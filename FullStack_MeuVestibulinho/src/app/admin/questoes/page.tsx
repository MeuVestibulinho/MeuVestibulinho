// src/app/admin/questoes/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import NewQuestionForm from "./NewQuestionForm";
import QuestaoList from "./QuestaoList";
import { Alternativa, Disciplina, GrauDificuldade } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminQuestoesPage() {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/admin/questoes");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const disciplinaOptions = Object.values(Disciplina);
  const grauOptions = Object.values(GrauDificuldade);
  const letraOptions = Object.values(Alternativa);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Admin • Gestão de Questões</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          Cadastre novas questões, mantenha o conteúdo atualizado e utilize os filtros para controlar o banco usado nos simulados.
        </p>
      </header>

      <section className="space-y-8">
        <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cadastrar nova questão</h2>
            <p className="text-sm text-gray-600">
              Preencha todas as informações obrigatórias para manter os simulados completos e alinhados às habilidades desejadas.
            </p>
          </div>
          <NewQuestionForm
            disciplinaOptions={disciplinaOptions}
            grauOptions={grauOptions}
            letraOptions={letraOptions}
          />
        </div>

        <QuestaoList
          disciplinaOptions={disciplinaOptions}
          grauOptions={grauOptions}
          letraOptions={letraOptions}
        />
      </section>
    </div>
  );
}
