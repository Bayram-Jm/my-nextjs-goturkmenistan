import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { setDeep, getByPath } from "@/lib/jsonUtils";
import imageSpecs from "../../../../../content/image-specs.json";
import { normalizePathForSpec } from "@/lib/jsonUtils";

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
  // skipSave=true: upload the file and return the path but do NOT update the
  // content JSON or delete the old file. Used by the "add/edit card" modal.
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

  /* ── Read current content JSON to find old path ───────────────────────── */
  const contentFilePath = path.join(process.cwd(), "content", `${section}.json`);
  let currentContent: Record<string, unknown> = {};
  try {
    currentContent = JSON.parse(fs.readFileSync(contentFilePath, "utf-8"));
  } catch {
    // Non-fatal — content file might not exist yet
  }
  const oldPath = getByPath(currentContent, fieldPath) as string | undefined;

  /* ── Determine output extension ───────────────────────────────────────── */
  const outExt = optimize ? "webp" : mimeExt;

  /* ── Generate unique filename ─────────────────────────────────────────── */
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  const filename = `${ts}-${rand}.${outExt}`;

  /* ── Ensure uploads directory exists ─────────────────────────────────── */
  const uploadsDir = path.join(process.cwd(), "public", "uploads", section as AllowedSection);
  fs.mkdirSync(uploadsDir, { recursive: true });

  /* ── Process and save file ────────────────────────────────────────────── */
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const outPath = path.join(uploadsDir, filename);

  if (optimize) {
    let sharpFn: ((buf: Buffer) => { webp: (opts: { quality: number }) => { toBuffer: () => Promise<Buffer> } }) | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sharpFn = (await import("sharp")).default as any;
    } catch {
      // sharp not available — fall back to saving original
    }
    if (sharpFn) {
      const optimized = await sharpFn(buffer).webp({ quality: 85 }).toBuffer();
      fs.writeFileSync(outPath, optimized);
    } else {
      fs.writeFileSync(outPath, buffer);
    }
  } else {
    fs.writeFileSync(outPath, buffer);
  }

  /* ── Public path for the new file ────────────────────────────────────── */
  const newPublicPath = `/uploads/${section}/${filename}`;

  if (!skipSave) {
    /* ── Update content JSON with new path ─────────────────────────────── */
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = setDeep(currentContent as any, fieldPath, newPublicPath);
      fs.writeFileSync(contentFilePath, JSON.stringify(updated, null, 2) + "\n", "utf-8");
    } catch (err) {
      console.error("Failed to update content JSON:", err);
      // Return success anyway — image was saved, JSON update can be retried
    }

    /* ── Delete old file if it was a previously uploaded file ──────────── */
    if (oldPath && oldPath.startsWith("/uploads/")) {
      const oldAbsPath = path.join(process.cwd(), "public", oldPath);
      try {
        if (fs.existsSync(oldAbsPath)) fs.unlinkSync(oldAbsPath);
      } catch {
        // Non-critical
      }
    }
  }

  return NextResponse.json({ ok: true, path: newPublicPath });
}
