// prisma/seed.base.ts
import type { PrismaClient } from "@prisma/client";

export async function seedBase(prisma: PrismaClient) {
  // Topics
  // Use a unique field for 'where' if available (e.g., unique by name, if it exists)
  const math: Awaited<ReturnType<typeof prisma.topic.upsert>> = await prisma.topic.upsert({
    where: { id: "topic-math" }, // Use a unique field for 'where' if available (e.g., unique by name, if it exists)
    update: {},
    create: { id: "topic-math", name: "Matemática" },
  });

  const fractions = await prisma.subtopic.upsert({
    where: { id: "subtopic-fractions" },
    update: {},
    create: { id: "subtopic-fractions", name: "Frações", topicId: math.id },
  });

  // Tags
  const tagFractions = await prisma.tag.upsert({
    where: { id: "tag-fractions" },
    update: {},
    create: { id: "tag-fractions", name: "Frações" },
  });

  // Prova (SourceExam)
  const etec2023 = await prisma.sourceExam.upsert({
    where: { id: "etec-2023" },
    update: {},
    create: { id: "etec-2023", name: "ETEC", year: 2023 },
  });

  console.log("✅ seed.base: tópicos/subtópicos/tags/sourceExam criados/atualizados");
}
