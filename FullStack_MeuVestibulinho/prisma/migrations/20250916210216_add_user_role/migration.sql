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
