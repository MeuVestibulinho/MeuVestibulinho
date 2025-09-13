// app/comunidade/page.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Users,
  Instagram,
  Music,
  GraduationCap,
  Sparkles,
  Target,
  ExternalLink,
} from "lucide-react";

export default function ComunidadePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <main className="container mx-auto flex-1 px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:p-12"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="inline-flex rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 p-3">
              <Users size={22} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Comunidade Meu Vestibulinho
              </h1>
              <p className="mt-2 text-gray-600">
                Mais do que estudar sozinho: queremos construir uma{" "}
                <strong>rede de apoio</strong> entre quem sonha com a vaga na
                ETEC. Nossa comunidade vive no dia a dia das redes sociais,
                conectando alunos, dicas e experiências reais.
              </p>
            </div>
          </div>

          {/* Redes sociais */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Instagram size={18} className="text-red-600" />
                Instagram
              </h2>
              <p className="leading-relaxed text-gray-700">
                Conteúdos rápidos, stories interativos e motivação diária. Siga
                e participe enviando dúvidas, respondendo enquetes e
                acompanhando as novidades.
              </p>
              <a
                href="https://instagram.com/meuvestibulinho"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-red-600 hover:underline"
              >
                Acessar Instagram <ExternalLink size={14} />
              </a>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Music size={18} className="text-red-600" />
                TikTok
              </h2>
              <p className="leading-relaxed text-gray-700">
                Dicas em vídeo curto, macetes de prova, desafios e lives com a
                comunidade. O TikTok é onde o aprendizado encontra o
                entretenimento — perfeito para manter o ritmo.
              </p>
              <a
                href="https://tiktok.com/@meuvestibulinho"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-red-600 hover:underline"
              >
                Acessar TikTok <ExternalLink size={14} />
              </a>
            </section>
          </div>

          {/* Propósito da comunidade */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <GraduationCap size={18} className="text-red-600" />O universo
                ETEC
              </h2>
              <p className="leading-relaxed text-gray-700">
                Todos os anos, milhares de estudantes se inscrevem para o{" "}
                <strong>Vestibulinho ETEC</strong>. São dezenas de milhares de
                vagas disputadas, com uma base de candidatos que cresce a cada
                edição.
              </p>
              <p className="leading-relaxed text-gray-700">
                Destes, uma grande parcela busca preparação estruturada. É esse
                público —{" "}
                <strong>quem quer transformar sua base em futuro</strong> — que
                queremos alcançar e reunir.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Target size={18} className="text-red-600" />
                Nosso objetivo
              </h2>
              <p className="leading-relaxed text-gray-700">
                Criar um espaço digital onde cada aluno se sinta parte de algo
                maior. Ao compartilhar dúvidas, vitórias e estratégias, todos
                crescem juntos.
              </p>
              <p className="leading-relaxed text-gray-700">
                O <strong>Meu Vestibulinho</strong> nasceu com a missão de
                democratizar a preparação e alcançar milhares de jovens para
                compor essa comunidade de transformação.
              </p>
            </section>
          </div>

          {/* Chamada final */}
          <div className="mt-10 rounded-2xl border border-gray-200 p-6 text-center">
            <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-900">
              <Sparkles size={18} className="text-red-600" />
              Junte-se à comunidade
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Siga nossas redes, compartilhe sua rotina de estudos e inspire
              outros candidatos. O futuro começa agora, e juntos vamos mais
              longe.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <a
                href="https://instagram.com/meuvestibulinho"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm hover:border-red-400 hover:text-red-600"
              >
                Instagram <Instagram size={16} />
              </a>
              <a
                href="https://tiktok.com/@meuvestibulinho"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm hover:border-red-400 hover:text-red-600"
              >
                TikTok <Music size={16} />
              </a>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
