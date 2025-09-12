// prisma/seed.demo.ts
import type { PrismaClient } from "@prisma/client";

export async function seedDemo(prisma: PrismaClient) {
  const question = await prisma.question.upsert({
    where: { fingerprint: "demo-question-001" }, // fingerprint único só pra demo
    update: {},
    create: {
      statement: "Qual é o resultado de 1/2 + 1/3?",
      choices: JSON.stringify(["5/6", "2/5", "1/6", "1/5"]),
      answerKey: "5/6",
      hints: JSON.stringify(["Tire o MMC de 2 e 3", "Some os numeradores"]),
      solution: JSON.stringify([
        "MMC(2,3) = 6",
        "1/2 = 3/6",
        "1/3 = 2/6",
        "3/6 + 2/6 = 5/6"
      ]),
      difficulty: "EASY",
      timeTargetS: 60,
      isPublic: true,
      fingerprint: "demo-question-001",
      topicId: "topic-math",         // precisa bater com o que criou no seed.base.ts
      subtopicId: "subtopic-fractions",
      sourceExamId: "etec-2023",
    },
  });

  console.log("✅ seed.demo: questão de exemplo criada/atualizada", question.id);
}
