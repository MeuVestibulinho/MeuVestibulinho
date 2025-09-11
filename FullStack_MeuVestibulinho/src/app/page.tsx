

// Importa o ReactNode do React, que é um tipo que representa qualquer coisa que pode ser renderizada pelo React (elementos, strings, números, fragmentos, etc.)
import Link from "next/link";

import Image from "next/image";
// Importa a função auth que lida com autenticação de usuários
import { auth } from "~/server/auth";
// Importa o objeto api do TRPC para fazer chamadas às rotas definidas no backend
// TRPC é uma biblioteca que facilita a comunicação entre frontend e backend com TypeScript
// Com rotas, eu quero dizer as funções que definimos no backend para criar, ler, atualizar e deletar dados (GET, POST, PUT, DELETE)
import { api, HydrateClient } from "~/trpc/server";

import herophoto from "../../public/foto-hero.jpg";

import { Button } from "~/app/_components/button";

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
      <section className="relative min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
    
        <div className="container mx-auto px-4 pt-20 pb-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Prepare-se para o 
                  <span className="text-red-600 block">Vestibulinho da ETEC <span className="text-orange-600">{new Date().getFullYear() + 1}</span></span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Simulados personalizados, guias de estudo e desafios diários para garantir sua aprovação na ETEC dos seus sonhos.
                </p>
              </div>
          
              <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary">
                Comece Agora Grátis
              </Button>

              <Button variant="secondary">
                Nossa Trilha de Estudos
              </Button>
            </div>          
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Criado por alunos para alunos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>100% Online</span>
                </div>
              </div>
            </div>
        
            {/* Image */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl">
                <Image
                  src={herophoto}
                  alt="Estudantes preparando-se para ETEC"
                  className="w-full h-80 object-cover rounded-2xl"
                />
            
                {/* Floating stats */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-red-500">100%</div>
                  <div className="text-sm text-gray-600">Grátis e acessível</div>
                </div>
            
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-red-600">ETEC</div>
                  <div className="text-sm text-gray-600">Seu caminho para a aprovação</div>
                </div>
              </div>
          
              {/* Background shapes */}
              <div className="absolute -z-10 top-8 left-8 w-full h-full bg-gradient-to-br from-red-200 to-orange-200 rounded-3xl"></div>
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
