// app/dicas/page.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Lightbulb,
  Timer,
  ListChecks,
  Target,
  BookOpen,
  BarChart3,
  Sparkles,
  Eye,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Coffee,
  CalendarDays,
  Shield,
  ExternalLink,
} from "lucide-react";

export default function DicasEstrategiasPage() {
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
              <Lightbulb size={22} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Dicas & Estratégias — vestibulinho ETEC
              </h1>
              <p className="mt-2 text-gray-600">
                Estratégias práticas para treinar e fazer a prova com eficiência
                — integradas aos recursos do <strong>Meu Vestibulinho</strong>:
                simulados, trilha, métricas, timer, streak e resolução lado a
                lado.
              </p>
            </div>
          </div>

          {/* Conteúdo do Card */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Coluna 1 */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Target size={18} className="text-red-600" />
                Estude com foco (Trilha + Mini cursos)
              </h2>
              <ul className="list-disc pl-5 leading-relaxed text-gray-700">
                <li>
                  Siga a{" "}
                  <a href="/guia" className="text-red-600 hover:underline">
                    Trilha
                  </a>
                  : blocos curtos de teoria → exercícios → revisão. Evite
                  maratonar só teoria.
                </li>
                <li>
                  Use <strong>Mini cursos</strong> quando um tópico estiver
                  fraco: revisão objetiva e retorno rápido aos exercícios.
                </li>
                <li>
                  Registre anotações de “erros comuns” para reler antes dos
                  simulados.
                </li>
              </ul>

              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Timer size={18} className="text-red-600" />
                Treine ritmo com Timer
              </h2>
              <p className="leading-relaxed text-gray-700">
                Ative o <strong>timer</strong> nos simulados e listas. Faça
                blocos de 25–40 minutos com pausas curtas. Em prova, gerencie o
                tempo por “passadas”: fácil → médio → difícil.
              </p>

              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <ListChecks size={18} className="text-red-600" />
                Ordem inteligente de resolução
              </h2>
              <ol className="list-decimal space-y-1 pl-5 leading-relaxed text-gray-700">
                <li>
                  <strong>Varredura 1</strong>: resolva as fáceis primeiro
                  (ganho rápido + confiança).
                </li>
                <li>
                  <strong>Varredura 2</strong>: volte nas médias; marque as
                  demoradas.
                </li>
                <li>
                  <strong>Varredura 3</strong>: ataque as difíceis com tempo
                  controlado. Se travar, chute estratégico e siga.
                </li>
              </ol>
            </section>

            {/* Coluna 2 */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Eye size={18} className="text-red-600" />
                Exercícios no estilo ETEC (split view)
              </h2>
              <p className="leading-relaxed text-gray-700">
                Priorize questões{" "}
                <strong>baseadas em provas reais da ETEC</strong>. Tente sozinho
                2–3 minutos, revele <em>dicas graduais</em> e só então veja a
                <strong> resolução lado a lado</strong> para comparar abordagem
                e passos.
              </p>

              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <BarChart3 size={18} className="text-red-600" />
                Use as métricas a seu favor
              </h2>
              <ul className="list-disc pl-5 leading-relaxed text-gray-700">
                <li>
                  <strong>Ganho marginal</strong>: foque nos temas que mais
                  sobem sua nota.
                </li>
                <li>
                  <strong>Tempo por questão</strong>: identifique onde está
                  perdendo minutos.
                </li>
                <li>
                  <strong>Erros recorrentes</strong>: revise-os antes de um novo
                  simulado.
                </li>
              </ul>

              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Sparkles size={18} className="text-red-600" />
                Consistência diária (streak)
              </h2>
              <p className="leading-relaxed text-gray-700">
                Faça ao menos um bloco curto por dia para manter o{" "}
                <strong>streak</strong>. Consistência {">"} intensidade: 30–40
                min diários vencem 1 dia longo por semana.
              </p>
            </section>
          </div>

          {/* Linha 2: Técnicas de prova */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Brain size={18} className="text-red-600" />
                Leitura ativa
              </h3>
              <p className="leading-relaxed text-gray-700">
                Sublinhe dados-chave, traduza o enunciado para suas palavras e
                estime o caminho antes de calcular. Evita retrabalho.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <BookOpen size={18} className="text-red-600" />
                Eliminação e chute estratégico
              </h3>
              <p className="leading-relaxed text-gray-700">
                Elimine alternativas absurdas/incoerentes. Se o tempo acabar,
                chute entre as duas mais plausíveis. Melhor resposta provável{" "}
                {">"} em branco.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CheckCircle2 size={18} className="text-red-600" />
                Revisão final
              </h3>
              <p className="leading-relaxed text-gray-700">
                Reserve 5–10 min finais: marque pendências durante a prova e
                volte nelas no fim. Não reabra questões já certas sem motivo.
              </p>
            </section>
          </div>

          {/* Linha 3: Antes / Dia / Depois */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ClipboardCheck size={18} className="text-red-600" />
                Antes da prova
              </h3>
              <ul className="list-disc pl-5 leading-relaxed text-gray-700">
                <li>Simulado-treino na véspera (tempo real);</li>
                <li>Releia “erros comuns” e fórmulas-chave;</li>
                <li>Separe documentos/canetas e confira o local.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Coffee size={18} className="text-red-600" />
                No dia da prova
              </h3>
              <ul className="list-disc pl-5 leading-relaxed text-gray-700">
                <li>Café da manhã leve + hidratação;</li>
                <li>Chegue cedo para ajustar ansiedade;</li>
                <li>
                  Execute a estratégia de <em>três passadas</em> e controle o
                  tempo.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CalendarDays size={18} className="text-red-600" />
                Depois da prova
              </h3>
              <p className="leading-relaxed text-gray-700">
                Revise onde errou por <strong>categoria</strong>{" "}
                (conteúdo/atenção/tempo). Alimente as métricas e ajuste a Trilha
                da semana seguinte.
              </p>
            </section>
          </div>

          {/* Observação de ética/privacidade */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Shield size={18} className="text-red-600" />
                Ética e uso responsável
              </h3>
              <p className="leading-relaxed text-gray-700">
                Treine com questões no estilo ETEC de forma honesta. Evite colas
                e foque no entendimento — sua evolução aparece nas métricas.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ExternalLink size={18} className="text-red-600" />
                Onde praticar agora
              </h3>
              <p className="leading-relaxed text-gray-700">
                Comece por{" "}
                <a href="/exercicios" className="text-red-600 hover:underline">
                  Exercícios
                </a>{" "}
                (estilo ETEC), depois rode um{" "}
                <a href="#" className="text-red-600 hover:underline">
                  Simulado
                </a>{" "}
                com <strong>timer</strong>e revise os erros na{" "}
                <a href="/guia" className="text-red-600 hover:underline">
                  Trilha
                </a>
                .
              </p>
            </section>
          </div>

          {/* CTA simples */}
          <div className="mt-10 rounded-2xl border border-gray-200 p-4 text-center text-sm text-gray-600">
            Aplique hoje: 1 bloco de teoria + 15 questões com timer + revisão
            dos erros. Amanhã, repita e mantenha o <strong>streak</strong>.
            Consistência vence.
          </div>
        </motion.div>
      </main>
    </div>
  );
}
