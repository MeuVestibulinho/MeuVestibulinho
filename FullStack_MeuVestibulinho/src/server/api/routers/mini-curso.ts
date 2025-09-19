import { TRPCError } from "@trpc/server";
import {
  type MiniCourseLessonKind,
  type Prisma,
  type PrismaClient,
} from "@prisma/client";
import { z } from "zod";

import {
  extractYoutubeId,
  hexColorSchema,
  lessonContentSchema,
  lessonDurationSchema,
  miniCourseLevelSchema,
  slugifyMiniCourseTitle,
} from "~/lib/mini-course";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

const courseDetailsSchema = z.object({
  title: z.string().trim().min(3).max(120),
  subtitle: z.string().trim().min(10).max(400),
  category: z.string().trim().min(3).max(60),
  level: miniCourseLevelSchema,
  emoji: z.string().trim().min(1).max(4),
  themeColor: hexColorSchema,
  estimatedMinutes: z.number({ coerce: true }).int().min(10).max(600),
});

const sectionDetailsSchema = z.object({
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(3).max(400).optional(),
});

const courseWithRelations = {
  include: {
    sections: {
      orderBy: { order: "asc" },
      include: { lessons: { orderBy: { order: "asc" } } },
    },
  },
} satisfies Prisma.MiniCourseInclude;

type CourseWithContent = Prisma.MiniCourseGetPayload<typeof courseWithRelations>;

type CourseLessonContent = z.infer<typeof lessonContentSchema>;

const lessonKindMap: Record<CourseLessonContent["type"], MiniCourseLessonKind> = {
  text: "TEXT",
  example: "EXAMPLE",
  video: "VIDEO",
  exercise: "EXERCISE",
};

function assertKindMatchesContent(
  kind: MiniCourseLessonKind,
  content: CourseLessonContent,
) {
  const expected = lessonKindMap[content.type];
  if (kind !== expected) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Conteúdo da aula não está consistente com o tipo salvo.",
    });
  }
}

function parseLesson(
  lesson: CourseWithContent["sections"][number]["lessons"][number],
) {
  let content: CourseLessonContent;
  try {
    content = lessonContentSchema.parse(lesson.content);
  } catch (error) {
    console.error("Invalid lesson content", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Conteúdo de mini-curso corrompido.",
    });
  }

  assertKindMatchesContent(lesson.kind, content);

  return {
    id: lesson.id,
    title: lesson.title,
    order: lesson.order,
    kind: lesson.kind,
    durationMinutes: lesson.durationMinutes,
    content,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  } as const;
}

function formatCourse(course: CourseWithContent) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    level: course.level,
    emoji: course.emoji,
    themeColor: course.themeColor,
    estimatedMinutes: course.estimatedMinutes,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    sections: course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      summary: section.summary,
      order: section.order,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      lessons: section.lessons.map(parseLesson),
    })),
  } as const;
}

async function getCourseOrThrow(db: PrismaClient, courseId: string) {
  const course = await db.miniCourse.findUnique({
    where: { id: courseId },
    ...courseWithRelations,
  });

  if (!course) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Mini-curso não encontrado." });
  }

  return formatCourse(course);
}

function normaliseContent(content: CourseLessonContent): CourseLessonContent {
  if (content.type !== "video") {
    return content;
  }

  const videoId = extractYoutubeId(content.youtubeId);
  if (!videoId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Informe um link ou ID válido do YouTube.",
    });
  }

  return {
    ...content,
    youtubeId: videoId,
  } as const;
}

async function resequenceSections(
  trx: Prisma.TransactionClient,
  courseId: string,
) {
  const sections = await trx.miniCourseSection.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: { id: true },
  });

  for (const [index, section] of sections.entries()) {
    await trx.miniCourseSection.update({
      where: { id: section.id },
      data: { order: index + 1 },
    });
  }
}

async function resequenceLessons(
  trx: Prisma.TransactionClient,
  sectionId: string,
) {
  const lessons = await trx.miniCourseLesson.findMany({
    where: { sectionId },
    orderBy: { order: "asc" },
    select: { id: true },
  });

  for (const [index, lesson] of lessons.entries()) {
    await trx.miniCourseLesson.update({
      where: { id: lesson.id },
      data: { order: index + 1 },
    });
  }
}

type DbClient = PrismaClient | Prisma.TransactionClient;

async function touchCourse(db: DbClient, courseId: string) {
  await db.miniCourse.update({
    where: { id: courseId },
    data: { updatedAt: new Date() },
  });
}

