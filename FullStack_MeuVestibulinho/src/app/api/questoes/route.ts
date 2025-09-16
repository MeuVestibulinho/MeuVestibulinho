// src/app/api/questoes/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { Disciplina, GrauDificuldade, Alternativa } from "@prisma/client";

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

/* --------------------------- schema de query (GET) ---------------------- */

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

/* --------------------------- schema do POST ----------------------------- */

const AltSchema = z.object({
  letra: z.nativeEnum(Alternativa),
  texto: z.string().min(1, "Texto da alternativa obrigatório"),
  correta: z.boolean().default(false),
});

const CreateQuestaoSchema = z
  .object({
    enunciado: z.string().min(10, "Enunciado muito curto"),
    disciplina: z.nativeEnum(Disciplina),
    grauDificuldade: z.nativeEnum(GrauDificuldade),
    ano: z.number().int().min(1900).max(2100).optional(),
    fonteUrl: z.string().url().optional(),
    imagemUrl: z.string().url().optional(),
    alternativas: z.array(AltSchema).min(2).max(5),
  })
  .refine(
    (v) => new Set(v.alternativas.map((a) => a.letra)).size === v.alternativas.length,
    { path: ["alternativas"], message: "Não repita letras (A..E) nas alternativas" },
  )
  .refine((v) => v.alternativas.some((a) => a.correta), {
    path: ["alternativas"],
    message: "Marque pelo menos uma alternativa correta",
  });

/* -------------------------------- GET ----------------------------------- */

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

  // 3) where/orderBy (inferência direta, sem any)
  const where = {
    ...(q.search
      ? {
          OR: [
            { enunciado: { contains: q.search, mode: "insensitive" as const } },
            // { comentario: { contains: q.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(q.disciplina?.length ? { disciplina: { in: q.disciplina } } : {}),
    ...(q.grau?.length ? { grauDificuldade: { in: q.grau } } : {}),
    ...(typeof q.ano === "number" && Number.isFinite(q.ano) ? { ano: q.ano } : {}),
  };

  const skip = (q.page - 1) * q.pageSize;
  const take = q.pageSize;

  try {
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
}

/* -------------------------------- POST ---------------------------------- */

export async function POST(req: Request) {
  // exige sessão (database session com NextAuth v5)
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = CreateQuestaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload inválido", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  try {
    const created = await db.questao.create({
      data: {
        enunciado: data.enunciado,
        disciplina: data.disciplina,
        grauDificuldade: data.grauDificuldade,
        ano: data.ano,
        fonteUrl: data.fonteUrl,
        imagemUrl: data.imagemUrl,
        alternativas: {
          create: data.alternativas.map((a) => ({
            letra: a.letra,
            texto: a.texto,
            correta: a.correta,
          })),
        },
      },
      include: { alternativas: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Erro ao criar questão",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
