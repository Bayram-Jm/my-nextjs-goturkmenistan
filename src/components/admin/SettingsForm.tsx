"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  KeyRound,
  Eye,
  EyeOff,
  User,
  Globe,
  Download,
  ShieldCheck,
  Clock,
  Layers,
  HardDrive,
  Loader2,
  X,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface SettingsProps {
  username: string;
  lastLogin: string | null;   // Human-readable string from server
  sectionCount: number;
  uploadsSizeKB: number;
}

/* ─── Password strength ──────────────────────────────────────────────────── */
interface Strength {
  bars: number;    // 0–4
  label: string;
  color: string;
}

function getStrength(pwd: string): Strength {
  if (!pwd) return { bars: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (/[a-z]/.test(pwd))         score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^a-zA-Z0-9]/.test(pwd))  score++;

  if (score <= 1) return { bars: 1, label: "Weak",   color: "#ef4444" };
  if (score === 2) return { bars: 2, label: "Fair",   color: "#f97316" };
  if (score === 3) return { bars: 3, label: "Good",   color: "#eab308" };
  return            { bars: 4, label: "Strong", color: "#22c55e" };
}

/* ─── Client-side validation (mirrors server) ────────────────────────────── */
function validateNewPassword(pwd: string): string | null {
  if (pwd.length < 8)        return "Minimum 8 characters";
  if (!/[a-z]/.test(pwd))    return "Must include a lowercase letter";
  if (!/[A-Z]/.test(pwd))    return "Must include an uppercase letter";
  if (!/[0-9]/.test(pwd))    return "Must include a number";
  return null;
}

/* ─── Style helpers ──────────────────────────────────────────────────────── */
const GRADIENT =
  "linear-gradient(90deg, rgb(233,55,37) 12%, rgb(233,54,77) 34%, rgb(233,54,131) 60%, rgb(233,56,201) 100%)";

