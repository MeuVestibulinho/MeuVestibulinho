// src/app/admin/questoes/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import NewQuestionForm from "./NewQuestionForm";
import { Disciplina, GrauDificuldade } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminQuestoesPage() {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/admin/questoes");
  }
  // Se já ativou RBAC:
  // if (session.user.role !== "ADMIN") redirect("/");

  const disciplinaOptions = Object.values(Disciplina);
  const grauOptions = Object.values(GrauDificuldade);
  const letraOptions = ["A", "B", "C", "D", "E"];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Admin — Questões</h1>
        <p className="text-sm text-gray-600">Crie e gerencie questões do banco de dados.</p>
      </header>

      <div className="rounded-xl border bg-white/80 p-4 shadow-sm">
        <NewQuestionForm
          disciplinaOptions={disciplinaOptions}
          grauOptions={grauOptions}
          letraOptions={letraOptions}
        />
      </div>
    </div>
  );
}
