// app/ajuda/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Search, BookOpen, GraduationCap, Timer, Sparkles,
  Info, MessageCircle, Shield, FileText, ExternalLink
} from "lucide-react";

type Faq = {
  q: string;
  a: string;
  tags: string[];
  category: "Conta" | "Simulados" | "Guia de Estudos" | "Mini Cursos" | "Geral" | "Privacidade";
};

const FAQS: Faq[] = [
  { q: "Como crio minha conta?", a: "Clique em Entrar/Cadastrar, informe e-mail e senha e confirme. Você pode completar o perfil depois.", tags: ["cadastro","login","conta"], category: "Conta" },
  { q: "Esqueci minha senha. E agora?", a: "Na tela de login, clique em “Esqueci minha senha” e siga as instruções enviadas ao seu e-mail.", tags: ["senha","recuperar","login"], category: "Conta" },
  { q: "Como funcionam os simulados personalizados?", a: "Escolha matérias e dificuldade. A prova é montada com timer e histórico salvo para métricas.", tags: ["simulados","personalizado","timer","painel"], category: "Simulados" },
  { q: "Onde vejo minhas métricas e evolução?", a: "Acesse seu dashboard para acertos por matéria, tempo por questão e evolução diária.", tags: ["métricas","dashboard","desempenho"], category: "Simulados" },
  { q: "O que é a Trilha de Estudos?", a: "Roteiro sugerido com teoria, questões e revisões, adaptável ao seu ritmo e foco.", tags: ["trilha","planejamento","estudos"], category: "Guia de Estudos" },
  { q: "Existem mini cursos dos tópicos da prova?", a: "Sim, conteúdos objetivos com teoria essencial e exercícios rápidos para revisão.", tags: ["mini cursos","revisão","teoria"], category: "Mini Cursos" },
  { q: "Como funcionam os desafios diários (foguinho)?", a: "Conclua ao menos um bloco diário para manter a sequência ativa e ganhar streak.", tags: ["desafios","streak","diário"], category: "Geral" },
  { q: "Como reporto um erro em uma questão?", a: "Na questão, use “Reportar erro” e descreva o problema. Ou envie pela página /contato.", tags: ["erro","questão","reportar"], category: "Geral" },
  { q: "Meus dados são usados para quê?", a: "Para personalizar sua experiência, melhorar o site, garantir segurança e comunicar updates. Detalhes na página de política de privacidade.", tags: ["privacidade","dados","lgpd"], category: "Privacidade" },
  { q: "Onde encontro Termos e Política de Privacidade?", a: "Na página de Termos e Política de Privacidade e também no rodapé do site.", tags: ["termos","política","jurídico"], category: "Geral" },
];

const ACTIONS = [
  { title: "Guia de Estudos", desc: "Comece pela trilha sugerida e ajuste ao seu ritmo.", href: "/guia", icon: GraduationCap },
  { title: "Simulados", desc: "Monte simulados por matéria e dificuldade.", href: "#", icon: BookOpen },
  { title: "Desafios Diários", desc: "Pratique todo dia e mantenha o foguinho aceso.", href: "#", icon: Sparkles },
  { title: "Timer de Prova", desc: "Treine com o tempo real do exame.", href: "#", icon: Timer },
];

export default function CentralDeAjudaPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todas" | Faq["category"]>("Todas");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const matchesQuery =
        !q ||
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q));
      const matchesCategory = category === "Todas" || f.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  const categories: Array<"Todas" | Faq["category"]> = [
    "Todas","Conta","Simulados","Guia de Estudos","Mini Cursos","Geral","Privacidade",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <main className="container mx-auto flex-1 px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Central de Ajuda</h1>
            <p className="mt-3 text-gray-600">
              Encontre respostas rápidas, tutoriais e orientações para aproveitar ao máximo o Meu Vestibulinho.
            </p>
          </div>

          {/* Busca + categorias */}
          <div className="mx-auto mb-8 max-w-3xl">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por 'simulados', 'senha', 'trilha'..."
                className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 pr-12 text-gray-900 outline-none ring-red-200 focus:ring-2"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    category === c
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-red-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            {ACTIONS.map(({ title, desc, href, icon: Icon }) => (
              <motion.a
                key={title}
                href={href}
                whileHover={{ y: -3 }}
                className="block rounded-2xl bg-white p-5 shadow-xl border border-gray-100"
              >
                <div className="mb-3 inline-flex rounded-xl bg-gradient-to-br from-red-100 to-orange-100 p-3">
                  <Icon size={20} className="text-red-600" />
                </div>
                <div className="font-semibold text-gray-900">{title}</div>
                <div className="text-sm text-gray-600 mt-1">{desc}</div>
              </motion.a>
            ))}
          </div>

          {/* Conteúdo principal: links úteis + FAQs */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Coluna esquerda: links úteis */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-yellow-100 p-3">
                    <Info size={18} className="text-yellow-700" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Links úteis</h2>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a href="/guia" className="group flex items-center justify-between rounded-xl p-3 hover:bg-red-50">
                      Trilha de Estudos
                      <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                    </a>
                  </li>
                  <li>
                    <a href="/termos" className="group flex items-center justify-between rounded-xl p-3 hover:bg-red-50">
                      Termos de Uso
                      <FileText size={14} className="opacity-50 group-hover:opacity-100" />
                    </a>
                  </li>
                  <li>
                    <a href="/privacidade" className="group flex items-center justify-between rounded-xl p-3 hover:bg-red-50">
                      Política de Privacidade
                      <Shield size={14} className="opacity-50 group-hover:opacity-100" />
                    </a>
                  </li>
                  <li>
                    <a href="/contato" className="group flex items-center justify-between rounded-xl p-3 hover:bg-red-50">
                      Fale Conosco
                      <MessageCircle size={14} className="opacity-50 group-hover:opacity-100" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Nota LGPD */}
              <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Privacidade e LGPD</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Seus dados são tratados para personalizar sua experiência e melhorar a plataforma.
                  Saiba mais em <a href="/privacidade" className="text-red-600 hover:underline">/privacidade</a>.
                </p>
              </div>
            </div>

            {/* Coluna direita: FAQs */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Perguntas frequentes</h2>

                {filtered.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Nada encontrado para “{query}”. Tente outras palavras ou mude a categoria.
                  </p>
                )}

                <ul className="divide-y divide-gray-100">
                  {filtered.map((item, idx) => (
                    <li key={idx} className="py-3">
                      <details className="group">
                        <summary className="cursor-pointer list-none rounded-xl p-3 transition-colors hover:bg-red-50">
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-medium text-gray-900">{item.q}</span>
                            <span className="text-xs text-gray-500">{item.category}</span>
                          </div>
                        </summary>
                        <div className="px-3 pb-3 pt-1 text-gray-700 text-sm leading-relaxed">
                          {item.a}
                          {item.tags?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA final */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-gray-600">
              Ao utilizar a plataforma, você concorda com nossos{" "}
              <a href="/termos" className="text-red-600 hover:underline">Termos de Uso</a> e{" "}
              <a href="/privacidade" className="text-red-600 hover:underline">Política de Privacidade</a>.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
