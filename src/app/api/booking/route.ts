import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/* ─── Config ─────────────────────────────────────────────────────────────── */
const TO_EMAIL = process.env.BOOKING_TO_EMAIL || "info@go-turkmenistan.com";
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL || "Go Turkmenistan <onboarding@resend.dev>";

/* ─── Schema ─────────────────────────────────────────────────────────────── */
const BookingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(200),
  phone: z.string().trim().min(3, "Phone number is required").max(40),
  startDate: z.string().trim().max(20).optional().default(""),
  endDate: z.string().trim().max(20).optional().default(""),
  tour: z.string().trim().max(200).optional().default(""),
  // Honeypot — real users never fill this
  website: z.string().max(0).optional(),
});

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/* ─── POST /api/booking ──────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  /* ── Parse + validate body ────────────────────────────────────────────── */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    // Honeypot hit: pretend success so bots don't retry
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { fullName, email, phone, startDate, endDate, tour } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[booking] RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Booking service is not configured" }, { status: 500 });
  }

  /* ── Build email ──────────────────────────────────────────────────────── */
  const rows: [string, string][] = [
    ["Full name", fullName],
    ["Email", email],
    ["Phone", phone],
    ["Arrival date", startDate || "—"],
    ["Departure date", endDate || "—"],
    ["Tour", tour || "—"],
  ];
  const html = `
    <h2 style="font-family:sans-serif">New booking request</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#666">${k}</td><td style="padding:6px 0"><strong>${escapeHtml(v)}</strong></td></tr>`
        )
        .join("")}
    </table>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  /* ── Send via Resend ──────────────────────────────────────────────────── */
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: email,
      subject: `New booking: ${fullName}${tour ? ` — ${tour}` : ""}`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    console.error("[booking] Resend error", res.status, await res.text());
    return NextResponse.json({ error: "Could not send booking. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
