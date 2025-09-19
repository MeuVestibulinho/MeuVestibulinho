"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  Clock,
  Layers,
  Search,
  Sparkles,
} from "lucide-react";

import type { MiniCourseLevel } from "~/lib/mini-course";
import type { RouterOutputs } from "~/trpc/react";

type MiniCourseListItem = RouterOutputs["miniCurso"]["list"][number];

type Props = {
  courses: MiniCourseListItem[];
  categories: string[];
};

type FilterLevel = MiniCourseLevel | "todos";

const LEVEL_LABEL: Record<MiniCourseLevel, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const LEVEL_BADGE: Record<MiniCourseLevel, string> = {
  iniciante: "bg-emerald-100 text-emerald-700",
  intermediario: "bg-sky-100 text-sky-700",
  avancado: "bg-purple-100 text-purple-700",
};

export default function MiniCourseExplorer({ courses, categories }: Props) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("Todos");
  const [level, setLevel] = React.useState<FilterLevel>("todos");

  const filteredCourses = React.useMemo(() => {
    const needle = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !needle ||
        course.title.toLowerCase().includes(needle) ||
        course.subtitle.toLowerCase().includes(needle) ||
        course.category.toLowerCase().includes(needle);

      const matchesCategory =
        category === "Todos" || course.category.toLowerCase() === category.toLowerCase();

      const matchesLevel = level === "todos" || course.level === level;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [category, courses, level, search]);

  const uniqueLevels = React.useMemo(() => {
    const set = new Set<MiniCourseLevel>();
    courses.forEach((course) => set.add(course.level as MiniCourseLevel));
    return Array.from(set);
  }, [courses]);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="flex flex-1 flex-col gap-2 text-sm font-medium text-gray-700">
            Buscar mini-cursos
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Digite um tema, matéria ou palavra-chave"
                className="w-full rounded-2xl border border-gray-200 bg-white px-11 py-3 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                type="search"
              />
            </div>
          </label>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Categoria
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="Todos">Todas as categorias</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Nível
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as FilterLevel)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="todos">Todos os níveis</option>
                {uniqueLevels.map((item) => (
                  <option key={item} value={item}>
                    {LEVEL_LABEL[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-12 text-center">
            <div className="text-5xl">🔍</div>
            <p className="mt-4 text-lg font-semibold text-gray-800">
              Não encontramos nenhum mini-curso com esses filtros.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Ajuste a busca ou explore outras categorias para descobrir conteúdos novos.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("Todos");
                setLevel("todos");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const durationLabel = course.estimatedMinutes
              ? `${course.estimatedMinutes} min`
              : "Duração livre";

            return (
              <Link
                key={course.id}
                href={`/mini-cursos/${course.slug}`}
                className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                style={{
                  borderColor: course.themeColor,
                  boxShadow: `0 16px 40px -28px ${course.themeColor}66`,
                }}
              >
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white via-white/70 to-transparent" />
                <div className="relative flex flex-1 flex-col gap-5 p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 text-3xl">
                      {course.emoji}
                    </span>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_BADGE[course.level as MiniCourseLevel] ?? "bg-gray-100 text-gray-700"}`}>
                          {LEVEL_LABEL[course.level as MiniCourseLevel] ?? course.level}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600">
                        {course.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-gray-600">{course.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} /> {durationLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers size={14} /> {course.sectionsCount} etapa{course.sectionsCount === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpenCheck size={14} /> {course.lessonsCount} atividade{course.lessonsCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 rounded-2xl bg-orange-50/60 px-4 py-3 text-sm text-orange-700">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} />
                      <span>Toque para abrir o passo a passo</span>
                    </div>
                    <span className="text-xs font-semibold text-orange-600">Ver mais</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
