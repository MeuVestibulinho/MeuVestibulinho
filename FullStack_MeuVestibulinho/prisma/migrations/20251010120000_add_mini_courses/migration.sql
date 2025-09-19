-- CreateEnum
CREATE TYPE "public"."MiniCourseLessonKind" AS ENUM ('TEXT', 'EXAMPLE', 'VIDEO', 'EXERCISE');

-- CreateTable
CREATE TABLE "public"."MiniCourse" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📘',
    "themeColor" TEXT NOT NULL DEFAULT '#f97316',
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 45,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MiniCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MiniCourseSection" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MiniCourseSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MiniCourseLesson" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "kind" "public"."MiniCourseLessonKind" NOT NULL,
    "durationMinutes" INTEGER,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MiniCourseLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MiniCourse_slug_key" ON "public"."MiniCourse"("slug");

-- CreateIndex
CREATE INDEX "MiniCourseSection_courseId_idx" ON "public"."MiniCourseSection"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "MiniCourseSection_courseId_order_key" ON "public"."MiniCourseSection"("courseId", "order");

-- CreateIndex
CREATE INDEX "MiniCourseLesson_sectionId_idx" ON "public"."MiniCourseLesson"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "MiniCourseLesson_sectionId_order_key" ON "public"."MiniCourseLesson"("sectionId", "order");

-- AddForeignKey
ALTER TABLE "public"."MiniCourseSection" ADD CONSTRAINT "MiniCourseSection_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."MiniCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MiniCourseLesson" ADD CONSTRAINT "MiniCourseLesson_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."MiniCourseSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
