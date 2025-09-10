

// Importa a biblioteca Zod para validação de esquemas de dados
// Zod é uma biblioteca TypeScript-first para validação e parsing de dados, útil para garantir que os dados recebidos em rotas de API estejam no formato esperado
// Exemplo: validar que um campo é uma string, um número, um objeto com propriedades específicas, etc.
import { z } from "zod";

import {
  createTRPCRouter,// createTRPCRouter é uma função que cria um roteador TRPC, que agrupa várias rotas (queries e mutations) em um único objeto
  protectedProcedure, // protectedProcedure é um wrapper para rotas que requerem autenticação, garantindo que apenas usuários logados possam acessá-las
  publicProcedure, // publicProcedure é um wrapper para rotas que não requerem autenticação, permitindo acesso público
} from "~/server/api/trpc"; // Importa o roteador TRPC e os wrappers para rotas protegidas e públicas



// Define o roteador de postagens (posts) com várias rotas (queries e mutations)
// Cada rota é definida usando publicProcedure ou protectedProcedure, dependendo se requer autenticação ou não
// As rotas incluem: hello (saudação), create (criar post), getLatest (buscar o post mais recente) e getSecretMessage (mensagem secreta)
export const postRouter = createTRPCRouter({
  hello: publicProcedure // Rota pública que retorna uma saudação personalizada
    .input(z.object({ text: z.string() })) // Define o esquema de entrada usando Zod, esperando um objeto com uma propriedade text do tipo string
    .query(({ input }) => { // Define a função que será executada quando essa rota for chamada, recebendo o input validado
      return { // Retorna um objeto com a saudação personalizada
        greeting: `Hello ${input.text}`, // Usa o valor de input.text para criar a saudação
      }; 
    }),

  getSecretMessage: protectedProcedure.query(() => { // Rota protegida que retorna uma mensagem secreta, acessível apenas para usuários autenticados
    return "Código do míssil nuclear: 42069"; // Retorna a mensagem secreta (pt = "você agora pode ver esta mensagem secreta!")
  }),
});
