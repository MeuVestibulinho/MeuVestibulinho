// use client é necessário para usar hooks do React nesse arquivo
// hooks são funções especiais do React que só funcionam em componentes de cliente
// componentes de cliente são aqueles que rodam no browser, não no servidor
// browser = navegador (Chrome, Firefox, Edge, etc.)
// servidor = backend (Node.js, etc.)
"use client";

// Importa o QueryClient do React Query para gerenciar o estado de consultas de dados na aplicação
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
// Importa links do TRPC para configurar a comunicação entre o cliente e o servidor
import { httpBatchStreamLink, loggerLink } from "@trpc/client";
// Importa funções do TRPC para criar o cliente TRPC e integrar com React Query
import { createTRPCReact } from "@trpc/react-query";
// Importa tipos do TRPC para inferir os tipos de inputs e outputs das rotas do servidor
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
// Importa o hook useState do React para gerenciar estado local no componente
import { useState } from "react";
// Importa SuperJSON, uma biblioteca que facilita a serialização e deserialização de dados complexos (como datas, mapas, conjuntos, etc.) para JSON
import SuperJSON from "superjson";

// Importa o tipo AppRouter que define as rotas do TRPC no servidor
import { type AppRouter } from "~/server/api/root";
// Importa a função para criar o QueryClient do React Query com configurações personalizadas
import { createQueryClient } from "./query-client";

// Mantém uma instância singleton do QueryClient no cliente (browser) para evitar a criação de múltiplas instâncias
// Singleton é um padrão de design que garante que uma classe tenha apenas uma instância e fornece um ponto global de acesso a ela
// No servidor, sempre criamos uma nova instância do QueryClient para cada requisição
// Isso é importante para evitar compartilhamento de estado entre diferentes usuários no servidor
let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  // Função que retorna a instância do QueryClient
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient(); // No servidor, cria uma nova instância do QueryClient
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient(); // No cliente, cria a instância do QueryClient apenas uma vez e reutiliza essa instância nas próximas chamadas

  return clientQueryClientSingleton; // Retorna a instância do QueryClient
};

export const api = createTRPCReact<AppRouter>(); // Cria o cliente TRPC usando as rotas definidas no AppRouter do servidor

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// exporta função que provê o contexto do TRPC e do React Query para os componentes filhos
export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient(); // Obtém a instância do QueryClient (singleton no cliente, nova instância no servidor)

  const [trpcClient] = useState(() =>
    // Cria o cliente TRPC apenas uma vez usando useState
    api.createClient({
      // Cria o cliente TRPC
      links: [
        // Define os links usados pelo cliente TRPC para comunicação com o servidor
        loggerLink({
          // Link que loga as requisições e respostas do TRPC para facilitar o debug
          enabled: (
            op, // Função que determina quando o logging deve estar habilitado
          ) =>
            process.env.NODE_ENV === "development" || // Habilita logging em ambiente de desenvolvimento
            (op.direction === "down" && op.result instanceof Error), // Habilita logging para respostas de erro vindas do servidor
        }),
        httpBatchStreamLink({
          // Link que permite fazer requisições HTTP em lote e com streaming
          transformer: SuperJSON, // Usa SuperJSON para serializar e desserializar os dados enviados e recebidos
          url: getBaseUrl() + "/api/trpc", // Define a URL do endpoint do TRPC no servidor
          headers: () => {
            // Função que retorna os headers a serem enviados em cada requisição
            const headers = new Headers(); // Cria um novo objeto Headers para adicionar headers personalizados
            headers.set("x-trpc-source", "nextjs-react"); // Adiciona um header personalizado para identificar a origem da requisição
            return headers; // Retorna o objeto Headers com os headers personalizados
          },
        }),
      ],
    }),
  );

  // Retorna o JSX que provê o contexto do TRPC e do React Query para os componentes filhos
  return (
    <QueryClientProvider client={queryClient}>
      {" "}
      {/* Provê o contexto do React Query para os componentes filhos */}
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {" "}
        {/* Provê o contexto do TRPC para os componentes filhos */}
        {props.children} {/* Renderiza os componentes filhos */}
      </api.Provider>
    </QueryClientProvider>
  );
}

// Função que retorna a URL base do servidor
// Isso é necessário para configurar o cliente TRPC com a URL correta do endpoint no servidor
// No cliente (browser), usamos a origem da janela (window.location.origin)
// No servidor, usamos a variável de ambiente VERCEL_URL se estiver implantado na Vercel, ou localhost com a porta definida na variável de ambiente PORT (ou 3000 por padrão)
function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin; // No cliente (browser), retorna a origem da janela
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Se estiver implantado na Vercel, retorna a URL da Vercel
  return `http://localhost:${process.env.PORT ?? 3000}`; // No servidor local, retorna localhost com a porta definida na variável de ambiente PORT (ou 3000 por padrão)
}

// Nesse arquivo definimos o provedor TRPCReactProvider que encapsula a aplicação React, fornecendo o contexto necessário para usar o TRPC e o React Query
// Incluímos a configuração do cliente TRPC, definindo os links para comunicação com o servidor, incluindo logging e suporte a requisições em lote com streaming
// Também configuramos o QueryClient do React Query, garantindo que uma instância singleton seja usada no cliente (browser) e uma nova instância seja criada no servidor para cada requisição
// Além disso, definimos a função getBaseUrl para determinar a URL base do servidor, adaptando-se ao ambiente (cliente, servidor local ou Vercel)
// Com essa configuração, os componentes filhos dentro do TRPCReactProvider podem fazer chamadas às rotas do TRPC de forma tipada e gerenciar o estado de consultas de dados eficientemente usando o React Query
// Isso facilita a comunicação entre frontend e backend, aproveitando os benefícios do TypeScript em toda a stack
