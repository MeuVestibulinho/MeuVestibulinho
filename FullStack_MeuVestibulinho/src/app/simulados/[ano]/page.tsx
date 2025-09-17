import { notFound, redirect } from "next/navigation";
import type { Session } from "next-auth";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

import SimuladoRunner from "./SimuladoRunner";
import { auth, swallowSessionTokenError } from "~/server/auth";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  ano: z.coerce.number().int().min(1900).max(2100),
});

export default async function SimuladoAnoPage({
  params,
}: {
  params: { ano: string };
}) {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch (error) {
    if (!swallowSessionTokenError(error)) {
      throw error;
    }
  }

  if (!session) {
    redirect(`/api/auth/signin?callbackUrl=/simulados/${params.ano ?? ""}`);
  }

  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) {
    notFound();
  }

  try {
    const simulado = await api.questao.simuladoDetalhes({ ano: parsed.data.ano });

    return (
      <main className="container mx-auto max-w-6xl px-4 pb-16 pt-24">
        <SimuladoRunner simulado={simulado} />
      </main>
    );
  } catch (error) {
    if (error instanceof TRPCClientError) {
      const shape = error.shape as { code?: string } | undefined;
      if (shape?.code === "NOT_FOUND") {
        notFound();
      }
    }

    throw error;
  }
}
