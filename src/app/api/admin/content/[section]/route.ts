import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

const ALLOWED_SECTIONS = [
  "hero",
  "ashgabat",
  "events",
  "heritage",
  "nature",
  "cuisine",
  "paywithease",
  "tours",
  "apps",
  "footer",
] as const;

type AllowedSection = (typeof ALLOWED_SECTIONS)[number];

function isAllowed(s: string): s is AllowedSection {
  return (ALLOWED_SECTIONS as readonly string[]).includes(s);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { section: string } }
) {
  // ── Auth ─────────────────────────────────────────────────────────
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Validate section ─────────────────────────────────────────────
  const { section } = params;
  if (!isAllowed(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  // ── Parse body ───────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Body must be a JSON object" },
      { status: 400 }
    );
  }

  // ── Write file ───────────────────────────────────────────────────
  const filePath = path.join(process.cwd(), "content", `${section}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2) + "\n", "utf-8");
  } catch (err) {
    console.error("Failed to write content file:", err);
    return NextResponse.json(
      { error: "Failed to write content file" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
