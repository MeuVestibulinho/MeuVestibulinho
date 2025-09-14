import NextAuth, { type NextAuthConfig, type User } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "~/server/db";
import { z } from "zod";

/**
 * Type guard para providers já-resolvidos (não fábricas):
 * garante que há `id: string` e opcionalmente `name: string`.
 */
type ProviderLike = { id: string; name?: string };
function isProviderLike(p: unknown): p is ProviderLike {
  return (
    typeof p === "object" &&
    p !== null &&
    "id" in p &&
    typeof (p as { id: unknown }).id === "string"
  );
}

/**
 * Configuração principal do Auth.js v5
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },

  providers: [
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

    // Credentials (helper em dev)
    ...(process.env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            credentials: {
              email: { label: "Email", type: "text" },
            },
            async authorize(
              credentials: Partial<Record<"email", unknown>>,
              _request: Request,
            ): Promise<User | null> {
              // Validação segura (evita no-base-to-string e no-unsafe-*)
              const parsed = z
                .object({ email: z.string().email() })
                .safeParse(credentials);

              if (!parsed.success) return null;

              const { email } = parsed.data; // string validada por Zod
              const user: User = {
                id: `dev-${email}`,
                email,
                name: "Dev User",
              };
              return user;
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      // adiciona id ao session.user se disponível, sem assertions
      return {
        ...session,
        user: session.user
          ? { ...session.user, id: token.sub ?? undefined }
          : session.user,
      };
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

/**
 * Lista de providers habilitados para a UI (id + name)
 * - Não assume que `providers` tenha sempre `.id` (pode haver fábricas)
 * - Narrowing com type guard, sem casts perigosos
 */
const rawProviders: unknown[] = [...(authConfig.providers ?? [])];
export const enabledProviders: { id: string; name: string }[] = rawProviders
  .filter(isProviderLike)
  .map((p) => ({
    id: p.id,
    name: p.name ?? p.id,
  }));

/**
 * Exports do NextAuth (mantém o padrão do seu projeto)
 */
const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);
export { handlers, signIn, signOut };
export { uncachedAuth as auth };
