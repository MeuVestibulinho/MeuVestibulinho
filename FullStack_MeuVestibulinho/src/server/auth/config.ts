


// Importa o adaptador Prisma para NextAuth.js, que permite usar o Prisma como backend de banco de dados para autenticação
// PrismaAdapter é uma função que conecta o NextAuth.js ao Prisma, facilitando o armazenamento e recuperação de dados de usuários, sessões, etc.
import { PrismaAdapter } from "@auth/prisma-adapter";

// Importa tipos do NextAuth.js para tipar o objeto de sessão e a configuração do NextAuth
import { type DefaultSession, type NextAuthConfig } from "next-auth";

// Importa o provedor de autenticação do Discord para NextAuth.js, permitindo que os usuários façam login usando suas contas do Discord
import DiscordProvider from "next-auth/providers/discord";

// Importa o banco de dados Prisma configurado na aplicação, que será usado pelo adaptador do NextAuth.js
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

// Aqui estamos estendendo os tipos do NextAuth.js para adicionar propriedades personalizadas ao objeto de sessão
// Isso é útil para garantir que o TypeScript reconheça essas propriedades adicionais quando acessamos a sessão do usuário
declare module "next-auth" {
  interface Session extends DefaultSession { // Estende a interface padrão de sessão do NextAuth.js
    user: { // Adiciona propriedades personalizadas ao objeto user dentro da sessão
      id: string; // Adiciona a propriedade id do usuário, que é uma string
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"]; // Combina as propriedades personalizadas com as propriedades padrão do objeto user
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */


// Define a configuração do NextAuth.js, incluindo provedores de autenticação, adaptador de banco de dados e callbacks
export const authConfig = {
  providers: [ // Define os provedores de autenticação que os usuários podem usar para fazer login
    DiscordProvider, // Adiciona o provedor de autenticação do Discord, permitindo login com contas do Discord
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ], // Fim da definição dos provedores de autenticação, mas poderíamos adicionar mais provedores aqui, como Google, GitHub, etc.
  adapter: PrismaAdapter(db), // Usa o adaptador Prisma para conectar o NextAuth.js ao banco de dados Prisma, permitindo armazenar e recuperar dados de autenticação
  callbacks: { // Define callbacks que são funções executadas em determinados momentos do fluxo de autenticação, elas servem para personalizar o comportamento do NextAuth.js
    session: ({ session, user }) => ({ // Callback que é chamado quando uma sessão é criada ou acessada
      ...session, // Mantém todas as propriedades padrão da sessão
      user: { // Adiciona propriedades personalizadas ao objeto user dentro da sessão
        ...session.user, // Mantém todas as propriedades padrão do objeto user
        id: user.id, // Adiciona a propriedade id do usuário, que vem do objeto user retornado pelo adaptador
      },
    }),
  },
} satisfies NextAuthConfig; // Usa "satisfies" para garantir que o objeto authConfig esteja em conformidade com o tipo NextAuthConfig, ajudando a evitar erros de tipagem



// Esse arquivo define a configuração do NextAuth.js para autenticação na aplicação
// Ele importa o adaptador Prisma para conectar o NextAuth.js ao banco de dados Prisma, permitindo armazenar e recuperar dados de autenticação
// A configuração inclui provedores de autenticação (neste caso, apenas o Discord), o adaptador de banco de dados e callbacks para personalizar o comportamento do NextAuth.js
// Também estende os tipos do NextAuth.js para adicionar propriedades personalizadas ao objeto de sessão, garantindo que o TypeScript reconheça essas propriedades adicionais
// Com essa configuração, a aplicação pode suportar autenticação com provedores externos, facilitando o login dos usuários e integrando o sistema de autenticação ao banco de dados Prisma
