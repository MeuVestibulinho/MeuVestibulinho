// src/server/auth/config.ts
// ------------------------------------------------------------
// NextAuth (Auth.js v5) + Prisma + Keycloak (condicional)
// - Sessão em JWT (middleware enxerga req.auth)
// - Callbacks compatíveis com JWT (usa token.sub como id)
// - Providers tipados (sem any)
// - Keycloak só liga quando variáveis do .env existem
// ------------------------------------------------------------

import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";

import DiscordProvider from "next-auth/providers/discord";
import Keycloak from "next-auth/providers/keycloak";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import type { Provider } from "next-auth/providers";
import { db } from "~/server/db";

/**
 * Augmentação de tipos da sessão:
 * Adiciona `user.id` no objeto de sessão com type-safety.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Flags a partir do .env
const hasKeycloak =
  !!process.env.KEYCLOAK_ISSUER &&
  !!process.env.KEYCLOAK_CLIENT_ID &&
  !!process.env.KEYCLOAK_CLIENT_SECRET;

const hasDiscord =
  !!process.env.AUTH_DISCORD_ID && !!process.env.AUTH_DISCORD_SECRET;

const isDev = process.env.NODE_ENV === "development";

// Tipagem do perfil do Google mock (sem `any`)
type GoogleMockProfile = {
  sub: string | number;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

// Lista final de providers (tipada)
const providers = [
  ...(hasKeycloak
    ? [
        Keycloak({
          // Ex.: http://localhost:8080/realms/meuvestibulinho
          issuer: process.env.KEYCLOAK_ISSUER!,
          // Ex.: nextjs
          clientId: process.env.KEYCLOAK_CLIENT_ID!,
          // Copie de Clients → Credentials
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
        }),
      ]
    : []),

  ...(hasDiscord ? [DiscordProvider] : []),

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

  // Credentials para teste rápido
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

// Config principal do NextAuth
export const authConfig = {
  providers,
  adapter: PrismaAdapter(db),

  // ✅ Middleware precisa de JWT para enxergar req.auth
  session: { strategy: "jwt" as const },

  callbacks: {
    // ✅ Grava o id no token ao logar (padrão OIDC usa `sub`)
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
      }
      return token;
    },

    // ✅ Em JWT, 'user' pode vir undefined; use `token.sub`
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: (token.sub as string) ?? session.user?.id ?? "",
        },
      };
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
