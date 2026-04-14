import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getPasswordHash, setPasswordHash } from "@/lib/authStore";

/* ─── Schema ─────────────────────────────────────────────────────────────── */
const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256)
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
});

/* ─── POST /api/admin/change-password ───────────────────────────────────── */
export async function POST(req: NextRequest) {
  /* ── Auth ─────────────────────────────────────────────────────────────── */
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  /* ── Parse + validate body ────────────────────────────────────────────── */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ error: firstIssue.message }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  /* ── Verify current password ──────────────────────────────────────────── */
  const currentHash = getPasswordHash();
  if (!currentHash) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const matches = await bcrypt.compare(currentPassword, currentHash);
  if (!matches) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must differ from the current one" },
      { status: 400 }
    );
  }

  /* ── Hash and persist ─────────────────────────────────────────────────── */
  const newHash = await bcrypt.hash(newPassword, 12);
  setPasswordHash(newHash);

  /* ── Sign the user out ────────────────────────────────────────────────── */
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
