// prisma/seed.cjs
const { PrismaClient, Alternativa, Disciplina, GrauDificuldade } = require("@prisma/client");

const db = new PrismaClient();

const ANOS = [2020, 2021, 2022, 2023, 2024, 2025];
const DISCIPLINAS = [
  Disciplina.MATEMATICA,
  Disciplina.PORTUGUES,
  Disciplina.CIENCIAS,
  Disciplina.HISTORIA,
  Disciplina.GEOGRAFIA,
  Disciplina.INGLES,
];
const GRAUS = [GrauDificuldade.FACIL, GrauDificuldade.MEDIO, GrauDificuldade.DIFICIL];
const CONTEUDOS = [
  {
    habilidade: "Resolver problemas que envolvem porcentagens e razões",
    conteudo: "Porcentagem e proporção",
    subconteudo: "Ajustes percentuais sucessivos",
  },
  {
    habilidade: "Interpretar gráficos e tabelas para extrair informações",
    conteudo: "Leitura de dados",
    subconteudo: "Gráficos de barras e linhas",
  },
  {
    habilidade: "Identificar classes gramaticais em textos curtos",
    conteudo: "Gramática",
    subconteudo: "Classes de palavras",
  },
  {
    habilidade: "Analisar ecossistemas e interações ecológicas",
    conteudo: "Ecologia",
    subconteudo: "Cadeias alimentares",
  },
  {
    habilidade: "Reconhecer fatos históricos e suas consequências",
    conteudo: "História do Brasil",
    subconteudo: "Período republicano",
  },
  {
    habilidade: "Aplicar conhecimentos de geometria plana",
    conteudo: "Geometria",
    subconteudo: "Área de polígonos",
  },
  {
    habilidade: "Identificar coordenadas e localizar pontos no plano",
    conteudo: "Geometria Analítica",
    subconteudo: "Plano cartesiano",
  },
  {
    habilidade: "Empregar leitura e interpretação textual",
    conteudo: "Compreensão de texto",
    subconteudo: "Ideia principal e inferências",
  },
  {
    habilidade: "Associar vocabulário em inglês ao contexto",
    conteudo: "Língua Inglesa",
    subconteudo: "Vocabulário cotidiano",
  },
  {
    habilidade: "Avaliar fenômenos físicos do cotidiano",
    conteudo: "Física",
    subconteudo: "Leis de Newton",
  },
  {
    habilidade: "Compreender medidas de tendência central",
    conteudo: "Estatística",
    subconteudo: "Média, mediana e moda",
  },
  {
    habilidade: "Relacionar fatos geográficos com mapas",
    conteudo: "Geografia",
    subconteudo: "Cartografia básica",
  },
];

const ALTERNATIVAS = Object.values(Alternativa);

async function main() {
  console.log("🧹 Limpando questões anteriores...");
  await db.alternativaQuestao.deleteMany();
  await db.questao.deleteMany();

  if (!CONTEUDOS.length || !DISCIPLINAS.length || !GRAUS.length) {
    throw new Error("As listas de conteúdos, disciplinas e graus devem conter ao menos um item.");
  }

  let totalCriadas = 0;

  for (const ano of ANOS) {
    for (let indice = 0; indice < 10; indice += 1) {
      const conteudoIndex = (indice + ano) % CONTEUDOS.length;
      const disciplinaIndex = (indice + ano) % DISCIPLINAS.length;
      const grauIndex = (indice + ano) % GRAUS.length;

      const conteudo = CONTEUDOS[conteudoIndex] ?? CONTEUDOS[0];
      const disciplina = DISCIPLINAS[disciplinaIndex] ?? Disciplina.MATEMATICA;
      const grau = GRAUS[grauIndex] ?? GrauDificuldade.MEDIO;

      if (!conteudo) {
        throw new Error("Falha ao recuperar informações de conteúdo para a seed.");
      }
      const indiceCorreto = (indice + ano) % ALTERNATIVAS.length;

      const enunciado = `Simulado ${ano} - Questão ${indice + 1}. ${conteudo.conteudo} / ${conteudo.subconteudo}.`;

      const alternativas = ALTERNATIVAS.map((letra, altIndex) => ({
        letra,
        texto: `Alternativa ${letra} para a questão ${indice + 1} do simulado ${ano}.`,
        correta: altIndex === indiceCorreto,
      }));

      await db.questao.create({
        data: {
          enunciado,
          ano,
          disciplina,
          grauDificuldade: grau,
          fonteUrl: `https://www.vestibulinhoetec.com.br/simulados/${ano}`,
          imagemUrl: null,
          habilidades: conteudo.habilidade,
          conteudo: conteudo.conteudo,
          subconteudo: conteudo.subconteudo,
          alternativas: {
            create: alternativas,
          },
        },
      });

      totalCriadas += 1;
    }

    console.log(`✅ Simulado ${ano} populado com 10 questões.`);
  }

  console.log(`🌟 Seed concluída com ${totalCriadas} questões.`);
}

main()
  .catch((error) => {
    console.error("❌ Seed falhou:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
