// src/server/auth/config.ts
import type { NextAuthConfig, User } from "next-auth";
import type { UserRole } from "@prisma/client";
import KeycloakProvider from "next-auth/providers/keycloak";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "~/server/db";

/** Constrói a lista de providers conforme ENVs disponíveis */
export const providers = [
  // Keycloak (habilita se TODAS as ENVs existirem)
  ...(process.env.KEYCLOAK_ISSUER &&
  process.env.KEYCLOAK_CLIENT_ID &&
  process.env.KEYCLOAK_CLIENT_SECRET
    ? [
        KeycloakProvider({
          issuer: process.env.KEYCLOAK_ISSUER,
          clientId: process.env.KEYCLOAK_CLIENT_ID,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        }),
      ]
    : []),

  // Discord (opcional)
  ...(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET
    ? [
        DiscordProvider({
          clientId: process.env.AUTH_DISCORD_ID,
          clientSecret: process.env.AUTH_DISCORD_SECRET,
        }),
      ]
    : []),

  // Google (opcional)
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : []),
 ];

/** Config principal do Auth.js v5 (não instanciamos NextAuth aqui) */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },        // 👈 sessão em banco
  trustHost: true,                          // 👈 recomendado atrás de proxy

  providers,
  pages: {
    signIn: "/signin",   // 👈 aqui
  },

  callbacks: {
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      (session.user as typeof session.user & { id: string }).id = user?.id ?? session.user.id;

      if (user?.role) {
        (session.user as typeof session.user & { role: UserRole }).role = user.role;
        return session;
      }

      if (!session.user.role) {
        const dbUser = await db.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        });

        (session.user as typeof session.user & { role: UserRole }).role = dbUser?.role ?? "USER";
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};
