// src/app/api/questoes/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Disciplina, GrauDificuldade } from "@prisma/client";

/* ------------------------------ utils ----------------------------------- */

function readStringArray(sp: URLSearchParams, key: string): string[] | undefined {
  const values = sp.getAll(key);
  if (values.length === 0) return undefined;
  const exploded = values.flatMap((v) => String(v).split(","));
  const cleaned = exploded.map((v) => v.trim()).filter(Boolean);
  return cleaned.length ? cleaned : undefined;
}

function toInt(v: string | null, def: number): number {
  if (!v) return def;
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? def : n;
}

/** Converte string[] → enum[] (filtra inválidos) */
function toEnumArray<E extends Record<string, string>>(
  arr: string[] | undefined,
  enumObj: E,
): Array<E[keyof E]> | undefined {
  if (!arr) return undefined;
  const allowed = new Set(Object.values(enumObj));
  const out = arr.filter((s): s is E[keyof E] => allowed.has(s as E[keyof E]));
  return out.length ? out : undefined;
}

type KnownPrismaError = { code: string; message: string };
const isKnownPrismaError = (e: unknown): e is KnownPrismaError => {
  if (typeof e !== "object" || e === null) return false;
  const r = e as Record<string, unknown>;
  return typeof r.code === "string" && typeof r.message === "string";
};

/* --------------------------- schema de query ---------------------------- */

const QuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(200).optional(),
  disciplina: z.array(z.nativeEnum(Disciplina)).optional(),
  grau: z.array(z.nativeEnum(GrauDificuldade)).optional(),
  ano: z.number().int().optional(),
  orderBy: z.enum(["newest", "oldest"]).default("newest"),
});
type Query = z.infer<typeof QuerySchema>;

/* ---- Tipos inferidos a partir do client (robusto; sem Prisma.XYZ*) ----- */

type QuestaoCountArgs = NonNullable<Parameters<typeof db.questao.count>[0]>;
type QuestaoFindManyArgs = NonNullable<Parameters<typeof db.questao.findMany>[0]>;
type QuestaoWhere = NonNullable<QuestaoCountArgs["where"]>;
type QuestaoOrderBy = NonNullable<QuestaoFindManyArgs["orderBy"]>;

/* -------------------------------- handler ------------------------------- */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  // 1) Converte strings → enums antes da validação
  const disciplinaEnums = toEnumArray(readStringArray(sp, "disciplina"), Disciplina);
  const grauEnums = toEnumArray(readStringArray(sp, "grau"), GrauDificuldade);

  // 2) Monta candidato e valida
  const candidate = {
    page: toInt(sp.get("page"), 1),
    pageSize: toInt(sp.get("pageSize"), 20),
    search: sp.get("q") ?? sp.get("search") ?? undefined,
    disciplina: disciplinaEnums,
    grau: grauEnums,
    ano: sp.get("ano") ? toInt(sp.get("ano"), NaN) : undefined,
    orderBy: (sp.get("orderBy") as Query["orderBy"]) ?? "newest",
  };

  const parsed = QuerySchema.safeParse(candidate);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parâmetros inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const q = parsed.data;

  // -------------------------- where/order tipados -------------------------

// 1) constrói 'where' incrementalmente (sem `satisfies`, sem `any`)
const where: QuestaoWhere = {};

if (q.search) {
  where.OR = [
    { enunciado: { contains: q.search, mode: "insensitive" } },
    // { comentario: { contains: q.search, mode: "insensitive" } },
  ];
}
if (q.disciplina?.length) {
  // q.disciplina já é Disciplina[] (z.nativeEnum + toEnumArray)
  where.disciplina = { in: q.disciplina };
}
if (q.grau?.length) {
  where.grauDificuldade = { in: q.grau };
}
if (typeof q.ano === "number" && Number.isFinite(q.ano)) {
  where.ano = q.ano;
}

const skip = (q.page - 1) * q.pageSize;
const take = q.pageSize;

try {
  // 2) deixe o TS inferir tipos dos args direto nas calls
  const [total, items] = await Promise.all([
    db.questao.count({ where }),
    db.questao.findMany({
      where,
      orderBy: { createdAt: q.orderBy === "oldest" ? "asc" : "desc" },
      skip,
      take,
      // include: { alternativas: true },
      // select: { id: true, enunciado: true, disciplina: true, grauDificuldade: true, ano: true, createdAt: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / q.pageSize));

  return NextResponse.json(
    {
      meta: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        totalPages,
        orderBy: q.orderBy,
        filtros: {
          search: q.search ?? null,
          disciplina: q.disciplina ?? [],
          grau: q.grau ?? [],
          ano: q.ano ?? null,
        },
      },
      items,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
} catch (err: unknown) {
  if (isKnownPrismaError(err) && err.code === "P2021") {
    return NextResponse.json(
      {
        error:
          'Tabela "Questao" não encontrada. Rode as migrações do Prisma ou ajuste o schema.',
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 },
    );
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  return NextResponse.json(
    {
      error: "Erro ao consultar as questões",
      details: process.env.NODE_ENV === "development" ? message : undefined,
    },
    { status: 500 },
  );
}
