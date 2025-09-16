-- CreateEnum
CREATE TYPE "public"."Disciplina" AS ENUM ('PORTUGUES', 'MATEMATICA', 'CIENCIAS', 'HISTORIA', 'GEOGRAFIA', 'INGLES', 'OUTRAS');

-- CreateEnum
CREATE TYPE "public"."GrauDificuldade" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL');

-- CreateEnum
CREATE TYPE "public"."Alternativa" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateTable
CREATE TABLE "public"."Questao" (
    "id" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "disciplina" "public"."Disciplina" NOT NULL,
    "grauDificuldade" "public"."GrauDificuldade" NOT NULL,
    "ano" INTEGER,
    "fonteUrl" TEXT,
    "imagemUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Questao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AlternativaQuestao" (
    "id" TEXT NOT NULL,
    "questaoId" TEXT NOT NULL,
    "letra" "public"."Alternativa" NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AlternativaQuestao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlternativaQuestao_questaoId_idx" ON "public"."AlternativaQuestao"("questaoId");

-- CreateIndex
CREATE UNIQUE INDEX "AlternativaQuestao_questaoId_letra_key" ON "public"."AlternativaQuestao"("questaoId", "letra");

-- AddForeignKey
ALTER TABLE "public"."AlternativaQuestao" ADD CONSTRAINT "AlternativaQuestao_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "public"."Questao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
