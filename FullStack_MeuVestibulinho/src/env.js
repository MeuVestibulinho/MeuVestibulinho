import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Especifique o esquema das variáveis de ambiente do lado do servidor aqui. Assim, você pode garantir que o app
   * não será construído com variáveis de ambiente inválidas.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Especifique o esquema das variáveis de ambiente do lado do cliente aqui. Assim, você pode garantir que o app
   * não será construído com variáveis de ambiente inválidas. Para expô-las ao cliente, prefixe com
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * Você não pode desestruturar `process.env` como um objeto comum nos edge runtimes do Next.js (por exemplo,
   * middlewares) ou no lado do cliente, então precisamos desestruturar manualmente.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Execute `build` ou `dev` com `SKIP_ENV_VALIDATION` para pular a validação das variáveis de ambiente.
   * Isso é especialmente útil para builds com Docker.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Faz com que strings vazias sejam tratadas como undefined. `SOME_VAR: z.string()` e
   * `SOME_VAR=''` lançarão um erro.
   */
  emptyStringAsUndefined: true,
});
