// Não exporte nada deste arquivo. Ele serve só para "augmentar" os tipos do pacote.
import type { DefaultSession, DefaultUser } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      username: string | null;
      avatarEmoji: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    username?: string | null;
    avatarEmoji?: string | null;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: UserRole;
    username?: string | null;
    avatarEmoji?: string | null;
  }
}
