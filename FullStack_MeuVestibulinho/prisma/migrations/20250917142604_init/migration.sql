-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Disciplina" AS ENUM ('PORTUGUES', 'MATEMATICA', 'CIENCIAS', 'HISTORIA', 'GEOGRAFIA', 'INGLES', 'OUTRAS');

-- CreateEnum
CREATE TYPE "public"."GrauDificuldade" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL');

-- CreateEnum
CREATE TYPE "public"."Alternativa" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Questao" (
    "id" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "disciplina" "public"."Disciplina" NOT NULL,
    "grauDificuldade" "public"."GrauDificuldade" NOT NULL,
    "ano" INTEGER,
    "fonteUrl" TEXT,
    "imagemUrl" TEXT,
    "habilidades" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "subconteudo" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Questao_disciplina_idx" ON "public"."Questao"("disciplina");

-- CreateIndex
CREATE INDEX "Questao_grauDificuldade_idx" ON "public"."Questao"("grauDificuldade");

-- CreateIndex
CREATE INDEX "Questao_ano_idx" ON "public"."Questao"("ano");

-- CreateIndex
CREATE INDEX "Questao_createdAt_idx" ON "public"."Questao"("createdAt");

-- CreateIndex
CREATE INDEX "Questao_disciplina_grauDificuldade_ano_createdAt_idx" ON "public"."Questao"("disciplina", "grauDificuldade", "ano", "createdAt");

-- CreateIndex
CREATE INDEX "AlternativaQuestao_questaoId_idx" ON "public"."AlternativaQuestao"("questaoId");

-- CreateIndex
CREATE UNIQUE INDEX "AlternativaQuestao_questaoId_letra_key" ON "public"."AlternativaQuestao"("questaoId", "letra");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlternativaQuestao" ADD CONSTRAINT "AlternativaQuestao_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "public"."Questao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
