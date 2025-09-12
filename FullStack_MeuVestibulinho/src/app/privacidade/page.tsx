"use client";

import React from "react";
import { motion } from "motion/react";


export default function PrivacidadePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <main className="flex-1 container mx-auto px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Política de Privacidade
          </h1>

          <p className="text-gray-600 leading-relaxed mb-6">
            A <strong>Meu Vestibulinho</strong> valoriza a sua privacidade. 
            Este documento descreve como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais, em conformidade com a LGPD (Lei Geral de Proteção de Dados).
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">1. Informações Coletadas</h2>
          <p className="text-gray-600 leading-relaxed">
            Durante o uso da plataforma, podemos coletar:
          </p>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed mt-2">
            <li>Dados de cadastro (nome, e-mail, senha e demais informações fornecidas);</li>
            <li>Dados de navegação (endereço IP, tipo de dispositivo, navegador e páginas acessadas);</li>
            <li>Informações sobre desempenho e uso dos recursos (ex.: simulados e trilha de estudos).</li>
          </ul>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">2. Finalidade do Uso dos Dados</h2>
          <p className="text-gray-600 leading-relaxed">
            Os dados coletados são utilizados para:
          </p>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed mt-2">
            <li>Personalizar sua experiência na plataforma;</li>
            <li>Melhorar nossos serviços e desenvolver novas funcionalidades;</li>
            <li>Garantir a segurança da aplicação e prevenir fraudes;</li>
            <li>Enviar notificações e comunicações relevantes (quando autorizado).</li>
          </ul>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">3. Compartilhamento de Informações</h2>
          <p className="text-gray-600 leading-relaxed">
            Não compartilhamos seus dados pessoais com terceiros, exceto:
          </p>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed mt-2">
            <li>Quando houver obrigação legal ou regulatória;</li>
            <li>Para proteger direitos, propriedade ou segurança da plataforma e dos usuários;</li>
            <li>Com parceiros de confiança, apenas quando necessário para prestação do serviço.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">4. Armazenamento e Segurança</h2>
          <p className="text-gray-600 leading-relaxed">
            Utilizamos medidas técnicas e administrativas adequadas para proteger seus dados contra acesso não autorizado, perda, alteração ou divulgação indevida.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">5. Cookies e Tecnologias Similares</h2>
          <p className="text-gray-600 leading-relaxed">
            Podemos utilizar cookies e tecnologias semelhantes para melhorar sua experiência de navegação, analisar o uso da plataforma e oferecer conteúdos personalizados. 
            O usuário pode gerenciar ou desativar cookies diretamente nas configurações do navegador.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">6. Direitos do Usuário</h2>
          <p className="text-gray-600 leading-relaxed">
            Conforme a LGPD, você tem direito a:
          </p>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed mt-2">
            <li>Acessar, corrigir ou excluir seus dados pessoais;</li>
            <li>Solicitar a portabilidade dos dados;</li>
            <li>Revogar consentimentos previamente fornecidos;</li>
            <li>Obter informações sobre o tratamento de seus dados.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">7. Alterações nesta Política</h2>
          <p className="text-gray-600 leading-relaxed">
            Esta Política de Privacidade pode ser atualizada periodicamente. 
            Alterações relevantes serão comunicadas de forma clara e destacada. 
            A versão mais recente estará sempre disponível nesta página.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">8. Contato</h2>
          <p className="text-gray-600 leading-relaxed">
            Caso tenha dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais, entre em contato pelo e-mail:{" "}
            <a href="mailto:3and3software@gmail.com" className="text-red-600 hover:underline">
              3and3software@gmail.com
            </a>.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
