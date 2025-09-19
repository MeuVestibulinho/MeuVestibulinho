import Link from "next/link";
import { Sparkles, Layers, BookOpenCheck, Clock } from "lucide-react";

import MiniCourseExplorer from "./MiniCourseExplorer";
import { api } from "~/trpc/server";

export const revalidate = 60;

export default async function MiniCursosPage() {
  const courses = await api.miniCurso.list();
  const categories = Array.from(new Set(courses.map((course) => course.category))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const totalLessons = courses.reduce((sum, course) => sum + course.lessonsCount, 0);
  const estimatedMinutes = courses.reduce((sum, course) => sum + (course.estimatedMinutes ?? 0), 0);

  return (
    <main className="container mx-auto max-w-6xl px-4 pb-16 pt-24">
      <header className="mb-12 space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
            <Sparkles size={16} /> Mini-cursos guiados
          </span>
          <h1 className="text-3xl font-semibold text-gray-900">
            Aprenda no seu ritmo com trilhas curtinhas
          </h1>
          <p className="max-w-3xl text-sm text-gray-600">
            Explicações objetivas, exemplos ilustrados e desafios passo a passo pensados para quem está se preparando para o vestibulinho da ETEC.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
            <Layers size={14} /> {courses.length} mini-curso{courses.length === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
            <BookOpenCheck size={14} /> {totalLessons} atividades guiadas
          </span>
          {estimatedMinutes > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
              <Clock size={14} /> {estimatedMinutes} minutos de conteúdo lúdico
            </span>
          )}
        </div>
      </header>

      <MiniCourseExplorer courses={courses} categories={categories} />

      <section className="mt-16 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 p-8 text-gray-900">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold">Pronto para dar o próximo passo?</h2>
          <p className="text-sm text-gray-600">
            Combine os mini-cursos com nossa trilha de estudos e simulados para fixar os conteúdos e chegar confiante no dia da prova.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/trilha"
              className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Ver trilha de estudos
            </Link>
            <Link
              href="/simulados"
              className="rounded-full border border-red-600 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              Fazer simulado
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}