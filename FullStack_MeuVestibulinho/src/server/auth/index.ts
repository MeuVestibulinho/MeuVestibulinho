// src/server/auth/index.ts
import NextAuth from "next-auth";
import { cache } from "react";
import { SessionTokenError } from "@auth/core/errors";
import { authConfig, providers } from "./config"; // nossa fonte única de verdade

export const { handlers, auth: uncachedAuth, signIn, signOut } = NextAuth(authConfig);

// Evita recriações desnecessárias em RSC
export const auth = cache(uncachedAuth);

export const providerMap = providers
  .map((provider) => {
    const providerData = typeof provider === "function" ? provider() : provider;
    return { id: providerData.id, name: providerData.name };
  }) as Array<{ id: string; name: string }>;

export function isSessionTokenError(error: unknown): error is SessionTokenError {
  if (error instanceof SessionTokenError) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { name?: unknown; type?: unknown };
  return maybeError.name === "SessionTokenError" || maybeError.type === "SessionTokenError";
}

export function swallowSessionTokenError(error: unknown): boolean {
  if (!isSessionTokenError(error)) {
    return false;
  }

  console.warn(
    "[auth] Token de sessão inválido detectado. Trataremos a requisição como não autenticada.",
  );
  return true;
}
