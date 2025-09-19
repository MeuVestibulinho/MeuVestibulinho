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
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
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
