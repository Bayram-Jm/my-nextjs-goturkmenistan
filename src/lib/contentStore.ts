/**
 * contentStore – abstracts content JSON and image storage.
 *
 * Local dev  : reads/writes content/*.json files and public/uploads directly.
 * Production : reads/writes via Vercel Blob (requires BLOB_READ_WRITE_TOKEN).
 *              Vercel sets this automatically when you add a Blob store.
 */

import path from "path";
import fs from "fs";

export type JsonObject = Record<string, unknown>;

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

/* ── Read one section ───────────────────────────────────────────────────── */

export async function getContent(section: string): Promise<JsonObject> {
  if (USE_BLOB) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: `content/${section}.json`, limit: 1 });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        if (res.ok) return res.json() as Promise<JsonObject>;
      }
    } catch (err) {
      console.error(`[contentStore] Blob read failed for "${section}":`, err);
    }
  }
  const fp = path.join(process.cwd(), "content", `${section}.json`);
  return JSON.parse(fs.readFileSync(fp, "utf-8")) as JsonObject;
}

/* ── Read all sections in one round trip ────────────────────────────────── */

export async function getAllContent(
  sections: readonly string[]
): Promise<Record<string, JsonObject>> {
  if (USE_BLOB) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: "content/", limit: 50 });
      const urlMap = new Map(
        blobs.map((b) => [
          b.pathname.replace(/^content\//, "").replace(/\.json$/, ""),
          b.url,
        ])
      );
      const entries = await Promise.all(
        sections.map(async (section) => {
          const url = urlMap.get(section);
          if (url) {
            try {
              const res = await fetch(url, { cache: "no-store" });
              if (res.ok)
                return [section, await res.json()] as [string, JsonObject];
            } catch {}
          }
          // Blob entry not yet seeded — fall back to local file
          const fp = path.join(process.cwd(), "content", `${section}.json`);
          return [section, JSON.parse(fs.readFileSync(fp, "utf-8"))] as [
            string,
            JsonObject,
          ];
        })
      );
      return Object.fromEntries(entries);
    } catch (err) {
      console.error("[contentStore] getAllContent failed:", err);
    }
  }
  return Object.fromEntries(
    sections.map((section) => {
      const fp = path.join(process.cwd(), "content", `${section}.json`);
      return [section, JSON.parse(fs.readFileSync(fp, "utf-8"))];
    })
  );
}

/* ── Write one section ──────────────────────────────────────────────────── */

export async function setContent(section: string, data: unknown): Promise<void> {
  if (USE_BLOB) {
    const { put } = await import("@vercel/blob");
    await put(`content/${section}.json`, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return;
  }
  const fp = path.join(process.cwd(), "content", `${section}.json`);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/* ── Upload image ───────────────────────────────────────────────────────── */

export async function uploadImage(
  section: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (USE_BLOB) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${section}/${filename}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }
  const uploadsDir = path.join(process.cwd(), "public", "uploads", section);
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `/uploads/${section}/${filename}`;
}

/* ── Delete image ───────────────────────────────────────────────────────── */

export async function deleteImage(imagePath: string): Promise<void> {
  if (!imagePath) return;
  if (USE_BLOB && imagePath.startsWith("https://")) {
    try {
      const { del } = await import("@vercel/blob");
      await del(imagePath);
    } catch {
      /* non-critical */
    }
    return;
  }
  if (imagePath.startsWith("/uploads/")) {
    try {
      const absPath = path.join(process.cwd(), "public", imagePath);
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
    } catch {
      /* non-critical */
    }
  }
}
