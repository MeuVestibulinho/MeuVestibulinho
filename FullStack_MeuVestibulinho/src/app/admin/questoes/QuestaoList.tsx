"use client";

import * as React from "react";
import clsx from "clsx";

import QuestionForm, {
  type DisciplinaOption,
  type GrauOption,
  type LetraOption,
  type QuestaoFormInitialValues,
  type QuestaoFormSubmitPayload,
  useInvalidateQuestoes,
} from "./QuestionForm";

import { api, type RouterInputs, type RouterOutputs } from "~/trpc/react";

const DEFAULT_PAGE_SIZE = 10;

type OrderByOption = NonNullable<RouterInputs["questao"]["list"]["orderBy"]>;

const ORDER_LABEL: Record<OrderByOption, string> = {
  newest: "Mais recentes",
  oldest: "Mais antigas",
};

type QuestaoListItem = RouterOutputs["questao"]["list"]["items"][number];

type FiltersState = {
  search: string;
  disciplina: DisciplinaOption[];
  grau: GrauOption[];
  ano: string;
  orderBy: OrderByOption;
};

type Props = {
  disciplinaOptions: DisciplinaOption[];
  grauOptions: GrauOption[];
  letraOptions: LetraOption[];
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

const createDefaultFilters = (): FiltersState => ({
  search: "",
  disciplina: [],
  grau: [],
  ano: "",
  orderBy: "newest",
});

function labelize(input: string): string {
  return input
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w|\s\w/g, (match) => match.toUpperCase());
}

function toInitialValues(questao: QuestaoListItem): QuestaoFormInitialValues {
  return {
    enunciado: questao.enunciado,
    disciplina: questao.disciplina,
    grauDificuldade: questao.grauDificuldade,
    ano: questao.ano ?? null,
    fonteUrl: questao.fonteUrl ?? null,
    imagemUrl: questao.imagemUrl ?? null,
    habilidades: questao.habilidades,
    conteudo: questao.conteudo,
    subconteudo: questao.subconteudo,
    alternativas: questao.alternativas.map((alt) => ({
      letra: alt.letra,
      texto: alt.texto,
      correta: alt.correta,
    })),
  };
}

function QuestionCard({ questao, onEdit, onDelete }: {
  questao: QuestaoListItem;
  onEdit: (questao: QuestaoListItem) => void;
  onDelete: (questao: QuestaoListItem) => void;
}) {
  const correctLabel = questao.alternativas
    .filter((alt) => alt.correta)
    .map((alt) => alt.letra)
    .join(", ");

  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <header className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
        {typeof questao.ano === "number" && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">Ano {questao.ano}</span>
        )}
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{labelize(questao.disciplina)}</span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{labelize(questao.grauDificuldade)}</span>
        <span className="ml-auto min-w-0 text-right text-[11px] text-gray-500">
          <span className="block break-words">
            Atualizada em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(questao.updatedAt)}
          </span>
        </span>
      </header>

      <div className="space-y-3 text-sm text-gray-800">
        <p className="min-w-0 break-words whitespace-pre-wrap font-medium leading-relaxed text-gray-900">
          {questao.enunciado}
        </p>
        <div className="grid min-w-0 gap-2 text-xs">
          <div className="rounded-lg bg-red-50/60 px-3 py-2">
            <span className="font-semibold text-red-700">Habilidades:&nbsp;</span>
            <span className="break-words text-red-900">{questao.habilidades}</span>
          </div>
          <div className="rounded-lg bg-orange-50/60 px-3 py-2">
            <span className="font-semibold text-orange-700">Conteúdo:&nbsp;</span>
            <span className="break-words text-orange-900">{questao.conteudo}</span>
          </div>
          <div className="rounded-lg bg-amber-50/60 px-3 py-2">
            <span className="font-semibold text-amber-700">Subconteúdo:&nbsp;</span>
            <span className="break-words text-amber-900">{questao.subconteudo}</span>
          </div>
        </div>
      </div>

      <ul className="grid min-w-0 gap-2 text-sm text-gray-700">
        {questao.alternativas.map((alt) => (
          <li
            key={alt.id}
            className={clsx(
              "flex min-w-0 items-start gap-3 rounded-xl border px-3 py-2 shadow-sm transition",
              alt.correta
                ? "border-green-300 bg-green-50/80"
                : "border-gray-200 bg-white",
            )}
          >
            <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-700">
              {alt.letra}
            </span>
            <span className="min-w-0 break-words text-sm leading-relaxed text-gray-800">
              {alt.texto}
            </span>
          </li>
        ))}
      </ul>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs text-gray-600">
        <span className="rounded-full bg-gray-100 px-2 py-1 font-medium">Gabarito: {correctLabel || "—"}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(questao)}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(questao)}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
          >
            Excluir
          </button>
        </div>
      </footer>
    </article>
  );
}

