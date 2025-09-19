"use client";

import * as React from "react";
import {
  BookOpenCheck,
  Clock,
  Layers,
  ListChecks,
  Loader2,
  NotebookPen,
  Play,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  miniCourseDetailsSchema,
  miniCourseSectionDetailsSchema,
  type MiniCourseLevel,
} from "~/lib/mini-course";
import { api, type RouterOutputs } from "~/trpc/react";

type AdminCourse = RouterOutputs["miniCurso"]["adminList"][number];
type AdminSection = AdminCourse["sections"][number];
type AdminLesson = AdminSection["lessons"][number];
type LessonType = AdminLesson["content"]["type"];

const LEVEL_OPTIONS: MiniCourseLevel[] = [
  "iniciante",
  "intermediario",
  "avancado",
];

const LEVEL_LABEL: Record<MiniCourseLevel, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const LESSON_ICONS: Record<LessonType, React.ElementType> = {
  text: NotebookPen,
  example: ListChecks,
  video: Play,
  exercise: Sparkles,
};

const LESSON_LABEL: Record<LessonType, string> = {
  text: "Explicação",
  example: "Exemplo guiado",
  video: "Vídeo",
  exercise: "Prática",
};

const FORM_DEFAULT_ERROR =
  "Revise os campos obrigatórios e tente novamente.";

