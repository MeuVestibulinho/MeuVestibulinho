// CSS global
import "~/styles/globals.css";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";

// Agora usamos o Header que injeta sessão + props corretas no NavbarClient
import Header from "./_components/header/Header";
import { Footer } from "./_components/Footer";

export const metadata: Metadata = {
  title: "MeuVestibulinho",
  description:
    "Plataforma que prepara alunos do 9º ano para vestibulinhos de ETEC, IF e escolas técnicas com simulados, conteúdos e dicas práticas.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <Header /> {/* ✅ usa Header em vez de Navbar direto */}
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Footer />
      </body>
    </html>
  );
}
