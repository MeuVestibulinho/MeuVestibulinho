"use client"

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Search, Mail, MessageSquare, BookOpen, LifeBuoy, ArrowRight } from "lucide-react";

export default function AjudaPage() {
  const [query, setQuery] = React.useState("");

  const faqs = [
    {
      q: "Como começar a usar a plataforma?",
      a: "Crie sua conta, acesse o guia de estudos e explore simulados e exercícios.",
    },
    {
      q: "O que é o Guia de Estudos?",
      a: "É um caminho sugerido com conteúdos e estratégias para te ajudar a se organizar.",
    },
    {
      q: "Posso usar no celular?",
      a: "Sim, a plataforma é responsiva e funciona bem em dispositivos móveis.",
    },
  ];

  const filteredFaqs = faqs.filter((f) =>
    (f.q + " " + f.a).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-16 -left-10 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
      </div>

      <section className="container mx-auto px-4 pt-16 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-medium">
            <LifeBuoy size={16} /> Central de Ajuda
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Tire suas dúvidas e encontre suporte
          </h1>
          <p className="mt-3 text-gray-600">
            Pesquise respostas rápidas ou fale com a gente. Estamos aqui para ajudar.
          </p>

          <div className="mt-6 max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por assuntos (ex.: simulados, guia, conta)"
                className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-24 relative z-10">
        <div className="mx-auto max-w-4xl">
          {/* Ações rápidas como pills, sem cartões */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              href="/guia"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 text-sm font-medium hover:opacity-95 transition"
            >
              <BookOpen size={16} /> Guia de Estudos
            </Link>
            <Link
              href="mailto:3and3software@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition"
            >
              <MessageSquare size={16} /> Fale Conosco
            </Link>
            <button
              type="button"
              onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur text-gray-800 px-4 py-2 text-sm font-medium border border-gray-200 hover:bg-white transition"
            >
              <Mail size={16} /> Dúvidas Frequentes
            </button>
          </motion.div>

          {/* Divisor suave */}
          <div className="my-10 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Callout em faixa, sem bordas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-50 via-white to-orange-50"
          >
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-red-300/30 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-orange-300/30 blur-3xl rounded-full" />
            <div className="relative p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
                    Precisa de ajuda rápida?
                  </h3>
                  <p className="mt-2 text-gray-600 max-w-xl">
                    Envie um e-mail e retornamos o mais rápido possível. Se preferir, consulte o FAQ abaixo.
                  </p>
                </div>
                <Link
                  href="mailto:3and3software@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-5 py-3 text-sm font-semibold hover:bg-gray-800 transition"
                >
                  Falar com suporte <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Divisor suave */}
          <div className="my-10 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* FAQ fluido, com separadores e sem caixas */}
          <motion.div
            id="faq"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900">Dúvidas Frequentes</h3>
            <p className="text-sm text-gray-600 mt-1">Respostas diretas, sem enrolação.</p>
            <div className="mt-6 divide-y divide-gray-200/80">
              {filteredFaqs.map((item, idx) => (
                <details key={idx} className="group py-4 open:py-4">
                  <summary className="cursor-pointer select-none list-none font-medium text-gray-800 flex items-center justify-between">
                    <span>{item.q}</span>
                    <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600 pr-6">{item.a}</p>
                </details>
              ))}
              {filteredFaqs.length === 0 && (
                <p className="py-4 text-sm text-gray-500">Nada encontrado para sua busca.</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}


