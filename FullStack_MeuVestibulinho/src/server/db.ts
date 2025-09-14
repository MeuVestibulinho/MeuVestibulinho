// src/server/db.ts
import { PrismaClient } from "@prisma/client";
import { env } from "~/env";

// Tipar a variável global para evitar `any` em hot-reload no dev
declare global {
  var prisma: PrismaClient | undefined;
}

function makePrismaClient(): PrismaClient {
  const log =
    env.NODE_ENV === "development" ? (["query", "warn", "error"] as const) : (["error"] as const);

  return new PrismaClient({ log: Array.from(log) });
}

// Exporta sempre um PrismaClient tipado
export const db: PrismaClient = globalThis.prisma ?? makePrismaClient();

// No dev, reutiliza a instância (evita múltiplas conexões em hot-reload)
if (env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
