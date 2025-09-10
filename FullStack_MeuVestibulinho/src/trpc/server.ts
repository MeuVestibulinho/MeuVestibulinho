

// importa o módulo "server-only" do Next.js para garantir que este código seja executado apenas no servidor
import "server-only";

// Importa o cliente TRPC para React, que permite fazer chamadas às rotas do TRPC no frontend
import { createHydrationHelpers } from "@trpc/react-query/rsc";
// Importa o objeto Headers do Next.js para manipular cabeçalhos HTTP
import { headers } from "next/headers";
// Importa o hook useState do React para gerenciar estado em componentes funcionais
import { cache } from "react";

// Importa o createCaller e o tipo AppRouter que define as rotas do TRPC no servidor
import { createCaller, type AppRouter } from "~/server/api/root";
// Importa a função para criar o contexto do TRPC, que inclui informações como cabeçalhos HTTP
import { createTRPCContext } from "~/server/api/trpc";
// Importa a função para criar o QueryClient do React Query com configurações personalizadas
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */

// Cria o contexto do TRPC para chamadas feitas a partir de componentes React no servidor
// Isso é necessário para que as rotas do TRPC tenham acesso a informações como usuário autenticado, conexões de banco de dados, etc.
// Usa o cache para memorizar o contexto e evitar recriações desnecessárias
const createContext = cache(async () => {
  const heads = new Headers(await headers()); // Cria um novo objeto Headers a partir dos cabeçalhos da requisição HTTP
  heads.set("x-trpc-source", "rsc"); // Adiciona um cabeçalho personalizado para identificar a origem da requisição

  return createTRPCContext({ // Passa o objeto de cabeçalhos HTTP para a função de criação do contexto
    headers: heads, // headers são informações adicionais enviadas na requisição HTTP, como tokens de autenticação, tipo de conteúdo, etc.
  });
});

const getQueryClient = cache(createQueryClient); // Cria o QueryClient do React Query e usa cache para memorizar a instância, evitando recriações desnecessárias
const caller = createCaller(createContext); // Cria o caller do TRPC usando a função de criação do contexto

// Exporta o cliente TRPC e o componente HydrateClient para serem usados em componentes React
// HydrateClient é um componente que reidrata o estado do React Query no cliente, permitindo que o estado gerenciado no servidor seja usado no cliente

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);



// Nesse arquivo definimos o cliente TRPC para ser usado em componentes React no servidor
// Ele importa o roteador principal do TRPC, a função para criar o contexto do TRPC e o QueryClient do React Query
// O contexto do TRPC é criado usando os cabeçalhos HTTP da requisição, permitindo que as rotas do TRPC tenham acesso a informações como usuário autenticado
// O QueryClient é criado e memorizado usando cache para evitar recriações desnecessárias
// Finalmente, exportamos o cliente TRPC e o componente HydrateClient, que reidrata o estado do React Query no cliente, permitindo que o estado gerenciado no servidor seja usado no cliente
// Isso facilita a comunicação entre frontend e backend, aproveitando os benefícios do TypeScript em toda a stack
// Com essa configuração, os componentes React podem fazer chamadas às rotas do TRPC de forma tipada e gerenciar o estado de consultas de dados eficientemente usando o React Query
// Isso é especialmente útil quando usamos SSR (Server-Side Rendering) para melhorar a performance e a experiência do usuário