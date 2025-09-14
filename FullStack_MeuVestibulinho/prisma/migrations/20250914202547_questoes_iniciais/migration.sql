-- CreateEnum
CREATE TYPE "public"."Disciplina" AS ENUM ('PORTUGUES', 'MATEMATICA', 'CIENCIAS_HUMANAS', 'CIENCIAS_NATUREZA', 'HISTORIA', 'GEOGRAFIA', 'BIOLOGIA', 'FISICA', 'QUIMICA');

-- CreateEnum
CREATE TYPE "public"."GrauDificuldade" AS ENUM ('MUITO_FACIL', 'FACIL', 'MEDIO', 'DIFICIL', 'MUITO_DIFICIL');

-- CreateEnum
CREATE TYPE "public"."Alternativa" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateTable
CREATE TABLE "public"."Questao" (
    "id" TEXT NOT NULL,
    "anoProva" INTEGER NOT NULL,
    "edicao" TEXT NOT NULL,
    "instituicao" TEXT NOT NULL,
    "urlProva" TEXT,
    "disciplina" "public"."Disciplina" NOT NULL,
    "tema" TEXT,
    "subtema" TEXT,
    "grauDificuldade" "public"."GrauDificuldade" NOT NULL,
    "habilidade" TEXT,
    "enunciado" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "alternativaA" TEXT NOT NULL,
    "alternativaB" TEXT NOT NULL,
    "alternativaC" TEXT NOT NULL,
    "alternativaD" TEXT NOT NULL,
    "alternativaE" TEXT NOT NULL,
    "respostaCorreta" "public"."Alternativa" NOT NULL,
    "resolucaoTexto" TEXT,
    "resolucaoImagem" TEXT,
    "fonteReferencia" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tempoMedioResolucaoMin" INTEGER,
    "percentualAcerto" DECIMAL(5,2),
    "usosEmSimulados" INTEGER NOT NULL DEFAULT 0,
    "comentarios" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Questao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Questao_anoProva_disciplina_grauDificuldade_idx" ON "public"."Questao"("anoProva", "disciplina", "grauDificuldade");
