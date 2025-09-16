// src/server/auth/index.ts
import NextAuth from "next-auth";
import { cache } from "react";
import { authConfig } from "./config"; // nossa fonte única de verdade

export const { handlers, auth: uncachedAuth, signIn, signOut } = NextAuth(authConfig);

// Evita recriações desnecessárias em RSC
export const auth = cache(uncachedAuth);