function inputClass(hasError = false) {
  return `w-full h-10 px-3.5 font-inter text-sm text-[#100706] bg-white border rounded-lg outline-none transition-colors ${
    hasError
      ? "border-[#e93725] focus:border-[#e93725]"
      : "border-[#e0dada] focus:border-[#f01e0e]"
  }`;
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[16px] border border-[#ede9e8] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f2eeee] bg-[#faf8f8]">
        <Icon size={16} className="text-[#9e9090]" />
        <span className="font-righteous text-sm text-[#100706]">{title}</span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <label className="block font-inter text-xs text-[#9e9090] uppercase tracking-[0.7px] mb-1.5">
      {label}
    </label>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function SettingsForm({
  username,
  lastLogin,
  sectionCount,
  uploadsSizeKB,
}: SettingsProps) {
  const router = useRouter();

  /* ── Password form state ─────────────────────────────────────────────── */
  const [currentPwd, setCurrentPwd]     = useState("");
  const [newPwd, setNewPwd]             = useState("");
  const [confirmPwd, setConfirmPwd]     = useState("");
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [pwdErrors, setPwdErrors]       = useState<Record<string, string>>({});
  const [isChanging, setIsChanging]     = useState(false);
  const [showModal, setShowModal]       = useState(false);

  /* ── Backup state ────────────────────────────────────────────────────── */
  const [isDownloading, setIsDownloading] = useState(false);

  const strength = getStrength(newPwd);

  /* ── Password validation ─────────────────────────────────────────────── */
  function validatePwdForm(): boolean {
    const errs: Record<string, string> = {};
    if (!currentPwd) errs.current = "Required";
    const complexErr = validateNewPassword(newPwd);
    if (complexErr) errs.new = complexErr;
    if (newPwd && confirmPwd && newPwd !== confirmPwd)
      errs.confirm = "Passwords do not match";
    if (!confirmPwd) errs.confirm = "Required";
    setPwdErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handlePasswordSubmit() {
    if (!validatePwdForm()) return;
    setShowModal(true);
  }

  async function handleConfirmedChange() {
    setShowModal(false);
    setIsChanging(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Password changed — please sign in again");
        // Give the toast time to show, then redirect to login
        setTimeout(() => router.push("/admin/login"), 1800);
      } else {
        const field = (data as { error?: string }).error?.toLowerCase().includes("current")
          ? "current"
          : "new";
        setPwdErrors({ [field]: (data as { error?: string }).error ?? "Failed" });
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setIsChanging(false);
    }
  }

  /* ── Backup download ─────────────────────────────────────────────────── */
  async function handleBackup() {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) {
        toast.error("Backup failed — please try again");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `goturkmenistan-backup-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } catch {
      toast.error("Backup failed — network error");
    } finally {
      setIsDownloading(false);
    }
  }

  /* ── Formatted uploads size ──────────────────────────────────────────── */
  function fmtSize(kb: number): string {
    if (kb === 0) return "0 B";
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  return (
    <>
      {/* ── Confirm modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9e9090] hover:text-[#524442] hover:bg-[#f3efef] transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-11 h-11 rounded-xl bg-[rgba(240,30,14,0.08)] flex items-center justify-center mb-4">
              <KeyRound size={20} className="text-[#f01e0e]" />
            </div>

            <h3 className="font-righteous text-lg text-[#100706] mb-1">
              Change password?
            </h3>
            <p className="font-inter text-sm text-[#7a6f6e] mb-6">
              You will be signed out immediately after your password is changed
              and will need to log in again with the new password.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-10 font-inter text-sm text-[#524442] border border-[#e0dada] rounded-lg hover:bg-[#f8f5f5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedChange}
                style={{ background: GRADIENT }}
                className="flex-1 h-10 font-inter text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Yes, change it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[720px] flex flex-col gap-6">
        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(124,77,255,0.08)] flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={22} className="text-[#7c4dff]" />
          </div>
          <div>
            <h1 className="font-righteous text-[28px] text-[#100706]">Settings</h1>
            <p className="font-inter text-sm text-[#7a6f6e] mt-0.5">
              Account security and site management
            </p>
          </div>
        </div>

        {/* ── Card 1: Change Password ────────────────────────────────── */}
        <SectionCard icon={KeyRound} title="Change Password">
          <div className="flex flex-col gap-4">
            {/* Current password */}
            <div>
              <FieldLabel label="Current Password" />
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPwd}
                  onChange={(e) => {
                    setCurrentPwd(e.target.value);
                    if (pwdErrors.current) setPwdErrors((p) => { const n = {...p}; delete n.current; return n; });
                  }}
                  autoComplete="current-password"
                  className={`${inputClass(!!pwdErrors.current)} pr-10`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5afae] hover:text-[#524442] transition-colors"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwdErrors.current && (
                <p className="font-inter text-xs text-[#e93725] mt-1">{pwdErrors.current}</p>
              )}
            </div>

            {/* New password + strength */}
            <div>
              <FieldLabel label="New Password" />
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => {
                    setNewPwd(e.target.value);
                    if (pwdErrors.new) setPwdErrors((p) => { const n = {...p}; delete n.new; return n; });
                  }}
                  autoComplete="new-password"
                  className={`${inputClass(!!pwdErrors.new)} pr-10`}
                  placeholder="Min. 8 chars, upper, lower, number"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5afae] hover:text-[#524442] transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwdErrors.new && (
                <p className="font-inter text-xs text-[#e93725] mt-1">{pwdErrors.new}</p>
              )}

              {/* Strength indicator */}
              {newPwd && (
                <div className="mt-2 flex items-center gap-2.5">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="h-1.5 flex-1 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor:
                            n <= strength.bars ? strength.color : "#e8e3e3",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="font-inter text-xs font-medium w-12 text-right"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <FieldLabel label="Confirm New Password" />
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => {
                    setConfirmPwd(e.target.value);
                    if (pwdErrors.confirm) setPwdErrors((p) => { const n = {...p}; delete n.confirm; return n; });
                  }}
                  autoComplete="new-password"
                  className={`${inputClass(!!pwdErrors.confirm)} pr-10`}
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5afae] hover:text-[#524442] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwdErrors.confirm && (
                <p className="font-inter text-xs text-[#e93725] mt-1">{pwdErrors.confirm}</p>
              )}
            </div>

            {/* Requirements hint */}
            <p className="font-inter text-xs text-[#b5afae]">
              Requirements: 8+ characters · uppercase · lowercase · number
            </p>

            <div className="pt-1">
              <button
                onClick={handlePasswordSubmit}
                disabled={isChanging}
                style={{ background: GRADIENT }}
                className="inline-flex items-center gap-2 font-inter text-sm text-white rounded-lg px-6 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isChanging ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Changing…
                  </>
                ) : (
                  <>
                    <KeyRound size={14} />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Card 2: Account ────────────────────────────────────────── */}
        <SectionCard icon={User} title="Account">
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
            <div>
              <FieldLabel label="Username" />
              <div className="flex items-center gap-2 h-10 px-3.5 bg-[#faf8f8] border border-[#e8e3e3] rounded-lg">
                <User size={14} className="text-[#b5afae] flex-shrink-0" />
                <span className="font-inter text-sm text-[#524442]">{username}</span>
              </div>
              <p className="font-inter text-[11px] text-[#b5afae] mt-1">
                Username cannot be changed here
              </p>
            </div>

            <div>
              <FieldLabel label="Last Login" />
              <div className="flex items-center gap-2 h-10 px-3.5 bg-[#faf8f8] border border-[#e8e3e3] rounded-lg">
                <Clock size={14} className="text-[#b5afae] flex-shrink-0" />
                <span className="font-inter text-sm text-[#524442]">
                  {lastLogin ?? "Not recorded yet"}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Card 3: Site ───────────────────────────────────────────── */}
        <SectionCard icon={Globe} title="Site">
          <div className="flex flex-col gap-5">
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 bg-[#faf8f8] border border-[#f0ecec] rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#e8e3e3] flex items-center justify-center flex-shrink-0">
                  <Layers size={15} className="text-[#9e9090]" />
                </div>
                <div>
                  <p className="font-righteous text-xl text-[#100706] leading-none">
                    {sectionCount}
                  </p>
                  <p className="font-inter text-xs text-[#9e9090] mt-0.5">Sections</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#faf8f8] border border-[#f0ecec] rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#e8e3e3] flex items-center justify-center flex-shrink-0">
                  <HardDrive size={15} className="text-[#9e9090]" />
                </div>
                <div>
                  <p className="font-righteous text-xl text-[#100706] leading-none">
                    {fmtSize(uploadsSizeKB)}
                  </p>
                  <p className="font-inter text-xs text-[#9e9090] mt-0.5">Uploaded</p>
                </div>
              </div>
            </div>

            {/* Backup */}
            <div className="flex items-start justify-between gap-4 p-4 bg-[#faf8f8] border border-[#f0ecec] rounded-xl">
              <div>
                <p className="font-inter text-sm font-medium text-[#100706]">
                  Content Backup
                </p>
                <p className="font-inter text-xs text-[#9e9090] mt-0.5">
                  Downloads a ZIP with all content JSON files and uploaded images.
                </p>
              </div>
              <button
                onClick={handleBackup}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 font-inter text-sm text-[#524442] border border-[#e0dada] rounded-lg px-4 py-2 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isDownloading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {isDownloading ? "Downloading…" : "Download"}
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
