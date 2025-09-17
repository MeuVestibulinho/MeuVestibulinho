import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import {
  computeRankings,
  formatStatistics,
  parseDetails,
  serializeDetails,
  type ConteudoStored,
} from "./_utils/statistics";

const conteudoAggregateSchema = z.object({
  conteudo: z.string().min(1),
  subconteudo: z.string().min(1),
  acertos: z.number().int().min(0),
  erros: z.number().int().min(0),
});

const recordSimuladoSchema = z.object({
  simuladoAno: z.number().int().min(1900).max(2100),
  totalQuestoes: z.number().int().min(1),
  acertos: z.number().int().min(0),
  erros: z.number().int().min(0),
  puladas: z.number().int().min(0),
  tempoTotalSegundos: z.number().int().min(0),
  conteudos: z.array(conteudoAggregateSchema).default([]),
});

export const statsRouter = createTRPCRouter({
  getOwn: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const stats = await ctx.db.userStatistics.findUnique({ where: { userId } });
    if (!stats) {
      return null;
    }

    return formatStatistics(stats);
  }),

  getByUserId: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.userStatistics.findUnique({ where: { userId: input.userId } });
      if (!stats) {
        return null;
      }
      return formatStatistics(stats);
    }),

  recordSimulado: protectedProcedure
    .input(recordSimuladoSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.userStatistics.findUnique({ where: { userId } });
      const detalhes = parseDetails(existing?.detalhes ?? null);
      const conteudosAtualizados: Record<string, ConteudoStored> = { ...detalhes.conteudos };

      for (const item of input.conteudos) {
        const key = `${item.conteudo}|${item.subconteudo}`;
        const atual = conteudosAtualizados[key] ?? {
          conteudo: item.conteudo,
          subconteudo: item.subconteudo,
          acertos: 0,
          erros: 0,
        };

        conteudosAtualizados[key] = {
          conteudo: item.conteudo,
          subconteudo: item.subconteudo,
          acertos: atual.acertos + item.acertos,
          erros: atual.erros + item.erros,
        };
      }

      const totalAcertos = (existing?.totalAcertos ?? 0) + input.acertos;
      const totalErros = (existing?.totalErros ?? 0) + input.erros;
      const totalPuladas = (existing?.totalPuladas ?? 0) + input.puladas;
      const simuladosConcluidos = (existing?.simuladosConcluidos ?? 0) + 1;
      const totalQuestoes = (existing?.totalQuestoes ?? 0) + input.totalQuestoes;
      const tempoTotalSegundos = (existing?.tempoTotalSegundos ?? 0) + input.tempoTotalSegundos;
      const tempoMedioSegundos =
        totalQuestoes > 0 ? Math.round((tempoTotalSegundos / totalQuestoes) * 100) / 100 : 0;

      const { maiores, menores } = computeRankings(conteudosAtualizados);
      const detalhesSerializados = serializeDetails({
        questoesTotais: totalQuestoes,
        tempoTotalSegundos,
        conteudos: conteudosAtualizados,
      });

      const data = {
        userId,
        totalAcertos,
        totalErros,
        totalPuladas,
        simuladosConcluidos,
        totalQuestoes,
        tempoMedioSegundos,
        tempoTotalSegundos,
        conteudosMaiorAcerto: maiores,
        conteudosMenorAcerto: menores,
        detalhes: detalhesSerializados,
      };

      const updated = existing
        ? await ctx.db.userStatistics.update({ where: { id: existing.id }, data })
        : await ctx.db.userStatistics.create({ data });

      return formatStatistics(updated);
    }),
});
