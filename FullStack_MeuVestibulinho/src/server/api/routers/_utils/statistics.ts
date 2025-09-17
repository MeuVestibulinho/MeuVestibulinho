import type { Prisma, UserStatistics } from "@prisma/client";

export type ConteudoStored = {
  conteudo: string;
  subconteudo: string;
  acertos: number;
  erros: number;
};

export type DetailsStored = {
  questoesTotais: number;
  tempoTotalSegundos: number;
  conteudos: Record<string, ConteudoStored>;
};

export type ConteudoResumo = ConteudoStored & {
  total: number;
  percentualAcerto: number;
};

export type StatisticsSummary = {
  totalAcertos: number;
  totalErros: number;
  totalPuladas: number;
  simuladosConcluidos: number;
  totalQuestoes: number;
  tempoMedioSegundos: number;
  tempoTotalSegundos: number;
  conteudosMaiorAcerto: ConteudoResumo[];
  conteudosMenorAcerto: ConteudoResumo[];
  conteudosDetalhados: ConteudoResumo[];
  createdAt: Date;
  updatedAt: Date;
};

const defaultDetails: DetailsStored = {
  questoesTotais: 0,
  tempoTotalSegundos: 0,
  conteudos: {},
};

function normalizeConteudoStored(value: unknown, fallbackKey: string): ConteudoStored {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const [conteudo = "", subconteudo = ""] = fallbackKey.split("|");
    return {
      conteudo,
      subconteudo,
      acertos: 0,
      erros: 0,
    };
  }

  const record = value as Record<string, unknown>;
  const acertos = typeof record.acertos === "number" ? record.acertos : 0;
  const erros = typeof record.erros === "number" ? record.erros : 0;
  const [fallbackConteudo = "", fallbackSubconteudo = ""] = fallbackKey.split("|");
  const conteudo = typeof record.conteudo === "string" ? record.conteudo : fallbackConteudo;
  const subconteudo = typeof record.subconteudo === "string" ? record.subconteudo : fallbackSubconteudo;

  return { conteudo, subconteudo, acertos, erros };
}

export function parseDetails(value: Prisma.JsonValue | null | undefined): DetailsStored {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaultDetails };
  }

  const parsed = value as Record<string, unknown>;
  const questoesTotais = typeof parsed.questoesTotais === "number" ? parsed.questoesTotais : 0;
  const tempoTotalSegundos = typeof parsed.tempoTotalSegundos === "number" ? parsed.tempoTotalSegundos : 0;

  const conteudosRaw = parsed.conteudos;
  const conteudos: Record<string, ConteudoStored> = {};

  if (conteudosRaw && typeof conteudosRaw === "object" && !Array.isArray(conteudosRaw)) {
    for (const [key, value] of Object.entries(conteudosRaw)) {
      conteudos[key] = normalizeConteudoStored(value, key);
    }
  }

  return {
    questoesTotais,
    tempoTotalSegundos,
    conteudos,
  };
}

export function buildConteudoResumos(map: Record<string, ConteudoStored>): ConteudoResumo[] {
  return Object.values(map).map((item) => {
    const total = Math.max(0, Math.round(item.acertos + item.erros));
    const percentual = total > 0 ? (item.acertos / total) * 100 : 0;
    const percentualAjustado = Number.isFinite(percentual) ? Math.round(percentual * 10) / 10 : 0;

    return {
      conteudo: item.conteudo,
      subconteudo: item.subconteudo,
      acertos: item.acertos,
      erros: item.erros,
      total,
      percentualAcerto: percentualAjustado,
    };
  });
}

export function computeRankings(map: Record<string, ConteudoStored>) {
  const resumos = buildConteudoResumos(map).filter((item) => item.total > 0);
  const maiores = [...resumos]
    .sort((a, b) => {
      if (b.percentualAcerto === a.percentualAcerto) {
        return b.total - a.total;
      }
      return b.percentualAcerto - a.percentualAcerto;
    })
    .slice(0, 5);
  const menores = [...resumos]
    .sort((a, b) => {
      if (a.percentualAcerto === b.percentualAcerto) {
        return a.total - b.total;
      }
      return a.percentualAcerto - b.percentualAcerto;
    })
    .slice(0, 5);

  return { maiores, menores, resumos };
}

function parseConteudoResumoArray(value: Prisma.JsonValue | null | undefined): ConteudoResumo[] {
  if (!value || !Array.isArray(value)) {
    return [];
  }

  const items: ConteudoResumo[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const conteudo = typeof record.conteudo === "string" ? record.conteudo : "";
    const subconteudo = typeof record.subconteudo === "string" ? record.subconteudo : "";
    const acertos = typeof record.acertos === "number" ? record.acertos : 0;
    const erros = typeof record.erros === "number" ? record.erros : 0;
    const total = typeof record.total === "number" ? record.total : Math.max(0, acertos + erros);
    const percentualAcerto = typeof record.percentualAcerto === "number"
      ? record.percentualAcerto
      : total > 0
        ? Math.round((acertos / total) * 1000) / 10
        : 0;

    items.push({ conteudo, subconteudo, acertos, erros, total, percentualAcerto });
  }

  return items;
}

export function formatStatistics(stat: UserStatistics): StatisticsSummary {
  const detalhes = parseDetails(stat.detalhes);
  const conteudosDetalhados = buildConteudoResumos(detalhes.conteudos);

  const conteudosMaiorAcerto = parseConteudoResumoArray(stat.conteudosMaiorAcerto);
  const conteudosMenorAcerto = parseConteudoResumoArray(stat.conteudosMenorAcerto);

  return {
    totalAcertos: stat.totalAcertos,
    totalErros: stat.totalErros,
    totalPuladas: stat.totalPuladas,
    simuladosConcluidos: stat.simuladosConcluidos,
    totalQuestoes: stat.totalQuestoes,
    tempoMedioSegundos: stat.tempoMedioSegundos,
    tempoTotalSegundos: stat.tempoTotalSegundos,
    conteudosMaiorAcerto,
    conteudosMenorAcerto,
    conteudosDetalhados,
    createdAt: stat.createdAt,
    updatedAt: stat.updatedAt,
  };
}

export function serializeDetails(details: DetailsStored): Prisma.JsonObject {
  const conteudos: Record<string, ConteudoStored> = {};
  for (const [key, value] of Object.entries(details.conteudos)) {
    conteudos[key] = {
      conteudo: value.conteudo,
      subconteudo: value.subconteudo,
      acertos: value.acertos,
      erros: value.erros,
    };
  }

  return {
    questoesTotais: details.questoesTotais,
    tempoTotalSegundos: details.tempoTotalSegundos,
    conteudos,
  } satisfies Prisma.JsonObject;
}
