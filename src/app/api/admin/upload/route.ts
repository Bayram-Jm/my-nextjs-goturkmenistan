import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { setDeep, getByPath } from "@/lib/jsonUtils";
import imageSpecs from "../../../../../content/image-specs.json";
import { normalizePathForSpec } from "@/lib/jsonUtils";
import { getContent, setContent, uploadImage, deleteImage } from "@/lib/contentStore";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const ALLOWED_SECTIONS = [
  "hero", "ashgabat", "events", "heritage", "nature",
  "cuisine", "paywithease", "tours", "apps", "footer",
] as const;

type AllowedSection = (typeof ALLOWED_SECTIONS)[number];

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/* ─── POST /api/admin/upload ─────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  /* ── Auth ─────────────────────────────────────────────────────────────── */
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  /* ── Parse form data ──────────────────────────────────────────────────── */
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const section = formData.get("section") as string | null;
  const fieldPath = formData.get("fieldPath") as string | null;
  const optimize = formData.get("optimize") === "true";
  const skipSave = formData.get("skipSave") === "true";

  if (!file || !section || !fieldPath) {
    return NextResponse.json({ error: "Missing file, section, or fieldPath" }, { status: 400 });
  }

  /* ── Validate section ─────────────────────────────────────────────────── */
  if (!(ALLOWED_SECTIONS as readonly string[]).includes(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  /* ── Validate file type ───────────────────────────────────────────────── */
  const mimeExt = MIME_TO_EXT[file.type];
  if (!mimeExt) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 400 }
    );
  }

  /* ── Check against spec (size + format) ───────────────────────────────── */
  const sectionSpecs = (imageSpecs as Record<string, Record<string, { maxFileSizeMB: number; allowedFormats: string[] }>>)[section];
  const specKey = normalizePathForSpec(fieldPath);
  const spec = sectionSpecs?.[specKey] ?? null;

  if (spec) {
    const maxBytes = spec.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${spec.maxFileSizeMB} MB.` },
        { status: 400 }
      );
    }
    if (!spec.allowedFormats.includes(mimeExt)) {
      return NextResponse.json(
        { error: `Format not allowed. Accepted: ${spec.allowedFormats.join(", ")}.` },
        { status: 400 }
      );
    }
  }

  /* ── Read current content to find old image path ──────────────────────── */
  let currentContent: Record<string, unknown> = {};
  try {
    currentContent = await getContent(section);
  } catch {
    // Non-fatal — content might not exist yet
  }
  const oldPath = getByPath(currentContent, fieldPath) as string | undefined;

  /* ── Determine output extension ───────────────────────────────────────── */
  const outExt = optimize ? "webp" : mimeExt;
  const outContentType = optimize ? "image/webp" : file.type;

  /* ── Generate unique filename ─────────────────────────────────────────── */
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  const filename = `${ts}-${rand}.${outExt}`;

  /* ── Process image buffer ─────────────────────────────────────────────── */
  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes) as Buffer;

  if (optimize) {
    let sharpFn: ((buf: Buffer) => { webp: (opts: { quality: number }) => { toBuffer: () => Promise<Buffer> } }) | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sharpFn = (await import("sharp")).default as any;
    } catch {
      // sharp not available — save original
    }
    if (sharpFn) {
      buffer = (await sharpFn(buffer).webp({ quality: 85 }).toBuffer()) as Buffer;
    }
  }

  /* ── Upload image ─────────────────────────────────────────────────────── */
  let newPublicPath: string;
  try {
    newPublicPath = await uploadImage(section as AllowedSection, filename, buffer, outContentType);
  } catch (err) {
    console.error("Failed to upload image:", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }

  if (!skipSave) {
    /* ── Update content JSON with new image path ────────────────────────── */
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = setDeep(currentContent as any, fieldPath, newPublicPath);
      await setContent(section, updated);
    } catch (err) {
      console.error("Failed to update content JSON:", err);
      // Return success anyway — image was saved, JSON update can be retried
    }

    /* ── Delete old image if it was a previously uploaded file ─────────── */
    if (oldPath) {
      await deleteImage(oldPath);
    }
  }

  return NextResponse.json({ ok: true, path: newPublicPath });
}
