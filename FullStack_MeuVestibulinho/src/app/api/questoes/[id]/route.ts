// src/app/api/questoes/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { Alternativa, Disciplina, GrauDificuldade } from "@prisma/client";

/* ------------------------- helpers: params (no any) --------------------- */

type ParamsLike = { id?: string };
type MaybePromise<T> = T | Promise<T>;

function isThenable<T>(v: unknown): v is PromiseLike<T> {
  return (
    typeof v === "object" &&
    v !== null &&
    "then" in v &&
    typeof (v as { then?: unknown }).then === "function"
  );
}

async function unwrapParams(p: MaybePromise<ParamsLike>): Promise<ParamsLike> {
  return isThenable<ParamsLike>(p) ? await p : p;
}

/* ----------------------------- Schemas ---------------------------------- */

const ParamsSchema = z.object({
  id: z.string().min(1, "id obrigatório"),
});

const AltSchema = z.object({
  letra: z.nativeEnum(Alternativa),
  texto: z.string().min(1, "Texto da alternativa obrigatório"),
  correta: z.boolean().default(false),
});

// Para edição parcial: todos opcionais, mas válidos
const UpdateQuestaoSchema = z
  .object({
    enunciado: z.string().min(10).optional(),
    disciplina: z.nativeEnum(Disciplina).optional(),
    grauDificuldade: z.nativeEnum(GrauDificuldade).optional(),
    ano: z.number().int().min(1900).max(2100).nullable().optional(),
    fonteUrl: z.string().url().nullable().optional(),
    imagemUrl: z.string().url().nullable().optional(),
    // Se enviar alternativas, iremos **substituir** todas as alternativas da questão
    alternativas: z.array(AltSchema).min(2).max(5).optional(),
  })
  .refine(
    (v) =>
      !v.alternativas ||
      new Set(v.alternativas.map((a) => a.letra)).size === v.alternativas.length,
    { path: ["alternativas"], message: "Não repita letras (A..E) nas alternativas" },
  )
  .refine((v) => !v.alternativas || v.alternativas.some((a) => a.correta), {
    path: ["alternativas"],
    message: "Marque pelo menos uma alternativa correta",
  });

/* -------------------------------- GET ----------------------------------- */

export async function GET(_req: Request, ctx: { params: MaybePromise<ParamsLike> }) {
  const params = await unwrapParams(ctx.params);
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parâmetros inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = parsed.data;

  const questao = await db.questao.findUnique({
    where: { id },
    include: { alternativas: true },
  });

  if (!questao) {
    return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 });
  }

  return NextResponse.json(questao, { headers: { "Cache-Control": "no-store" } });
}

/* -------------------------------- PUT ----------------------------------- */

export async function PUT(req: Request, ctx: { params: MaybePromise<ParamsLike> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await unwrapParams(ctx.params);
  const parsedParams = ParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json(
      { error: "Parâmetros inválidos", issues: parsedParams.error.flatten() },
      { status: 400 },
    );
  }
  const { id } = parsedParams.data;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsedBody = UpdateQuestaoSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Payload inválido", issues: parsedBody.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsedBody.data;

  // Garante que existe antes de editar (mensagem 404 melhor)
  const exists = await db.questao.findUnique({ where: { id } });
  if (!exists) {
    return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 });
  }

  // Monta os dados para update
  const updateData: Record<string, unknown> = {};
  if (typeof data.enunciado !== "undefined") updateData.enunciado = data.enunciado;
  if (typeof data.disciplina !== "undefined") updateData.disciplina = data.disciplina;
  if (typeof data.grauDificuldade !== "undefined")
    updateData.grauDificuldade = data.grauDificuldade;
  if (typeof data.ano !== "undefined") updateData.ano = data.ano;
  if (typeof data.fonteUrl !== "undefined") updateData.fonteUrl = data.fonteUrl;
  if (typeof data.imagemUrl !== "undefined") updateData.imagemUrl = data.imagemUrl;

  try {
    // Se enviar alternativas, substitui todas (deleteMany + create)
    if (data.alternativas) {
      await db.$transaction([
        db.alternativaQuestao.deleteMany({ where: { questaoId: id } }),
        db.questao.update({
          where: { id },
          data: {
            ...updateData,
            alternativas: {
              create: data.alternativas.map((a) => ({
                letra: a.letra,
                texto: a.texto,
                correta: a.correta,
              })),
            },
          },
        }),
      ]);

      const updated = await db.questao.findUnique({
        where: { id },
        include: { alternativas: true },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    // Sem alternativas → apenas update da própria questão
    const updated = await db.questao.update({
      where: { id },
      data: updateData,
      include: { alternativas: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Erro ao atualizar questão",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}

/* ------------------------------- DELETE --------------------------------- */

export async function DELETE(_req: Request, ctx: { params: MaybePromise<ParamsLike> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await unwrapParams(ctx.params);
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parâmetros inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { id } = parsed.data;

  try {
    const exists = await db.questao.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 });
    }

    await db.$transaction([
      db.alternativaQuestao.deleteMany({ where: { questaoId: id } }),
      db.questao.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Erro ao deletar questão",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
