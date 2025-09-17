import { redirect } from "next/navigation";

import type { Session } from "next-auth";
import SimuladosClient from "./SimuladosClient";
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

  const simulados = await api.questao.simulados();

  return (
    <main className="container mx-auto max-w-6xl px-4 pb-16 pt-24">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Simulados Inteligentes</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          Escolha o ano desejado para treinar com questões oficiais. Cada prova oferece tempo limite de 4 horas, feedback em tempo real de acertos e erros e um relatório completo ao finalizar.
        </p>
      </header>

      <SimuladosClient simulados={simulados} />
    </main>
  );
}
