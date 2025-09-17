"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "~/server/api/root";

type Simulado = inferRouterOutputs<AppRouter>["questao"]["simulados"][number];

type Props = {
  simulados: Simulado[];
};

type ModalState = {
  simulado: Simulado;
};

const COVER_FALLBACK = "/images/simulados/capa-default.svg";

function formatTempo(minutes: number): string {
  const horas = Math.floor(minutes / 60);
  const minutos = minutes % 60;
  if (minutos === 0) {
    return `${horas}h`;
  }
  if (horas === 0) {
    return `${minutos}min`;
  }
  return `${horas}h ${minutos}min`;
}

function formatQuestaoCount(quantidade: number): string {
  return `${quantidade} questão${quantidade === 1 ? "" : "es"}`;
}

function coverForYear(ano: number): string {
  return `/images/simulados/capa-${ano}.svg`;
}

function SimuladoCard({ simulado, onSelect }: { simulado: Simulado; onSelect: () => void }) {
  const { ano, titulo, questoes, tempoLimiteMinutos } = simulado;
  const capa = ano ? coverForYear(ano) : COVER_FALLBACK;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
    >
      <div className="relative h-40 w-full bg-gray-100">
        <Image
          src={capa}
          alt={`Capa do simulado ${ano}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between text-xs font-medium text-gray-600">
          <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Ano {ano}</span>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
            Tempo limite: {formatTempo(tempoLimiteMinutos)}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{titulo}</h3>
        <p className="text-sm text-gray-600">
          Prepare-se com {formatQuestaoCount(questoes)} selecionadas desse ano. Receba feedback imediato de acertos e erros ao
          longo da resolução.
        </p>
        <div className="mt-auto flex items-center justify-between text-sm font-semibold text-red-600">
          <span>{formatQuestaoCount(questoes)}</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 transition group-hover:bg-red-100">
            Iniciar simulado
            <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m13 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

export default function SimuladosClient({ simulados }: Props) {
  const router = useRouter();
  const [modalState, setModalState] = React.useState<ModalState | null>(null);

  const handleOpen = React.useCallback((simulado: Simulado) => {
    setModalState({ simulado });
  }, []);

  const handleClose = React.useCallback(() => {
    setModalState(null);
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (!modalState) return;
    router.push(`/simulados/${modalState.simulado.ano}`);
    setModalState(null);
  }, [modalState, router]);

  if (!simulados.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-12 text-center text-sm text-gray-600 shadow-sm">
        Nenhum simulado disponível no momento. Retorne após novos cadastros de questões.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {simulados.map((simulado) => (
          <SimuladoCard key={simulado.ano} simulado={simulado} onSelect={() => handleOpen(simulado)} />
        ))}
      </div>

      {modalState && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900">Iniciar {modalState.simulado.titulo}</h2>
            <p className="mt-3 text-sm text-gray-700">
              O simulado oficial do Vestibulinho possui 50 questões e limite de {formatTempo(modalState.simulado.tempoLimiteMinutos)}.
              Nesta plataforma você resolverá {formatQuestaoCount(modalState.simulado.questoes)} selecionadas desse ano, com um
              ambiente completo de prova e relatório final.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
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
