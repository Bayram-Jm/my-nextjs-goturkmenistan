import type { Viewport } from "next";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin — Go Turkmenistan",
};

// Force light mode for admin — prevent OS dark-mode from affecting the UI
export const viewport: Viewport = {
  colorScheme: "light",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(COOKIE_NAME)?.value;
  let username = "admin";
  if (token) {
    const payload = await verifyToken(token);
    if (payload) username = payload.username;
  }

  return <AdminShell username={username}>{children}</AdminShell>;
}
