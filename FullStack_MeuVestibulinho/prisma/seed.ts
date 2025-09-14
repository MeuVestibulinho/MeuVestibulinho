import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const cs101 = await prisma.course.upsert({
    where: { code: "CS101" },
    update: {},
    create: { code: "CS101", title: "Introdução à Programação" },
  });

  const aluno = await prisma.student.upsert({
    where: { email: "aluno@example.com" },
    update: {},
    create: { email: "aluno@example.com", name: "Aluno Demo" },
  });

  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: aluno.id, courseId: cs101.id } },
    update: {},
    create: { studentId: aluno.id, courseId: cs101.id },
  });

  console.log("Seed concluído ✅");
}

main().finally(() => prisma.$disconnect());
