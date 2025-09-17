// importa o roteador de postagens definido em outro arquivo, que contém várias rotas (queries e mutations) relacionadas a postagens
import { adminRouter } from "~/server/api/routers/admin";
import { postRouter } from "~/server/api/routers/post";
import { questaoRouter } from "~/server/api/routers/questao";
import { statsRouter } from "~/server/api/routers/stats";
import { profileRouter } from "~/server/api/routers/profile";
// importa funções para criar o roteador TRPC e o caller do servidor, que permite fazer chamadas às rotas do TRPC no backend
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

// cria o roteador principal do TRPC, que agrupa várias rotas (queries e mutations) em um único objeto
export const appRouter = createTRPCRouter({
  post: postRouter, // adiciona o roteador de postagens como uma sub-rota do roteador principal
  questao: questaoRouter,
  admin: adminRouter,
  stats: statsRouter,
  profile: profileRouter,
});

// export type definition of API
// cria um tipo TypeScript que representa o roteador principal do TRPC, útil para tipar o cliente TRPC no frontend
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */

// cria o caller do servidor para o roteador principal do TRPC, permitindo fazer chamadas às rotas do TRPC no backend
export const createCaller = createCallerFactory(appRouter);
