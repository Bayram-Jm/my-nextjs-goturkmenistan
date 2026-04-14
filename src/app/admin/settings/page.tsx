import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getLastLogin } from "@/lib/authStore";
import SettingsForm from "@/components/admin/SettingsForm";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatLastLogin(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getUploadsSizeKB(): number {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) return 0;

  let totalBytes = 0;
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        totalBytes += fs.statSync(full).size;
      }
    }
  }
  walk(uploadsDir);
  return Math.round(totalBytes / 1024);
}

const SECTION_COUNT = 10;

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default async function SettingsPage() {
  // Read username from the JWT cookie
  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  const username = payload?.username ?? "admin";

  const lastLogin = formatLastLogin(getLastLogin());
  const uploadsSizeKB = getUploadsSizeKB();

  return (
    <SettingsForm
      username={username}
      lastLogin={lastLogin}
      sectionCount={SECTION_COUNT}
      uploadsSizeKB={uploadsSizeKB}
    />
  );
}
