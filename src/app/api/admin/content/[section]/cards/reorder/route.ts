import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getByPath, setDeep } from "@/lib/jsonUtils";
import type { JsonObject } from "@/lib/jsonUtils";
import { CAROUSEL_CONFIG } from "@/lib/carouselConfig";
import { getContent, setContent } from "@/lib/contentStore";

const ALLOWED_SECTIONS = Object.keys(CAROUSEL_CONFIG);

const ReorderSchema = z.object({
  arrayPath: z.string().min(1, "arrayPath required"),
  orderedIds: z.array(z.string()),
});

/* ── PATCH /api/admin/content/[section]/cards/reorder ────────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { section: string } }
) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = params;
  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = ReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { arrayPath, orderedIds } = parsed.data;

  let content: JsonObject;
  try {
    content = await getContent(section) as JsonObject;
  } catch {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const arr = getByPath(content, arrayPath);
  if (!Array.isArray(arr)) {
    return NextResponse.json({ error: "Array not found at path" }, { status: 400 });
  }

  const itemsById = new Map(
    (arr as JsonObject[]).map((item) => [item.id as string, item])
  );
  const sorted: JsonObject[] = [];
  for (const id of orderedIds) {
    const item = itemsById.get(id);
    if (item) sorted.push(item);
  }
  for (const item of arr as JsonObject[]) {
    if (!orderedIds.includes(item.id as string)) sorted.push(item);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = setDeep(content as any, arrayPath, sorted);
  try {
    await setContent(section, updated);
  } catch (err) {
    console.error("Failed to save:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