function getFirstIssueMessage(issues: Array<{ message: string }>) {
  return issues[0]?.message ?? FORM_DEFAULT_ERROR;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

type LessonFormValues = {
  title: string;
  durationMinutes: number | null;
  content: AdminLesson["content"];
};

function parseLines(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}min`;
}

function typeDescription(type: LessonType) {
  switch (type) {
    case "text":
      return "Resumo curto e amigável sobre o tema.";
    case "example":
      return "Exemplo resolvido com passos numerados.";
    case "video":
      return "Vídeo do YouTube exibido dentro da plataforma.";
    case "exercise":
      return "Atividade guiada com resolução passo a passo.";
    default:
      return "";
  }
}

function LessonBadge({ type }: { type: LessonType }) {
  const Icon = LESSON_ICONS[type];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-orange-700">
      <Icon size={12} />
      {LESSON_LABEL[type]}
    </span>
  );
}

type LessonFormProps = {
  mode: "create" | "update";
  defaultValues?: LessonFormValues;
  onSubmit: (values: LessonFormValues) => Promise<void> | void;
  onCancel?: () => void;
  disabled?: boolean;
};

function LessonForm({ mode, defaultValues, onSubmit, onCancel, disabled }: LessonFormProps) {
  const [type, setType] = React.useState<LessonType>(defaultValues?.content.type ?? "text");
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (defaultValues) {
      setType(defaultValues.content.type);
    }
  }, [defaultValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      setFormError("Informe um título para o conteúdo.");
      return;
    }

    const durationValue = String(formData.get("durationMinutes") ?? "").trim();
    const durationMinutes = durationValue ? Number(durationValue) : null;
    if (durationMinutes !== null && (Number.isNaN(durationMinutes) || durationMinutes < 1)) {
      setFormError("Defina uma duração válida em minutos.");
      return;
    }

    try {
      let content: LessonFormValues["content"];
      if (type === "text") {
        const body = String(formData.get("body") ?? "").trim();
        if (!body) {
          setFormError("Descreva a explicação do conteúdo.");
          return;
        }
        const tips = parseLines(formData.get("tips"));
        content = {
          type: "text",
          body,
          ...(tips.length > 0 ? { tips } : {}),
        };
      } else if (type === "example") {
        const description = String(formData.get("description") ?? "").trim();
        const steps = parseLines(formData.get("steps"));
        if (!description) {
          setFormError("Explique rapidamente o contexto do exemplo.");
          return;
        }
        if (steps.length === 0) {
          setFormError("Liste ao menos um passo do exemplo.");
          return;
        }
        content = {
          type: "example",
          description,
          steps,
        };
      } else if (type === "video") {
        const youtubeId = String(formData.get("youtubeId") ?? "").trim();
        if (!youtubeId) {
          setFormError("Informe um link ou ID do vídeo.");
          return;
        }
        const description = String(formData.get("videoDescription") ?? "").trim();
        content = {
          type: "video",
          youtubeId,
          ...(description ? { description } : {}),
        };
      } else {
        const prompt = String(formData.get("prompt") ?? "").trim();
        const steps = parseLines(formData.get("exerciseSteps"));
        if (!prompt) {
          setFormError("Descreva o desafio proposto ao aluno.");
          return;
        }
        if (steps.length === 0) {
          setFormError("Inclua ao menos um passo da resolução.");
          return;
        }
        content = {
          type: "exercise",
          prompt,
          steps,
        };
      }

      await onSubmit({ title, durationMinutes, content });
      setFormError(null);
      if (mode === "create") {
        form.reset();
        setType("text");
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o conteúdo agora.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Título
          <input
            name="title"
            defaultValue={defaultValues?.title ?? ""}
            placeholder="Nome amigável para os alunos"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            disabled={disabled}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Duração (min)
          <input
            type="number"
            name="durationMinutes"
            min={1}
            max={180}
            defaultValue={defaultValues?.durationMinutes ?? ""}
            placeholder="Opcional"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            disabled={disabled}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Formato
          <select
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value as LessonType)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            disabled={disabled}
          >
            <option value="text">Explicação curta</option>
            <option value="example">Exemplo guiado</option>
            <option value="video">Vídeo do YouTube</option>
            <option value="exercise">Prática guiada</option>
          </select>
        </label>
        <p className="break-words rounded-xl border border-dashed border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
          {typeDescription(type)}
        </p>
      </div>

      {type === "text" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 sm:col-span-2">
            Explicação
            <textarea
              name="body"
              defaultValue={
                defaultValues?.content.type === "text"
                  ? defaultValues.content.body
                  : ""
              }
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Explique em linguagem simples e direta."
              disabled={disabled}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 sm:col-span-2">
            Dicas em tópicos (opcional)
            <textarea
              name="tips"
              defaultValue={
                defaultValues?.content.type === "text"
                  ? (defaultValues.content.tips ?? []).join("\n")
                  : ""
              }
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Uma dica por linha para reforçar o aprendizado."
              disabled={disabled}
            />
          </label>
        </div>
      )}

      {type === "example" && (
        <div className="grid gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Contexto do exemplo
            <textarea
              name="description"
              rows={3}
              defaultValue={
                defaultValues?.content.type === "example"
                  ? defaultValues.content.description
                  : ""
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Explique rapidamente o que será resolvido."
              disabled={disabled}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Passos do exemplo
            <textarea
              name="steps"
              rows={4}
              defaultValue={
                defaultValues?.content.type === "example"
                  ? defaultValues.content.steps.join("\n")
                  : ""
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Escreva um passo por linha."
              disabled={disabled}
            />
          </label>
        </div>
      )}

      {type === "video" && (
        <div className="grid gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Link ou ID do YouTube
            <input
              name="youtubeId"
              defaultValue={
                defaultValues?.content.type === "video"
                  ? defaultValues.content.youtubeId
                  : ""
              }
              placeholder="https://youtu.be/..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              disabled={disabled}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Resumo do vídeo (opcional)
            <textarea
              name="videoDescription"
              rows={3}
              defaultValue={
                defaultValues?.content.type === "video"
                  ? defaultValues.content.description ?? ""
                  : ""
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Conte por que o vídeo é importante."
              disabled={disabled}
            />
          </label>
        </div>
      )}

      {type === "exercise" && (
        <div className="grid gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Proposta da atividade
            <textarea
              name="prompt"
              rows={3}
              defaultValue={
                defaultValues?.content.type === "exercise"
                  ? defaultValues.content.prompt
                  : ""
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Descreva o exercício de maneira motivadora."
              disabled={disabled}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Passos da resolução
            <textarea
              name="exerciseSteps"
              rows={4}
              defaultValue={
                defaultValues?.content.type === "exercise"
                  ? defaultValues.content.steps.join("\n")
                  : ""
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Explique a resolução, um passo por linha."
              disabled={disabled}
            />
          </label>
        </div>
      )}

      {formError && (
        <p className="break-words text-sm text-red-600" role="alert">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-red-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {disabled && <Loader2 size={16} className="animate-spin" />}
          {mode === "create" ? "Adicionar conteúdo" : "Salvar alterações"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
export default function MiniCourseManager() {
  const utils = api.useUtils();
  const coursesQuery = api.miniCurso.adminList.useQuery(undefined, {
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error?.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 3;
    },
  });
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);
  const [editingLessonId, setEditingLessonId] = React.useState<string | null>(null);
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const isUnauthorized = coursesQuery.error?.data?.code === "UNAUTHORIZED";
  if (isUnauthorized) {
    const signInUrl = `/api/auth/signin?callbackUrl=${encodeURIComponent(
      "/admin?view=mini-cursos",
    )}`;

    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
        <span aria-hidden className="text-3xl">
          🔒
        </span>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Acesso administrativo necessário
        </h2>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Sua sessão expirou ou você não tem permissão para gerenciar mini-cursos.
          Faça login novamente com uma conta de administrador para continuar.
        </p>
        <a
          href={signInUrl}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-red-600 hover:to-orange-600"
        >
          Ir para a tela de login
        </a>
      </div>
    );
  }

  const sortCourses = React.useCallback((items: AdminCourse[]) => {
    return [...items].sort(
      (a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)),
    );
  }, []);

  const updateCourseCache = React.useCallback(
    (course: AdminCourse) => {
      utils.miniCurso.adminList.setData(undefined, (current) => {
        const base = current ?? [];
        const filtered = base.filter((item) => item.id !== course.id);
        return sortCourses([course, ...filtered]);
      });
    },
    [sortCourses, utils.miniCurso.adminList],
  );

  const removeCourseCache = React.useCallback(
    (courseId: string) => {
      utils.miniCurso.adminList.setData(undefined, (current) =>
        current?.filter((course) => course.id !== courseId),
      );
    },
    [utils.miniCurso.adminList],
  );

  const createCourseMutation = api.miniCurso.createCourse.useMutation({
    onSuccess: (course) => {
      updateCourseCache(course);
      setSelectedCourseId(course.id);
      setFeedback({ type: "success", message: "Mini-curso criado com sucesso!" });
      void utils.miniCurso.list.invalidate();
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível criar o mini-curso.",
      });
    },
  });

  const updateCourseMutation = api.miniCurso.updateCourse.useMutation({
    onSuccess: (course) => {
      updateCourseCache(course);
      setFeedback({ type: "success", message: "Mini-curso atualizado." });
      void utils.miniCurso.list.invalidate();
      void utils.miniCurso.getBySlug.invalidate({ slug: course.slug });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível atualizar o mini-curso.",
      });
    },
  });

  const deleteCourseMutation = api.miniCurso.deleteCourse.useMutation({
    onSuccess: (_, variables) => {
      removeCourseCache(variables.courseId);
      const next = utils.miniCurso.adminList.getData(undefined) ?? [];
      setSelectedCourseId(next[0]?.id ?? null);
      setFeedback({ type: "success", message: "Mini-curso removido." });
      setEditingLessonId(null);
      setExpandedSection(null);
      void utils.miniCurso.list.invalidate();
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível remover o mini-curso.",
      });
    },
  });

  const createSectionMutation = api.miniCurso.createSection.useMutation({
    onSuccess: (course) => {
      updateCourseCache(course);
      setFeedback({ type: "success", message: "Seção adicionada." });
      setExpandedSection(course.sections.at(-1)?.id ?? null);
      void utils.miniCurso.list.invalidate();
      void utils.miniCurso.getBySlug.invalidate({ slug: course.slug });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível criar a seção.",
      });
    },
  });

  const updateSectionMutation = api.miniCurso.updateSection.useMutation({
    onSuccess: (course) => {
      updateCourseCache(course);
      setFeedback({ type: "success", message: "Seção atualizada." });
      void utils.miniCurso.list.invalidate();
      void utils.miniCurso.getBySlug.invalidate({ slug: course.slug });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível atualizar a seção.",
      });
    },
  });

  const deleteSectionMutation = api.miniCurso.deleteSection.useMutation({
    onSuccess: (course) => {
      updateCourseCache(course);
      setFeedback({ type: "success", message: "Seção removida." });
      setEditingLessonId(null);
      setExpandedSection(null);
      void utils.miniCurso.list.invalidate();
      void utils.miniCurso.getBySlug.invalidate({ slug: course.slug });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível excluir a seção.",
      });
    },
  });

  const createLessonMutation = api.miniCurso.createLesson.useMutation({
    onSuccess: (course) => {
      updateCourseCache(course);
      setFeedback({ type: "success", message: "Conteúdo adicionado." });
      setEditingLessonId(null);
      void utils.miniCurso.list.invalidate();
      void utils.miniCurso.getBySlug.invalidate({ slug: course.slug });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível adicionar o conteúdo.",
      });
    },
  });

  const updateLessonMutation = api.miniCurso.updateLesson.useMutation({
    onSuccess: (course) => {
      updateCourseCache(course);
      setFeedback({ type: "success", message: "Conteúdo atualizado." });
      setEditingLessonId(null);
      void utils.miniCurso.list.invalidate();
      void utils.miniCurso.getBySlug.invalidate({ slug: course.slug });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível salvar as alterações.",
      });
    },
  });

  const deleteLessonMutation = api.miniCurso.deleteLesson.useMutation({
    onSuccess: (course) => {
      updateCourseCache(course);
      setFeedback({ type: "success", message: "Conteúdo removido." });
      setEditingLessonId(null);
      void utils.miniCurso.list.invalidate();
      void utils.miniCurso.getBySlug.invalidate({ slug: course.slug });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível remover o conteúdo.",
      });
    },
  });

  const courses = coursesQuery.data ?? [];

  React.useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  React.useEffect(() => {
    setExpandedSection(null);
    setEditingLessonId(null);
  }, [selectedCourseId]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;
  const handleCreateCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createCourseMutation.isPending) {
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);

    const title = String(data.get("title") ?? "").trim();
    const subtitle = String(data.get("subtitle") ?? "").trim();
    const category = String(data.get("category") ?? "").trim();
    const level = (data.get("level") ?? "iniciante") as MiniCourseLevel;
    const emoji = String(data.get("emoji") ?? "📘").trim() || "📘";
    const themeColor = String(data.get("themeColor") ?? "#f97316").trim();
    const estimatedInput = String(data.get("estimatedMinutes") ?? "").trim();

    const estimatedMinutesValue =
      estimatedInput === "" ? 45 : Number(estimatedInput);

    if (!Number.isFinite(estimatedMinutesValue)) {
      setFeedback({
        type: "error",
        message: "Informe uma duração válida em minutos.",
      });
      return;
    }

    const parsed = miniCourseDetailsSchema.safeParse({
      title,
      subtitle,
      category,
      level,
      emoji,
      themeColor,
      estimatedMinutes: estimatedMinutesValue,
    });

    if (!parsed.success) {
      setFeedback({
        type: "error",
        message: getFirstIssueMessage(parsed.error.issues),
      });
      return;
    }

    createCourseMutation.mutate(parsed.data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const handleUpdateCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCourse) return;
    if (updateCourseMutation.isPending) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const subtitle = String(data.get("subtitle") ?? "").trim();
    const category = String(data.get("category") ?? "").trim();
    const level = (data.get("level") ?? selectedCourse.level) as MiniCourseLevel;
    const emoji = String(data.get("emoji") ?? selectedCourse.emoji).trim() || selectedCourse.emoji;
    const themeColor = String(data.get("themeColor") ?? selectedCourse.themeColor).trim();
    const estimatedInput = String(data.get("estimatedMinutes") ?? "").trim();

    const estimatedMinutesValue =
      estimatedInput === ""
        ? selectedCourse.estimatedMinutes
        : Number(estimatedInput);

    if (!Number.isFinite(estimatedMinutesValue)) {
      setFeedback({
        type: "error",
        message: "Informe uma duração válida em minutos.",
      });
      return;
    }

    const parsed = miniCourseDetailsSchema.safeParse({
      title,
      subtitle,
      category,
      level,
      emoji,
      themeColor,
      estimatedMinutes: estimatedMinutesValue,
    });

    if (!parsed.success) {
      setFeedback({
        type: "error",
        message: getFirstIssueMessage(parsed.error.issues),
      });
      return;
    }

    updateCourseMutation.mutate({
      courseId: selectedCourse.id,
      ...parsed.data,
    });
  };

  const handleDeleteCourse = (course: AdminCourse) => {
    const confirmed = window.confirm(
      `Deseja excluir o mini-curso "${course.title}"? Todo o conteúdo será removido.`,
    );
    if (!confirmed) {
      return;
    }

    deleteCourseMutation.mutate({ courseId: course.id });
  };

  const handleCreateSection = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCourse) return;
    if (createSectionMutation.isPending) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    const title = String(data.get("title") ?? "").trim();
    const summaryValue = String(data.get("summary") ?? "").trim();

    const parsed = miniCourseSectionDetailsSchema.safeParse({
      title,
      summary: summaryValue === "" ? undefined : summaryValue,
    });

    if (!parsed.success) {
      setFeedback({
        type: "error",
        message: getFirstIssueMessage(parsed.error.issues),
      });
      return;
    }

    createSectionMutation.mutate(
      {
        courseId: selectedCourse.id,
        ...parsed.data,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      },
    );
  };

  const totalLessons = (course: AdminCourse) =>
    course.sections.reduce((total, section) => total + section.lessons.length, 0);

  const renderCourseList = () => (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <header className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">Criar novo mini-curso</h2>
          <p className="text-sm text-gray-600">
            Títulos curtos, linguagem acolhedora e duração estimada ajudam os alunos a escolher o melhor caminho.
          </p>
        </header>
        <form onSubmit={handleCreateCourse} className="space-y-4" noValidate>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Título
            <input
              name="title"
              required
              placeholder="Ex.: Frações na cozinha"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              disabled={createCourseMutation.isPending}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Descrição curta
            <textarea
              name="subtitle"
              required
              rows={3}
              placeholder="Explique em poucas linhas o que o aluno aprenderá."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              disabled={createCourseMutation.isPending}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Categoria
              <input
                name="category"
                required
                placeholder="Matemática, Português, Ciências..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={createCourseMutation.isPending}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Emoji
              <input
                name="emoji"
                defaultValue="📘"
                maxLength={4}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={createCourseMutation.isPending}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Cor temática
              <input
                type="color"
                name="themeColor"
                defaultValue="#f97316"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white p-1"
                disabled={createCourseMutation.isPending}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Duração estimada (min)
              <input
                type="number"
                name="estimatedMinutes"
                min={10}
                max={600}
                defaultValue={45}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={createCourseMutation.isPending}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Nível
            <select
              name="level"
              defaultValue="iniciante"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              disabled={createCourseMutation.isPending}
            >
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {LEVEL_LABEL[level]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-red-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={createCourseMutation.isPending}
          >
            {createCourseMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Criar mini-curso
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Mini-cursos cadastrados</h3>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {courses.length} ativo{courses.length === 1 ? "" : "s"}
          </span>
        </header>
        <ul className="space-y-2">
          {courses.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
              Nenhum mini-curso cadastrado ainda. Crie o primeiro acima!
            </li>
          ) : (
            courses.map((course) => {
              const isActive = course.id === selectedCourseId;
              const sectionsCount = course.sections.length;
              const lessonsCount = totalLessons(course);
              const durationLabel = formatDuration(course.estimatedMinutes);

              return (
                <li key={course.id} className="min-w-0">
                  <div className="flex items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
                        isActive
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white hover:border-red-200 hover:bg-red-50/40"
                      }`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 text-xl">
                          {course.emoji}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="line-clamp-2 break-words text-sm font-semibold text-gray-900">
                            {course.title}
                          </p>
                          <p className="line-clamp-2 break-words text-xs text-gray-500">
                            {course.subtitle}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Layers size={12} /> {sectionsCount} seção{sectionsCount === 1 ? "" : "es"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <BookOpenCheck size={12} /> {lessonsCount} passo{lessonsCount === 1 ? "" : "s"}
                            </span>
                            {durationLabel && (
                              <span className="inline-flex items-center gap-1">
                                <Clock size={12} /> {durationLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course)}
                      className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
                      aria-label={`Excluir ${course.title}`}
                      disabled={deleteCourseMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
  const handleUpdateSection = (section: AdminSection) =>
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (updateSectionMutation.isPending) {
        return;
      }
      const data = new FormData(event.currentTarget);
      const title = String(data.get("title") ?? "").trim();
      const summaryValue = String(data.get("summary") ?? "").trim();

      const parsed = miniCourseSectionDetailsSchema.safeParse({
        title,
        summary: summaryValue === "" ? undefined : summaryValue,
      });

      if (!parsed.success) {
        setFeedback({
          type: "error",
          message: getFirstIssueMessage(parsed.error.issues),
        });
        return;
      }

      updateSectionMutation.mutate({
        sectionId: section.id,
        ...parsed.data,
      });
    };

  const handleDeleteSection = (section: AdminSection) => {
    const confirmed = window.confirm(
      `Remover a seção "${section.title}" e todos os seus conteúdos?`,
    );
    if (!confirmed) return;
    deleteSectionMutation.mutate({ sectionId: section.id });
  };

  const handleCreateLesson = (sectionId: string) => async (values: LessonFormValues) => {
    await createLessonMutation.mutateAsync({
      sectionId,
      title: values.title,
      durationMinutes: values.durationMinutes ?? undefined,
      content: values.content,
    });
  };

  const handleUpdateLesson = (lesson: AdminLesson) =>
    async (values: LessonFormValues) => {
      await updateLessonMutation.mutateAsync({
        lessonId: lesson.id,
        title: values.title,
        durationMinutes: values.durationMinutes ?? undefined,
        content: values.content,
      });
    };

  const handleDeleteLesson = (lesson: AdminLesson) => {
    const confirmed = window.confirm(
      `Excluir o conteúdo "${lesson.title}" desta seção?`,
    );
    if (!confirmed) return;
    deleteLessonMutation.mutate({ lessonId: lesson.id });
  };
  const lessonPreview = (lesson: AdminLesson) => {
    switch (lesson.content.type) {
      case "text":
        return lesson.content.body;
      case "example":
        return lesson.content.description;
      case "video":
        return lesson.content.description ?? "Vídeo complementar";
      case "exercise":
        return lesson.content.prompt;
      default:
        return "";
    }
  };
  const renderCourseDetails = () => {
    if (!selectedCourse) {
      return (
        <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <div className="text-4xl">🧩</div>
          <p className="mt-4 text-base font-semibold text-gray-800">
            Selecione um mini-curso
          </p>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            Use a coluna ao lado para escolher um conteúdo ou crie um novo mini-curso para começar a organizar as aulas.
          </p>
        </div>
      );
    }

    const sectionsCount = selectedCourse.sections.length;
    const lessonsCount = totalLessons(selectedCourse);
    const durationLabel = formatDuration(selectedCourse.estimatedMinutes);

    return (
      <div className="space-y-6">
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <header className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
              {selectedCourse.category}
            </span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
              {LEVEL_LABEL[selectedCourse.level as MiniCourseLevel] ?? selectedCourse.level}
            </span>
            {durationLabel && (
              <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-gray-500">
                <Clock size={14} /> {durationLabel}
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDeleteCourse(selectedCourse)}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
              disabled={deleteCourseMutation.isPending}
            >
              <Trash2 size={14} /> Excluir mini-curso
            </button>
          </header>

          <p className="mt-4 break-words text-sm text-gray-600">
            {selectedCourse.subtitle}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
              <Layers size={12} /> {sectionsCount} seção{sectionsCount === 1 ? "" : "es"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
              <BookOpenCheck size={12} /> {lessonsCount} conteúdo{lessonsCount === 1 ? "" : "s"}
            </span>
          </div>

          <form onSubmit={handleUpdateCourse} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Título
              <input
                name="title"
                defaultValue={selectedCourse.title}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={updateCourseMutation.isPending}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Categoria
              <input
                name="category"
                defaultValue={selectedCourse.category}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={updateCourseMutation.isPending}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Emoji
              <input
                name="emoji"
                defaultValue={selectedCourse.emoji}
                maxLength={4}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={updateCourseMutation.isPending}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Nível
              <select
                name="level"
                defaultValue={selectedCourse.level}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={updateCourseMutation.isPending}
              >
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {LEVEL_LABEL[level]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 sm:col-span-2">
              Descrição
              <textarea
                name="subtitle"
                rows={3}
                defaultValue={selectedCourse.subtitle}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={updateCourseMutation.isPending}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2 sm:col-span-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Duração estimada (min)
                <input
                  type="number"
                  name="estimatedMinutes"
                  min={10}
                  max={600}
                  defaultValue={selectedCourse.estimatedMinutes}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                  disabled={updateCourseMutation.isPending}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Cor temática
                <input
                  type="color"
                  name="themeColor"
                  defaultValue={selectedCourse.themeColor}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white p-1"
                  disabled={updateCourseMutation.isPending}
                />
              </label>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-red-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={updateCourseMutation.isPending}
              >
                {updateCourseMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Salvar informações
              </button>
            </div>
          </form>
        </article>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Seções e conteúdos
              </h3>
              <p className="text-sm text-gray-600">
                Organize o aprendizado em blocos curtos, com linguagem lúdica e conteúdos variados.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              <Layers size={12} /> {sectionsCount} seção{sectionsCount === 1 ? "" : "es"}
            </span>
          </header>

          <form
            onSubmit={handleCreateSection}
            className="grid gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-4 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]"
            noValidate
          >
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Título da seção
              <input
                name="title"
                required
                placeholder="Ex.: Aquecimento"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={createSectionMutation.isPending}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 sm:col-span-1">
              Descrição (opcional)
              <input
                name="summary"
                placeholder="Conte o que o aluno verá nesta etapa."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={createSectionMutation.isPending}
              />
            </label>
            <button
              type="submit"
              className="h-fit rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-red-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={createSectionMutation.isPending}
            >
              {createSectionMutation.isPending ? "Adicionando..." : "Adicionar seção"}
            </button>
          </form>

          <div className="space-y-4">
            {selectedCourse.sections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                Este mini-curso ainda não possui seções. Crie a primeira para começar a montar as aulas.
              </div>
            ) : (
              selectedCourse.sections.map((section) => (
                <article
                  key={section.id}
                  className="space-y-4 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <h4 className="break-words text-base font-semibold text-gray-900">
                        {section.title}
                      </h4>
                      <p className="break-words text-sm text-gray-600">
                        {section.summary ?? "Ainda sem resumo para esta etapa."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
                        <BookOpenCheck size={12} /> {section.lessons.length} conteúdo{section.lessons.length === 1 ? "" : "s"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
                        disabled={deleteSectionMutation.isPending}
                      >
                        <Trash2 size={12} /> Remover seção
                      </button>
                    </div>
                  </div>

                  <form
                    onSubmit={handleUpdateSection(section)}
                    className="grid gap-3 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]"
                    noValidate
                  >
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                      Renomear
                      <input
                        name="title"
                        defaultValue={section.title}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                        disabled={updateSectionMutation.isPending}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 sm:col-span-1">
                      Resumo
                      <input
                        name="summary"
                        defaultValue={section.summary ?? ""}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                        disabled={updateSectionMutation.isPending}
                      />
                    </label>
                    <button
                      type="submit"
                      className="h-fit rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={updateSectionMutation.isPending}
                    >
                      Salvar seção
                    </button>
                  </form>

                  <div className="space-y-3">
                    {section.lessons.map((lesson) => {
                      const isEditing = editingLessonId === lesson.id;
                      const preview = lessonPreview(lesson);

                      return (
                        <div
                          key={lesson.id}
                          className="min-w-0 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                        >
                          {isEditing ? (
                            <LessonForm
                              mode="update"
                              defaultValues={{
                                title: lesson.title,
                                durationMinutes: lesson.durationMinutes ?? null,
                                content: lesson.content,
                              }}
                              onSubmit={handleUpdateLesson(lesson)}
                              onCancel={() => setEditingLessonId(null)}
                              disabled={updateLessonMutation.isPending}
                            />
                          ) : (
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <LessonBadge type={lesson.content.type} />
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {formatDuration(lesson.durationMinutes) && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock size={12} /> {formatDuration(lesson.durationMinutes)}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setEditingLessonId(lesson.id)}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLesson(lesson)}
                                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
                                    disabled={deleteLessonMutation.isPending}
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>
                              <div className="min-w-0 space-y-1">
                                <p className="break-words text-sm font-semibold text-gray-900">
                                  {lesson.title}
                                </p>
                                {preview && (
                                  <p className="line-clamp-3 break-words text-sm text-gray-600">{preview}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 px-4 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSection((current) =>
                            current === section.id ? null : section.id,
                          )
                        }
                        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-700"
                      >
                        {expandedSection === section.id ? "Ocultar formulário" : "Adicionar novo conteúdo"}
                      </button>
                      {expandedSection === section.id && (
                        <LessonForm
                          mode="create"
                          onSubmit={handleCreateLesson(section.id)}
                          disabled={createLessonMutation.isPending}
                        />
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    );
  };
  React.useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timer);
  }, [feedback]);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <aside className="space-y-6">{renderCourseList()}</aside>
      <section className="min-w-0 space-y-4">
        <div aria-live="polite" className="min-h-[1rem]">
          {feedback && (
            <div
              className={`flex min-w-0 items-center gap-2 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {feedback.type === "success" ? (
                <span aria-hidden className="text-lg">✨</span>
              ) : (
                <span aria-hidden className="text-lg">⚠️</span>
              )}
              <span className="break-words font-medium">{feedback.message}</span>
            </div>
          )}
        </div>
        {renderCourseDetails()}
      </section>
    </div>
  );
}
