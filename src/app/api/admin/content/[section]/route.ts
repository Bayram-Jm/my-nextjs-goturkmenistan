import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getContent, setContent } from "@/lib/contentStore";

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

  // ── Write ────────────────────────────────────────────────────────
  try {
    await setContent(section, body);
  } catch (err) {
    console.error("Failed to write content:", err);
    return NextResponse.json(
      { error: "Failed to write content file" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { section: string } }
) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = params;
  if (!isAllowed(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  try {
    const content = await getContent(section);
    return NextResponse.json(content);
  } catch (err) {
    console.error("Failed to read content:", err);
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }
}
