// prisma/seed.cjs
const { PrismaClient, Prisma } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  // evita duplicar: tenta achar uma igual por (anoProva, edicao, instituicao, tema, subtema)
  const exists = await db.questao.findFirst({
    where: {
      anoProva: 2025,
      edicao: "1º semestre",
      instituicao: "ETEC",
      tema: "Porcentagem",
      subtema: "Descontos sucessivos",
    },
  });

  if (exists) {
    console.log("ℹ️  Questão já existe, nada a fazer (id:", exists.id, ")");
    return;
  }

  const created = await db.questao.create({
    data: {
      // Identificação
      anoProva: 2025,
      edicao: "1º semestre",
      instituicao: "ETEC",
      urlProva: "https://www.vestibulinhoetec.com.br/provas/2025-1s.pdf",

      // Classificação
      disciplina: "MATEMATICA",          // enum Disciplina
      tema: "Porcentagem",
      subtema: "Descontos sucessivos",
      grauDificuldade: "MEDIO",          // enum GrauDificuldade
      habilidade: "EF09MA06",

      // Conteúdo
      enunciado:
        "Um produto que custava R$ 200,00 recebeu descontos sucessivos de 10% e 20%. Qual é o preço final?",
      imagemUrl: null,

      alternativaA: "R$ 140,00",
      alternativaB: "R$ 144,00",
      alternativaC: "R$ 150,00",
      alternativaD: "R$ 160,00",
      alternativaE: "R$ 180,00",
      respostaCorreta: "B",              // enum Alternativa

      // Resolução / fontes
      resolucaoTexto:
        "10% de 200 = 20 → 200 - 20 = 180. Depois 20% de 180 = 36 → 180 - 36 = 144.",
      resolucaoImagem: null,
      fonteReferencia: "Prova oficial ETEC 2025 1º semestre",

      // Metadados
      tags: ["vestibulinho", "matematica", "porcentagem", "2025"],
      tempoMedioResolucaoMin: 2,
      percentualAcerto: "78.50",         // Decimal -> use string para evitar ponto flutuante
      usosEmSimulados: 1,
      comentarios: "Boa questão para treino de descontos sucessivos.",
    },
  });

  console.log("✅ Seed criada com sucesso! id:", created.id);
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
