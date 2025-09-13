"use client";

import React from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  GraduationCap,
  User,
  Play,
  Sparkles,
  Timer,
  BarChart3,
  Users,
  CheckCircle2,
  MessageCircle,
  Shield,
  FileText,
  ExternalLink,
} from "lucide-react";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5 }}
    className="rounded-3xl bg-white p-6 md:p-8 shadow-xl border border-gray-100"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="inline-flex rounded-xl bg-gradient-to-br from-red-100 to-orange-100 p-3">
        <Icon size={20} className="text-red-600" />
      </div>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="text-gray-700 leading-relaxed">{children}</div>
  </motion.section>
);

export default function ComoFuncionaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <main className="container mx-auto flex-1 px-4 py-24 md:py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-900">Como funciona?</h1>
          <p className="mt-3 text-gray-600">
            Entenda, passo a passo, como usar nossos programas e recursos para se preparar com eficiência para o vestibulinho.
          </p>
        </motion.div>

        <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-3">
          {/* Coluna 1 */}
          <div className="space-y-6">
            <Section icon={BookOpen} title="Simulados personalizados">
              <p>
                Monte provas por matéria e dificuldade, com timer embutido. O sistema salva seu histórico
                para que você acompanhe evolução, acertos por tema e tempo médio por questão.
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm">
                <li>Escolha conteúdo e nível;</li>
                <li>Ative o cronômetro para treinar ritmo;</li>
                <li>Revise com gabarito comentado (quando disponível);</li>
                <li>Acompanhe seu desempenho no painel.</li>
              </ul>
              <a href="#" className="inline-flex items-center gap-1 mt-3 text-red-600 hover:underline">
                Abrir Simulados <ExternalLink size={14} />
              </a>
            </Section>

            <Section icon={Timer} title="Timer & gestão de tempo">
              <p>
                Treine na pressão certa: o cronômetro replica a dinâmica de prova. Você pode pausar entre blocos,
                visualizar tempo restante e comparar seu pacing por matéria.
              </p>
            </Section>

            <Section icon={Play} title="Mini cursos por tópico">
              <p>
                Aulas objetivas com teoria essencial + exercícios rápidos. Ideal para revisar pontos fracos
                identificados nas métricas e consolidar conteúdos de alta incidência.
              </p>
              <a href="#" className="inline-flex items-center gap-1 mt-3 text-red-600 hover:underline">
                Ver Mini Cursos <ExternalLink size={14} />
              </a>
            </Section>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-6">
            <Section icon={GraduationCap} title="Guia de Estudos (Trilha)">
              <p>
                Um roteiro sugerido para organizar sua semana: teoria, questões, revisões e simulados.
                Adapte a trilha ao seu ritmo e foque nos temas com maior impacto.
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm">
                <li>Planejamento semanal com metas claras;</li>
                <li>Blocos de estudo curtos e encaixáveis na rotina;</li>
                <li>Revisões espaçadas e checkpoints;</li>
                <li>Integração com métricas para priorizar o que mais importa.</li>
              </ul>
              <a href="/guia" className="inline-flex items-center gap-1 mt-3 text-red-600 hover:underline">
                Abrir Guia de Estudos <ExternalLink size={14} />
              </a>
            </Section>

            <Section icon={Sparkles} title="Desafios diários (streak)">
              <p>
                Complete pelo menos um conjunto de exercícios por dia para manter sua sequência ativa
                e construir consistência. Pequenas vitórias diárias, grande resultado no fim.
              </p>
            </Section>

            <Section icon={Users} title="Comunidade & suporte">
              <p>
                Participe da comunidade para trocar dicas e tirar dúvidas. Conte também com a Central de Ajuda
                para tutoriais e respostas rápidas.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a href="/ajuda" className="text-red-600 hover:underline inline-flex items-center gap-1">
                  Central de Ajuda <ExternalLink size={14} />
                </a>
                <a href="/contato" className="text-red-600 hover:underline inline-flex items-center gap-1">
                  Fale Conosco <MessageCircle size={14} />
                </a>
              </div>
            </Section>
          </div>

          {/* Coluna 3 */}
          <div className="space-y-6">
            <Section icon={User} title="Meu Espaço (perfil e progresso)">
              <p>
                Seu hub pessoal: histórico de simulados, metas da semana, materiais salvos e recomendações
                personalizadas com base no seu desempenho.
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm">
                <li>Resumo do dia e próximos passos;</li>
                <li>Atalhos para retomar estudos e simulados;</li>
                <li>Preferências de matérias e notificações.</li>
              </ul>
            </Section>

            <Section icon={BarChart3} title="Métricas & painel (dashboard)">
              <p>
                Acompanhe seus indicadores: acertos por matéria, tópicos com maior ganho marginal,
                tempo médio por questão e evolução semanal. Use esses dados para ajustar seu estudo.
              </p>
            </Section>

            <Section icon={CheckCircle2} title="Boas práticas para aproveitar tudo">
              <ul className="list-disc pl-5 text-sm">
                <li>Alterne blocos curtos de teoria e questões;</li>
                <li>Use o timer nos simulados ao menos 2× por semana;</li>
                <li>Revise erros recentes antes de abrir um novo simulado;</li>
                <li>Atualize sua trilha conforme as métricas apontarem prioridades;</li>
                <li>Faça um “mini simulado” no dia anterior à prova para calibrar ritmo.</li>
              </ul>
            </Section>

            <Section icon={Shield} title="Privacidade & termos">
              <p>
                Tratamos dados para personalizar sua experiência, melhorar a plataforma e garantir segurança.
                Consulte os documentos oficiais:
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a href="/privacidade" className="text-red-600 hover:underline inline-flex items-center gap-1">
                  Política de Privacidade <Shield size={14} />
                </a>
                <a href="/termos" className="text-red-600 hover:underline inline-flex items-center gap-1">
                  Termos de Uso <FileText size={14} />
                </a>
              </div>
            </Section>
          </div>
        </div>

        {/* CTA final */}
        <div className="mx-auto max-w-3xl text-center mt-10">
          <p className="text-sm text-gray-600">
            Pronto para começar? Explore a <a href="/guia" className="text-red-600 hover:underline">Trilha de Estudos</a> e crie seu
            primeiro <a href="#" className="text-red-600 hover:underline">Simulado</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
