/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatarEmoji" TEXT NOT NULL DEFAULT '🎯',
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "public"."EmailBlacklist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserStatistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalAcertos" INTEGER NOT NULL DEFAULT 0,
    "totalErros" INTEGER NOT NULL DEFAULT 0,
    "totalPuladas" INTEGER NOT NULL DEFAULT 0,
    "simuladosConcluidos" INTEGER NOT NULL DEFAULT 0,
    "totalQuestoes" INTEGER NOT NULL DEFAULT 0,
    "tempoMedioSegundos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conteudosMaiorAcerto" JSONB NOT NULL DEFAULT '[]',
    "conteudosMenorAcerto" JSONB NOT NULL DEFAULT '[]',
    "detalhes" JSONB NOT NULL DEFAULT '{}',
    "tempoTotalSegundos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SimuladoMetadata" (
    "id" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "titulo" TEXT,
    "descricao" TEXT,
    "coverImageUrl" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimuladoMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailBlacklist_email_key" ON "public"."EmailBlacklist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserStatistics_userId_key" ON "public"."UserStatistics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SimuladoMetadata_ano_key" ON "public"."SimuladoMetadata"("ano");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."EmailBlacklist" ADD CONSTRAINT "EmailBlacklist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserStatistics" ADD CONSTRAINT "UserStatistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SimuladoMetadata" ADD CONSTRAINT "SimuladoMetadata_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
