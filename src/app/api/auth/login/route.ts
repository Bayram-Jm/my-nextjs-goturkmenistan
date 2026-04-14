import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { getPasswordHash, setLastLogin } from "@/lib/authStore";
import { checkRateLimit, getRetryAfter } from "@/lib/rateLimiter";

const LoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(256),
});

export async function POST(req: NextRequest) {
  /* ── Rate limiting: max 5 attempts per minute per IP ─────────────────── */
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  if (!checkRateLimit(`login:${ip}`, 5, 60_000)) {
    const retryAfter = getRetryAfter(`login:${ip}`);
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  /* ── Parse + validate body ────────────────────────────────────────────── */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const { username, password } = parsed.data;

  /* ── Authenticate ─────────────────────────────────────────────────────── */
  const validUsername = process.env.ADMIN_USERNAME;
  const passwordHash = getPasswordHash(); // authStore first, env var fallback

  if (!validUsername || !passwordHash) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const usernameMatch = username === validUsername;
  const passwordMatch = await bcrypt.compare(password, passwordHash);

  if (!usernameMatch || !passwordMatch) {
    // Constant-time: both checks always run to prevent timing attacks
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  setLastLogin();

  const token = await signToken(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
