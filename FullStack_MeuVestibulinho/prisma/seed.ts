// prisma/seed.ts (ESM + tsx)
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  // Se teus arquivos exportam funções nomeadas:
  const { seedBase } = await import("./seed.base.ts");
  const { seedDemo } = await import("./seed.demo.ts");

  // (Se exportarem default, use estas duas linhas no lugar das acima)
  // const seedBase = (await import("./seed.base.ts")).default;
  // const seedDemo = (await import("./seed.demo.ts")).default;

  await seedBase(prisma);
  await seedDemo(prisma);

  console.log("✅ Seed concluído: base + demo");
}

run()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Seed falhou:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
