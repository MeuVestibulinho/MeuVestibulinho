

// Importa o arquivo CSS global para aplicar estilos em toda a aplicação
import "~/styles/globals.css";
// Importa o tipo Metadata do Next.js para definir metadados da aplicação, como título, descrição, ícones, etc.
// Metadata é um objeto que contém informações sobre a página, usadas por motores de busca, redes sociais, etc.
// Exemplo: título da página, descrição, palavras-chave, autor, ícones, etc.
import { type Metadata } from "next";

// Importa a fonte Geist Sans do Google Fonts usando o sistema de fontes do Next.js
import { Geist } from "next/font/google";

// Importa o componente TRPCReactProvider que envolve a aplicação para fornecer o contexto do TRPC
// TRPCReactProvider é um componente que usa o Context API do React para disponibilizar o cliente TRPC em toda a aplicação
// Isso permite que qualquer componente da aplicação faça chamadas às rotas definidas no backend usando o TRPC( Type-safe Remote Procedure Call, é uma biblioteca que facilita a comunicação entre frontend e backend com TypeScript )
import { TRPCReactProvider } from "~/trpc/react";

import { Navbar } from "./_components/Navbar";  


// Define os metadados da aplicação, como título, descrição e ícones
// Esses metadados são usados pelo Next.js para configurar a página HTML gerada
// title é o título da página que aparece na aba do navegador e nos resultados de busca
// description é uma breve descrição da página, usada por motores de busca( Google ) e redes sociais
// icons define os ícones usados pela aplicação, como favicon (ícone que aparece na aba do navegador)
export const metadata: Metadata = {
  title: "MeuVestibulinho",
  description: "Meu Vestibulinho é uma plataforma que prepara alunos do 9º ano para vestibulinhos de ETEC, IF e escolas técnicas. Oferece conteúdos direcionados, simulados e dicas práticas para tornar o estudo acessível, organizado e aumentar as chances de aprovação.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({ // Importa a fonte Geist Sans do Google Fonts
  subsets: ["latin"], // Define os subsets (conjuntos de caracteres) da fonte, aqui usamos apenas o subset latino
  variable: "--font-geist-sans", // Define uma variável CSS para a fonte, que pode ser usada em estilos CSS
});


// Componente raiz que envolve toda a aplicação
// Ele recebe os children (conteúdo filho) como props e os renderiza dentro do layout HTML
// O layout define a estrutura básica da página, incluindo a tag <html> e <body>
// A classe `${geist.variable}` aplica a fonte Geist Sans em toda a aplicação usando a variável CSS definida anteriormente
// O TRPCReactProvider envolve os children para fornecer o contexto do TRPC em toda a aplicação, permitindo chamadas às rotas do backend
export default function RootLayout({
  children, // children é o conteúdo filho que será renderizado dentro do layout
}: Readonly<{ children: React.ReactNode }>) { // Define o tipo das props, onde children é do tipo React.ReactNode (qualquer conteúdo React válido)
  return (

    <> <Navbar />

    <html lang="pt-BR" className={`${geist.variable}`}>{/* Define a tag <html> com o atributo lang para especificar o idioma da página (português do Brasil) e aplica a fonte Geist Sans */}
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider> {/* Envolve os children com o TRPCReactProvider para fornecer o contexto do TRPC */}
      </body>
    </html>
    </>
  );
}
