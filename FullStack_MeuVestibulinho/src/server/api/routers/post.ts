

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


  // Rota protegida que cria um novo post no banco de dados
  // Requer que o usuário esteja autenticado (usando protectedProcedure)
  // Recebe um objeto com a propriedade name (nome do post) como entrada
  // Insere o novo post no banco de dados, associando-o ao usuário autenticado
  // Retorna o post criado
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) })) // Define o esquema de entrada usando Zod, esperando um objeto com uma propriedade name do tipo string, com no mínimo 1 caractere
    .mutation(async ({ ctx, input }) => { // Define a função assíncrona que será executada quando essa rota for chamada, recebendo o contexto (ctx) e o input validado
      return ctx.db.post.create({ // Usa o contexto para acessar o banco de dados e criar um novo post
        data: { // Define os dados do novo post
          name: input.name, // Usa o valor de input.name para o nome do post
          createdBy: { connect: { id: ctx.session.user.id } }, // Associa o post ao usuário autenticado, usando o ID do usuário na sessão
        },
      });
    }),


  // Rota protegida que busca o post mais recente criado pelo usuário autenticado
  // Requer que o usuário esteja autenticado (usando protectedProcedure)
  // Não recebe entrada (input)
  // Consulta o banco de dados para encontrar o post mais recente do usuário, ordenando por data de criação em ordem decrescente
  // Retorna o post encontrado ou null se o usuário não tiver posts
  getLatest: protectedProcedure.query(async ({ ctx }) => { // Define a função assíncrona que será executada quando essa rota for chamada, recebendo o contexto (ctx)
    const post = await ctx.db.post.findFirst({ // Usa o contexto para acessar o banco de dados e buscar o primeiro post que corresponde aos critérios
      orderBy: { createdAt: "desc" }, // Ordena os posts pela data de criação (createdAt) em ordem decrescente (do mais recente para o mais antigo)
      where: { createdBy: { id: ctx.session.user.id } }, // Filtra os posts para incluir apenas aqueles criados pelo usuário autenticado, usando o ID do usuário na sessão
    });

    return post ?? null; // Retorna o post encontrado ou null se nenhum post for encontrado (usando o operador de coalescência nula ??
  }),

  getSecretMessage: protectedProcedure.query(() => { // Rota protegida que retorna uma mensagem secreta, acessível apenas para usuários autenticados
    return "you can now see this secret message!"; // Retorna a mensagem secreta (pt = "você agora pode ver esta mensagem secreta!")
  }),
});
