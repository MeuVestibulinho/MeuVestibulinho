"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";

import FotoAdhemar from "../../public/AdhemarFotoMv.jpeg";
import FotoAdhemarHover from "../../public/AdhemarFotoMv2.jpeg";




type Member = {
  name: string;
  course: string;
  position: string;
  university: string;
  photo: string;
  photoHover: string;
  story: string;
};

const MEMBERS: Member[] = [
  {
    name: "Adhemar Molon",
    course: "Ciências da Computação",
    position: "Desenvolvedor",
    university: "USP - ICMC",
    photo: "/AdhemarFotoMv.jpeg",
    photoHover: "/AdhemarFotoMv2.jpeg",
    story:
      "Professor voluntário no cursinho popular Pré-ETEC há mais de três anos, fundador e idealizador da plataforma, guiado pela convicção de que transformar o futuro começa pela construção de uma base sólida. Formado no IFSP de Jundiaí no ensino médio técnico, vivenciei de perto o impacto que uma educação de qualidade pode ter na vida de um estudante. Hoje, levo essa experiência para o projeto, com o propósito de oferecer oportunidades que abram portas e mudem trajetórias. (E, claro, o mais “maneiro” da equipe de desenvolvimento).",
  },
  {
    name: "Fernando Alee",
    course: "Ciências da Computação",
    position: "Desenvolvedor",
    university: "USP - ICMC",
    photo: "/team/fernando1.jpg",
    photoHover: "/team/fernando2.jpg",
    story:
      "Sou muito bicha.",
  },
  {
    name: "Guilherme Torquato",
    course: "Ciências da Computação",
    position: "Desenvolvedor",
    university: "USP - ICMC",
    photo: "/team/guilherme1.jpg",
    photoHover: "/team/guilherme2.jpg",
    story:
      "Sou muito bicha.",
  },
  {
    name: "Pedro Lucas",
    course: "Ciências da Computação",
    position: "Desenvolvedor",
    university: "USP - ICMC",
    photo: "/team/pedro1.jpg",
    photoHover: "/team/pedro2.jpg",
    story:
      "Sou muito bicha.",
  },
];

const TeamCard: React.FC<{ member: Member; hovered: boolean }> = ({
  member,
  hovered,
}) => {
  return (
    <motion.div
      layout
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
      animate={{ scale: hovered ? 1.03 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Foto com troca no hover */}
      <div className="relative h-64 w-full">
        <Image
          src={hovered ? member.photoHover : member.photo}
          alt={member.name}
          fill
          sizes="(max-width: 1024px) 100vw, 25vw"
          className="object-cover transition-all duration-500"
          priority={false}
        />
      </div>

      {/* Campos solicitados (4) */}
      <div className="p-6 space-y-2">
        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
        <p className="text-sm text-gray-700">
          <strong>Curso:</strong> {member.course}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Posição na equipe:</strong> {member.position}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Universidade:</strong> {member.university}
        </p>
      </div>

      {/* Camada expandida com a história única enquanto o mouse estiver sobre o card */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-white/95 backdrop-blur-sm p-6 flex items-center"
        >
          <p className="text-sm leading-relaxed text-gray-800">{member.story}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function SobreNosPage() {
  const [hoveredName, setHoveredName] = React.useState<string | null>(null);

  return (


      <main className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 via-white to-red-50">
        {/* Hero / Título */}
        <section className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-16 left-24 w-80 h-80 bg-red-500 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 right-16 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 px-6 py-14 lg:px-12">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">
                Sobre Nós
              </h1>
              <p className="mt-4 max-w-3xl text-lg text-gray-700 leading-relaxed">
                Somos alunos de <strong>Ciências da Computação</strong> da{" "}
                <strong>Universidade de São Paulo (USP)</strong>, no{" "}
                <strong>Instituto de Ciências Matemáticas e de Computação (ICMC)</strong>.
                Identificamos uma lacuna: há muitos recursos para ingresso em universidades,
                mas quase nenhuma solução bem organizada para a transição do fundamental
                para o médio técnico. Decidimos então ser pioneiros —{" "}
                <em>construindo a base que sustenta o topo</em> — com uma
                plataforma completa, gratuita e de alta qualidade, que guia estudantes
                passo a passo rumo a oportunidades melhores.
              </p>
            </div>
          </div>
        </section>

        {/* Equipe */}
        <section className="container mx-auto px-4 mt-14">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            Equipe de Desenvolvimento
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {MEMBERS.map((m) => {
              const isHovered = hoveredName === m.name;
              return (
                <div
                  key={m.name}
                  onMouseEnter={() => setHoveredName(m.name)}
                  onMouseLeave={() => setHoveredName(null)}
                >
                  <TeamCard member={m} hovered={!!isHovered} />
                </div>
              );
            })}
          </div>
        </section>

        {/* Motivação */}
        <section className="container mx-auto px-4 mt-14 mb-24">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Nossa Motivação
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Acreditamos que educação transforma trajetórias. Por isso,
              desenhamos uma experiência focada, clara e guiada — para que
              estudantes tenham acesso gratuito a simulados, trilhas e materiais
              que realmente façam diferença. O objetivo é simples:{" "}
              <strong>fortalecer a base para que mais jovens cheguem ao topo</strong>.
            </p>
          </div>
        </section>
      </main>


  );
}
