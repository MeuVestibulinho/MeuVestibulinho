import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth, swallowSessionTokenError } from "~/server/auth";
import { api } from "~/trpc/server";
import ProfileSettingsCard from "./ProfileSettingsCard";
import { AVATAR_EMOJIS, normalizeAvatarEmoji } from "~/lib/profile";

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}min`);
  }
  if (parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(" ");
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch (error) {
    if (!swallowSessionTokenError(error)) {
      throw error;
    }
  }

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  const [stats, profile] = await Promise.all([
    api.stats.getOwn(),
    api.profile.getCurrent(),
  ]);
  const percentualGlobal = stats && stats.totalQuestoes > 0
    ? Math.round(((stats.totalAcertos / stats.totalQuestoes) * 100) * 10) / 10
    : 0;
  const avatarEmoji = normalizeAvatarEmoji(profile?.avatarEmoji);
  const displayName = profile?.name ?? session.user.name ?? "Bem-vindo(a)!";
  const usernameLabel = profile?.username
    ? `@${profile.username}`
    : "Defina um nome de usuário para identificar seus resultados.";
  const emailLabel = profile?.email ?? session.user.email ?? "—";

  return (
    <main className="container mx-auto max-w-6xl px-4 pb-16 pt-24">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Meu Espaço</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          Acompanhe seu progresso, identifique os conteúdos dominados e saiba exatamente onde concentrar os próximos estudos.
        </p>
      </header>

      <section className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-4xl">
              {avatarEmoji}
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-500">{usernameLabel}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-sm text-gray-600">
            <div>
              <dt className="font-semibold text-gray-800">E-mail</dt>
              <dd>{emailLabel}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-800">Simulados concluídos</dt>
              <dd>{stats?.simuladosConcluidos ?? 0}</dd>
            </div>
          </dl>
        </div>
        <ProfileSettingsCard
          profile={{
            name: profile?.name ?? null,
            email: emailLabel,
            username: profile?.username ?? null,
            avatarEmoji,
          }}
          emojiOptions={AVATAR_EMOJIS}
        />
      </section>

      {stats ? (
        <div className="space-y-10">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">Total de acertos</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.totalAcertos}</p>
              <p className="mt-2 text-xs text-gray-500">
                {percentualGlobal.toFixed(1)}% de aproveitamento geral.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">Erros acumulados</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats.totalErros}</p>
              <p className="mt-2 text-xs text-gray-500">Aprenda com eles no relatório de cada simulado.</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">Questões puladas</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{stats.totalPuladas}</p>
              <p className="mt-2 text-xs text-gray-500">Retorne a elas para fortalecer os pontos sensíveis.</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">Simulados concluídos</p>
              <p className="mt-2 text-3xl font-bold text-gray-800">{stats.simuladosConcluidos}</p>
              <p className="mt-2 text-xs text-gray-500">
                Tempo médio por questão: {formatDuration(stats.tempoMedioSegundos)}.
              </p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Conteúdos em que você mais acerta</h2>
              <p className="mt-1 text-xs text-gray-500">
                Continue revisando para manter o desempenho elevado.
              </p>
              {stats.conteudosMaiorAcerto.length === 0 ? (
                <p className="mt-4 text-sm text-gray-600">Ainda não há dados suficientes. Conclua um simulado para iniciar.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {stats.conteudosMaiorAcerto.slice(0, 5).map((item) => (
                    <li
                      key={`${item.conteudo}-${item.subconteudo}-melhor`}
                      className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-green-800">{item.conteudo}</p>
                          <p className="text-xs text-green-700">{item.subconteudo}</p>
                        </div>
                        <span className="text-xs font-semibold text-green-700">
                          {item.percentualAcerto.toFixed(1)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-green-700">
                        {item.acertos} acerto{item.acertos === 1 ? "" : "s"} em {item.total} tentativa{item.total === 1 ? "" : "s"}.
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Conteúdos que pedem atenção</h2>
              <p className="mt-1 text-xs text-gray-500">
                Use esses tópicos como prioridade no próximo ciclo de estudo.
              </p>
              {stats.conteudosMenorAcerto.length === 0 ? (
                <p className="mt-4 text-sm text-gray-600">Sem registros de dificuldades. Continue praticando!</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {stats.conteudosMenorAcerto.slice(0, 5).map((item) => (
                    <li
                      key={`${item.conteudo}-${item.subconteudo}-revisar`}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-red-800">{item.conteudo}</p>
                          <p className="text-xs text-red-700">{item.subconteudo}</p>
                        </div>
                        <span className="text-xs font-semibold text-red-700">
                          {item.percentualAcerto.toFixed(1)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-red-700">
                        {item.erros} erro{item.erros === 1 ? "" : "s"} em {item.total} tentativa{item.total === 1 ? "" : "s"}.
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Resumo detalhado</h2>
            <p className="mt-1 text-xs text-gray-500">
              Visão consolidada de todos os conteúdos trabalhados nos simulados concluídos.
            </p>
            {stats.conteudosDetalhados.length === 0 ? (
              <p className="mt-4 text-sm text-gray-600">Resolva um simulado para destravar suas estatísticas individuais.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Conteúdo</th>
                      <th className="px-4 py-3">Subconteúdo</th>
                      <th className="px-4 py-3 text-center">Acertos</th>
                      <th className="px-4 py-3 text-center">Erros</th>
                      <th className="px-4 py-3 text-center">Aproveitamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.conteudosDetalhados.map((item) => (
                      <tr key={`${item.conteudo}-${item.subconteudo}-linha`}>
                        <td className="px-4 py-3 font-medium text-gray-800">{item.conteudo}</td>
                        <td className="px-4 py-3 text-gray-600">{item.subconteudo}</td>
                        <td className="px-4 py-3 text-center text-green-700">{item.acertos}</td>
                        <td className="px-4 py-3 text-center text-red-600">{item.erros}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{item.percentualAcerto.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-12 text-center text-sm text-gray-600 shadow-sm">
          Você ainda não possui estatísticas registradas. Inicie um simulado para acompanhar sua evolução aqui.
        </div>
      )}
    </main>
  );
}
