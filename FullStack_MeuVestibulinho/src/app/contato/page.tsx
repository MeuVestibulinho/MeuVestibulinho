"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, Instagram } from "lucide-react";
import { Button } from "../_components/button";

export default function ContatoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Ajuste se quiser centralizar isso em um config
  const EMAIL = "3and3software@gmail.com";
  const PHONE = "(11) 91023-2912";
  const CITY = "São Paulo, Brasil";
  const INSTAGRAM = "#";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !mensagem) {
      alert("Preencha ao menos Nome, E-mail e Mensagem.");
      return;
    }

    setEnviando(true);
    try {
      // Fallback com mailto enquanto não existe API
      const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(
        assunto || `Contato de ${nome}`
      )}&body=${encodeURIComponent(
        `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`
      )}`;
      window.location.href = mailto;
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <main className="container mx-auto flex-1 px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-5"
        >
          {/* Coluna esquerda: informações */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Fale com a gente
              </h1>
              <p className="text-gray-600">
                Tem dúvidas, sugestões ou encontrou algum problema? Escreva para
                nós — respondemos o quanto antes.
              </p>

              <div className="mt-8 space-y-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Mail size={18} className="text-red-600" />
                  </div>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="hover:text-red-600 transition-colors"
                  >
                    {EMAIL}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Phone size={18} className="text-orange-600" />
                  </div>
                  <a
                    href={`https://wa.me/55${PHONE.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-600 transition-colors"
                  >
                    {PHONE}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <MapPin size={18} className="text-yellow-600" />
                  </div>
                  <span>{CITY}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-100">
                    <Instagram size={18} className="text-pink-600" />
                  </div>
                  <a
                    href={INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-600 transition-colors"
                  >
                    Instagram
                  </a>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-600">
                  Dica: inclua no texto seu{" "}
                  <span className="font-medium text-gray-800">
                    nome completo
                  </span>
                  ,{" "}
                  <span className="font-medium text-gray-800">série/ano</span> e
                  uma breve descrição do problema/sugestão para agilizar o
                  atendimento.
                </p>
              </div>
            </div>

            {/* FAQ enxuta (opcional) */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Dúvidas rápidas
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <details className="group">
                    <summary className="cursor-pointer list-none rounded-xl p-3 transition-colors hover:bg-red-50">
                      Não consigo acessar minha conta
                    </summary>
                    <div className="px-3 pb-3 text-sm text-gray-600">
                      Verifique se o e-mail e a senha estão corretos.
                      Se persistir, nos envie seu e-mail cadastrado.
                    </div>
                  </details>
                </li>
                <li>
                  <details className="group">
                    <summary className="cursor-pointer list-none rounded-xl p-3 transition-colors hover:bg-red-50">
                      Como reportar um erro no simulado?
                    </summary>
                    <div className="px-3 pb-3 text-sm text-gray-600">
                      Copie o link/print da questão e descreva o ocorrido no
                      formulário ao lado. Vamos revisar.
                    </div>
                  </details>
                </li>
              </ul>
            </div>
          </div>

          {/* Coluna direita: formulário */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Envie uma mensagem
              </h2>
              <p className="text-gray-600 mb-6">
                Responderemos no seu e-mail. Campos marcados com * são
                obrigatórios.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none ring-red-200 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@email.com"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none ring-red-200 focus:ring-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    placeholder="Ex.: Dúvida sobre simulados"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none ring-red-200 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mensagem *
                  </label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Conte-nos como podemos ajudar"
                    required
                    rows={6}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none ring-red-200 focus:ring-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Ao enviar, você concorda com nossa{" "}
                    <a
                      href="/privacidade"
                      className="text-red-600 hover:underline"
                    >
                      Política de Privacidade
                    </a>
                    .
                  </span>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={enviando}
                    className="min-w-40"
                  >
                    {enviando ? "Enviando..." : "Enviar"}
                    <Send size={18} />
                  </Button>
                </div>
              </form>
            </div>

            {/* Aviso de LGPD / Privacidade */}
            <p className="mt-4 text-xs text-gray-500">
              Tratamos seus dados pessoais conforme a LGPD para responder ao
              seu contato e melhorar nossos serviços. Saiba mais em{" "}
              <a href="/privacidade" className="text-red-600 hover:underline">
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
