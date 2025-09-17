import Image from "next/image";
import type { inferRouterOutputs } from "@trpc/server";

import { api } from "~/trpc/server";
import type { AppRouter } from "~/server/api/root";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

type RecentQuestao = inferRouterOutputs<AppRouter>["questao"]["recent"]["items"][number];

function labelize(input: string): string {
  return input
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w|\s\w/g, (match) => match.toUpperCase());
}

function formatCreatedAt(date: Date): string {
  return dateFormatter.format(date);
}

function buildCorrectLabel(questao: RecentQuestao): string {
  const letters = questao.alternativas
    .filter((alt) => alt.correta)
    .map((alt) => alt.letra)
    .join(", ");
  return letters || "—";
}

export default async function SimuladosPage() {
  const { items: questoes } = await api.questao.recent({ take: 20 });

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
          {questoes.map((questao) => {
            const correctAnswer = buildCorrectLabel(questao);

            return (
              <li
                key={questao.id}
                className="rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3 text-sm text-gray-600">
                  {typeof questao.ano === "number" && (
                    <span className="rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-700">
                      Ano {questao.ano}
                    </span>
                  )}
                  <span className="rounded-full bg-gray-50 px-3 py-1">
                    {labelize(questao.disciplina)}
                  </span>
                  <span className="rounded-full bg-gray-50 px-3 py-1">
                    {labelize(questao.grauDificuldade)}
                  </span>
                  <span className="rounded-full bg-gray-50 px-3 py-1">
                    Cadastrada em {formatCreatedAt(questao.createdAt)}
                  </span>
                  {questao.fonteUrl && (
                    <a
                      href={questao.fonteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto underline underline-offset-2 hover:text-red-600"
                    >
                      Fonte oficial
                    </a>
                  )}
                </div>

                <div className="space-y-4 px-5 py-5">
                  <p className="text-base leading-relaxed text-gray-900">{questao.enunciado}</p>

                  {questao.imagemUrl && (
                    <div className="relative h-[420px] w-full overflow-hidden rounded-xl border">
                      <Image
                        src={questao.imagemUrl}
                        alt="Imagem da questão"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  )}

                  <div className="mt-2 grid gap-2">
                    {questao.alternativas.map((alt) => {
                      const isCorrect = alt.correta;
                      return (
                        <div
                          key={alt.id}
                          className={`group flex items-start gap-3 rounded-lg border px-3 py-2 transition hover:border-red-300 hover:bg-red-50/40 ${
                            isCorrect ? "border-green-300 bg-green-50/60" : "border-gray-200"
                          }`}
                        >
                          <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-gray-100 px-1 text-xs font-semibold text-gray-700">
                            {alt.letra}
                          </span>
                          <span className="text-sm text-gray-900">{alt.texto}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t pt-3 text-xs text-gray-600">
                    <span className="rounded-full bg-gray-50 px-2 py-0.5 font-medium">
                      Gabarito: {correctAnswer}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
