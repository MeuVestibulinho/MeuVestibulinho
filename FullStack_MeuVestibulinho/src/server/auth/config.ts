// src/server/auth/config.ts
import type { NextAuthConfig, User } from "next-auth";
import type { UserRole } from "@prisma/client";
import KeycloakProvider from "next-auth/providers/keycloak";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "~/server/db";
import { normalizeAvatarEmoji } from "~/lib/profile";

/** Constrói a lista de providers conforme ENVs disponíveis */
export const providers: NonNullable<NextAuthConfig["providers"]> = [
  // Keycloak (habilita se TODAS as ENVs existirem)
  ...(process.env.KEYCLOAK_ISSUER &&
  process.env.KEYCLOAK_CLIENT_ID 
    ? [
        KeycloakProvider({
          issuer: process.env.KEYCLOAK_ISSUER,
          clientId: process.env.KEYCLOAK_CLIENT_ID,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
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
    async signIn({ user }) {
      const email = typeof user.email === "string" ? user.email.toLowerCase() : null;
      if (!email) {
        return true;
      }

      const blocked = await db.emailBlacklist.findUnique({ where: { email } });
      if (blocked) {
        console.warn(`[auth] Tentativa de acesso bloqueada para o email ${email}`);
        return false;
      }

      return true;
    },
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      const sessionUser = session.user as typeof session.user & {
        id: string;
        role?: UserRole;
        username?: string | null;
        avatarEmoji?: string | null;
      };

      sessionUser.id = user?.id ?? sessionUser.id;

      if (user) {
        if (user.role) {
          sessionUser.role = user.role;
        }
        if ("username" in user) {
          sessionUser.username = user.username ?? null;
        }
        if ("avatarEmoji" in user) {
          sessionUser.avatarEmoji = normalizeAvatarEmoji(user.avatarEmoji);
        }
      }

      if (
        !sessionUser.role ||
        typeof sessionUser.username === "undefined" ||
        typeof sessionUser.avatarEmoji === "undefined"
      ) {
        const dbUser = await db.user.findUnique({
          where: { id: sessionUser.id },
          select: { role: true, username: true, avatarEmoji: true },
        });

        sessionUser.role = dbUser?.role ?? sessionUser.role ?? "USER";
        sessionUser.username =
          typeof dbUser?.username === "undefined"
            ? sessionUser.username ?? null
            : dbUser.username ?? null;
        sessionUser.avatarEmoji = normalizeAvatarEmoji(
          dbUser?.avatarEmoji ?? sessionUser.avatarEmoji,
        );
      } else {
        sessionUser.avatarEmoji = normalizeAvatarEmoji(sessionUser.avatarEmoji);
      }

      if (!sessionUser.role) {
        sessionUser.role = "USER";
      }
      if (typeof sessionUser.username === "undefined") {
        sessionUser.username = null;
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};
