import { notFound } from "next/navigation";
import Link from "next/link";
import { TRPCClientError } from "@trpc/client";
import {
  ArrowLeft,
  BookOpenCheck,
  Clock,
  Layers,
  ListChecks,
  NotebookPen,
  Play,
  Sparkles,
} from "lucide-react";

import type { MiniCourseLessonContent, MiniCourseLevel } from "~/lib/mini-course";
import { api } from "~/trpc/server";

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

type PageParams = { slug: string };

type CourseWithContent = Awaited<ReturnType<(typeof api)["miniCurso"]["getBySlug"]>>;

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = params;

  try {
    const course = await api.miniCurso.getBySlug({ slug });
    return {
      title: `${course.title} · Mini-cursos`,
      description: course.subtitle,
    };
  } catch (error) {
    if (error instanceof TRPCClientError && error.shape?.code === "NOT_FOUND") {
      return { title: "Mini-curso não encontrado" };
    }
    throw error;
  }
}

export default async function MiniCursoDetalhePage({ params }: { params: PageParams }) {
  const { slug } = params;

  const course = await api.miniCurso
    .getBySlug({ slug })
    .catch((error: unknown) => {
      if (error instanceof TRPCClientError && error.shape?.code === "NOT_FOUND") {
        notFound();
      }
      throw error;
    });

  const sectionsCount = course.sections.length;
  const lessonsCount = course.sections.reduce((total, section) => total + section.lessons.length, 0);
  const durationLabel = course.estimatedMinutes ? `${course.estimatedMinutes} min` : null;

  return (
    <main className="bg-gradient-to-br from-rose-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ArrowLeft size={16} />
            <Link href="/mini-cursos" className="font-semibold text-red-600 transition hover:text-red-500">
              Voltar para os mini-cursos
            </Link>
          </div>

          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-red-100 to-orange-100 text-4xl">
                {course.emoji}
              </span>
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-4 py-1 text-xs font-semibold ${LEVEL_BADGE[course.level as MiniCourseLevel] ?? "bg-gray-100 text-gray-700"}`}>
                    {LEVEL_LABEL[course.level as MiniCourseLevel] ?? course.level}
                  </span>
                  <span className="rounded-full bg-gray-100 px-4 py-1 text-xs font-semibold text-gray-600">
                    {course.category}
                  </span>
                  {durationLabel && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1 text-xs font-semibold text-gray-600">
                      <Clock size={14} /> {durationLabel}
                    </span>
                  )}
                </div>
                <h1 className="break-words text-4xl font-semibold text-gray-900 sm:text-5xl">{course.title}</h1>
                <p className="max-w-3xl break-words text-lg text-gray-600">{course.subtitle}</p>
                <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                    <Layers size={14} /> {sectionsCount} etapa{sectionsCount === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                    <BookOpenCheck size={14} /> {lessonsCount} atividade{lessonsCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="#conteudo"
                    className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-red-600 hover:to-orange-600"
                  >
                    Ver conteúdo completo
                  </Link>
                  <Link
                    href="/simulados"
                    className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                  >
                    Praticar com simulados
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section id="conteudo" className="space-y-8">
            {course.sections.map((section, index) => (
              <article
                key={section.id}
                className="space-y-6 rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur"
              >
                <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-semibold uppercase text-orange-500">Etapa {index + 1}</p>
                    <h2 className="break-words text-2xl font-semibold text-gray-900">{section.title}</h2>
                    {section.summary && (
                      <p className="max-w-3xl break-words text-sm text-gray-600">{section.summary}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                    <BookOpenCheck size={12} /> {section.lessons.length} conteúdo{section.lessons.length === 1 ? "" : "s"}
                  </span>
                </header>

                <div className="space-y-4">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <LessonBlock key={lesson.id} lesson={lesson} position={lessonIndex + 1} />
                  ))}
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

type LessonBlockProps = {
  lesson: CourseWithContent["sections"][number]["lessons"][number];
  position: number;
};

function LessonBlock({ lesson, position }: LessonBlockProps) {
  const { type } = lesson.content;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <LessonIcon type={type} />
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">Passo {position}</p>
            <h3 className="break-words text-lg font-semibold text-gray-900">{lesson.title}</h3>
          </div>
        </div>
        {lesson.durationMinutes && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            <Clock size={12} /> {lesson.durationMinutes} min
          </span>
        )}
      </div>
      <LessonContent content={lesson.content} />
    </div>
  );
}

type LessonContentProps = {
  content: MiniCourseLessonContent;
};

function LessonContent({ content }: LessonContentProps) {
  switch (content.type) {
    case "text":
      return (
        <div className="space-y-3">
          {content.body.split(/\n+/).map((paragraph, index) => (
            <p key={index} className="break-words text-sm leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
          {content.tips && content.tips.length > 0 && (
            <div className="rounded-2xl bg-orange-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-orange-600">Dicas rápidas</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-orange-700">
                {content.tips.map((tip, index) => (
                  <li key={index} className="break-words">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    case "example":
      return (
        <div className="space-y-4">
          <p className="break-words text-sm leading-relaxed text-gray-700">{content.description}</p>
          <ol className="space-y-3 rounded-2xl bg-sky-50 px-4 py-4 text-sm text-sky-900">
            {content.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full bg-sky-200 text-center text-xs font-semibold leading-6 text-sky-700">
                  {index + 1}
                </span>
                <span className="break-words">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "video":
      return (
        <div className="grid gap-3">
          <div className="aspect-video overflow-hidden rounded-2xl bg-gray-900">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${content.youtubeId}?rel=0`}
              title="Vídeo complementar"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          {content.description && (
            <p className="break-words text-sm text-gray-600">{content.description}</p>
          )}
        </div>
      );
    case "exercise":
      return (
        <div className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <p className="font-semibold">Desafio:</p>
            <p className="mt-1 break-words">{content.prompt}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase text-emerald-600">Solução guiada</p>
            <ol className="mt-2 space-y-2 text-sm text-emerald-800">
              {content.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full bg-emerald-100 text-center text-xs font-semibold leading-6 text-emerald-700">
                    {index + 1}
                  </span>
                  <span className="break-words">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function LessonIcon({ type }: { type: MiniCourseLessonContent["type"] }) {
  switch (type) {
    case "text":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <NotebookPen size={20} />
        </span>
      );
    case "example":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
          <ListChecks size={20} />
        </span>
      );
    case "video":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <Play size={20} />
        </span>
      );
    case "exercise":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Sparkles size={20} />
        </span>
      );
    default:
      return null;
  }
}
