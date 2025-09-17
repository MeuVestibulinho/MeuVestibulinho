// prisma/seed.cjs
const { PrismaClient } = require("@prisma/client");

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

  const created = await db.questao.create({
    data: {
      enunciado,
      ano,
      disciplina,
      grauDificuldade,
      fonteUrl: "https://www.vestibulinhoetec.com.br/provas/2025-1s.pdf",
      imagemUrl: null,
      alternativas: {
        create: [
          { letra: "A", texto: "R$ 140,00", correta: false },
          { letra: "B", texto: "R$ 144,00", correta: true },
          { letra: "C", texto: "R$ 150,00", correta: false },
          { letra: "D", texto: "R$ 160,00", correta: false },
          { letra: "E", texto: "R$ 180,00", correta: false },
        ],
      },
    },
    select: {
      id: true,
      alternativas: {
        select: { letra: true, correta: true },
        orderBy: { letra: "asc" },
      },
    },
  });

  const gabarito = created.alternativas
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
