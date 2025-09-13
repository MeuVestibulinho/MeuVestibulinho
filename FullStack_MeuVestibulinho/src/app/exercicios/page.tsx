// app/exercicios/page.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import {
  ListChecks,
  BookOpen,
  Eye,
  Sparkles,
  Timer,
  Tag,
  BarChart3,
  Shield,
  MessageSquareWarning,
  Download,
} from "lucide-react";

export default function ExerciciosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <main className="container mx-auto flex-1 px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl rounded-3xl bg-white p-8 md:p-12 shadow-xl border border-gray-100"
        >
          {/* Header do Card */}
          <div className="flex items-start gap-4">
            <div className="inline-flex rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 p-3">
              <ListChecks size={22} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Exercícios — foco total no estilo ETEC
              </h1>
              <p className="mt-2 text-gray-600">
                Nossa coleção é baseada nas <strong>provas oficiais da ETEC</strong> e em
                questões espelhadas/variantes fiéis ao formato do exame. Cada exercício vem
                com <strong>resolução lado a lado</strong>, dicas graduais, controle de tempo e
                tags por tema e dificuldade — tudo para você aprender de verdade e ganhar ritmo de prova.
              </p>
            </div>
          </div>

          {/* Conteúdo do Card */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Coluna 1 */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen size={18} className="text-red-600" />
                Fonte e curadoria das questões
              </h2>
              <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
                <li>
                  <strong>Base ETEC</strong>: acervo com questões das edições anteriores e
                  modelos alinhados ao estilo da banca.
                </li>
                <li>
                  <strong>Atualização contínua</strong>: priorizamos conteúdos de alta incidência e
                  adicionamos variantes para cobrir pegadinhas clássicas.
                </li>
                <li>
                  <strong>Qualidade</strong>: revisão pedagógica e técnica antes de publicar.
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Eye size={18} className="text-red-600" />
                Layout “split view” (resolução ao lado)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Você visualiza o <strong>enunciado à esquerda</strong> e, à direita, um
                <em> passo a passo comentado</em> com estratégia, cálculos e justificativas.
                Pode ocultar/mostrar a solução quando quiser.
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border p-3">👀 Mostrar/ocultar solução</div>
                <div className="rounded-xl border p-3">🧭 Estratégia resumida</div>
                <div className="rounded-xl border p-3">🧮 Passo a passo</div>
              </div>
            </section>

            {/* Coluna 2 */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-red-600" />
                Dicas graduais & erros comuns
              </h2>
              <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
                <li><strong>Hints 1/2/3</strong>: revelação progressiva para manter o aprendizado ativo.</li>
                <li><strong>Erros frequentes</strong>: alertas do que a banca costuma cobrar/enganar.</li>
                <li><strong>Boas práticas</strong>: caminhos alternativos quando valem a pena.</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Timer size={18} className="text-red-600" />
                Timer & ritmo de prova
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Treine com <strong>tempo por questão</strong> e compare seu pacing com o tempo-alvo.
                Ao final, você vê quanto gastou e onde ajustar o ritmo.
              </p>
            </section>
          </div>

          {/* Linha 2: Tags, Métricas, Segurança, Report, Export */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag size={18} className="text-red-600" />
                Tags por tema e dificuldade
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Cada exercício recebe <strong>tema</strong> (ex.: Frações, Interpretação de Texto),
                <strong> subtema</strong> e <strong>nível</strong> (Fácil/Médio/Difícil).
                Isso permite montar listas sob medida ou seguir a ordem sugerida.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-red-600" />
                Métricas e reforço inteligente
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Acompanhamos acertos, tempo por questão e reincidência de erros.
                O sistema recomenda os próximos exercícios com <strong>maior ganho marginal</strong>
                para você evoluir mais rápido.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield size={18} className="text-red-600" />
                Experiência justa e confiável
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Evitamos “spoilers” antes da hora e mantemos a ordem lógica dos passos.
                Sempre que possível, apresentamos <strong>fontes e justificativas</strong> didáticas.
              </p>
            </section>
          </div>

          {/* Linha 3: Reporte e Export */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquareWarning size={18} className="text-red-600" />
                Reporte um problema
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Encontrou algo estranho? Use <strong>“Reportar erro”</strong> no próprio exercício.
                Descreva o que aconteceu (enunciado, alternativa, solução, formatação).
                A curadoria revisa e atualiza rapidamente.
              </p>
              <p className="text-sm text-gray-500">
                Dica: anexar print/link acelera a correção.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Download size={18} className="text-red-600" />
                Estude off-line (export)
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Em listas selecionadas, você pode <strong>exportar</strong> um PDF com enunciados e
                gabarito ao final — ideal para treinos impressos e simulações sem distrações.
              </p>
            </section>
          </div>

          {/* CTA simples */}
          <div className="mt-10 rounded-2xl border border-gray-200 p-4 text-center text-sm text-gray-600">
            Comece pelo tema que mais cai: abra uma lista de <strong>exercícios ETEC</strong>,
            tente sozinho por 2–3 minutos, revele uma dica se travar e só então veja a
            <strong> resolução passo a passo</strong>. Ritmo + entendimento = aprovação.
          </div>
        </motion.div>
      </main>
    </div>
  );
}
