// Importa o ReactNode do React, que é um tipo que representa qualquer coisa que pode ser renderizada pelo React (elementos, strings, números, fragmentos, etc.)
import Image from "next/image";
// Importa o HydrateClient do TRPC para hidratar consultas pré-carregadas no servidor
import { HydrateClient } from "~/trpc/server";

import herophoto from "../../public/foto-hero.jpg";

import { Button } from "~/app/_components/button";

// Componente assíncrono que representa a página inicial da aplicação
// Ele busca uma saudação do backend usando o TRPC e a sessão do usuário autenticado
// Se o usuário estiver autenticado, ele pré-busca o post mais recente para melhorar a performance
export default async function Home() {
  // Retorna o JSX que define a interface da página inicial
  // JSX é uma sintaxe que mistura HTML e JavaScript, usada pelo React para definir a UI (User Interface = interface do usuário)
  // Aqui exibimos links pra documentação, a saudação do backend e o estado de autenticação do usuário
  return (
    // HydrateClient é um componente que hidrata o estado do TRPC no cliente, permitindo que o frontend use os dados pré-buscados
    <HydrateClient>
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-red-500 blur-3xl"></div>
          <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-orange-500 blur-3xl"></div>
        </div>

        {/* Aumentado o padding-top para descer o conteúdo abaixo do topo */}
        <div className="relative z-10 container mx-auto px-4 pt-36 pb-32 md:pt-44 xl:pt-52">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl leading-tight font-bold text-gray-900 lg:text-6xl">
                  Prepare-se para o
                  <span className="block text-red-600">
                    Vestibulinho da ETEC{" "}
                    <span className="text-orange-600">
                      {new Date().getFullYear() + 1}
                    </span>
                  </span>
                </h1>
                <p className="text-xl leading-relaxed text-gray-600">
                  Simulados personalizados, guias de estudo e desafios diários
                  para garantir sua aprovação na ETEC dos seus sonhos.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button variant="primary">Comece Agora Grátis</Button>

                <Button variant="secondary">Nossa Trilha de Estudos</Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Criado por alunos para alunos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>100% Online</span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl bg-white shadow-2xl">
                <Image
                  src={herophoto}
                  alt="Estudantes preparando-se para ETEC"
                  className="h-80 w-full rounded-2xl object-cover"
                />

                {/* Floating stats */}
                <div className="absolute -top-4 -left-4 rounded-2xl bg-white p-4 shadow-lg">
                  <div className="text-2xl font-bold text-red-500">100%</div>
                  <div className="text-sm text-gray-600">
                    Grátis e acessível
                  </div>
                </div>

                <div className="absolute -right-4 -bottom-4 rounded-2xl bg-white p-4 shadow-lg">
                  <div className="text-2xl font-bold text-red-600">ETEC</div>
                  <div className="text-sm text-gray-600">
                    Seu caminho para a aprovação
                  </div>
                </div>
              </div>

              {/* Background shapes */}
              <div className="absolute top-8 left-8 -z-10 h-full w-full rounded-3xl bg-gradient-to-br from-red-200 to-orange-200"></div>
            </div>
          </div>
        </div>
      </section>
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
