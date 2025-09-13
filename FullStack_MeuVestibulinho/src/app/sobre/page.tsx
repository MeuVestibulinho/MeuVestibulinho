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
    photo: "/eu-edited2.png",
    story:
      "Ex-aluno da ETEC de Bauru, onde descobri meu gosto por tecnologia e programação. Hoje em dia percebo como a educação técnica pode transformar vidas e abrir portas incríveis. Como desenvolvedor atualmente, busco criar ferramentas que facilitem o acesso à educação de qualidade para outros jovens.",
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 pt-24">
      {/* Hero / Título */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-16 left-24 h-80 w-80 rounded-full bg-red-500 blur-3xl" />
            <div className="absolute right-16 -bottom-10 h-96 w-96 rounded-full bg-orange-500 blur-3xl" />
          </div>

          {/* duas colunas no desktop */}
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 px-6 py-14 lg:grid-cols-2 lg:px-12">
            {/* Texto à esquerda */}
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 lg:text-4xl">
                Sobre Nós
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-700">
                Somos alunos de <strong>Ciências da Computação</strong> da{" "}
                <strong>USP/ICMC</strong>. Identificamos uma lacuna na transição
                do fundamental para o ensino técnico e decidimos construir uma
                plataforma completa, gratuita e de alta qualidade que guie
                estudantes passo a passo rumo a oportunidades melhores.
              </p>
            </div>

            {/* Imagem à direita */}
            <div className="relative h-64 w-full sm:h-72 lg:h-80">
              <Image
                src="/FotoTeam.jpeg"
                alt="Ilustração sobre nós"
                fill
                priority
                sizes="(min-width:1024px) 40vw, 90vw"
                className="rounded-2xl object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="container mx-auto mt-14 px-4">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 lg:text-3xl">
          Equipe de Desenvolvimento
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {MEMBERS.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </div>
      </section>

      {/* Motivação */}
      <section className="container mx-auto mt-14 mb-24 px-4">
        <div className="rounded-2xl border border-gray-100 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
          <h3 className="mb-3 text-xl font-bold text-gray-900">
            Nossa Motivação
          </h3>
          <p className="leading-relaxed text-gray-700">
            Educação transforma trajetórias. Criamos uma experiência focada e
            guiada, com simulados, trilhas e materiais que realmente fazem
            diferença. Nosso objetivo:{" "}
            <strong>
              fortalecer a base para que mais jovens cheguem ao topo
            </strong>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