function EditQuestaoModal({
  questao,
  disciplinaOptions,
  grauOptions,
  letraOptions,
  onClose,
  onSuccess,
}: {
  questao: QuestaoListItem;
  disciplinaOptions: DisciplinaOption[];
  grauOptions: GrauOption[];
  letraOptions: LetraOption[];
  onClose: () => void;
  onSuccess: (message: FeedbackState) => void;
}) {
  const invalidateQuestoes = useInvalidateQuestoes();
  const updateQuestao = api.questao.update.useMutation({
    onSuccess: async () => {
      await invalidateQuestoes();
      onSuccess({ type: "success", message: "Questão atualizada com sucesso." });
      onClose();
    },
    onError: () => {
      onSuccess({ type: "error", message: "Não foi possível atualizar a questão." });
    },
  });

  const initialValues = React.useMemo(() => toInitialValues(questao), [questao]);

  async function handleSubmit(payload: QuestaoFormSubmitPayload) {
    await updateQuestao.mutateAsync({
      id: questao.id,
      data: {
        ...payload,
        ano:
          typeof payload.ano === "number"
            ? payload.ano
            : questao.ano !== null
              ? null
              : undefined,
        fonteUrl:
          typeof payload.fonteUrl === "string"
            ? payload.fonteUrl
            : questao.fonteUrl !== null
              ? null
              : undefined,
        imagemUrl:
          typeof payload.imagemUrl === "string"
            ? payload.imagemUrl
            : questao.imagemUrl !== null
              ? null
              : undefined,
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Editar questão</h2>
            <p className="text-sm text-gray-600">
              Atualize os dados da questão e salve para manter o banco consistente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
          >
            Fechar
          </button>
        </div>

        <QuestionForm
          key={questao.id}
          initialValues={initialValues}
          disciplinaOptions={disciplinaOptions}
          grauOptions={grauOptions}
          letraOptions={letraOptions}
          onSubmit={handleSubmit}
          submitLabel="Salvar alterações"
          isSubmitting={updateQuestao.isPending}
          successMessage="Questão atualizada com sucesso!"
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

export default function QuestaoList({ disciplinaOptions, grauOptions, letraOptions }: Props) {
  const [page, setPage] = React.useState(1);
  const [filtersForm, setFiltersForm] = React.useState<FiltersState>(createDefaultFilters);
  const [activeFilters, setActiveFilters] = React.useState<FiltersState>(createDefaultFilters);
  const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);
  const [editingQuestao, setEditingQuestao] = React.useState<QuestaoListItem | null>(null);

  const invalidateQuestoes = useInvalidateQuestoes();

  const listQuery = api.questao.list.useQuery(
    {
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      search: activeFilters.search.trim() || undefined,
      disciplina: activeFilters.disciplina.length ? activeFilters.disciplina : undefined,
      grau: activeFilters.grau.length ? activeFilters.grau : undefined,
      ano: activeFilters.ano.trim() ? Number.parseInt(activeFilters.ano, 10) : undefined,
      orderBy: activeFilters.orderBy,
    },
  );

  const deleteQuestao = api.questao.delete.useMutation({
    onSuccess: async () => {
      await invalidateQuestoes();
      setFeedback({ type: "success", message: "Questão excluída com sucesso." });
    },
    onError: () => {
      setFeedback({ type: "error", message: "Erro ao excluir questão. Tente novamente." });
    },
  });

  React.useEffect(() => {
    if (feedback) {
      const id = window.setTimeout(() => setFeedback(null), 4000);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [feedback]);

  function handleToggleDisciplina(value: DisciplinaOption) {
    setFiltersForm((prev) => ({
      ...prev,
      disciplina: prev.disciplina.includes(value)
        ? prev.disciplina.filter((d) => d !== value)
        : [...prev.disciplina, value],
    }));
  }

  function handleToggleGrau(value: GrauOption) {
    setFiltersForm((prev) => ({
      ...prev,
      grau: prev.grau.includes(value)
        ? prev.grau.filter((g) => g !== value)
        : [...prev.grau, value],
    }));
  }

  function applyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActiveFilters({
      ...filtersForm,
      disciplina: [...filtersForm.disciplina],
      grau: [...filtersForm.grau],
    });
    setPage(1);
  }

  function resetFilters() {
    const defaults = createDefaultFilters();
    setFiltersForm(defaults);
    setActiveFilters(defaults);
    setPage(1);
  }

  async function handleDelete(questao: QuestaoListItem) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a questão selecionada? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;
    await deleteQuestao.mutateAsync({ id: questao.id });
  }

  const totalPages = listQuery.data?.meta.totalPages ?? 1;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Banco de questões</h2>
        <p className="text-sm text-gray-600">
          Utilize os filtros para localizar questões específicas e gerenciar rapidamente o conteúdo cadastrado.
        </p>
      </header>

      <form
        onSubmit={applyFilters}
        className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="search">
              Buscar por enunciado
            </label>
            <input
              id="search"
              type="text"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Digite um trecho do enunciado"
              value={filtersForm.search}
              onChange={(e) => setFiltersForm((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">Disciplinas</span>
            <div className="flex flex-wrap gap-2">
              {disciplinaOptions.map((disc) => {
                const checked = filtersForm.disciplina.includes(disc);
                return (
                  <label
                    key={`disc-${disc}`}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition",
                      checked
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-gray-200 bg-white text-gray-600",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={checked}
                      onChange={() => handleToggleDisciplina(disc)}
                    />
                    {labelize(disc)}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">Dificuldade</span>
            <div className="flex flex-wrap gap-2">
              {grauOptions.map((value) => {
                const checked = filtersForm.grau.includes(value);
                return (
                  <label
                    key={`grau-${value}`}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition",
                      checked
                        ? "border-orange-300 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-gray-600",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={checked}
                      onChange={() => handleToggleGrau(value)}
                    />
                    {labelize(value)}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="ano">
              Ano da prova
            </label>
            <input
              id="ano"
              type="number"
              min={1900}
              max={2100}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              value={filtersForm.ano}
              onChange={(e) => setFiltersForm((prev) => ({ ...prev, ano: e.target.value }))}
              placeholder="2024"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="orderBy">
              Ordenação
            </label>
            <select
              id="orderBy"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              value={filtersForm.orderBy}
              onChange={(e) =>
                setFiltersForm((prev) => ({
                  ...prev,
                  orderBy: e.target.value as OrderByOption,
                }))
              }
            >
              {Object.entries(ORDER_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Limpar filtros
          </button>
          <button
            type="submit"
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Aplicar filtros
          </button>
        </div>
      </form>

      {feedback && (
        <div
          className={clsx(
            "rounded-2xl border px-4 py-3 text-sm",
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {feedback.message}
        </div>
      )}

      <div className="space-y-4">
        {listQuery.isLoading ? (
          <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-500">
            Carregando questões...
          </div>
        ) : listQuery.data && listQuery.data.items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-500">
            Nenhuma questão encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="grid gap-4">
            {listQuery.data?.items.map((questao) => (
              <QuestionCard
                key={questao.id}
                questao={questao}
                onEdit={(item) => setEditingQuestao(item)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {listQuery.data && listQuery.data.items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm shadow-sm">
          <div className="text-gray-600">
            Página {listQuery.data.meta.page} de {totalPages} — {listQuery.data.meta.total} questões
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || listQuery.isFetching}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || listQuery.isFetching}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {editingQuestao && (
        <EditQuestaoModal
          questao={editingQuestao}
          disciplinaOptions={disciplinaOptions}
          grauOptions={grauOptions}
          letraOptions={letraOptions}
          onClose={() => setEditingQuestao(null)}
          onSuccess={(message) => setFeedback(message)}
        />
      )}
    </section>
  );
}
