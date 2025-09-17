import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { formatStatistics } from "./_utils/statistics";

const listUsersInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  search: z.string().trim().min(1).max(200).optional(),
});

export const adminRouter = createTRPCRouter({
  overview: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, adminCount, statsRegistradas, blacklistCount, simuladosPorAno, metadados] =
      await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { role: "ADMIN" } }),
        ctx.db.userStatistics.count(),
        ctx.db.emailBlacklist.count(),
        ctx.db.questao.groupBy({
          by: ["ano"],
          where: { ano: { not: null } },
          _count: { _all: true },
        }),
        ctx.db.simuladoMetadata.count({ where: { coverImageUrl: { not: null } } }),
      ]);

    const simuladosDisponiveis = simuladosPorAno.filter((item) => typeof item.ano === "number").length;

    return {
      totalUsers,
      adminCount,
      statsRegistradas,
      blacklistCount,
      simuladosDisponiveis,
      simuladosComCapa: metadados,
    } as const;
  }),

  listUsers: adminProcedure.input(listUsersInput).query(async ({ ctx, input }) => {
    const where: Prisma.UserWhereInput = {};
    const search = input.search?.trim();
    if (search) {
      const or: Prisma.UserWhereInput[] = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
      if (search.length >= 5) {
        or.push({ id: search });
      }
      where.OR = or;
    }

    const skip = (input.page - 1) * input.pageSize;
    const take = input.pageSize;

    const [total, usuarios] = await Promise.all([
      ctx.db.user.count({ where }),
      ctx.db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          avatarEmoji: true,
          createdAt: true,
          updatedAt: true,
          statistics: true,
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));

    const items = usuarios.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarEmoji: user.avatarEmoji,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      statistics: user.statistics ? formatStatistics(user.statistics) : null,
    }));

    return {
      meta: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages,
        search: search ?? null,
      },
      items,
    } as const;
  }),

  promoteUser: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: input.userId }, select: { id: true, role: true } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      if (user.role === "ADMIN") {
        return { ok: true, role: user.role } as const;
      }

      const updated = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: "ADMIN" },
        select: { id: true, role: true },
      });

      return { ok: true, role: updated.role } as const;
    }),

  demoteUser: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você não pode rebaixar a si mesmo." });
      }

      const user = await ctx.db.user.findUnique({ where: { id: input.userId }, select: { id: true, role: true } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      if (user.role !== "ADMIN") {
        return { ok: true, role: user.role } as const;
      }

      const adminCount = await ctx.db.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "É necessário manter ao menos um administrador ativo.",
        });
      }

      const updated = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: "USER" },
        select: { id: true, role: true },
      });

      return { ok: true, role: updated.role } as const;
    }),

  deleteUser: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        reason: z.string().trim().min(3).max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você não pode excluir a própria conta." });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      const reason = input.reason ?? "Removido pela administração";

      await ctx.db.$transaction(async (trx) => {
        if (user.email) {
          const email = user.email.toLowerCase();
          await trx.emailBlacklist.upsert({
            where: { email },
            update: { reason, createdById: ctx.session.user.id },
            create: { email, reason, createdById: ctx.session.user.id },
          });
        }

        await trx.user.delete({ where: { id: user.id } });
      });

      return { ok: true } as const;
    }),

  simulados: adminProcedure.query(async ({ ctx }) => {
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
          questoes: grupo._count._all,
          metadata,
        } as const;
      })
      .sort((a, b) => b.ano - a.ano);

    return itens;
  }),
});
