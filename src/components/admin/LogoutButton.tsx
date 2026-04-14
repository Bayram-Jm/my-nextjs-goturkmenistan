"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="font-inter text-sm text-[rgba(250,245,245,0.4)] border border-[#434343] rounded-lg px-5 py-2.5 hover:border-[rgba(250,245,245,0.3)] hover:text-[rgba(250,245,245,0.7)] transition-colors"
    >
      Sign out
    </button>
  );
}
