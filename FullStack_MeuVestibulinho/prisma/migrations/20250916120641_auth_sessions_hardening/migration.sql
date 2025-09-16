-- ACCOUNT
ALTER TABLE "public"."Account"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- backfill explícito (cobre qualquer linha existente)
UPDATE "public"."Account" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

-- alinhar com Prisma (@updatedAt não usa default permanente)
ALTER TABLE "public"."Account" ALTER COLUMN "updatedAt" DROP DEFAULT;


-- SESSION
ALTER TABLE "public"."Session"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "public"."Session" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
ALTER TABLE "public"."Session" ALTER COLUMN "updatedAt" DROP DEFAULT;


-- USER
ALTER TABLE "public"."User"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "public"."User" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" DROP DEFAULT;


-- Indexes (ok manter)
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "public"."Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "public"."Session"("userId");

/* MUITO IMPORTANTE:
   Remova as linhas abaixo se você NÃO quer perder a tabela Questao e os enums!
   -- DROP TABLE "public"."Questao";
   -- DROP TYPE "public"."Alternativa";
   -- DROP TYPE "public"."Disciplina";
   -- DROP TYPE "public"."GrauDificuldade";
*/
