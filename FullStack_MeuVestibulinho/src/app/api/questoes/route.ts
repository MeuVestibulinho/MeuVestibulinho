// src/app/api/questoes/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";
import { Disciplina, GrauDificuldade, Alternativa } from "@prisma/client";
import { z } from "zod";

/* ============================
   Zod: normalização de query
   ============================ */

function normalizeEnumInput(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const upper = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const noAccents = upper.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return noAccents || undefined;
}
const enumCI = <T extends Record<string, string>>(nativeEnum: T) =>
  z.preprocess(normalizeEnumInput, z.nativeEnum(nativeEnum));

const listQuerySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100).optional(),
  disciplina: enumCI(Disciplina).optional(),
  dificuldade: enumCI(GrauDificuldade).optional(),
  q: z.string().trim().min(1).optional(),
  take: z.coerce.number().int().positive().max(100).default(20),
  skip: z.coerce.number().int().nonnegative().default(0),
});
type ListQuery = z.infer<typeof listQuerySchema>;

/* ============================
   Select + schema de saída
   ============================ */

// mantém literais `true` para boa inferência do Prisma
const selectList = {
  id: true,
  anoProva: true,
  edicao: true,
  instituicao: true,
  disciplina: true,
  tema: true,
  subtema: true,
  grauDificuldade: true,
  respostaCorreta: true,
  createdAt: true,
} as const;
type QuestaoListItem = Prisma.QuestaoGetPayload<{ select: typeof selectList }>;

// Zod do item (valida e tipa o retorno do Prisma, evitando “unsafe assignment”)
const questaoListItemSchema: z.ZodType<QuestaoListItem> = z.object({
  id: z.string(),
  anoProva: z.number().int(),
  edicao: z.string(),
  instituicao: z.string(),
  disciplina: z.nativeEnum(Disciplina),
  tema: z.string().nullable(),
  subtema: z.string().nullable(),
  grauDificuldade: z.nativeEnum(GrauDificuldade),
  respostaCorreta: z.nativeEnum(Alternativa),
  createdAt: z.date(),
});
const listResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(questaoListItemSchema),
});
type ListResponse = z.infer<typeof listResponseSchema>;
type ApiError = { error: string };

/* ============================
   GET /api/questoes
   ============================ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = listQuerySchema.safeParse({
    ano: searchParams.get("ano"),
    disciplina: searchParams.get("disciplina"),
    dificuldade: searchParams.get("dificuldade"),
    q: searchParams.get("q"),
    take: searchParams.get("take"),
    skip: searchParams.get("skip"),
  });

  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json<ApiError>(
      { error: `Parâmetros inválidos: ${details}` },
      { status: 400 },
    );
  }

  const query: ListQuery = parsed.data;

  // where sem mutação
  const andFilters: Prisma.QuestaoWhereInput[] = [];
  if (query.ano !== undefined) andFilters.push({ anoProva: query.ano });
  if (query.disciplina !== undefined) andFilters.push({ disciplina: query.disciplina });
  if (query.dificuldade !== undefined) andFilters.push({ grauDificuldade: query.dificuldade });
  if (query.q) {
    andFilters.push({
      OR: [
        { enunciado: { contains: query.q, mode: "insensitive" } },
        { tema: { contains: query.q, mode: "insensitive" } },
        { subtema: { contains: query.q, mode: "insensitive" } },
        { tags: { has: query.q } },
      ],
    });
  }
  const where: Prisma.QuestaoWhereInput = andFilters.length ? { AND: andFilters } : {};

  // ✅ Valida o retorno “na boca” → evita assignment de valor “error typed”
  const items = questaoListItemSchema
    .array()
    .parse(
      await db.questao.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.take,
        skip: query.skip,
        select: selectList,
      }),
    );

  const total = z.number().int().nonnegative().parse(
    await db.questao.count({ where }),
  );

  // resposta validada (opcional, mas ajuda durante dev)
  const response: ListResponse = listResponseSchema.parse({ total, items });
  return NextResponse.json<ListResponse>(response, { status: 200 });
}
