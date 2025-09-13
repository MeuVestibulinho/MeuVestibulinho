// Importa o cliente Prisma para interagir com o banco de dados
import { PrismaClient } from "@prisma/client";

// Importa as variáveis de ambiente da aplicação, que podem incluir configurações como o ambiente (desenvolvimento, produção, etc.)
import { env } from "~/env";

// Cria uma instância do PrismaClient com configurações específicas
// A configuração de log é ajustada com base no ambiente: em desenvolvimento, loga todas as queries, erros e avisos; em produção, loga apenas erros
const createPrismaClient = () =>
  new PrismaClient({
    // Cria uma nova instância do PrismaClient
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"], // Configura o log com base no ambiente, ajudando no debug durante o desenvolvimento
  });

// Usa uma variável global para armazenar a instância do PrismaClient
// Isso evita a criação de múltiplas instâncias durante o desenvolvimento, onde o código pode ser recarregado frequentemente
// Em produção, uma nova instância é criada normalmente
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined; // Define uma propriedade prisma que pode ser do tipo PrismaClient ou undefined
};

export const db = globalForPrisma.prisma ?? createPrismaClient(); // Se já existir uma instância do PrismaClient na variável global, usa essa instância; caso contrário, cria uma nova instância

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db; // Em ambientes que não são de produção, armazena a instância do PrismaClient na variável global para reutilização futura

// Nesse arquivo definimos a configuração do cliente Prisma para interagir com o banco de dados
// Ele cria uma instância do PrismaClient com configurações específicas, incluindo o log de queries, erros e avisos durante o desenvolvimento
// Também utiliza uma variável global para armazenar a instância do PrismaClient, evitando a criação de múltiplas instâncias durante o desenvolvimento, onde o código pode ser recarregado frequentemente
// Em produção, uma nova instância é criada normalmente
// Finalmente, a instância do PrismaClient é exportada para ser usada em outras partes da aplicação, permitindo consultas e manipulações no banco de dados de forma eficiente e consistente
