"use client";

import React from "react";
import { motion } from "motion/react";
import {
  GitBranch,
  BookOpen,
  ListChecks,
  Eye,
  BarChart3,
  Timer,
  Sparkles,
} from "lucide-react";

export default function GuiaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <main className="container mx-auto flex-1 px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:p-12"
        >
          {/* Header do Card */}
          <div className="flex items-start gap-4">
            <div className="inline-flex rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 p-3">
              <GitBranch size={22} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Trilha de Estudos — estilo “árvore de conteúdo”
              </h1>
              <p className="mt-2 text-gray-600">
                Um roadmap em forma de árvore: cada nó é um tópico com breve
                apresentação e os principais exercícios, acompanhados de uma{" "}
                <strong>resolução lado a lado</strong>. Você avança destravando
                pré-requisitos, consolidando o que importa e acompanhando seu
                progresso.
              </p>
            </div>
          </div>

          {/* Conteúdo do Card */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Coluna 1: Como funciona a árvore */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <GitBranch size={18} className="text-red-600" />
                Estrutura em árvore (roadmap)
              </h2>
              <ul className="list-disc pl-5 leading-relaxed text-gray-700">
                <li>
                  <strong>Nós por tópico</strong>: Matemática, Português,
                  Ciências, Humanas… cada nó traz sub-tópicos (ex.: Frações →
                  Operações → Problemas Clássicos).
                </li>
                <li>
                  <strong>Pré-requisitos</strong>: para abrir um nó, conclua os
                  anteriores. Assim, a base fica sólida e o estudo flui.
                </li>
                <li>
                  <strong>Ordem sugerida e adaptação</strong>: a plataforma
                  recomenda uma rota; suas métricas ajustam prioridades ao longo
                  da semana.
                </li>
              </ul>

              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <BookOpen size={18} className="text-red-600" />
                Mini-apresentação do conteúdo
              </h2>
              <p className="leading-relaxed text-gray-700">
                Cada nó começa com uma{" "}
                <strong>apresentação leve e objetiva</strong>: definições
                essenciais, 1–2 exemplos rápidos e “erros comuns”. É o mínimo
                necessário para entender o que vai ser praticado, sem enrolação.
              </p>
            </section>

            {/* Coluna 2: Exercícios + Solução lado a lado */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <ListChecks size={18} className="text-red-600" />
                Principais exercícios com resolução ao lado
              </h2>
              <ul className="list-disc pl-5 leading-relaxed text-gray-700">
                <li>
                  <strong>Selecionados a dedo</strong>: questões clássicas de
                  prova para fixar 80% do resultado com 20% do esforço.
                </li>
                <li>
                  <strong>Layout “split view”</strong>: enunciado à esquerda; à
                  direita, <em>passo a passo comentado</em>, dicas e
                  alternativas.
                </li>
                <li>
                  <strong>Reveal progressivo</strong>: primeiro tente; depois
                  revele pistas; por fim, a solução completa.
                </li>
              </ul>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-xl border p-3">
                  <Eye size={16} className="text-orange-600" />
                  Dicas graduais
                </div>
                <div className="flex items-center gap-2 rounded-xl border p-3">
                  <Timer size={16} className="text-orange-600" />
                  Timer por questão
                </div>
                <div className="flex items-center gap-2 rounded-xl border p-3">
                  <Sparkles size={16} className="text-orange-600" />
                  Erros comuns
                </div>
              </div>
            </section>
          </div>

          {/* Linha 2: Progresso, Revisão e Simulados */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <BarChart3 size={18} className="text-red-600" />
                Progresso e métricas
              </h3>
              <p className="leading-relaxed text-gray-700">
                Cada nó registra acertos, tempo por questão e dificuldades. O
                painel sugere o próximo nó com{" "}
                <strong>maior ganho marginal</strong>.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Timer size={18} className="text-red-600" />
                Revisão e checkpoints
              </h3>
              <p className="leading-relaxed text-gray-700">
                Revisões espaçadas (24h → 3d → 7d) e <em>checkpoints</em>{" "}
                semanais para fechar lacunas antes de avançar.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ListChecks size={18} className="text-red-600" />
                Mini simulados integrados
              </h3>
              <p className="leading-relaxed text-gray-700">
                Blocos cronometrados validam o que foi estudado e alimentam as
                métricas que reordenam a árvore.
              </p>
            </section>
          </div>

          {/* CTA simples */}
          <div className="mt-10 rounded-2xl border border-gray-200 p-4 text-center text-sm text-gray-600">
            Comece pela base: abra o primeiro nó da sua matéria mais importante,
            leia a mini-apresentação e resolva os{" "}
            <strong>3–5 exercícios essenciais</strong>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
