/**
 * authStore — runtime password & last-login persistence.
 *
 * Priority for reading the password hash:
 *   1. /content/.auth.json  (written on every password change; works on any host)
 *   2. process.env.ADMIN_PASSWORD_HASH  (initial value from .env.local)
 *
 * On password change we write to BOTH places:
 *   • .auth.json  → takes effect immediately, no restart needed
 *   • .env.local  → kept in sync for local dev (ignored if the file is read-only)
 *
 * Note: .auth.json is git-ignored to avoid committing the hash.
 */

import fs from "fs";
import path from "path";

const AUTH_JSON_PATH = path.join(process.cwd(), "content", ".auth.json");
const ENV_LOCAL_PATH = path.join(process.cwd(), ".env.local");

interface AuthStore {
  passwordHash?: string;
  lastLogin?: string;
}

/* ── Low-level read / write ─────────────────────────────────────────────── */

function readStore(): AuthStore {
  try {
    return JSON.parse(fs.readFileSync(AUTH_JSON_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writeStore(patch: Partial<AuthStore>): void {
  const current = readStore();
  const next = { ...current, ...patch };
  fs.writeFileSync(AUTH_JSON_PATH, JSON.stringify(next, null, 2) + "\n", "utf-8");
}

/* ── Public API ─────────────────────────────────────────────────────────── */

/** Returns the active password hash (authStore first, then env var). */
export function getPasswordHash(): string {
  const store = readStore();
  return store.passwordHash ?? process.env.ADMIN_PASSWORD_HASH ?? "";
}

/** Persists a new password hash. Also patches .env.local if writable. */
export function setPasswordHash(hash: string): void {
  writeStore({ passwordHash: hash });

  // Best-effort: keep .env.local in sync for local development
  try {
    let env = fs.readFileSync(ENV_LOCAL_PATH, "utf-8");
    if (/^ADMIN_PASSWORD_HASH=/m.test(env)) {
      env = env.replace(/^ADMIN_PASSWORD_HASH=.*$/m, `ADMIN_PASSWORD_HASH=${hash}`);
    } else {
      env += `\nADMIN_PASSWORD_HASH=${hash}\n`;
    }
    fs.writeFileSync(ENV_LOCAL_PATH, env, "utf-8");
  } catch {
    // Read-only filesystem (e.g. Vercel) — .auth.json is the source of truth
  }
}

/** Returns ISO string of last successful login, or null if never recorded. */
export function getLastLogin(): string | null {
  return readStore().lastLogin ?? null;
}

/** Records the current timestamp as the last successful login. */
export function setLastLogin(): void {
  writeStore({ lastLogin: new Date().toISOString() });
}
