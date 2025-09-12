"use client";

import React from "react";
import { motion } from "motion/react";


export default function TermosPage() {
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
            Termos de Uso
          </h1>

          <p className="text-gray-600 leading-relaxed mb-6">
            Bem-vindo(a) à plataforma <strong>Meu Vestibulinho</strong>. 
            Ao acessar e utilizar nossos serviços, você concorda integralmente com os presentes Termos de Uso. 
            Este documento estabelece as condições para utilização da plataforma e seus recursos, visando transparência e segurança para todos os usuários.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">1. Aceitação</h2>
          <p className="text-gray-600 leading-relaxed">
            O uso da plataforma implica a aceitação integral destes Termos. 
            Caso não concorde com qualquer cláusula, pedimos que interrompa o uso imediatamente.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">2. Cadastro e Conta</h2>
          <p className="text-gray-600 leading-relaxed">
            Para acessar determinados recursos, poderá ser necessário criar uma conta. 
            Você se compromete a fornecer informações verdadeiras, atualizadas e completas, sendo responsável por manter a confidencialidade de seus dados de acesso.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">3. Uso da Plataforma</h2>
          <p className="text-gray-600 leading-relaxed">
            A plataforma é destinada exclusivamente para fins educacionais. 
            É proibido utilizá-la para atividades ilícitas, comerciais não autorizadas ou que violem direitos de terceiros.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">4. Coleta e Uso de Dados</h2>
          <p className="text-gray-600 leading-relaxed">
            Durante o uso da plataforma, podemos coletar informações pessoais e de navegação. 
            Esses dados são utilizados para:
          </p>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed mt-2">
            <li>Personalizar sua experiência de aprendizado;</li>
            <li>Melhorar continuamente nossos serviços e funcionalidades;</li>
            <li>Garantir a segurança da plataforma e dos usuários;</li>
            <li>Enviar comunicações importantes sobre atualizações e novidades.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-2">
            O uso dos dados respeitará nossa <a href="/privacidade" className="text-red-600 hover:underline">Política de Privacidade</a>.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">5. Propriedade Intelectual</h2>
          <p className="text-gray-600 leading-relaxed">
            Todo o conteúdo da plataforma, incluindo textos, gráficos, logotipos, ícones, imagens e software, é protegido por direitos autorais e outras leis de propriedade intelectual. 
            O uso indevido é expressamente proibido.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">6. Limitação de Responsabilidade</h2>
          <p className="text-gray-600 leading-relaxed">
            A equipe do Meu Vestibulinho não se responsabiliza por danos decorrentes de:
          </p>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed mt-2">
            <li>Mau uso da plataforma;</li>
            <li>Indisponibilidades temporárias do sistema;</li>
            <li>Conteúdos de terceiros acessados por meio da plataforma.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">7. Alterações nos Termos</h2>
          <p className="text-gray-600 leading-relaxed">
            Reservamo-nos o direito de alterar estes Termos a qualquer momento. 
            Alterações relevantes serão comunicadas com antecedência razoável. 
            A continuidade no uso da plataforma após as alterações representa aceitação das novas condições.
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">8. Direitos do Usuário</h2>
          <p className="text-gray-600 leading-relaxed">
            O usuário tem direito a acessar, corrigir e solicitar a exclusão de seus dados pessoais, em conformidade com a legislação aplicável, incluindo a LGPD (Lei Geral de Proteção de Dados).
          </p>

          <h2 className="text-2xl font-semibold text-red-600 mt-8 mb-3">9. Contato</h2>
          <p className="text-gray-600 leading-relaxed">
            Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail:{" "}
            <a href="mailto:3and3software@gmail.com" className="text-red-600 hover:underline">
              3and3software@gmail.com
            </a>.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
