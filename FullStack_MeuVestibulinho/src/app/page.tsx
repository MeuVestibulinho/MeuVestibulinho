

// Importa o ReactNode do React, que é um tipo que representa qualquer coisa que pode ser renderizada pelo React (elementos, strings, números, fragmentos, etc.)
import Link from "next/link";
// Importa a função auth que lida com autenticação de usuários
import { auth } from "~/server/auth";
// Importa o objeto api do TRPC para fazer chamadas às rotas definidas no backend
// TRPC é uma biblioteca que facilita a comunicação entre frontend e backend com TypeScript
// Com rotas, eu quero dizer as funções que definimos no backend para criar, ler, atualizar e deletar dados (GET, POST, PUT, DELETE)
import { api, HydrateClient } from "~/trpc/server";



// Componente assíncrono que representa a página inicial da aplicação
// Ele busca uma saudação do backend usando o TRPC e a sessão do usuário autenticado
// Se o usuário estiver autenticado, ele pré-busca o post mais recente para melhorar a performance
export default async function Home() {
  const session = await auth(); // Busca a sessão do usuário autenticado usando a função auth

  

  // Retorna o JSX que define a interface da página inicial
  // JSX é uma sintaxe que mistura HTML e JavaScript, usada pelo React para definir a UI (User Interface = interface do usuário)
  // Aqui exibimos links pra documentação, a saudação do backend e o estado de autenticação do usuário
  return (

    // HydrateClient é um componente que hidrata o estado do TRPC no cliente, permitindo que o frontend use os dados pré-buscados
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App 
          </h1> 
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {session?.user ? await api.post.getSecretMessage() : "Loga pra ver!"  }
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}

// Nesse arquivo definimos a página inicial da aplicação
// Ele busca uma saudação do backend usando o TRPC e a sessão do usuário autenticado
// Se o usuário estiver autenticado, ele pré-busca o post mais recente para melhorar a performance

// A interface é definida usando JSX, uma sintaxe que mistura HTML e JavaScript, usada pelo React para criar a UI (User Interface = interface do usuário)

// O componente HydrateClient envolve o conteúdo para hidratar o estado do TRPC no cliente, permitindo que o frontend use os dados pré-buscados
// A estilização é feita usando classes do Tailwind CSS para um visual moderno e responsivo
// Isso cria uma experiência de usuário agradável, mostrando informações relevantes com base no estado de autenticação
// E aproveitando os benefícios do TRPC para comunicação eficiente entre frontend e backend com TypeScript
