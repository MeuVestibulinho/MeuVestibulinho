import { Alternativa, Disciplina, GrauDificuldade } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const questaoWithAlternativasSelect = {
  id: true,
  enunciado: true,
  disciplina: true,
  grauDificuldade: true,
  ano: true,
  fonteUrl: true,
  imagemUrl: true,
  habilidades: true,
  conteudo: true,
  subconteudo: true,
  createdAt: true,
  updatedAt: true,
  alternativas: {
    select: {
      id: true,
      letra: true,
      texto: true,
      correta: true,
    },
    orderBy: { letra: "asc" as const },
  },
} satisfies Prisma.QuestaoSelect;

const alternativasSchema = z.object({
  letra: z.nativeEnum(Alternativa),
  texto: z.string().min(1, "Texto da alternativa obrigatório"),
  correta: z.boolean().default(false),
});

const createQuestaoSchema = z
  .object({
    enunciado: z.string().min(10, "Enunciado muito curto"),
    disciplina: z.nativeEnum(Disciplina),
    grauDificuldade: z.nativeEnum(GrauDificuldade),
    ano: z.number().int().min(1900).max(2100).optional(),
    fonteUrl: z.string().url().optional(),
    imagemUrl: z.string().url().optional(),
    habilidades: z.string().trim().min(3, "Informe as habilidades"),
    conteudo: z.string().trim().min(3, "Informe o conteúdo"),
    subconteudo: z.string().trim().min(3, "Informe o subconteúdo"),
    alternativas: z.array(alternativasSchema).min(2).max(5),
  })
  .refine(
    (value) => new Set(value.alternativas.map((alt) => alt.letra)).size === value.alternativas.length,
    { path: ["alternativas"], message: "Não repita letras (A..E) nas alternativas" },
  )
  .refine((value) => value.alternativas.some((alt) => alt.correta), {
    path: ["alternativas"],
    message: "Marque pelo menos uma alternativa correta",
  });

const updateQuestaoSchema = z
  .object({
    enunciado: z.string().min(10).optional(),
    disciplina: z.nativeEnum(Disciplina).optional(),
    grauDificuldade: z.nativeEnum(GrauDificuldade).optional(),
    ano: z.number().int().min(1900).max(2100).nullable().optional(),
    fonteUrl: z.string().url().nullable().optional(),
    imagemUrl: z.string().url().nullable().optional(),
    habilidades: z.string().trim().min(3).optional(),
    conteudo: z.string().trim().min(3).optional(),
    subconteudo: z.string().trim().min(3).optional(),
    alternativas: z.array(alternativasSchema).min(2).max(5).optional(),
  })
  .refine(
    (value) =>
      !value.alternativas ||
      new Set(value.alternativas.map((alt) => alt.letra)).size === value.alternativas.length,
    { path: ["alternativas"], message: "Não repita letras (A..E) nas alternativas" },
  )
  .refine((value) => !value.alternativas || value.alternativas.some((alt) => alt.correta), {
    path: ["alternativas"],
    message: "Marque pelo menos uma alternativa correta",
  });

const listInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(200).optional(),
  disciplina: z.array(z.nativeEnum(Disciplina)).optional(),
  grau: z.array(z.nativeEnum(GrauDificuldade)).optional(),
  ano: z.number().int().optional(),
  orderBy: z.enum(["newest", "oldest"]).default("newest"),
});

