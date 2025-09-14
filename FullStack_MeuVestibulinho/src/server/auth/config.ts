// src/server/auth/config.ts
// ------------------------------------------------------------
// NextAuth (Auth.js v5) + Prisma + Keycloak (condicional)
// - Tipagem correta (sem any)
// - Providers tipados com `satisfies Provider[]`
// - Keycloak só liga com envs e com issuer explícito
// ------------------------------------------------------------

import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";

import DiscordProvider from "next-auth/providers/discord";
import Keycloak from "next-auth/providers/keycloak";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import type { Provider } from "next-auth/providers"; // <- tipo dos providers
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...outras props no futuro (ex.: role)
    } & DefaultSession["user"];
  }
}

// -------------------------------
// Flags a partir do .env
// -------------------------------
const hasKeycloak =
  !!process.env.KEYCLOAK_ISSUER &&
  !!process.env.KEYCLOAK_CLIENT_ID &&
  !!process.env.KEYCLOAK_CLIENT_SECRET;

const hasDiscord =
  !!process.env.AUTH_DISCORD_ID && !!process.env.AUTH_DISCORD_SECRET;

const isDev = process.env.NODE_ENV === "development";

// -------------------------------
// Tipagem do perfil do Google mock
// (apenas para eliminar `any`)
// -------------------------------
type GoogleMockProfile = {
  sub: string | number;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

// -------------------------------
// Lista final de providers (tipada)
// Usamos spreads condicionais e garantimos o tipo com `satisfies Provider[]`
// -------------------------------
const providers = [
  // Keycloak: só entra se as envs existirem
  ...(hasKeycloak
    ? [
        Keycloak({
          issuer: process.env.KEYCLOAK_ISSUER!, // ex.: http://localhost:8080/realms/meuvestibulinho
          clientId: process.env.KEYCLOAK_CLIENT_ID!, // ex.: nextjs
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!, // copie de Clients → Credentials
        }),
      ]
    : []),

  // Discord: só entra se tiver envs AUTH_DISCORD_*
  ...(hasDiscord ? [DiscordProvider] : []),

  // Google mock em dev (como você já usava), com perfil tipado
  ...(isDev
    ? [
        Google({
          clientId: "google-id-123",
          clientSecret: "dummy",
          authorization: {
            url: "https://oauth-mock.mock.beeceptor.com/oauth/authorize",
          },
          token: {
            url: "https://oauth-mock.mock.beeceptor.com/oauth/token/google",
          },
          userinfo: {
            url: "https://oauth-mock.mock.beeceptor.com/userinfo/google",
          },
          profile(profile: unknown) {
            const p = profile as GoogleMockProfile;
            return {
              id: String(p.sub),
              name: p.name ?? null,
              email: p.email ?? null,
              image: p.picture ?? null,
            };
          },
        }),
      ]
    : []),

  // Credentials (sempre disponível para testes locais)
  Credentials({
    name: "Demo (e-mail apenas)",
    credentials: {
      email: { label: "Email", type: "text", placeholder: "voce@exemplo.com" },
    },
    async authorize(raw) {
      const email = typeof raw?.email === "string" ? raw.email.trim() : "";
      if (!email) return null;

      const user = await db.user.upsert({
        where: { email },
        update: {},
        create: { email, name: "Demo" },
      });

      return { id: user.id, email: user.email ?? email, name: user.name ?? "Demo" };
    },
  }),
] satisfies Provider[];

// -------------------------------
// Config principal do NextAuth
// -------------------------------
export const authConfig = {
  providers,
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
