import { redirect } from "next/navigation";

import SimuladosClient from "./SimuladosClient";
import type { Session } from "next-auth";
import { auth, swallowSessionTokenError } from "~/server/auth";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function SimuladosPage() {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch (error) {
    if (!swallowSessionTokenError(error)) {
      throw error;
    }
  }

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/simulados");
  }

  const { items: questoes } = await api.questao.recent({ take: 100 });

  return (
    <main className="container mx-auto max-w-6xl px-4 pb-16 pt-24">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Simulados Inteligentes</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          Revise as questões cadastradas pela equipe, organizadas por ano. Cada simulado possui limite de 4 horas e é composto por 50 questões para você treinar em condições próximas às provas oficiais.
        </p>
      </header>

      <SimuladosClient questoes={questoes} />
    </main>
  );
}
