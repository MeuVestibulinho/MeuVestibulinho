

// importa os handlers (manipuladores) de requisições GET e POST do NextAuth
// NextAuth é uma biblioteca para autenticação em aplicações Next.js, facilitando o login com provedores externos (Google, GitHub, etc.) ou e-mail/senha
// handlers são funções que lidam com requisições HTTP específicas (GET para obter dados, POST para enviar dados)
import { handlers } from "~/server/auth";


// exporta os handlers( GET e POST ) para que o Next.js possa usá-los como rotas de API
// Isso permite que a aplicação suporte autenticação, como login, logout, callback de provedores, etc., usando o NextAuth
export const { GET, POST } = handlers;




// Esse arquivo define as rotas de API para autenticação usando o NextAuth no Next.js
// Ele importa os handlers de requisições GET e POST do NextAuth e os exporta para que o Next.js possa usá-los como rotas de API
// Com isso, a aplicação pode suportar autenticação com provedores externos (Google, GitHub, etc.) ou e-mail/senha, facilitando o login dos usuários
// Essas rotas lidam com operações como login, logout, callback de provedores, etc., integrando o NextAuth ao sistema de rotas do Next.js