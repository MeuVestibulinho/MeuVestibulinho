import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".avif"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const anoValue = formData.get("ano");
  const file = formData.get("file");

  const ano = typeof anoValue === "string" ? Number.parseInt(anoValue, 10) : Number(anoValue);
  if (!Number.isFinite(ano) || ano < 1900 || ano > 2100) {
    return NextResponse.json({ error: "Ano do simulado inválido" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Imagem deve ter no máximo 5MB" }, { status: 413 });
  }

  const originalExt = path.extname(file.name || "").toLowerCase();
  if (originalExt && !ALLOWED_EXTENSIONS.includes(originalExt)) {
    return NextResponse.json({ error: "Formato de imagem não suportado" }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = originalExt || ".png";

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "simulados");
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = `simulado-${ano}-${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, buffer);

  const relativePath = `/uploads/simulados/${fileName}`;

  const existing = await db.simuladoMetadata.findUnique({ where: { ano } });

  if (existing?.coverImageUrl && existing.coverImageUrl.startsWith("/uploads/simulados")) {
    const normalized = existing.coverImageUrl.startsWith("/")
      ? existing.coverImageUrl.slice(1)
      : existing.coverImageUrl;
    const previousPath = path.join(process.cwd(), "public", normalized);
    try {
      await fs.stat(previousPath);
      await fs.unlink(previousPath);
    } catch (error) {
      console.warn("[simulados] Não foi possível remover a imagem anterior:", error);
    }
  }

  await db.simuladoMetadata.upsert({
    where: { ano },
    update: {
      coverImageUrl: relativePath,
      updatedById: session.user.id,
    },
    create: {
      ano,
      coverImageUrl: relativePath,
      updatedById: session.user.id,
      titulo: `Simulado ${ano}`,
    },
  });

  return NextResponse.json({ ok: true, coverImageUrl: relativePath });
}
