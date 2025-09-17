ALTER TABLE "Questao" ADD COLUMN "habilidades" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Questao" ADD COLUMN "conteudo" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Questao" ADD COLUMN "subconteudo" TEXT NOT NULL DEFAULT '';

UPDATE "Questao"
SET
  "habilidades" = 'Atualize as habilidades desta questão',
  "conteudo" = 'Atualize o conteúdo principal desta questão',
  "subconteudo" = 'Atualize o subconteúdo desta questão'
WHERE "habilidades" = '' AND "conteudo" = '' AND "subconteudo" = '';

ALTER TABLE "Questao" ALTER COLUMN "habilidades" DROP DEFAULT;
ALTER TABLE "Questao" ALTER COLUMN "conteudo" DROP DEFAULT;
ALTER TABLE "Questao" ALTER COLUMN "subconteudo" DROP DEFAULT;
