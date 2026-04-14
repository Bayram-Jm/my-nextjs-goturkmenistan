import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

/* ─── GET /api/admin/backup ──────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  /* ── Auth ─────────────────────────────────────────────────────────────── */
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  /* ── Build ZIP ────────────────────────────────────────────────────────── */
  const zip = new AdmZip();

  const contentDir = path.join(process.cwd(), "content");
  if (fs.existsSync(contentDir)) {
    for (const file of fs.readdirSync(contentDir)) {
      // Exclude .auth.json — it contains the password hash
      if (file === ".auth.json") continue;
      const filePath = path.join(contentDir, file);
      if (fs.statSync(filePath).isFile()) {
        zip.addLocalFile(filePath, "content");
      }
    }
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (fs.existsSync(uploadsDir)) {
    zip.addLocalFolder(uploadsDir, "uploads");
  }

  const buffer = zip.toBuffer();
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="goturkmenistan-backup-${date}.zip"`,
      "Content-Length": String(buffer.length),
    },
  });
}
