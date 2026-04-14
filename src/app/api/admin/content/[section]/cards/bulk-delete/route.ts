import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getByPath, setDeep } from "@/lib/jsonUtils";
import type { JsonObject } from "@/lib/jsonUtils";
import { CAROUSEL_CONFIG } from "@/lib/carouselConfig";
import { getContent, setContent, deleteImage } from "@/lib/contentStore";

const ALLOWED_SECTIONS = Object.keys(CAROUSEL_CONFIG);

const BulkDeleteSchema = z.object({
  arrayPath: z.string().min(1, "arrayPath required"),
  ids: z.array(z.string()).min(1, "At least one id required"),
});

/* ── POST /api/admin/content/[section]/cards/bulk-delete ─────────────── */
export async function POST(
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
  const parsed = BulkDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { arrayPath, ids } = parsed.data;
  const idSet = new Set(ids);

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

  const items = arr as JsonObject[];
  const remaining = items.filter((c) => !idSet.has(c.id as string));

  if (remaining.length === 0) {
    return NextResponse.json(
      { error: "Cannot delete all cards — at least one must remain" },
      { status: 400 }
    );
  }

  const deleted = items.filter((c) => idSet.has(c.id as string));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = setDeep(content as any, arrayPath, remaining);
  try {
    await setContent(section, updated);
  } catch (err) {
    console.error("Failed to save:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  /* Delete uploaded images for removed cards */
  const config = CAROUSEL_CONFIG[section];
  const imageFields = [config.imageField, "icon"].filter(Boolean) as string[];
  for (const card of deleted) {
    for (const field of imageFields) {
      const imgPath = card[field];
      if (typeof imgPath === "string" && imgPath) {
        await deleteImage(imgPath);
      }
    }
  }

  return NextResponse.json({ ok: true, deleted: deleted.length });
}
