"use client";

import * as React from "react";
import Image from "next/image";
import clsx from "clsx";
import type { inferRouterOutputs } from "@trpc/server";

import { api } from "~/trpc/react";
import type { AppRouter } from "~/server/api/root";
import { ADMIN_VIEW_LABEL, type AdminView } from "./views";
import NewQuestionForm from "./questoes/NewQuestionForm";
import QuestaoList from "./questoes/QuestaoList";
import type {
  DisciplinaOption,
  GrauOption,
  LetraOption,
} from "./questoes/QuestionForm";

const COVER_FALLBACK = "/images/simulados/capa-default.svg";

function coverForYear(ano: number): string {
  return `/images/simulados/capa-${ano}.svg`;
}

type Overview = inferRouterOutputs<AppRouter>["admin"]["overview"];
type UserListItem =
  inferRouterOutputs<AppRouter>["admin"]["listUsers"]["items"][number];

type UploadFeedback = {
  ano: number;
  message: string;
  type: "success" | "error";
};

type Props = {
  currentUserId: string;
  initialOverview: Overview;
  activeView: AdminView;
  disciplinaOptions: DisciplinaOption[];
  grauOptions: GrauOption[];
  letraOptions: LetraOption[];
};

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const instance = typeof date === "string" ? new Date(date) : date;
  return instance.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboardClient({
  currentUserId,
  initialOverview,
  activeView,
  disciplinaOptions,
  grauOptions,
  letraOptions,
}: Props) {
  const utils = api.useUtils();
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<UserListItem | null>(
    null,
  );
  const [uploadingAno, setUploadingAno] = React.useState<number | null>(null);
  const [uploadFeedback, setUploadFeedback] =
    React.useState<UploadFeedback | null>(null);

  const isOverview = activeView === "overview";

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(handle);
  }, [search]);

  React.useEffect(() => {
    if (!isOverview) {
      return;
    }
    setPage(1);
  }, [debouncedSearch, isOverview]);

  React.useEffect(() => {
    if (!isOverview) {
      setSelectedUser(null);
      setUploadFeedback(null);
    }
  }, [isOverview]);

  const overviewQuery = api.admin.overview.useQuery(undefined, {
    initialData: initialOverview,
    staleTime: 30_000,
    enabled: isOverview,
  });

  const usersQuery = api.admin.listUsers.useQuery(
    {
      page,
      pageSize,
      search: debouncedSearch || undefined,
    },
    {
      enabled: isOverview,
    },
  );

  React.useEffect(() => {
    if (!isOverview || !usersQuery.data) {
      return;
    }
    const totalPages = Math.max(1, usersQuery.data.meta.totalPages);
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [isOverview, page, usersQuery.data]);

  const simuladosQuery = api.admin.simulados.useQuery(undefined, {
    staleTime: 60_000,
    enabled: isOverview,
  });

  const promoteMutation = api.admin.promoteUser.useMutation({
    onSuccess: () => {
      void utils.admin.listUsers.invalidate();
      void utils.admin.overview.invalidate();
    },
  });

  const demoteMutation = api.admin.demoteUser.useMutation({
    onSuccess: () => {
      void utils.admin.listUsers.invalidate();
      void utils.admin.overview.invalidate();
    },
  });

  const deleteMutation = api.admin.deleteUser.useMutation({
    onSuccess: () => {
      void utils.admin.listUsers.invalidate();
      void utils.admin.overview.invalidate();
    },
  });

  const userStatsQuery = api.stats.getByUserId.useQuery(
    { userId: selectedUser?.id ?? "" },
    { enabled: isOverview && !!selectedUser?.id },
  );

  const handlePromote = React.useCallback(
    async (userId: string) => {
      await promoteMutation.mutateAsync({ userId });
    },
    [promoteMutation],
  );

  const handleDemote = React.useCallback(
    async (userId: string) => {
      await demoteMutation.mutateAsync({ userId });
    },
    [demoteMutation],
  );

  const handleDelete = React.useCallback(
    async (userId: string) => {
      const confirmed = window.confirm(
        "Esta ação excluirá o usuário e bloqueará o e-mail para futuros cadastros. Deseja continuar?",
      );
      if (!confirmed) {
        return;
      }

      await deleteMutation.mutateAsync({ userId });
    },
    [deleteMutation],
  );

  const handleUpload = React.useCallback(
    async (ano: number, file: File) => {
      setUploadingAno(ano);
      setUploadFeedback(null);
      try {
        const formData = new FormData();
        formData.append("ano", String(ano));
        formData.append("file", file);

        const response = await fetch("/api/admin/simulados/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Falha ao enviar imagem");
        }

        setUploadFeedback({
          ano,
          message: "Imagem atualizada com sucesso!",
          type: "success",
        });
        await Promise.all([
          utils.admin.simulados.invalidate(),
          utils.questao.simulados.invalidate(),
          utils.admin.overview.invalidate(),
        ]);
      } catch (error) {
        console.error(error);
        setUploadFeedback({
          ano,
          message:
            error instanceof Error
              ? error.message
              : "Não foi possível enviar a imagem.",
          type: "error",
        });
      } finally {
        setUploadingAno(null);
      }
    },
    [utils.admin.overview, utils.admin.simulados, utils.questao.simulados],
  );

  const handleFileChange = React.useCallback(
    (ano: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        setUploadFeedback({
          ano,
          message: "Selecione uma imagem de até 5MB.",
          type: "error",
        });
        event.target.value = "";
        return;
      }
      void handleUpload(ano, file);
      event.target.value = "";
    },
    [handleUpload],
  );

  const overview = overviewQuery.data ?? initialOverview;
  const users = usersQuery.data?.items ?? [];
  const meta = usersQuery.data?.meta;
  const simulados = simuladosQuery.data ?? [];

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          {ADMIN_VIEW_LABEL[activeView]}
        </span>
        <h1 className="text-3xl font-semibold text-gray-900">Administração</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          {isOverview
            ? "Gerencie usuários, acompanhe estatísticas e personalize os simulados da plataforma."
            : "Cadastre novas questões, mantenha o banco atualizado e organize os simulados em um só lugar."}
        </p>
      </header>

      {isOverview ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Usuários ativos
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {overview.totalUsers}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {overview.adminCount} administradore
                {overview.adminCount === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Estatísticas registradas
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {overview.statsRegistradas}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Usuários com histórico de simulados.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">
                E-mails bloqueados
              </p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {overview.blacklistCount}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Proteção contra recriações maliciosas.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Simulados disponíveis
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {overview.simuladosDisponiveis}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {overview.simuladosComCapa} com capa personalizada.
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Gestão de usuários
                </h2>
                <p className="text-xs text-gray-500">
                  Pesquise por nome, e-mail ou ID para atualizar permissões e
                  revisar estatísticas individuais.
                </p>
              </div>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, e-mail ou ID"
                className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-300 md:max-w-xs"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3">Papel</th>
                    <th className="px-4 py-3">Estatísticas</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersQuery.isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-sm text-gray-500"
                      >
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-sm text-gray-500"
                      >
                        Nenhum usuário encontrado com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const isCurrentUser = user.id === currentUserId;
                      const statsSummary = user.statistics
                        ? `${user.statistics.totalAcertos} acertos · ${user.statistics.totalErros} erros · ${user.statistics.simuladosConcluidos} simulados`
                        : "Sem registros";

                      return (
                        <tr key={user.id} className="bg-white">
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-xl">
                                {user.avatarEmoji}
                              </div>
                              <div className="space-y-1">
                                <p className="font-semibold text-gray-900">
                                  {user.name ?? "Usuário sem nome"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.email ?? "—"}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {user.username
                                    ? `@${user.username}`
                                    : "Sem nome de usuário"}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  ID: {user.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={clsx(
                                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                                user.role === "ADMIN"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700",
                              )}
                            >
                              {user.role === "ADMIN"
                                ? "Administrador"
                                : "Usuário"}
                            </span>
                            <p className="mt-1 text-[11px] text-gray-400">
                              Desde {formatDate(user.createdAt)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {statsSummary}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedUser(user)}
                                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                              >
                                Ver estatísticas
                              </button>
                              {user.role !== "ADMIN" ? (
                                <button
                                  type="button"
                                  onClick={() => void handlePromote(user.id)}
                                  disabled={promoteMutation.isPending}
                                  className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-100"
                                >
                                  Promover
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void handleDemote(user.id)}
                                  disabled={
                                    isCurrentUser || demoteMutation.isPending
                                  }
                                  className={clsx(
                                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                                    isCurrentUser
                                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                      : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100",
                                  )}
                                >
                                  Rebaixar
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => void handleDelete(user.id)}
                                disabled={
                                  isCurrentUser || deleteMutation.isPending
                                }
                                className={clsx(
                                  "rounded-full border px-3 py-1 text-xs font-semibold transition",
                                  isCurrentUser
                                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                    : "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100",
                                )}
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  Página {meta.page} de {meta.totalPages} · {meta.total} usuário
                  {meta.total === 1 ? "" : "s"}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={meta.page <= 1}
                    className={clsx(
                      "rounded-full border px-4 py-2 text-xs font-semibold transition",
                      meta.page <= 1
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:text-red-600",
                    )}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(meta.totalPages, current + 1),
                      )
                    }
                    disabled={meta.page >= meta.totalPages}
                    className={clsx(
                      "rounded-full border px-4 py-2 text-xs font-semibold transition",
                      meta.page >= meta.totalPages
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100",
                    )}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Capas dos simulados
                </h2>
                <p className="text-xs text-gray-500">
                  Personalize as imagens exibidas nos cards. Formatos suportados:
                  PNG, JPG, WEBP ou AVIF até 5MB.
                </p>
              </div>
            </div>

            {simuladosQuery.isLoading ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                Carregando simulados...
              </p>
            ) : simulados.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                Nenhum simulado disponível. Cadastre questões para liberar esta
                área.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {simulados.map((item) => {
                  const metadata = item.metadata;
                  const capa =
                    metadata?.coverImageUrl ??
                    coverForYear(item.ano) ??
                    COVER_FALLBACK;
                  const feedbackActive =
                    uploadFeedback && uploadFeedback.ano === item.ano;

                  return (
                    <div
                      key={item.ano}
                      className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="relative h-40 w-full bg-gray-100">
                        <Image
                          src={capa}
                          alt={`Capa do simulado ${item.ano}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-4 p-5">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                            Ano {item.ano}
                          </span>
                          <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
                            {item.questoes} questão
                            {item.questoes === 1 ? "" : "s"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {metadata?.descricao ??
                            "Atualize a capa para destacar este simulado na vitrine principal."}
                        </p>
                        <div className="mt-auto space-y-2">
                          <label className="flex cursor-pointer flex-col items-start gap-2 text-xs font-semibold text-gray-700">
                            <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600">
                              Escolher imagem
                            </span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/avif"
                              className="hidden"
                              onChange={(event) =>
                                handleFileChange(item.ano, event)
                              }
                            />
                          </label>
                          {feedbackActive && (
                            <p
                              className={clsx(
                                "text-xs",
                                uploadFeedback.type === "success"
                                  ? "text-green-600"
                                  : "text-red-600",
                              )}
                            >
                              {uploadFeedback.message}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-400">
                            {metadata?.updatedAt
                              ? `Última atualização: ${formatDate(metadata.updatedAt)}`
                              : "Capa padrão"}
                          </p>
                        </div>
                      </div>
                      {uploadingAno === item.ano && (
                        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-center text-xs text-gray-500">
                          Enviando imagem...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {selectedUser && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
            >
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                      {selectedUser.avatarEmoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Estatísticas de{" "}
                        {selectedUser.name ?? selectedUser.email ?? "usuário"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedUser.username ? `@${selectedUser.username} · ` : ""}
                        ID: {selectedUser.id}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                </div>

                {userStatsQuery.isLoading ? (
                  <p className="mt-6 text-sm text-gray-500">
                    Carregando estatísticas...
                  </p>
                ) : userStatsQuery.data ? (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Acertos
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {userStatsQuery.data.totalAcertos}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Erros
                        </p>
                        <p className="text-xl font-bold text-red-600">
                          {userStatsQuery.data.totalErros}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Simulados
                        </p>
                        <p className="text-xl font-bold text-gray-800">
                          {userStatsQuery.data.simuladosConcluidos}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                          <tr>
                            <th className="px-4 py-3">Conteúdo</th>
                            <th className="px-4 py-3">Subconteúdo</th>
                            <th className="px-4 py-3 text-center">Acertos</th>
                            <th className="px-4 py-3 text-center">Erros</th>
                            <th className="px-4 py-3 text-center">
                              Aproveitamento
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {userStatsQuery.data.conteudosDetalhados.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-6 text-center text-sm text-gray-500"
                              >
                                Nenhuma estatística registrada para este usuário.
                              </td>
                            </tr>
                          ) : (
                            userStatsQuery.data.conteudosDetalhados.map((item) => (
                              <tr
                                key={`${item.conteudo}-${item.subconteudo}-admin`}
                                className="bg-white"
                              >
                                <td className="px-4 py-3 font-medium text-gray-800">
                                  {item.conteudo}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {item.subconteudo}
                                </td>
                                <td className="px-4 py-3 text-center text-green-700">
                                  {item.acertos}
                                </td>
                                <td className="px-4 py-3 text-center text-red-600">
                                  {item.erros}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-700">
                                  {item.percentualAcerto.toFixed(1)}%
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-gray-500">
                    Sem estatísticas registradas para este usuário.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <section className="space-y-8">
          <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Cadastrar nova questão
              </h2>
              <p className="text-sm text-gray-600">
                Preencha todas as informações obrigatórias para manter os
                simulados completos e alinhados às habilidades desejadas.
              </p>
            </div>
            <NewQuestionForm
              disciplinaOptions={disciplinaOptions}
              grauOptions={grauOptions}
              letraOptions={letraOptions}
            />
          </div>

          <QuestaoList
            disciplinaOptions={disciplinaOptions}
            grauOptions={grauOptions}
            letraOptions={letraOptions}
          />
        </section>
      )}
    </div>
  );
}
