

// Importa o handler do tRPC para lidar com requisições HTTP
// tRPC é uma biblioteca que facilita a comunicação entre frontend e backend com TypeScript, permitindo definir rotas de API fortemente tipadas
// fetchRequestHandler é uma função que adapta o tRPC para funcionar com o sistema de rotas do Next.js( API Routes ), lidando com requisições HTTP (GET, POST, etc.)
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// Importa o tipo NextRequest do Next.js para tipar o objeto de requisição HTTP
// NextRequest é uma extensão do Request padrão do JavaScript, adicionando funcionalidades específicas do Next.js, como acesso a cookies, headers, etc.
import { type NextRequest } from "next/server";


// Importa variáveis de ambiente, o roteador principal do tRPC e a função para criar o contexto do tRPC (contexto é um objeto que pode conter informações como usuário autenticado, conexões de banco de dados, etc.)
import { env } from "~/env";
// appRouter é o roteador principal que agrupa todas as rotas definidas no backend (queries e mutations)
import { appRouter } from "~/server/api/root";
// createTRPCContext é uma função que cria o contexto necessário para cada requisição ao tRPC
// contexto é um objeto que pode conter informações como usuário autenticado, conexões de banco de dados, etc.
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */

// Cria o contexto do tRPC para cada requisição HTTP
// Isso é necessário para que as rotas do tRPC tenham acesso a informações como usuário autenticado, conexões de banco de dados, etc.
const createContext = async (req: NextRequest) => {
  return createTRPCContext({ // Passa o objeto de requisição HTTP para a função de criação do contexto
    headers: req.headers, // headers são informações adicionais enviadas na requisição HTTP, como tokens de autenticação, tipo de conteúdo, etc.
  });
};


// Cria o handler que lida com requisições HTTP para as rotas do tRPC, handler é uma função que recebe o objeto de requisição HTTP e retorna uma resposta HTTP
const handler = (req: NextRequest) =>
  fetchRequestHandler({ // Usa o fetchRequestHandler do tRPC para lidar com a requisição
    endpoint: "/api/trpc", // Define o endpoint (rota) onde o tRPC está disponível
    req, // Passa o objeto de requisição HTTP
    router: appRouter, // Passa o roteador principal do tRPC que contém todas as rotas definidas
    createContext: () => createContext(req), // Passa a função para criar o contexto do tRPC para essa requisição
    onError: // Define uma função para lidar com erros que ocorrem durante o processamento da requisição
      env.NODE_ENV === "development" // Se estiver em ambiente de desenvolvimento, loga os erros no console para facilitar o debug
        ? ({ path, error }) => { // path é a rota onde o erro ocorreu, error é o objeto de erro
            console.error( // Loga uma mensagem de erro detalhada no console
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}` // path pode ser undefined, então usamos ?? para fornecer um valor padrão "<no-path>"
            );
          }
        : undefined, // Se não estiver em desenvolvimento, não faz nada (undefined)
  });

export { handler as GET, handler as POST }; // Exporta o handler para que ele possa ser usado como rota de API no Next.js, tanto para requisições GET quanto POST


// Nesse arquivo definimos as rotas de API para o tRPC no Next.js
// Ele importa o roteador principal do tRPC, a função para criar o contexto do tRPC e o handler que lida com requisições HTTP
// O handler usa o fetchRequestHandler do tRPC para processar as requisições, passando o endpoint, o roteador, o contexto e uma função de erro
// Finalmente, o handler é exportado para que o Next.js possa usá-lo como rota de API, permitindo que o frontend faça chamadas às rotas definidas no backend de forma tipada e segura
// Isso facilita a comunicação entre frontend e backend, aproveitando os benefícios do TypeScript em toda a stack