export const questaoRouter = createTRPCRouter({
  recent: protectedProcedure
    .input(z.object({ take: z.number().int().min(1).max(100).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const take = input?.take ?? 20;
      const items = await ctx.db.questao.findMany({
        orderBy: { createdAt: "desc" },
        take,
        select: questaoWithAlternativasSelect,
      });

      return { items };
    }),

  simulados: protectedProcedure.query(async ({ ctx }) => {
    const [grupos, metadados] = await Promise.all([
      ctx.db.questao.groupBy({
        by: ["ano"],
        where: { ano: { not: null } },
        _count: { _all: true },
      }),
      ctx.db.simuladoMetadata.findMany(),
    ]);

    const metadataMap = new Map(metadados.map((meta) => [meta.ano, meta]));

    const itens = grupos
      .filter((grupo): grupo is { ano: number; _count: { _all: number } } => typeof grupo.ano === "number")
      .map((grupo) => {
        const metadata = metadataMap.get(grupo.ano) ?? null;
        return {
          ano: grupo.ano,
          titulo: metadata?.titulo ?? `Simulado ${grupo.ano}`,
          questoes: grupo._count._all,
          tempoLimiteMinutos: 240,
          coverImageUrl: metadata?.coverImageUrl ?? null,
          descricao: metadata?.descricao ?? null,
          metadataAtualizadaEm: metadata?.updatedAt ?? null,
        } as const;
      })
      .sort((a, b) => b.ano - a.ano);

    return itens;
  }),

  simuladoDetalhes: protectedProcedure
    .input(z.object({ ano: z.number().int().min(1900).max(2100) }))
    .query(async ({ ctx, input }) => {
      const questoes = await ctx.db.questao.findMany({
        where: { ano: input.ano },
        orderBy: [
          { createdAt: "asc" },
          { id: "asc" },
        ],
        select: questaoWithAlternativasSelect,
      });

      if (questoes.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Nenhuma questão cadastrada para o ano informado.",
        });
      }

      return {
        ano: input.ano,
        titulo: `Simulado ${input.ano}`,
        tempoLimiteMinutos: 240,
        questoes,
        serverNow: new Date().toISOString(),
      } as const;
    }),

  list: adminProcedure.input(listInputSchema).query(async ({ ctx, input }) => {
    const where: Prisma.QuestaoWhereInput = {
      ...(input.search
        ? {
            OR: [
              { enunciado: { contains: input.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.disciplina?.length ? { disciplina: { in: input.disciplina } } : {}),
      ...(input.grau?.length ? { grauDificuldade: { in: input.grau } } : {}),
      ...(typeof input.ano === "number" && Number.isFinite(input.ano) ? { ano: input.ano } : {}),
    };

    const skip = (input.page - 1) * input.pageSize;
    const take = input.pageSize;

    const [total, items] = await Promise.all([
      ctx.db.questao.count({ where }),
      ctx.db.questao.findMany({
        where,
        orderBy: { createdAt: input.orderBy === "oldest" ? "asc" : "desc" },
        skip,
        take,
        select: questaoWithAlternativasSelect,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));

    return {
      meta: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages,
        orderBy: input.orderBy,
        filtros: {
          search: input.search ?? null,
          disciplina: input.disciplina ?? [],
          grau: input.grau ?? [],
          ano: input.ano ?? null,
        },
      },
      items,
    };
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const questao = await ctx.db.questao.findUnique({
        where: { id: input.id },
        select: questaoWithAlternativasSelect,
      });

      if (!questao) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Questão não encontrada" });
      }

      return questao;
    }),

  create: adminProcedure.input(createQuestaoSchema).mutation(async ({ ctx, input }) => {
    const created = await ctx.db.questao.create({
      data: {
        enunciado: input.enunciado,
        disciplina: input.disciplina,
        grauDificuldade: input.grauDificuldade,
        ano: input.ano ?? null,
        fonteUrl: input.fonteUrl ?? null,
        imagemUrl: input.imagemUrl ?? null,
        habilidades: input.habilidades,
        conteudo: input.conteudo,
        subconteudo: input.subconteudo,
        alternativas: {
          create: input.alternativas.map((alt) => ({
            letra: alt.letra,
            texto: alt.texto,
            correta: alt.correta,
          })),
        },
      },
      select: questaoWithAlternativasSelect,
    });

    return created;
  }),

  update: adminProcedure
    .input(z.object({ id: z.string().cuid(), data: updateQuestaoSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      const exists = await ctx.db.questao.findUnique({ where: { id }, select: { id: true } });
      if (!exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Questão não encontrada" });
      }

      const updateData: Prisma.QuestaoUpdateInput = {};

      if (typeof data.enunciado !== "undefined") updateData.enunciado = data.enunciado;
      if (typeof data.disciplina !== "undefined") updateData.disciplina = data.disciplina;
      if (typeof data.grauDificuldade !== "undefined") updateData.grauDificuldade = data.grauDificuldade;
      if (typeof data.ano !== "undefined") updateData.ano = data.ano;
      if (typeof data.fonteUrl !== "undefined") updateData.fonteUrl = data.fonteUrl;
      if (typeof data.imagemUrl !== "undefined") updateData.imagemUrl = data.imagemUrl;
      if (typeof data.habilidades !== "undefined") updateData.habilidades = data.habilidades;
      if (typeof data.conteudo !== "undefined") updateData.conteudo = data.conteudo;
      if (typeof data.subconteudo !== "undefined") updateData.subconteudo = data.subconteudo;

      if (data.alternativas) {
        await ctx.db.$transaction([
          ctx.db.alternativaQuestao.deleteMany({ where: { questaoId: id } }),
          ctx.db.questao.update({
            where: { id },
            data: {
              ...updateData,
              alternativas: {
                create: data.alternativas.map((alt) => ({
                  letra: alt.letra,
                  texto: alt.texto,
                  correta: alt.correta,
                })),
              },
            },
          }),
        ]);
      } else if (Object.keys(updateData).length > 0) {
        await ctx.db.questao.update({
          where: { id },
          data: updateData,
        });
      }

      const questaoAtualizada = await ctx.db.questao.findUnique({
        where: { id },
        select: questaoWithAlternativasSelect,
      });

      if (!questaoAtualizada) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Questão não encontrada" });
      }

      return questaoAtualizada;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.questao.findUnique({ where: { id: input.id }, select: { id: true } });
      if (!exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Questão não encontrada" });
      }

      await ctx.db.$transaction([
        ctx.db.alternativaQuestao.deleteMany({ where: { questaoId: input.id } }),
        ctx.db.questao.delete({ where: { id: input.id } }),
      ]);

      return { ok: true } as const;
    }),
});
