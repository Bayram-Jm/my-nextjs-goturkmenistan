"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  Loader2,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface ImageSpec {
  recommendedWidth: number;
  recommendedHeight: number;
  maxFileSizeMB: number;
  allowedFormats: string[];
  description: string;
}

interface Props {
  label: string;
  currentPath: string;
  fieldPath: string;
  section: string;
  spec: ImageSpec | null;
  onSaved: (newPath: string) => void;
}

type Stage = "idle" | "selected" | "uploading";

interface SelectedFile {
  file: File;
  objectUrl: string;
  formatError: string | null;
  sizeError: string | null;
  dimWarning: string | null;
  optimize: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

const GRADIENT =
  "linear-gradient(90deg, rgb(233,55,37) 12%, rgb(233,54,77) 34%, rgb(233,54,131) 60%, rgb(233,56,201) 100%)";

/* ─── ImageUploader ──────────────────────────────────────────────────────── */
export default function ImageUploader({
  label,
  currentPath,
  fieldPath,
  section,
  spec,
  onSaved,
}: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File validation ───────────────────────────────────────────────── */
  const validateAndSelect = useCallback(
    async (file: File) => {
      const ext = MIME_TO_EXT[file.type] ?? null;
      let formatError: string | null = null;
      let sizeError: string | null = null;
      let dimWarning: string | null = null;

      if (!ext) {
        formatError = `Unsupported format. Use: jpg, png, webp.`;
      } else if (spec && !spec.allowedFormats.includes(ext)) {
        formatError = `Format not allowed. Accepted: ${spec.allowedFormats.join(", ")}.`;
      }

      if (spec && file.size > spec.maxFileSizeMB * 1024 * 1024) {
        sizeError = `File too large (${fmtSize(file.size)}). Max: ${spec.maxFileSizeMB} MB.`;
      }

      const objectUrl = URL.createObjectURL(file);

      // Check dimensions only when there's no format error
      if (!formatError && spec) {
        try {
          const { width, height } = await getImageDimensions(objectUrl);
          const wOk = width === spec.recommendedWidth;
          const hOk = height === spec.recommendedHeight;
          if (!wOk || !hOk) {
            dimWarning = `Dimensions ${width}×${height} differ from recommended ${spec.recommendedWidth}×${spec.recommendedHeight}. Image may appear cropped or stretched.`;
          }
        } catch {
          // Dimension check failed silently
        }
      }

      const canOptimize = !formatError && ext !== "webp";

      setSelected({
        file,
        objectUrl,
        formatError,
        sizeError,
        dimWarning,
        optimize: canOptimize,
      });
      setStage("selected");
      setUploadError(null);
    },
    [spec]
  );

  /* ── Drag handlers ─────────────────────────────────────────────────── */
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  /* ── Cancel selection ──────────────────────────────────────────────── */
  function handleCancel() {
    if (selected) URL.revokeObjectURL(selected.objectUrl);
    setSelected(null);
    setStage("idle");
    setUploadError(null);
  }

  /* ── Upload ────────────────────────────────────────────────────────── */
  async function handleUpload() {
    if (!selected || selected.formatError || selected.sizeError) return;

    setStage("uploading");
    setProgress(0);
    setUploadError(null);

    // Animate fake progress while upload runs
    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 15 : p));
    }, 120);

    try {
      const fd = new FormData();
      fd.append("file", selected.file);
      fd.append("section", section);
      fd.append("fieldPath", fieldPath);
      fd.append("optimize", String(selected.optimize));

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      clearInterval(progressInterval);
      setProgress(100);

      if (res.ok) {
        const data = await res.json();
        URL.revokeObjectURL(selected.objectUrl);
        setSelected(null);
        setStage("idle");
        onSaved(data.path);
      } else {
        const err = await res.json().catch(() => ({}));
        setUploadError((err as { error?: string }).error ?? "Upload failed");
        setStage("selected");
      }
    } catch {
      clearInterval(progressInterval);
      setUploadError("Network error — please try again");
      setStage("selected");
    }
  }

  /* ── Render ────────────────────────────────────────────────────────── */
  const hasCurrentImage = Boolean(currentPath);
  const canUpload = selected && !selected.formatError && !selected.sizeError;

  return (
    <div>
      {/* Label */}
      <label className="block font-inter text-xs text-[#9e9090] uppercase tracking-[0.7px] mb-1.5">
        {label}
      </label>

      {/* ── Idle / current image ───────────────────────────────────────── */}
      {stage === "idle" && (
        <div>
          {/* Current image preview */}
          {hasCurrentImage && (
            <div className="mb-2 rounded-lg overflow-hidden border border-[#e8e3e3] bg-[#faf8f8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPath}
                alt={label}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2 py-5 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              isDragging
                ? "border-[#f01e0e] bg-[rgba(240,30,14,0.04)]"
                : "border-[#e0dada] hover:border-[#c9c0c0] hover:bg-[#faf8f8]"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-[#f3efef] flex items-center justify-center">
              <Upload size={16} className="text-[#9e9090]" />
            </div>
            <p className="font-inter text-sm text-[#7a6f6e] text-center">
              {isDragging ? "Drop to upload" : "Drop image here or click to browse"}
            </p>
            {spec && (
              <p className="font-inter text-[11px] text-[#b5afae] text-center">
                {spec.recommendedWidth}×{spec.recommendedHeight}px · max {spec.maxFileSizeMB} MB ·{" "}
                {spec.allowedFormats.join(", ")}
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* ── File selected ──────────────────────────────────────────────── */}
      {stage === "selected" && selected && (
        <div className="border border-[#e8e3e3] rounded-xl overflow-hidden">
          {/* Preview */}
          <div className="relative bg-[#faf8f8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.objectUrl}
              alt="Preview"
              className="w-full h-40 object-contain"
            />
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow border border-[#e0dada] flex items-center justify-center text-[#9e9090] hover:text-[#524442] transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          {/* File info + validation */}
          <div className="p-3.5 flex flex-col gap-2.5">
            {/* File name + size */}
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon size={14} className="text-[#9e9090] flex-shrink-0" />
              <span className="font-inter text-xs text-[#524442] truncate flex-1">
                {selected.file.name}
              </span>
              <span className="font-inter text-xs text-[#9e9090] flex-shrink-0">
                {fmtSize(selected.file.size)}
              </span>
            </div>

            {/* Format error — red, blocks upload */}
            {selected.formatError && (
              <div className="flex items-start gap-1.5 bg-[rgba(233,55,37,0.07)] border border-[rgba(233,55,37,0.2)] rounded-lg px-2.5 py-2">
                <AlertTriangle size={13} className="text-[#e93725] mt-0.5 flex-shrink-0" />
                <span className="font-inter text-xs text-[#c02010]">{selected.formatError}</span>
              </div>
            )}

            {/* Size error — red, blocks upload */}
            {selected.sizeError && (
              <div className="flex items-start gap-1.5 bg-[rgba(233,55,37,0.07)] border border-[rgba(233,55,37,0.2)] rounded-lg px-2.5 py-2">
                <AlertTriangle size={13} className="text-[#e93725] mt-0.5 flex-shrink-0" />
                <span className="font-inter text-xs text-[#c02010]">{selected.sizeError}</span>
              </div>
            )}

            {/* Dimension warning — yellow, non-blocking */}
            {selected.dimWarning && !selected.formatError && !selected.sizeError && (
              <div className="flex items-start gap-1.5 bg-[rgba(234,179,8,0.08)] border border-[rgba(234,179,8,0.3)] rounded-lg px-2.5 py-2">
                <AlertTriangle size={13} className="text-[#ca8a04] mt-0.5 flex-shrink-0" />
                <span className="font-inter text-xs text-[#92400e]">{selected.dimWarning}</span>
              </div>
            )}

            {/* Upload error from server */}
            {uploadError && (
              <div className="flex items-start gap-1.5 bg-[rgba(233,55,37,0.07)] border border-[rgba(233,55,37,0.2)] rounded-lg px-2.5 py-2">
                <AlertTriangle size={13} className="text-[#e93725] mt-0.5 flex-shrink-0" />
                <span className="font-inter text-xs text-[#c02010]">{uploadError}</span>
              </div>
            )}

            {/* Optimize checkbox — only when valid and not already webp */}
            {canUpload && MIME_TO_EXT[selected.file.type] !== "webp" && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selected.optimize}
                  onChange={(e) =>
                    setSelected((prev) =>
                      prev ? { ...prev, optimize: e.target.checked } : prev
                    )
                  }
                  className="w-4 h-4 accent-[#f01e0e] cursor-pointer"
                />
                <span className="font-inter text-xs text-[#524442]">
                  Optimise on upload (convert to WebP, compress to ~85%)
                </span>
              </label>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 h-8 font-inter text-xs text-[#524442] border border-[#e0dada] rounded-lg hover:bg-[#f8f5f5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!canUpload}
                style={canUpload ? { background: GRADIENT } : undefined}
                className="flex-1 h-8 font-inter text-xs text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#d0c8c8]"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Uploading ──────────────────────────────────────────────────── */}
      {stage === "uploading" && (
        <div className="border border-[#e8e3e3] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="text-[#f01e0e] animate-spin flex-shrink-0" />
            <span className="font-inter text-sm text-[#524442]">Uploading…</span>
            <span className="font-inter text-xs text-[#9e9090] ml-auto">
              {Math.round(progress)}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#f3efef] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%`, background: GRADIENT }}
            />
          </div>
        </div>
      )}

      {/* Current path hint */}
      {stage === "idle" && hasCurrentImage && (
        <p className="font-inter text-[11px] text-[#b5afae] mt-1.5 truncate">
          {currentPath}
        </p>
      )}
    </div>
  );
}

/* ── Success flash (exported for optional use) ────────────────────────────── */
export function UploadSuccessFlash() {
  return (
    <div className="flex items-center gap-1.5 font-inter text-xs text-[#16a34a]">
      <CheckCircle2 size={13} />
      Saved
    </div>
  );
}
