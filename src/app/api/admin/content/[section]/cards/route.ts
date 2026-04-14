import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getByPath, setDeep } from "@/lib/jsonUtils";
import type { JsonObject } from "@/lib/jsonUtils";
import { CAROUSEL_CONFIG } from "@/lib/carouselConfig";

const ALLOWED_SECTIONS = Object.keys(CAROUSEL_CONFIG);

const AddCardSchema = z.object({
  arrayPath: z.string().min(1, "arrayPath required"),
  card: z.record(z.string(), z.unknown()),
});

/* ── POST /api/admin/content/[section]/cards ─────────────────────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: { section: string } }
) {
  /* Auth */
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  /* Validate section */
  const { section } = params;
  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  /* Parse body */
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = AddCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { arrayPath, card } = parsed.data;

  /* Read content file */
  const filePath = path.join(process.cwd(), "content", `${section}.json`);
  let content: JsonObject;
  try {
    content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return NextResponse.json({ error: "Content file not found" }, { status: 404 });
  }

  /* Get the array */
  const arr = getByPath(content, arrayPath);
  if (!Array.isArray(arr)) {
    return NextResponse.json({ error: "Array not found at path" }, { status: 400 });
  }

  /* Check max cards limit */
  const config = CAROUSEL_CONFIG[section];
  if (arr.length >= config.maxCards) {
    return NextResponse.json(
      { error: `Maximum ${config.maxCards} cards allowed` },
      { status: 400 }
    );
  }

  /* Generate id if not provided */
  const newCard: JsonObject = {
    id: crypto.randomUUID(),
    ...(card as JsonObject),
  };
  // If card already has a valid id, keep it
  if (typeof (card as JsonObject).id === "string" && (card as JsonObject).id) {
    newCard.id = (card as JsonObject).id as string;
  }

  /* Append and save */
  const newArray = [...arr, newCard];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = setDeep(content as any, arrayPath, newArray);
  try {
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + "\n", "utf-8");
  } catch (err) {
    console.error("Failed to write content file:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, card: newCard });
}
