import { z } from "zod";

export const miniCourseLevelSchema = z.enum([
  "iniciante",
  "intermediario",
  "avancado",
]);

export type MiniCourseLevel = z.infer<typeof miniCourseLevelSchema>;

export const textContentSchema = z.object({
  type: z.literal("text"),
  body: z.string().trim().min(1).max(4000),
  tips: z
    .array(z.string().trim().min(1).max(200))
    .max(6)
    .optional(),
});

export const exampleContentSchema = z.object({
  type: z.literal("example"),
  description: z.string().trim().min(1).max(4000),
  steps: z
    .array(z.string().trim().min(1).max(400))
    .min(1)
    .max(10),
});

export const videoContentSchema = z.object({
  type: z.literal("video"),
  youtubeId: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4000).optional(),
});

export const exerciseContentSchema = z.object({
  type: z.literal("exercise"),
  prompt: z.string().trim().min(1).max(4000),
  steps: z
    .array(z.string().trim().min(1).max(400))
    .min(1)
    .max(10),
});

export const lessonContentSchema = z.discriminatedUnion("type", [
  textContentSchema,
  exampleContentSchema,
  videoContentSchema,
  exerciseContentSchema,
]);

export type MiniCourseLessonContent = z.infer<typeof lessonContentSchema>;

export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
    message: "Informe uma cor hexadecimal válida (#RRGGBB).",
  })
  .transform((value) => value.toLowerCase());

export function slugifyMiniCourseTitle(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const normalized = base.slice(0, 60) || "curso";
  return normalized;
}

export function extractYoutubeId(input: string): string | null {
  const raw = input.trim();
  const directId = raw.match(/^[\w-]{11}$/);
  if (directId) {
    return directId[0];
  }

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace(/\//g, "");
      return id.length === 11 ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v");
      if (id && id.length === 11) {
        return id;
      }

      const pathnameMatch = url.pathname.match(/\/shorts\/([\w-]{11})/);
      if (pathnameMatch) {
        return pathnameMatch[1] ?? null;
      }
    }
  } catch (error) {
    return null;
  }

  return null;
}

export const lessonDurationSchema = z
  .number({ coerce: true })
  .int()
  .min(1)
  .max(180)
  .optional();

export const miniCourseDetailsSchema = z.object({
  title: z
    .string({ required_error: "Informe um título para o mini-curso." })
    .trim()
    .min(3, { message: "O título deve ter pelo menos 3 caracteres." })
    .max(120, { message: "O título pode ter no máximo 120 caracteres." }),
  subtitle: z
    .string({ required_error: "Descreva rapidamente o mini-curso." })
    .trim()
    .min(10, { message: "Use pelo menos 10 caracteres na descrição." })
    .max(400, {
      message: "A descrição pode ter no máximo 400 caracteres.",
    }),
  category: z
    .string({ required_error: "Informe a categoria do mini-curso." })
    .trim()
    .min(3, { message: "A categoria deve ter pelo menos 3 caracteres." })
    .max(60, { message: "A categoria pode ter no máximo 60 caracteres." }),
  level: miniCourseLevelSchema,
  emoji: z
    .string({ required_error: "Escolha um emoji para o mini-curso." })
    .trim()
    .min(1, { message: "Escolha ao menos um emoji." })
    .max(4, { message: "Use até 4 caracteres para o emoji." }),
  themeColor: hexColorSchema,
  estimatedMinutes: z
    .number({
      coerce: true,
      invalid_type_error: "Informe a carga horária em minutos.",
    })
    .int({ message: "A duração deve ser um número inteiro." })
    .min(10, { message: "O mini-curso deve ter pelo menos 10 minutos." })
    .max(600, { message: "O mini-curso pode ter no máximo 600 minutos." }),
});

export type MiniCourseDetailsInput = z.infer<typeof miniCourseDetailsSchema>;

export const miniCourseSectionDetailsSchema = z.object({
  title: z
    .string({ required_error: "Informe o título da seção." })
    .trim()
    .min(3, { message: "O título da seção deve ter pelo menos 3 caracteres." })
    .max(120, {
      message: "O título da seção pode ter no máximo 120 caracteres.",
    }),
  summary: z
    .string()
    .trim()
    .min(3, { message: "O resumo deve ter pelo menos 3 caracteres." })
    .max(400, { message: "O resumo pode ter no máximo 400 caracteres." })
    .optional(),
});

export type MiniCourseSectionDetailsInput = z.infer<
  typeof miniCourseSectionDetailsSchema
>;
