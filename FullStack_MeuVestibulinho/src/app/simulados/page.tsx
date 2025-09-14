// src/app/simulados/page.tsx
import React from "react";
import { Prisma } from "@prisma/client";
import { db } from "~/server/db";
// Se preferir evitar alias, use: import { db } from "../../server/db";

export const dynamic = "force-dynamic";

// Select tipado (mantém literais `true`)
const selectFull = {
  id: true,
  anoProva: true,
  edicao: true,
  instituicao: true,
  urlProva: true,
  disciplina: true,
  tema: true,
  subtema: true,
  grauDificuldade: true,
  habilidade: true,
  enunciado: true,
  imagemUrl: true,
  alternativaA: true,
  alternativaB: true,
  alternativaC: true,
  alternativaD: true,
  alternativaE: true,
  respostaCorreta: true,
  resolucaoTexto: true,
  resolucaoImagem: true,
  fonteReferencia: true,
  tags: true,
  tempoMedioResolucaoMin: true,
  percentualAcerto: true,
  usosEmSimulados: true,
  createdAt: true,
} as const;

type QuestaoCard = Prisma.QuestaoGetPayload<{ select: typeof selectFull }>;

function labelize(input: string): string {
  return input
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w|\s\w/g, (m) => m.toUpperCase());
}

async function SimuladosPage(): Promise<JSX.Element> {
  const questoes: QuestaoCard[] = await db.questao.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: selectFull,
  });

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Simulados</h1>
        <p className="text-sm text-gray-600">Questões mais recentes cadastradas.</p>
      </header>

      {questoes.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500">
          Nenhuma questão cadastrada ainda.
        </div>
      ) : (
        <ul className="space-y-6">
          {questoes.map((q) => (
            <li
              key={q.id}
              className="rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3 text-sm text-gray-600">
                <span className="rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-700">
                  {q.anoProva} • {q.edicao}
                </span>
                <span className="rounded-full bg-gray-50 px-3 py-1">{q.instituicao}</span>
                <span className="rounded-full bg-gray-50 px-3 py-1">
                  {labelize(String(q.disciplina))}
                </span>
                <span className="rounded-full bg-gray-50 px-3 py-1">
                  {labelize(String(q.grauDificuldade))}
                </span>
                {q.habilidade && (
                  <span className="rounded-full bg-gray-50 px-3 py-1">Habilidade: {q.habilidade}</span>
                )}
                {(q.tema || q.subtema) && (
                  <span className="rounded-full bg-gray-50 px-3 py-1">
                    {q.tema ?? "-"}
                    {q.subtema ? ` › ${q.subtema}` : ""}
                  </span>
                )}
                {q.urlProva && (
                  <a
                    href={q.urlProva}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto underline underline-offset-2 hover:text-red-600"
                  >
                    Prova oficial
                  </a>
                )}
              </div>

              <div className="space-y-4 px-5 py-5">
                <p className="text-base leading-relaxed text-gray-900">{q.enunciado}</p>

                {q.imagemUrl && (
                  <div className="overflow-hidden rounded-xl border">
                    <img
                      src={q.imagemUrl}
                      alt="Imagem da questão"
                      className="max-h-[420px] w-full object-contain"
                    />
                  </div>
                )}

                <div className="mt-2 grid gap-2">
                  {([
                    ["A", q.alternativaA],
                    ["B", q.alternativaB],
                    ["C", q.alternativaC],
                    ["D", q.alternativaD],
                    ["E", q.alternativaE],
                  ] as const).map(([letter, text]) => (
                    <div
                      key={letter}
                      className="group flex items-start gap-3 rounded-lg border px-3 py-2 transition hover:border-red-300 hover:bg-red-50/40"
                    >
                      <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-gray-100 px-1 text-xs font-semibold text-gray-700">
                        {letter}
                      </span>
                      <span className="text-sm text-gray-900">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-gray-600">
                  {q.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {q.tags.map((t) => (
                        <span key={t} className="rounded-full bg-gray-50 px-2 py-0.5">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  {q.tempoMedioResolucaoMin != null && (
                    <span className="rounded-full bg-gray-50 px-2 py-0.5">⏱ {q.tempoMedioResolucaoMin} min</span>
                  )}
                  {q.percentualAcerto != null && (
                    <span className="rounded-full bg-gray-50 px-2 py-0.5">
                      🎯 {q.percentualAcerto.toString()}%
                    </span>
                  )}
                  {q.usosEmSimulados > 0 && (
                    <span className="rounded-full bg-gray-50 px-2 py-0.5">📚 usado {q.usosEmSimulados}x</span>
                  )}
                </div>

                <details className="group rounded-xl border bg-gray-50/60">
                  <summary className="cursor-pointer select-none rounded-xl px-4 py-2 text-sm font-medium text-gray-800 transition group-open:bg-gray-100">
                    Ver gabarito e resolução
                  </summary>
                  <div className="space-y-3 border-t px-4 py-3">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">Gabarito:{""}</span>{" "}
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-green-100 px-2 text-xs font-semibold text-green-700">
                        {q.respostaCorreta}
                      </span>
                    </p>
                    {q.resolucaoTexto && (
                      <div className="whitespace-pre-wrap rounded-lg border bg-white px-3 py-2 text-sm text-gray-800">
                        {q.resolucaoTexto}
                      </div>
                    )}
                    {q.resolucaoImagem && (
                      <div className="overflow-hidden rounded-lg border bg-white p-2">
                        <img
                          src={q.resolucaoImagem}
                          alt="Imagem da resolução"
                          className="max-h-[420px] w-full object-contain"
                        />
                      </div>
                    )}
                    {q.fonteReferencia && (
                      <p className="text-xs text-gray-600">Fonte: {q.fonteReferencia}</p>
                    )}
                  </div>
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default SimuladosPage;
