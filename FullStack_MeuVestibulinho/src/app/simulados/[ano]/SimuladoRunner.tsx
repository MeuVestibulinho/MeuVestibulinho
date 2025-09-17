
"use client";

import * as React from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "~/server/api/root";

function labelize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);
  const pad = (input: number) => input.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

type SimuladoDetalhes = inferRouterOutputs<AppRouter>["questao"]["simuladoDetalhes"];

type AnswerStatus = "unanswered" | "skipped" | "correct" | "incorrect";

type AnswerState = {
  selectedAlternativeId: string | null;
  status: AnswerStatus;
};

type Props = {
  simulado: SimuladoDetalhes;
};

type FinalizationReason = "manual" | "timeout";

type ReportResumo = {
  conteudo: string;
  subconteudo: string;
  quantidade: number;
  recomendacao?: string;
};

type ReportData = {
  totalQuestoes: number;
  acertos: number;
  erros: number;
  puladas: number;
  percentualAcerto: number;
  tempoTotal: string;
  tempoMedio: string;
  conteudosAcertos: ReportResumo[];
  conteudosErros: ReportResumo[];
};

export default function SimuladoRunner({ simulado }: Props) {
  const router = useRouter();
  const totalQuestoes = simulado.questoes.length;
  const startTimestampRef = React.useRef<number>(Date.now());

  const [questionOrder, setQuestionOrder] = React.useState<string[]>(() =>
    simulado.questoes.map((questao) => questao.id),
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, AnswerState>>(() => {
    const initial: Record<string, AnswerState> = {};
    for (const questao of simulado.questoes) {
      initial[questao.id] = { selectedAlternativeId: null, status: "unanswered" };
    }
    return initial;
  });
  const [status, setStatus] = React.useState<"in-progress" | "finished">("in-progress");
  const [finalizationReason, setFinalizationReason] = React.useState<FinalizationReason | null>(null);
  const [finishedAt, setFinishedAt] = React.useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = React.useState(simulado.tempoLimiteMinutos * 60);
  const [reportVisible, setReportVisible] = React.useState(false);

  const questoesMap = React.useMemo(() => {
    const map = new Map<string, SimuladoDetalhes["questoes"][number]>();
    simulado.questoes.forEach((questao) => {
      map.set(questao.id, questao);
    });
    return map;
  }, [simulado.questoes]);

  const currentQuestionId = questionOrder[currentIndex];
  const currentQuestion = currentQuestionId ? questoesMap.get(currentQuestionId) ?? null : null;
  const currentAnswer = currentQuestionId ? answers[currentQuestionId] : undefined;

  const stats = React.useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    Object.values(answers).forEach((answer) => {
      if (!answer) return;
      if (answer.status === "correct") correct += 1;
      else if (answer.status === "incorrect") incorrect += 1;
      else if (answer.status === "skipped") skipped += 1;
    });

    return {
      correct,
      incorrect,
      skipped,
      answered: correct + incorrect,
    };
  }, [answers]);

  const allAnswered = React.useMemo(
    () =>
      questionOrder.every((id) => {
        const answer = answers[id];
        return answer && (answer.status === "correct" || answer.status === "incorrect");
      }),
    [answers, questionOrder],
  );

  const progressPercent = totalQuestoes === 0 ? 0 : Math.round((stats.answered / totalQuestoes) * 100);

  const finalizeSimulado = React.useCallback(
    (reason: FinalizationReason) => {
      setStatus((prev) => {
        if (prev === "finished") {
          return prev;
        }
        setFinalizationReason((previous) => previous ?? reason);
        setFinishedAt((previous) => previous ?? Date.now());
        if (reason === "timeout") {
          setTimeRemaining(0);
        }
        return "finished";
      });
    },
    [],
  );

  React.useEffect(() => {
    if (status === "finished") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          finalizeSimulado("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [finalizeSimulado, status]);

  React.useEffect(() => {
    if (status === "finished") {
      setReportVisible(true);
    }
  }, [status]);

  const handleSelectAlternative = React.useCallback(
    (questaoId: string, alternativaId: string) => {
      if (status === "finished") return;
      const questao = questoesMap.get(questaoId);
      if (!questao) return;
      const alternativa = questao.alternativas.find((alt) => alt.id === alternativaId);
      if (!alternativa) return;

      setAnswers((prev) => ({
        ...prev,
        [questaoId]: {
          selectedAlternativeId: alternativaId,
          status: alternativa.correta ? "correct" : "incorrect",
        },
      }));
    },
    [questoesMap, status],
  );

  const handleSkip = React.useCallback(() => {
    if (status === "finished") return;
    const questaoId = questionOrder[currentIndex];
    if (!questaoId) return;
    const answer = answers[questaoId];
    if (answer && (answer.status === "correct" || answer.status === "incorrect")) {
      return;
    }

    const newOrder = [...questionOrder];
    newOrder.splice(currentIndex, 1);
    newOrder.push(questaoId);
    setQuestionOrder(newOrder);
    setAnswers((prev) => ({
      ...prev,
      [questaoId]: {
        selectedAlternativeId: null,
        status: "skipped",
      },
    }));

    if (newOrder.length > 1 && currentIndex >= newOrder.length - 1) {
      setCurrentIndex(0);
    }
  }, [answers, currentIndex, questionOrder, status]);

  const handleNavigate = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= questionOrder.length) return;
      setCurrentIndex(index);
    },
    [questionOrder.length],
  );

  const handlePrev = React.useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => Math.min(questionOrder.length - 1, prev + 1));
  }, [questionOrder.length]);

  const handleFinish = React.useCallback(() => {
    if (status === "finished") return;
    if (!allAnswered) {
      const proceed = window.confirm(
        "Ainda há questões sem resposta. Deseja realmente encerrar o simulado agora?",
      );
      if (!proceed) {
        return;
      }
    }
    finalizeSimulado("manual");
  }, [allAnswered, finalizeSimulado, status]);

  const orderedQuestoes = React.useMemo(
    () =>
      questionOrder
        .map((id, index) => {
          const questao = questoesMap.get(id);
          if (!questao) return null;
          return { questao, index };
        })
        .filter((entry): entry is { questao: SimuladoDetalhes["questoes"][number]; index: number } => entry !== null),
    [questoesMap, questionOrder],
  );

  const summarizeConteudo = React.useCallback(
    (predicate: (answer: AnswerState | undefined) => boolean): ReportResumo[] => {
      const map = new Map<string, ReportResumo>();
      simulado.questoes.forEach((questao) => {
        const answer = answers[questao.id];
        if (!predicate(answer)) {
          return;
        }
        const key = `${questao.conteudo}|${questao.subconteudo}`;
        const current = map.get(key);
        if (current) {
          current.quantidade += 1;
        } else {
          map.set(key, {
            conteudo: questao.conteudo,
            subconteudo: questao.subconteudo,
            quantidade: 1,
          });
        }
      });
      return Array.from(map.values());
    },
    [answers, simulado.questoes],
  );

  const report = React.useMemo<ReportData | null>(() => {
    if (status !== "finished" || !finishedAt) {
      return null;
    }

    const totalSeconds = Math.max(1, Math.round((finishedAt - startTimestampRef.current) / 1000));
    const percentual = totalQuestoes === 0 ? 0 : (stats.correct / totalQuestoes) * 100;

    const conteudosAcertos = summarizeConteudo((answer) => answer?.status === "correct");
    const conteudosErros = summarizeConteudo((answer) =>
      answer?.status === "incorrect" || answer?.status === "skipped",
    ).map((item) => ({
      ...item,
      recomendacao: `Reforce os estudos em ${item.conteudo} (${item.subconteudo}) com revisão teórica e exercícios aplicados.`,
    }));

    return {
      totalQuestoes,
      acertos: stats.correct,
      erros: stats.incorrect,
      puladas: stats.skipped,
      percentualAcerto: Number.isFinite(percentual) ? Math.round(percentual * 10) / 10 : 0,
      tempoTotal: formatSeconds(totalSeconds),
      tempoMedio: formatSeconds(Math.round(totalSeconds / Math.max(1, totalQuestoes))),
      conteudosAcertos,
      conteudosErros,
    };
  }, [finishedAt, stats, status, summarizeConteudo, totalQuestoes]);

  const tempoRestanteCritico = timeRemaining <= 5 * 60;
  const canSkip =
    status !== "finished" &&
    !!currentAnswer &&
    currentAnswer.status !== "correct" &&
    currentAnswer.status !== "incorrect" &&
    questionOrder.length > 0;

  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < questionOrder.length - 1;

  return (
    <div className="space-y-6 pb-12">
      <header className="sticky top-16 z-20 -mx-4 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">{simulado.titulo}</h1>
          <p className="text-sm text-gray-600">
            Tempo limite de {simulado.tempoLimiteMinutos / 60} horas · {totalQuestoes} questão{totalQuestoes === 1 ? "" : "es"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-gray-100 px-4 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase text-gray-500">Tempo restante</p>
            <p
              className={clsx(
                "font-mono text-lg font-semibold",
                tempoRestanteCritico ? "text-red-600" : "text-gray-800",
              )}
            >
              {formatSeconds(timeRemaining)}
            </p>
          </div>
          <div className="rounded-2xl bg-green-50 px-4 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase text-green-700">Acertos</p>
            <p className="text-lg font-semibold text-green-700">{stats.correct}</p>
          </div>
          <div className="rounded-2xl bg-red-50 px-4 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase text-red-700">Erros</p>
            <p className="text-lg font-semibold text-red-700">{stats.incorrect}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase text-amber-700">Puladas</p>
            <p className="text-lg font-semibold text-amber-700">{stats.skipped}</p>
          </div>
        </div>
        <div className="w-full md:max-w-xs">
          <p className="text-xs font-semibold uppercase text-gray-500">Progresso</p>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-red-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-600">
            {stats.answered} de {totalQuestoes} respondidas
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          {currentQuestion ? (
            <React.Fragment>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Questão {currentIndex + 1} de {totalQuestoes}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {labelize(currentQuestion.disciplina)} · {labelize(currentQuestion.grauDificuldade)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={!canSkip}
                    className={clsx(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      canSkip
                        ? "border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100"
                        : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
                    )}
                  >
                    Pular questão
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={status === "finished"}
                    className={clsx(
                      "rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
                      status === "finished"
                        ? "cursor-not-allowed bg-gray-300"
                        : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300",
                    )}
                  >
                    Encerrar simulado
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
                  Conteúdo: {currentQuestion.conteudo}
                </span>
                <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700">
                  Subconteúdo: {currentQuestion.subconteudo}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                  Habilidades: {currentQuestion.habilidades}
                </span>
              </div>

              {currentQuestion.imagemUrl && (
                <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentQuestion.imagemUrl}
                    alt="Ilustração da questão"
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}

              <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
                {currentQuestion.enunciado}
              </p>

              <div className="space-y-3">
                {currentQuestion.alternativas.map((alternativa) => {
                  const isSelected = currentAnswer?.selectedAlternativeId === alternativa.id;
                  const isCorrect = alternativa.correta;
                  const isAnswered =
                    currentAnswer?.status === "correct" || currentAnswer?.status === "incorrect";
                  const shouldRevealCorrect = isAnswered || status === "finished";

                  const variant = clsx(
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    isSelected && !shouldRevealCorrect && "border-red-200 bg-red-50",
                    shouldRevealCorrect && isCorrect && "border-green-300 bg-green-50",
                    shouldRevealCorrect && isSelected && !isCorrect && "border-red-300 bg-red-50",
                    !isSelected && !isCorrect && "border-gray-200 bg-white hover:border-red-200",
                    status === "finished" && !isCorrect && "opacity-90",
                  );

                  return (
                    <button
                      key={alternativa.id}
                      type="button"
                      onClick={() => handleSelectAlternative(currentQuestion.id, alternativa.id)}
                      disabled={status === "finished"}
                      className={variant}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-gray-100 px-2 text-sm font-semibold text-gray-700">
                          {alternativa.letra}
                        </span>
                        <span className="text-sm leading-relaxed text-gray-800">{alternativa.texto}</span>
                        {shouldRevealCorrect && isCorrect && (
                          <span className="ml-auto inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Correta
                          </span>
                        )}
                        {shouldRevealCorrect && isSelected && !isCorrect && (
                          <span className="ml-auto inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            Sua resposta
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap justify-between gap-3 pt-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!canNavigatePrev}
                  className={clsx(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    canNavigatePrev
                      ? "border-gray-300 bg-white text-gray-700 hover:border-red-200 hover:text-red-600"
                      : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
                  )}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canNavigateNext}
                  className={clsx(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    canNavigateNext
                      ? "border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100"
                      : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
                  )}
                >
                  Próxima
                </button>
              </div>
            </React.Fragment>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-500">
              Nenhuma questão disponível para este simulado.
            </div>
          )}
        </section>

        <aside className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Navegação</h3>
            {status === "finished" && !reportVisible && (
              <button
                type="button"
                onClick={() => setReportVisible(true)}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Ver relatório
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {orderedQuestoes.map(({ questao, index }) => {
              const answer = answers[questao.id];
              const isActive = index === currentIndex;
              const statusClass = (() => {
                if (answer?.status === "correct") return "bg-green-100 text-green-700 border-green-200";
                if (answer?.status === "incorrect") return "bg-red-100 text-red-700 border-red-200";
                if (answer?.status === "skipped") return "bg-amber-100 text-amber-800 border-amber-200";
                return "bg-gray-100 text-gray-600 border-gray-200";
              })();

              return (
                <button
                  key={questao.id}
                  type="button"
                  onClick={() => handleNavigate(index)}
                  className={clsx(
                    "flex h-10 items-center justify-center rounded-xl border text-sm font-semibold transition",
                    statusClass,
                    isActive && "ring-2 ring-red-300",
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-700">Legenda:</p>
            <ul className="mt-2 space-y-1">
              <li>
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> <span className="ml-1">Respondida corretamente</span>
              </li>
              <li>
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> <span className="ml-1">Respondida incorretamente</span>
              </li>
              <li>
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> <span className="ml-1">Pulada</span>
              </li>
              <li>
                <span className="inline-block h-2 w-2 rounded-full bg-gray-400" /> <span className="ml-1">Sem resposta</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {reportVisible && report && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Relatório do simulado</h2>
                <p className="text-sm text-gray-600">
                  {finalizationReason === "timeout"
                    ? "Tempo esgotado. Revise os conteúdos abaixo para aprimorar seu desempenho."
                    : allAnswered
                    ? "Parabéns! Você respondeu todas as questões deste simulado."
                    : "Simulado finalizado. Utilize as recomendações para evoluir."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setReportVisible(false)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Fechar relatório
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/simulados")}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Voltar para simulados
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Acertos</p>
                <p className="text-2xl font-bold text-green-700">{report.acertos}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Erros</p>
                <p className="text-2xl font-bold text-red-600">{report.erros}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-gray-500">% de acerto</p>
                <p className="text-2xl font-bold text-gray-800">{report.percentualAcerto.toFixed(1)}%</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Tempo total</p>
                <p className="text-2xl font-bold text-gray-800">{report.tempoTotal}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Tempo médio por questão</p>
                <p className="text-2xl font-bold text-gray-800">{report.tempoMedio}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Questões puladas</p>
                <p className="text-2xl font-bold text-amber-600">{report.puladas}</p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900">Conteúdos dominados</h3>
                {report.conteudosAcertos.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">Nenhum conteúdo com acertos registrados.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {report.conteudosAcertos.map((item) => (
                      <li
                        key={`${item.conteudo}-${item.subconteudo}`}
                        className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                      >
                        <p className="font-semibold">{item.conteudo}</p>
                        <p className="text-xs text-green-700">{item.subconteudo}</p>
                        <p className="mt-1 text-xs text-green-700">
                          {item.quantidade} questão{item.quantidade === 1 ? "" : "s"} respondida{item.quantidade === 1 ? "" : "s"} corretamente.
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900">Conteúdos para revisar</h3>
                {report.conteudosErros.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">Nenhum erro registrado. Excelente desempenho!</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {report.conteudosErros.map((item) => (
                      <li
                        key={`${item.conteudo}-${item.subconteudo}`}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                      >
                        <p className="font-semibold">{item.conteudo}</p>
                        <p className="text-xs text-red-700">{item.subconteudo}</p>
                        <p className="mt-1 text-xs text-red-700">
                          {item.quantidade} questão{item.quantidade === 1 ? "" : "s"} com necessidade de revisão.
                        </p>
                        {item.recomendacao && (
                          <p className="mt-1 text-xs text-red-700">{item.recomendacao}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
