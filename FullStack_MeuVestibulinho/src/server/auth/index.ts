// importa os tipos padrão do NextAuth.js para estender e personalizar a sessão do usuário, além do tipo de configuração do NextAuth
import NextAuth from "next-auth";

// Importa o adaptador Prisma para NextAuth.js, permitindo que o NextAuth.js se conecte ao banco de dados Prisma para armazenar e recuperar dados de autenticação
import { cache } from "react";

// Importa o adaptador Prisma para NextAuth.js, permitindo que o NextAuth.js se conecte ao banco de dados Prisma para armazenar e recuperar dados de autenticação
import { authConfig } from "./config";

// Desestrutura o objeto retornado pelo NextAuth, obtendo a função de autenticação (auth), os handlers para requisições HTTP (handlers), e as funções para login (signIn) e logout (signOut)
const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

// Usa cache para memorizar a instância de autenticação, evitando recriações desnecessárias em re-renderizações
const auth = cache(uncachedAuth);

// exporta a instância de autenticação, os handlers e as funções de login/logout para serem usados em outras partes da aplicação
export { auth, handlers, signIn, signOut };

// Nesse arquivo definimos a configuração do NextAuth.js para autenticação na aplicação
// Ele importa o adaptador Prisma para conectar o NextAuth.js ao banco de dados Prisma, permitindo armazenar e recuperar dados de autenticação
// A configuração inclui provedores de autenticação (neste caso, apenas o Discord), o adaptador de banco de dados e callbacks para personalizar o comportamento do NextAuth.js
// Também estende os tipos do NextAuth.js para adicionar propriedades personalizadas ao objeto de sessão, garantindo que o TypeScript reconheça essas propriedades adicionais
// Com essa configuração, a aplicação pode suportar autenticação com provedores externos, facilitando o login dos usuários e integrando o sistema de autenticação ao banco de dados Prisma
