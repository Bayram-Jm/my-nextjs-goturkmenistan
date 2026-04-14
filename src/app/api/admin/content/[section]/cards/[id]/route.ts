import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getByPath, setDeep } from "@/lib/jsonUtils";
import type { JsonObject } from "@/lib/jsonUtils";
import { CAROUSEL_CONFIG } from "@/lib/carouselConfig";

const ALLOWED_SECTIONS = Object.keys(CAROUSEL_CONFIG);

const EditCardSchema = z.object({
  arrayPath: z.string().min(1, "arrayPath required"),
  card: z.record(z.string(), z.unknown()),
});

function auth(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

function readContent(section: string): JsonObject | null {
  try {
    const fp = path.join(process.cwd(), "content", `${section}.json`);
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch { return null; }
}

function writeContent(section: string, content: JsonObject): boolean {
  try {
    const fp = path.join(process.cwd(), "content", `${section}.json`);
    fs.writeFileSync(fp, JSON.stringify(content, null, 2) + "\n", "utf-8");
    return true;
  } catch { return false; }
}

/* ── DELETE /api/admin/content/[section]/cards/[id] ──────────────────── */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { section: string; id: string } }
) {
  if (!await auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section, id } = params;
  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  const arrayPath = req.nextUrl.searchParams.get("arrayPath");
  if (!arrayPath) return NextResponse.json({ error: "Missing arrayPath" }, { status: 400 });

  const content = readContent(section);
  if (!content) return NextResponse.json({ error: "Content file not found" }, { status: 404 });

  const arr = getByPath(content, arrayPath);
  if (!Array.isArray(arr)) {
    return NextResponse.json({ error: "Array not found at path" }, { status: 400 });
  }

  const items = arr as JsonObject[];
  const cardIndex = items.findIndex((c) => c.id === id);
  if (cardIndex === -1) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (items.length <= 1) {
    return NextResponse.json(
      { error: "Cannot delete the last card" },
      { status: 400 }
    );
  }

  const card = items[cardIndex];

  /* Remove card from array */
  const newArray = items.filter((_, i) => i !== cardIndex);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = setDeep(content as any, arrayPath, newArray);
  if (!writeContent(section, updated)) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  /* Delete associated uploaded images */
  const config = CAROUSEL_CONFIG[section];
  const imageFields = config.imageField ? [config.imageField] : [];
  // Also check for any field named "icon" (apps section has both icon and screenshot)
  const extraImageFields = ["icon"];
  for (const field of [...imageFields, ...extraImageFields]) {
    const imgPath = card[field];
    if (typeof imgPath === "string" && imgPath.startsWith("/uploads/")) {
      const absPath = path.join(process.cwd(), "public", imgPath);
      try { if (fs.existsSync(absPath)) fs.unlinkSync(absPath); } catch { /* non-critical */ }
    }
  }

  return NextResponse.json({ ok: true });
}

/* ── PATCH /api/admin/content/[section]/cards/[id] ───────────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { section: string; id: string } }
) {
  if (!await auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section, id } = params;
  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = EditCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { arrayPath, card: newCardData } = parsed.data;

  const content = readContent(section);
  if (!content) return NextResponse.json({ error: "Content file not found" }, { status: 404 });

  const arr = getByPath(content, arrayPath);
  if (!Array.isArray(arr)) {
    return NextResponse.json({ error: "Array not found at path" }, { status: 400 });
  }

  const items = arr as JsonObject[];
  const cardIndex = items.findIndex((c) => c.id === id);
  if (cardIndex === -1) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const oldCard = items[cardIndex];
  const updatedCard: JsonObject = { ...oldCard, ...(newCardData as JsonObject), id };

  /* If image path changed, delete old uploaded image */
  const config = CAROUSEL_CONFIG[section];
  const imageFields = [config.imageField, "icon"].filter(Boolean) as string[];
  for (const field of imageFields) {
    const oldPath = oldCard[field];
    const newPath = updatedCard[field];
    if (
      typeof oldPath === "string" &&
      oldPath.startsWith("/uploads/") &&
      oldPath !== newPath
    ) {
      const absPath = path.join(process.cwd(), "public", oldPath);
      try { if (fs.existsSync(absPath)) fs.unlinkSync(absPath); } catch { /* non-critical */ }
    }
  }

  const newArray = items.map((c, i) => (i === cardIndex ? updatedCard : c));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = setDeep(content as any, arrayPath, newArray);
  if (!writeContent(section, updated)) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, card: updatedCard });
}
