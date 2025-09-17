// prisma/seed.cjs
const { PrismaClient, Alternativa } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  const enunciado =
    "Um produto que custava R$ 200,00 recebeu descontos sucessivos de 10% e 20%. Qual é o preço final?";
  const ano = 2025;
  const disciplina = "MATEMATICA";
  const grauDificuldade = "MEDIO";

  const exists = await db.questao.findFirst({
    where: {
      enunciado,
      ano,
      disciplina,
      grauDificuldade,
    },
  });

  if (exists) {
    console.log("ℹ️  Questão já existe, nada a fazer (id:", exists.id, ")");
    return;
  }

  const alternativas = [
    { letra: Alternativa.A, texto: "R$ 140,00", correta: false },
    { letra: Alternativa.B, texto: "R$ 144,00", correta: true },
    { letra: Alternativa.C, texto: "R$ 150,00", correta: false },
    { letra: Alternativa.D, texto: "R$ 160,00", correta: false },
    { letra: Alternativa.E, texto: "R$ 180,00", correta: false },
  ];

  const created = await db.questao.create({
    data: {
      enunciado,
      ano,
      disciplina,
      grauDificuldade,
      fonteUrl: "https://www.vestibulinhoetec.com.br/provas/2025-1s.pdf",
      imagemUrl: null,
      habilidades: "Análise de porcentagem e descontos sucessivos",
      conteudo: "Porcentagem aplicada a situações de desconto composto",
      subconteudo: "Descontos sucessivos e cálculo percentual",
      alternativas: {
        create: alternativas,
      },
    },
    select: { id: true },
  });

  const gabarito = alternativas
    .filter((alt) => alt.correta)
    .map((alt) => alt.letra)
    .join(", ");

  console.log(
    `✅ Seed criada com sucesso! id: ${created.id} | gabarito: ${gabarito || "sem resposta marcada"}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
