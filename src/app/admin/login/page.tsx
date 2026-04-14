"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const GRADIENT = "linear-gradient(90deg, rgb(233,55,37) 12%, rgb(233,54,77) 34%, rgb(233,54,131) 60%, rgb(233,56,201) 100%)";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        setError(
          retryAfter
            ? `Too many attempts. Try again in ${retryAfter} seconds.`
            : "Too many attempts. Please wait before trying again."
        );
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid credentials");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#100706] flex items-center justify-center px-5">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #faf5f5 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-block font-righteous text-2xl">
            <span className="text-[#0ff216]">Go</span>
            <span className="text-[#faf5f5]"> Turkmenistan</span>
          </a>
          <p className="font-inter text-sm text-[rgba(250,245,245,0.4)] mt-2 tracking-[0.5px] uppercase">
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="bg-[rgba(250,245,245,0.04)] border border-[#434343] rounded-[20px] px-8 py-10">
          <h1 className="font-righteous text-[22px] text-[#faf5f5] mb-1">Welcome back</h1>
          <p className="font-inter text-sm text-[rgba(250,245,245,0.4)] mb-8">
            Sign in to manage your content
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="username"
                className="font-inter text-xs text-[rgba(250,245,245,0.5)] uppercase tracking-[0.8px]"
              >
                Username
              </label>
              <input
                ref={usernameRef}
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="admin"
                className="w-full h-[48px] bg-[rgba(250,245,245,0.06)] border border-[rgba(67,67,67,0.8)] rounded-lg px-4 font-inter text-sm text-[#faf5f5] placeholder-[rgba(250,245,245,0.2)] outline-none transition-colors focus:border-[rgba(250,245,245,0.3)]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="font-inter text-xs text-[rgba(250,245,245,0.5)] uppercase tracking-[0.8px]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full h-[48px] bg-[rgba(250,245,245,0.06)] border border-[rgba(67,67,67,0.8)] rounded-lg px-4 font-inter text-sm text-[#faf5f5] placeholder-[rgba(250,245,245,0.2)] outline-none transition-colors focus:border-[rgba(250,245,245,0.3)]"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-[rgba(233,55,37,0.12)] border border-[rgba(233,55,37,0.3)] rounded-lg px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <path
                    d="M8 5v4M8 11h.01M1.5 13.5h13L8 2.5 1.5 13.5z"
                    stroke="#e93725"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-inter text-sm text-[#e97572]">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ background: GRADIENT }}
              className="w-full h-[50px] rounded-lg font-righteous text-sm uppercase tracking-[0.28px] text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <p className="text-center mt-6">
          <a
            href="/"
            className="font-inter text-sm text-[rgba(250,245,245,0.35)] hover:text-[rgba(250,245,245,0.65)] transition-colors"
          >
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