export const miniCursoRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db.miniCourse.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        sections: {
          select: {
            id: true,
            lessons: { select: { id: true } },
          },
        },
      },
    });

    return courses.map((course) => {
      const sectionsCount = course.sections.length;
      const lessonsCount = course.sections.reduce(
        (total, section) => total + section.lessons.length,
        0,
      );

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        category: course.category,
        level: course.level,
        emoji: course.emoji,
        themeColor: course.themeColor,
        estimatedMinutes: course.estimatedMinutes,
        updatedAt: course.updatedAt,
        sectionsCount,
        lessonsCount,
      } as const;
    });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().trim().min(1).max(80) }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.miniCourse.findUnique({
        where: { slug: input.slug },
        ...courseWithRelations,
      });

      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mini-curso não encontrado." });
      }

      return formatCourse(course);
    }),

  adminList: adminProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db.miniCourse.findMany({
      orderBy: { updatedAt: "desc" },
      ...courseWithRelations,
    });

    return courses.map((course) => formatCourse(course));
  }),

  createCourse: adminProcedure
    .input(courseDetailsSchema)
    .mutation(async ({ ctx, input }) => {
      const baseSlug = slugifyMiniCourseTitle(input.title);
      let slug = baseSlug;
      let attempt = 1;

      // Ensure unique slug
      while (true) {
        const existing = await ctx.db.miniCourse.findUnique({
          where: { slug },
          select: { id: true },
        });

        if (!existing) {
          break;
        }

        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
        if (attempt > 50) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não foi possível gerar um endereço único para o mini-curso.",
          });
        }
      }

      const created = await ctx.db.miniCourse.create({
        data: {
          slug,
          title: input.title,
          subtitle: input.subtitle,
          category: input.category,
          level: input.level,
          emoji: input.emoji,
          themeColor: input.themeColor,
          estimatedMinutes: input.estimatedMinutes,
        },
        ...courseWithRelations,
      });

      return formatCourse(created);
    }),

  updateCourse: adminProcedure
    .input(courseDetailsSchema.extend({ courseId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db.miniCourse.update({
        where: { id: input.courseId },
        data: {
          title: input.title,
          subtitle: input.subtitle,
          category: input.category,
          level: input.level,
          emoji: input.emoji,
          themeColor: input.themeColor,
          estimatedMinutes: input.estimatedMinutes,
        },
        ...courseWithRelations,
      });

      return formatCourse(course);
    }),

  deleteCourse: adminProcedure
    .input(z.object({ courseId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.miniCourse.delete({ where: { id: input.courseId } });
      return { ok: true } as const;
    }),

  createSection: adminProcedure
    .input(sectionDetailsSchema.extend({ courseId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const lastSection = await ctx.db.miniCourseSection.findFirst({
        where: { courseId: input.courseId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      await ctx.db.miniCourseSection.create({
        data: {
          courseId: input.courseId,
          title: input.title,
          summary: input.summary ?? null,
          order: (lastSection?.order ?? 0) + 1,
        },
      });

      await touchCourse(ctx.db, input.courseId);

      return getCourseOrThrow(ctx.db, input.courseId);
    }),

  updateSection: adminProcedure
    .input(
      sectionDetailsSchema.extend({ sectionId: z.string().cuid() }),
    )
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.miniCourseSection.update({
        where: { id: input.sectionId },
        data: {
          title: input.title,
          summary: input.summary ?? null,
        },
        select: { courseId: true },
      });

      await touchCourse(ctx.db, section.courseId);

      return getCourseOrThrow(ctx.db, section.courseId);
    }),

  deleteSection: adminProcedure
    .input(z.object({ sectionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.miniCourseSection.findUnique({
        where: { id: input.sectionId },
        select: { courseId: true },
      });

      if (!section) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Seção não encontrada." });
      }

      await ctx.db.$transaction(async (trx) => {
        await trx.miniCourseSection.delete({ where: { id: input.sectionId } });
        await resequenceSections(trx, section.courseId);
        await touchCourse(trx, section.courseId);
      });

      return getCourseOrThrow(ctx.db, section.courseId);
    }),

  createLesson: adminProcedure
    .input(
      z.object({
        sectionId: z.string().cuid(),
        title: z.string().trim().min(3).max(120),
        durationMinutes: lessonDurationSchema,
        content: lessonContentSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.miniCourseSection.findUnique({
        where: { id: input.sectionId },
        select: { id: true, courseId: true },
      });

      if (!section) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Seção não encontrada." });
      }

      const content = normaliseContent(input.content);
      const lastLesson = await ctx.db.miniCourseLesson.findFirst({
        where: { sectionId: section.id },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      await ctx.db.miniCourseLesson.create({
        data: {
          sectionId: section.id,
          title: input.title,
          order: (lastLesson?.order ?? 0) + 1,
          durationMinutes: input.durationMinutes ?? null,
          kind: lessonKindMap[content.type],
          content,
        },
      });

      await touchCourse(ctx.db, section.courseId);

      return getCourseOrThrow(ctx.db, section.courseId);
    }),

  updateLesson: adminProcedure
    .input(
      z.object({
        lessonId: z.string().cuid(),
        title: z.string().trim().min(3).max(120),
        durationMinutes: lessonDurationSchema,
        content: lessonContentSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lesson = await ctx.db.miniCourseLesson.findUnique({
        where: { id: input.lessonId },
        select: { id: true, sectionId: true, section: { select: { courseId: true } } },
      });

      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Aula não encontrada." });
      }

      const content = normaliseContent(input.content);

      await ctx.db.miniCourseLesson.update({
        where: { id: input.lessonId },
        data: {
          title: input.title,
          durationMinutes: input.durationMinutes ?? null,
          kind: lessonKindMap[content.type],
          content,
        },
      });

      await touchCourse(ctx.db, lesson.section.courseId);

      return getCourseOrThrow(ctx.db, lesson.section.courseId);
    }),

  deleteLesson: adminProcedure
    .input(z.object({ lessonId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const lesson = await ctx.db.miniCourseLesson.findUnique({
        where: { id: input.lessonId },
        select: {
          id: true,
          sectionId: true,
          section: { select: { courseId: true } },
        },
      });

      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Aula não encontrada." });
      }

      await ctx.db.$transaction(async (trx) => {
        await trx.miniCourseLesson.delete({ where: { id: input.lessonId } });
        await resequenceLessons(trx, lesson.sectionId);
        await touchCourse(trx, lesson.section.courseId);
      });

      return getCourseOrThrow(ctx.db, lesson.section.courseId);
    }),
});
