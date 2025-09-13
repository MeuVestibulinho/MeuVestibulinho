"use client";

import * as React from "react";
import Image from "next/image";
import { TeamCard } from "../_components/TeamCard";



type Member = {
  name: string;
  course: string;
  position: string;
  university: string;
  photo: string;
  story: string;
};

const MEMBERS: Member[] = [
  {
    name: "Adhemar Molon",
    course: "Ciências da Computação",
    position: "Desenvolvedor",
    university: "USP - ICMC",
    photo: "/AdhemarFotoMv.jpeg",
    story:
      "Professor voluntário no cursinho popular Pré-ETEC há mais de três anos, guiado pela convicção de que transformar o futuro começa pela construção de uma base sólida. Como ex-aluno de escola técnica, vivenciei de perto o impacto que esse tipo de ensino pode gerar na vida de um jovem — um verdadeiro efeito dominó, capaz de abrir portas, criar oportunidades e mudar trajetórias. Acredito que a educação deve ser acessível, organizada e capaz de oferecer a cada estudante as ferramentas para conquistar seus sonhos.",
  },
  {
    name: "Fernando Alee",
    course: "Ciências da Computação",
    position: "Desenvolvedor",
    university: "USP - ICMC",
    photo: "/FotoTeam.jpeg",
    story:
      "Apaixonado por produtos educacionais e acessibilidade digital. Curto transformar conteúdo difícil em interfaces simples.",
  },
  {
    name: "Guilherme Torquato",
    course: "Ciências da Computação",
    position: "Desenvolvedor",
    university: "USP - ICMC",
    photo: "/FotoTeam.jpeg",
    story:
      "Foco em front-end performático e animações. Acredito que UX consistente ensina melhor.",
  },
  {
    name: "Pedro Lucas",
    course: "Ciências da Computação",
    position: "Desenvolvedor",
    university: "USP - ICMC",
    photo: "/FotoTeam.jpeg",
    story:
      "Curto dados e visualizações. Métricas claras ajudam o aluno a evoluir com propósito.",
  },
];

export default function SobreNosPage() {
  return (
    <main className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Hero / Título */}
        <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="absolute inset-0 opacity-10">
            <div className="absolute top-16 left-24 w-80 h-80 bg-red-500 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 right-16 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
            </div>

            {/* duas colunas no desktop */}
            <div className="relative z-10 px-6 py-14 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Texto à esquerda */}
            <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">
                Sobre Nós
                </h1>
                <p className="mt-4 max-w-3xl text-lg text-gray-700 leading-relaxed">
                Somos alunos de <strong>Ciências da Computação</strong> da{" "}
                <strong>USP/ICMC</strong>. Identificamos uma lacuna na transição
                do fundamental para o ensino técnico e decidimos construir uma
                plataforma completa, gratuita e de alta qualidade que guie
                estudantes passo a passo rumo a oportunidades melhores.
                </p>
            </div>

            {/* Imagem à direita */}
            <div className="relative w-full h-64 sm:h-72 lg:h-80">
                <Image
                src="/FotoTeam.jpeg" 
                alt="Ilustração sobre nós"
                fill
                priority
                sizes="(min-width:1024px) 40vw, 90vw"
                className="object-contain rounded-2xl shadow-md"
                />
            </div>
            </div>
        </div>
        </section>


      {/* Equipe */}
      <section className="container mx-auto px-4 mt-14">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
          Equipe de Desenvolvimento
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {MEMBERS.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </div>
      </section>

      {/* Motivação */}
      <section className="container mx-auto px-4 mt-14 mb-24">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Nossa Motivação
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Educação transforma trajetórias. Criamos uma experiência focada e
            guiada, com simulados, trilhas e materiais que realmente fazem
            diferença. Nosso objetivo:{" "}
            <strong>fortalecer a base para que mais jovens cheguem ao topo</strong>.
          </p>
        </div>
      </section>
    </main>
  );
}
