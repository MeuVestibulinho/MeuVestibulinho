"use client";

import * as React from "react";
import clsx from "clsx";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "~/server/api/root";

type RecentQuestao = inferRouterOutputs<AppRouter>["questao"]["recent"]["items"][number];

type Props = {
  questoes: RecentQuestao[];
};

type GroupedQuestoes = Record<string, RecentQuestao[]>;

type ModalState = {
  yearLabel: string;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

function groupByAno(questoes: RecentQuestao[]): GroupedQuestoes {
  return questoes.reduce<GroupedQuestoes>((groups, questao) => {
    const key = typeof questao.ano === "number" ? String(questao.ano) : "Sem ano";
    const list = (groups[key] ??= []);
    list.push(questao);
    return groups;
  }, {});
}

function labelize(input: string): string {
  return input
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w|\s\w/g, (match) => match.toUpperCase());
}

function Card({ questao, onClick }: { questao: RecentQuestao; onClick: () => void }) {
  const correctLetters = questao.alternativas
    .filter((alt) => alt.correta)
    .map((alt) => alt.letra)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full flex-col gap-4 rounded-3xl border border-gray-200 bg-white/90 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-red-300 hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
        <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
          {labelize(questao.disciplina)}
        </span>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
          {labelize(questao.grauDificuldade)}
        </span>
        {typeof questao.ano === "number" && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
            Ano {questao.ano}
          </span>
        )}
        <span className="ml-auto text-[11px] text-gray-500">
          Cadastrada em {dateFormatter.format(questao.createdAt)}
        </span>
      </div>

      <div className="space-y-3 text-sm text-gray-800">
        <p className="whitespace-pre-wrap font-medium leading-relaxed text-gray-900">{questao.enunciado}</p>

        {questao.imagemUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={questao.imagemUrl}
              alt="Ilustração da questão"
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
        )}

        <div className="grid gap-2 text-xs">
          <div className="rounded-xl bg-red-50/70 px-3 py-2 text-red-900">
            <span className="font-semibold text-red-700">Habilidades:&nbsp;</span>
            {questao.habilidades}
          </div>
          <div className="rounded-xl bg-orange-50/70 px-3 py-2 text-orange-900">
            <span className="font-semibold text-orange-700">Conteúdo:&nbsp;</span>
            {questao.conteudo}
          </div>
          <div className="rounded-xl bg-amber-50/70 px-3 py-2 text-amber-900">
            <span className="font-semibold text-amber-700">Subconteúdo:&nbsp;</span>
            {questao.subconteudo}
          </div>
        </div>
      </div>

      <ul className="mt-2 grid gap-2 text-sm text-gray-700">
        {questao.alternativas.map((alt) => (
          <li
            key={alt.id}
            className={clsx(
              "flex items-start gap-3 rounded-xl border px-3 py-2 transition",
              alt.correta
                ? "border-green-300 bg-green-50/80 shadow-sm"
                : "border-gray-200 bg-white/80",
            )}
          >
            <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-gray-100 px-1 text-xs font-semibold text-gray-700">
              {alt.letra}
            </span>
            <span className="text-sm leading-relaxed text-gray-800">{alt.texto}</span>
          </li>
        ))}
      </ul>

      <footer className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-gray-500">
        <span>Gabarito: {correctLetters || "—"}</span>
        {questao.fonteUrl && (
          <a
            href={questao.fonteUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-red-300 hover:text-red-600"
          >
            Fonte oficial
          </a>
        )}
      </footer>
    </button>
  );
}

export default function SimuladosClient({ questoes }: Props) {
  const grouped = React.useMemo(() => groupByAno(questoes), [questoes]);
  const [modalState, setModalState] = React.useState<ModalState | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!feedback) return undefined;
    const id = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const groupEntries = React.useMemo(() => {
    const entries = Object.entries(grouped);
    return entries.sort((a, b) => {
      if (a[0] === "Sem ano") return 1;
      if (b[0] === "Sem ano") return -1;
      return Number(b[0]) - Number(a[0]);
    });
  }, [grouped]);

  function openModal(yearLabel: string) {
    setModalState({ yearLabel });
  }

  function closeModal() {
    setModalState(null);
  }

  function confirmSimulado() {
    if (modalState) {
      setFeedback(
        `Simulado ${modalState.yearLabel} preparado! Você tem 4 horas para responder as 50 questões.`,
      );
    }
    setModalState(null);
  }

  return (
    <div className="space-y-8">
      {feedback && (
        <div className="rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
          {feedback}
        </div>
      )}

      {groupEntries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-500">
          Nenhuma questão cadastrada até o momento. Volte em breve para novos simulados!
        </div>
      ) : (
        groupEntries.map(([yearLabel, lista]) => (
          <section key={yearLabel} className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Simulado {yearLabel}</h2>
              <p className="text-sm text-gray-600">
                {lista.length} questão{lista.length > 1 ? "s" : ""} disponíveis para praticar com tempo limite de 4 horas.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {lista.map((questao) => (
                <Card
                  key={questao.id}
                  questao={questao}
                  onClick={() => openModal(yearLabel)}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {modalState && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
        >
          <div className="max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900">Iniciar simulado {modalState.yearLabel}</h3>
            <p className="mt-3 text-sm text-gray-700">
              Este simulado é composto por 50 questões e possui tempo limite de 4 horas. Deseja começar agora?
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmSimulado}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Iniciar simulado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
