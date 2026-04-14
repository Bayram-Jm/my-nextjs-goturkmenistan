"use client";

/**
 * CardListEditor — universal carousel card management component.
 *
 * Props:
 *   section     — section key (e.g. "events")
 *   arrayPath   — dot-path to the array in the JSON (e.g. "events", "tour.plan")
 *   fieldKey    — display name key (e.g. "events")
 *   items       — current card array
 *   config      — per-section carousel config (imageField, titleField, maxCards)
 *   onMutation  — called after every successful mutation with the new items array
 *
 * Features: drag-to-reorder, add, edit, duplicate, delete, bulk-select,
 *           live-preview side panel (iframe).
 */

import React, {
  useState,
  useCallback,
  useContext,
  useRef,
  useEffect,
} from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Copy,
  X,
  Loader2,
  AlertTriangle,
  Upload,
  ImageIcon,
  CheckCircle2,
  Eye,
  EyeOff,
  Square,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import type { CarouselSectionConfig } from "@/lib/carouselConfig";
import { FormContext } from "./ContentForm";
import type { JsonObject, JsonValue } from "@/lib/jsonUtils";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const GRADIENT =
  "linear-gradient(90deg, rgb(233,55,37) 12%, rgb(233,54,77) 34%, rgb(233,54,131) 60%, rgb(233,56,201) 100%)";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/* ─── Field helpers ──────────────────────────────────────────────────────── */
function isImageField(key: string, value: unknown): boolean {
  return (
    /^(image|img|src|icon|thumbnail|screenshot|video|bg|backgroundImage)/i.test(key) ||
    (typeof value === "string" && /^\/images\/|^\/videos\/|^\/uploads\//.test(value))
  );
}

function isLongTextField(key: string, value: unknown): boolean {
  return (
    /^(description|desc|body|subheading|subtitle)/i.test(key) ||
    (typeof value === "string" && value.length > 120)
  );
}

function labelFromKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

function createEmpty(template: JsonObject): JsonObject {
  const result: JsonObject = {};
  for (const [key, val] of Object.entries(template)) {
    if (key === "id") continue;
    if (typeof val === "string") result[key] = "";
    else if (typeof val === "number") result[key] = 0;
    else if (typeof val === "boolean") result[key] = false;
  }
  return result;
}

/* ─── Mini image uploader (for card modal) ───────────────────────────────── */
interface MiniUploaderProps {
  label: string;
  currentPath: string;
  fieldKey: string;
  section: string;
  arrayPath: string;
  onUploaded: (path: string) => void;
}

function MiniUploader({
  label, currentPath, fieldKey, section, arrayPath, onUploaded,
}: MiniUploaderProps) {
  const { getImageSpec } = useContext(FormContext);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const spec = getImageSpec(`${arrayPath}.0.${fieldKey}`);

  const upload = useCallback(
    async (file: File) => {
      setErr(null);
      const ext = MIME_TO_EXT[file.type];
      if (!ext) { setErr("Unsupported format. Use jpg, png, or webp."); return; }
      if (spec) {
        if (!spec.allowedFormats.includes(ext)) {
          setErr(`Format not allowed. Accepted: ${spec.allowedFormats.join(", ")}.`);
          return;
        }
        if (file.size > spec.maxFileSizeMB * 1024 * 1024) {
          setErr(`File too large. Max: ${spec.maxFileSizeMB} MB.`);
          return;
        }
      }
      const objUrl = URL.createObjectURL(file);
      setPreview(objUrl);
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("section", section);
        fd.append("fieldPath", `${arrayPath}.0.${fieldKey}`);
        fd.append("optimize", "false");
        fd.append("skipSave", "true");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          onUploaded(data.path);
          URL.revokeObjectURL(objUrl);
          setPreview(data.path);
        } else {
          const e = await res.json().catch(() => ({}));
          setErr((e as { error?: string }).error ?? "Upload failed");
          setPreview(null);
          URL.revokeObjectURL(objUrl);
        }
      } catch {
        setErr("Network error — please try again");
        setPreview(null);
        URL.revokeObjectURL(objUrl);
      } finally {
        setUploading(false);
      }
    },
    [spec, section, arrayPath, fieldKey, onUploaded]
  );

  const displayPath = preview || currentPath;

  return (
    <div>
      <label className="block font-inter text-xs text-[#9e9090] uppercase tracking-[0.7px] mb-1.5">
        {label}
      </label>
      {displayPath && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayPath}
          alt={label}
          className="w-full h-28 object-cover rounded-lg mb-2 border border-[#e8e3e3]"
        />
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
          isDragging ? "border-[#f01e0e] bg-[rgba(240,30,14,0.04)]" : "border-[#e0dada] hover:border-[#c9c0c0]"
        }`}
      >
        {uploading
          ? <><Loader2 size={14} className="animate-spin text-[#f01e0e]" /><span className="font-inter text-sm text-[#7a6f6e]">Uploading…</span></>
          : <><Upload size={14} className="text-[#9e9090]" /><span className="font-inter text-sm text-[#7a6f6e]">Drop or click to upload</span></>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      {spec && (
        <p className="font-inter text-[11px] text-[#b5afae] mt-1">
          {spec.recommendedWidth}×{spec.recommendedHeight}px · max {spec.maxFileSizeMB} MB · {spec.allowedFormats.join(", ")}
        </p>
      )}
      {err && (
        <p className="font-inter text-xs text-[#e93725] mt-1 flex items-center gap-1">
          <AlertTriangle size={11} />{err}
        </p>
      )}
    </div>
  );
}

/* ─── Card Form Modal (Add / Edit) ───────────────────────────────────────── */
interface CardModalProps {
  mode: "add" | "edit";
  section: string;
  arrayPath: string;
  template: JsonObject;
  initialCard?: JsonObject;
  onClose: () => void;
  onSaved: (card: JsonObject) => void;
}

function CardModal({
  mode, section, arrayPath, template, initialCard, onClose, onSaved,
}: CardModalProps) {
  const [fields, setFields] = useState<JsonObject>(
    mode === "edit" && initialCard ? { ...initialCard } : createEmpty(template)
  );
  const [saving, setSaving] = useState(false);

  const setField = (key: string, value: unknown) =>
    setFields((prev) => ({ ...prev, [key]: value as JsonValue }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const [key, val] of Object.entries(fields)) {
      if (key === "id") continue;
      if (typeof val === "string" && !isImageField(key, val) && val.trim() === "") {
        toast.error(`"${labelFromKey(key)}" is required`);
        return;
      }
    }
    setSaving(true);
    try {
      if (mode === "add") {
        const res = await fetch(`/api/admin/content/${section}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arrayPath, card: fields }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          toast.error((e as { error?: string }).error ?? "Failed to create card");
          return;
        }
        const data = await res.json();
        toast.success("Card added");
        onSaved(data.card);
      } else {
        const cardId = (initialCard as JsonObject).id as string;
        const res = await fetch(`/api/admin/content/${section}/cards/${cardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arrayPath, card: fields }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          toast.error((e as { error?: string }).error ?? "Failed to save card");
          return;
        }
        const data = await res.json();
        toast.success("Card saved");
        onSaved(data.card);
      }
      onClose();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  const fieldEntries = Object.entries(template).filter(([k]) => k !== "id");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-white rounded-[20px] shadow-[0_16px_64px_rgba(16,7,6,0.18)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f2eeee] flex-shrink-0">
          <h2 className="font-righteous text-[18px] text-[#100706]">
            {mode === "add" ? "Add Card" : "Edit Card"}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#e0dada] text-[#9e9090] hover:text-[#524442] transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Fields */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          {fieldEntries.map(([key]) => {
            const val = fields[key];
            const label = labelFromKey(key);
            if (isImageField(key, val)) {
              return (
                <MiniUploader key={key} label={label}
                  currentPath={typeof val === "string" ? val : ""}
                  fieldKey={key} section={section} arrayPath={arrayPath}
                  onUploaded={(p) => setField(key, p)} />
              );
            }
            if (typeof val === "boolean") {
              return (
                <label key={key} className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={val}
                    onChange={(e) => setField(key, e.target.checked)}
                    className="w-4 h-4 accent-[#f01e0e]" />
                  <span className="font-inter text-sm text-[#524442]">{label}</span>
                </label>
              );
            }
            if (typeof val === "number") {
              return (
                <div key={key}>
                  <label className="block font-inter text-xs text-[#9e9090] uppercase tracking-[0.7px] mb-1.5">{label}</label>
                  <input type="number" value={val}
                    onChange={(e) => setField(key, parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3.5 font-inter text-sm text-[#100706] bg-white border border-[#e0dada] rounded-lg outline-none focus:border-[#f01e0e] transition-colors" />
                </div>
              );
            }
            return (
              <div key={key}>
                <label className="block font-inter text-xs text-[#9e9090] uppercase tracking-[0.7px] mb-1.5">{label}</label>
                {isLongTextField(key, val)
                  ? <textarea value={typeof val === "string" ? val : ""}
                      onChange={(e) => setField(key, e.target.value)} rows={3}
                      className="w-full px-3.5 py-2.5 font-inter text-sm text-[#100706] bg-white border border-[#e0dada] rounded-lg outline-none focus:border-[#f01e0e] transition-colors resize-y min-h-[80px]" />
                  : <input type="text" value={typeof val === "string" ? val : ""}
                      onChange={(e) => setField(key, e.target.value)}
                      className="w-full h-10 px-3.5 font-inter text-sm text-[#100706] bg-white border border-[#e0dada] rounded-lg outline-none focus:border-[#f01e0e] transition-colors" />}
              </div>
            );
          })}
        </form>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#f2eeee] flex-shrink-0">
          <button type="button" onClick={onClose} disabled={saving}
            className="flex-1 h-10 font-inter text-sm text-[#524442] border border-[#e0dada] rounded-lg hover:bg-[#f8f5f5] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" form="" onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={saving} style={{ background: GRADIENT }}
            className="flex-1 h-10 font-inter text-sm text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
            {saving
              ? <><Loader2 size={14} className="animate-spin" />{mode === "add" ? "Creating…" : "Saving…"}</>
              : <><CheckCircle2 size={14} />{mode === "add" ? "Create Card" : "Save Changes"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ────────────────────────────────────────────────── */
function DeleteModal({
  title, onConfirm, onCancel, loading,
}: { title: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-[380px] bg-white rounded-[16px] shadow-[0_16px_64px_rgba(16,7,6,0.18)] p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(233,55,37,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Trash2 size={18} className="text-[#e93725]" />
          </div>
          <div>
            <h3 className="font-righteous text-[16px] text-[#100706]">Delete card?</h3>
            <p className="font-inter text-sm text-[#7a6f6e] mt-1">
              <strong className="text-[#100706]">&ldquo;{title}&rdquo;</strong> will be permanently deleted. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 h-10 font-inter text-sm text-[#524442] border border-[#e0dada] rounded-lg hover:bg-[#f8f5f5] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-10 font-inter text-sm text-white bg-[#e93725] rounded-lg hover:bg-[#c92e1d] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Bulk Delete Confirm Modal ──────────────────────────────────────────── */
function BulkDeleteModal({
  count, onConfirm, onCancel, loading,
}: { count: number; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-[380px] bg-white rounded-[16px] shadow-[0_16px_64px_rgba(16,7,6,0.18)] p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(233,55,37,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Trash2 size={18} className="text-[#e93725]" />
          </div>
          <div>
            <h3 className="font-righteous text-[16px] text-[#100706]">Delete {count} card{count !== 1 ? "s" : ""}?</h3>
            <p className="font-inter text-sm text-[#7a6f6e] mt-1">
              This will permanently delete {count} selected card{count !== 1 ? "s" : ""} and their uploaded images. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 h-10 font-inter text-sm text-[#524442] border border-[#e0dada] rounded-lg hover:bg-[#f8f5f5] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-10 font-inter text-sm text-white bg-[#e93725] rounded-lg hover:bg-[#c92e1d] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : `Delete ${count}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sortable Card Row ───────────────────────────────────────────────────── */
interface CardRowProps {
  card: JsonObject;
  config: CarouselSectionConfig;
  index: number;
  isReordering: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  duplicating: boolean;
}

function SortableCardRow({
  card, config, index, isReordering, isSelected,
  onToggleSelect, onEdit, onDuplicate, onDelete, duplicating,
}: CardRowProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: card.id as string });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    zIndex: isDragging ? 999 : undefined,
  };

  const thumbnail = config.imageField ? card[config.imageField] : null;
  const title = (card[config.titleField] as string) || `Card ${index + 1}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 px-4 py-3 transition-colors border-b border-[#f2eeee] last:border-b-0 ${
        isSelected ? "bg-[rgba(240,30,14,0.04)]" : "bg-white hover:bg-[#faf8f8]"
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={onToggleSelect}
        className="flex-shrink-0 text-[#c5bebe] hover:text-[#f01e0e] transition-colors"
        aria-label={isSelected ? "Deselect" : "Select"}
      >
        {isSelected
          ? <CheckSquare size={16} className="text-[#f01e0e]" />
          : <Square size={16} />}
      </button>

      {/* Drag handle */}
      <button
        type="button"
        className={`flex-shrink-0 touch-none cursor-grab active:cursor-grabbing transition-colors ${
          isReordering ? "text-[#d0c8c8] cursor-not-allowed" : "text-[#c5bebe] hover:text-[#9e9090]"
        }`}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      {/* Number */}
      <span
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-righteous text-white"
        style={{ background: GRADIENT }}
      >
        {index + 1}
      </span>

      {/* Thumbnail */}
      {thumbnail && typeof thumbnail === "string" && thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail as string}
          alt={title}
          className="w-12 h-9 object-cover rounded-md flex-shrink-0 border border-[#e8e3e3]"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="w-12 h-9 rounded-md bg-[#f3efef] flex items-center justify-center flex-shrink-0">
          <ImageIcon size={14} className="text-[#c5bebe]" />
        </div>
      )}

      {/* Title */}
      <span className="font-inter text-sm text-[#524442] flex-1 truncate min-w-0">{title}</span>

      {/* Reorder indicator */}
      {isReordering && (
        <span className="font-inter text-xs text-[#9e9090] flex items-center gap-1 flex-shrink-0">
          <Loader2 size={11} className="animate-spin" />Saving…
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button type="button" onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e0dada] text-[#9e9090] hover:text-[#524442] hover:border-[#c5bebe] transition-colors"
          title="Edit">
          <Pencil size={12} />
        </button>
        <button type="button" onClick={onDuplicate} disabled={duplicating}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e0dada] text-[#9e9090] hover:text-[#524442] hover:border-[#c5bebe] transition-colors disabled:opacity-40"
          title="Duplicate">
          {duplicating ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} />}
        </button>
        <button type="button" onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e0dada] text-[#9e9090] hover:text-[#e93725] hover:border-[rgba(233,55,37,0.4)] transition-colors"
          title="Delete">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ─── Preview Side Panel ─────────────────────────────────────────────────── */
function PreviewPanel({
  href, version, onClose,
}: { href: string; version: number; onClose: () => void }) {
  return (
    <div className="fixed top-0 right-0 bottom-0 z-30 w-[42vw] min-w-[320px] max-w-[640px] bg-white border-l border-[#e0dada] shadow-[-4px_0_24px_rgba(16,7,6,0.08)] flex flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f2eeee] bg-[#faf8f8] flex-shrink-0">
        <span className="font-inter text-sm text-[#524442] flex items-center gap-2">
          <Eye size={14} className="text-[#9e9090]" />
          Live Preview
          <span className="font-inter text-[10px] text-[#b5afae]">
            (updates after each change)
          </span>
        </span>
        <div className="flex items-center gap-2">
          <a href={href} target="_blank" rel="noreferrer"
            className="font-inter text-xs text-[#9e9090] hover:text-[#524442] transition-colors"
            title="Open in new tab">
            ↗
          </a>
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e0dada] text-[#9e9090] hover:text-[#524442] transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>
      {/* Iframe */}
      <iframe
        key={`preview-${version}`}
        src={href}
        className="flex-1 w-full border-none"
        title="Section preview"
      />
    </div>
  );
}

/* ─── CardListEditor ─────────────────────────────────────────────────────── */
export interface CardListEditorProps {
  fieldKey: string;
  items: JsonObject[];
  section: string;
  config: CarouselSectionConfig;
  onMutation: (newItems: JsonObject[]) => void;
}

export default function CardListEditor({
  fieldKey, items, section, config, onMutation,
}: CardListEditorProps) {
  const { previewHref } = useContext(FormContext);

  const [cards, setCards] = useState<JsonObject[]>(items);
  const [isReordering, setIsReordering] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JsonObject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingCard, setEditingCard] = useState<JsonObject | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

  /* Keep local cards in sync when parent re-renders */
  const prevItemsRef = useRef(items);
  if (prevItemsRef.current !== items) {
    prevItemsRef.current = items;
    setCards(items);
    setSelected(new Set());
  }

  /* Bump iframe version after each mutation so the preview reloads */
  const mutate = useCallback((newCards: JsonObject[]) => {
    setCards(newCards);
    onMutation(newCards);
    setPreviewVersion((v) => v + 1);
  }, [onMutation]);

  /* ── DnD ──────────────────────────────────────────────────────────── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(cards, oldIndex, newIndex);
    setCards(reordered); // optimistic
    setIsReordering(true);
    try {
      const res = await fetch(`/api/admin/content/${section}/cards/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arrayPath: config.arrayPath,
          orderedIds: reordered.map((c) => c.id as string),
        }),
      });
      if (res.ok) {
        mutate(reordered);
      } else {
        setCards(cards); // rollback
        toast.error("Failed to save order");
      }
    } catch {
      setCards(cards); // rollback
      toast.error("Network error — order not saved");
    } finally {
      setIsReordering(false);
    }
  }

  /* ── Delete single ────────────────────────────────────────────────── */
  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/content/${section}/cards/${deleteTarget.id}?arrayPath=${encodeURIComponent(config.arrayPath)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        const newCards = cards.filter((c) => c.id !== deleteTarget.id);
        mutate(newCards);
        setSelected((s) => { const n = new Set(s); n.delete(deleteTarget.id as string); return n; });
        toast.success("Card deleted");
        setDeleteTarget(null);
      } else {
        const e = await res.json().catch(() => ({}));
        toast.error((e as { error?: string }).error ?? "Failed to delete");
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setIsDeleting(false);
    }
  }

  /* ── Duplicate ────────────────────────────────────────────────────── */
  async function handleDuplicate(card: JsonObject) {
    const cardId = card.id as string;
    setDuplicatingId(cardId);
    const copy: JsonObject = { ...card, id: "" }; // id generated by server
    delete copy.id;
    try {
      const res = await fetch(`/api/admin/content/${section}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arrayPath: config.arrayPath, card: copy }),
      });
      if (res.ok) {
        const data = await res.json();
        const newCards = [...cards, data.card];
        mutate(newCards);
        toast.success("Card duplicated");
      } else {
        const e = await res.json().catch(() => ({}));
        toast.error((e as { error?: string }).error ?? "Failed to duplicate");
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setDuplicatingId(null);
    }
  }

  /* ── Bulk delete ──────────────────────────────────────────────────── */
  async function confirmBulkDelete() {
    if (selected.size === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await fetch(`/api/admin/content/${section}/cards/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arrayPath: config.arrayPath,
          ids: Array.from(selected),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newCards = cards.filter((c) => !selected.has(c.id as string));
        mutate(newCards);
        setSelected(new Set());
        setShowBulkDelete(false);
        toast.success(`${data.deleted} card${data.deleted !== 1 ? "s" : ""} deleted`);
      } else {
        const e = await res.json().catch(() => ({}));
        toast.error((e as { error?: string }).error ?? "Failed to delete");
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setIsBulkDeleting(false);
    }
  }

  /* ── Card saved (add or edit) ─────────────────────────────────────── */
  function handleCardSaved(savedCard: JsonObject) {
    let newCards: JsonObject[];
    if (modalMode === "add") {
      newCards = [...cards, savedCard];
    } else {
      newCards = cards.map((c) => (c.id === savedCard.id ? savedCard : c));
    }
    mutate(newCards);
  }

  /* ── Select helpers ───────────────────────────────────────────────── */
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const allSelected = cards.length > 0 && cards.every((c) => selected.has(c.id as string));
  const someSelected = selected.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(cards.map((c) => c.id as string)));
    }
  }

  /* Close preview when pressing Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && previewOpen) setPreviewOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  const template = items[0] ?? {};
  const labelText = fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1);
  const atMax = cards.length >= config.maxCards;
  const sectionPreviewHref = previewHref || "/";

  return (
    <>
      <div className="border border-[#ede9e8] rounded-xl overflow-hidden">
        {/* ── Top toolbar ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 justify-between px-4 py-3 bg-[#faf8f8] flex-wrap">
          <div className="flex items-center gap-2">
            {/* Select all toggle */}
            <button type="button" onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-inter text-xs text-[#9e9090] hover:text-[#524442] transition-colors"
              title={allSelected ? "Deselect all" : "Select all"}>
              {allSelected
                ? <CheckSquare size={14} className="text-[#f01e0e]" />
                : <Square size={14} />}
            </button>
            <span className="font-righteous text-sm text-[#100706]">
              {labelText}
              <span className="ml-1.5 font-inter text-xs text-[#9e9090] font-normal">
                ({cards.length}/{config.maxCards})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Preview toggle */}
            <button type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                previewOpen
                  ? "border-[#f01e0e] text-[#f01e0e] bg-[rgba(240,30,14,0.05)]"
                  : "border-[#e0dada] text-[#9e9090] hover:text-[#524442]"
              }`}
              title={previewOpen ? "Close preview" : "Open live preview"}>
              {previewOpen ? <EyeOff size={13} /> : <Eye size={13} />}
              Preview
            </button>

            {/* Add card */}
            <button type="button"
              onClick={() => { setEditingCard(null); setModalMode("add"); }}
              disabled={atMax}
              style={atMax ? undefined : { background: GRADIENT }}
              className="inline-flex items-center gap-1.5 font-inter text-xs text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#c5bebe]"
              title={atMax ? `Max ${config.maxCards} cards` : "Add a new card"}>
              <Plus size={13} />
              Add Card
            </button>
          </div>
        </div>

        {/* ── Bulk action banner ──────────────────────────────────────── */}
        {someSelected && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[rgba(240,30,14,0.04)] border-b border-[rgba(240,30,14,0.1)]">
            <span className="font-inter text-sm text-[#524442] flex-1">
              <strong className="text-[#100706]">{selected.size}</strong> card{selected.size !== 1 ? "s" : ""} selected
            </span>
            <button type="button"
              onClick={() => setSelected(new Set())}
              className="font-inter text-xs text-[#9e9090] hover:text-[#524442] transition-colors">
              Clear
            </button>
            <button type="button"
              onClick={() => setShowBulkDelete(true)}
              className="inline-flex items-center gap-1.5 font-inter text-xs text-white bg-[#e93725] hover:bg-[#c92e1d] px-3 py-1.5 rounded-lg transition-colors">
              <Trash2 size={12} />
              Delete {selected.size}
            </button>
          </div>
        )}

        {/* ── Sortable list ────────────────────────────────────────────── */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cards.map((c) => c.id as string)} strategy={verticalListSortingStrategy}>
            <div>
              {cards.map((card, index) => (
                <SortableCardRow
                  key={card.id as string}
                  card={card}
                  config={config}
                  index={index}
                  isReordering={isReordering}
                  isSelected={selected.has(card.id as string)}
                  onToggleSelect={() => toggleSelect(card.id as string)}
                  onEdit={() => { setEditingCard(card); setModalMode("edit"); }}
                  onDuplicate={() => handleDuplicate(card)}
                  onDelete={() => setDeleteTarget(card)}
                  duplicating={duplicatingId === (card.id as string)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* ── Footer add button (for lists > 4) ───────────────────────── */}
        {cards.length >= 4 && (
          <div className="px-4 py-3 bg-[#faf8f8] border-t border-[#f2eeee]">
            <button type="button"
              onClick={() => { setEditingCard(null); setModalMode("add"); }}
              disabled={atMax}
              className="w-full h-9 flex items-center justify-center gap-2 font-inter text-sm text-[#9e9090] border border-dashed border-[#d9d3d3] rounded-lg hover:border-[#b5afae] hover:text-[#524442] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus size={14} />
              Add Card
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {modalMode !== null && (
        <CardModal
          mode={modalMode}
          section={section}
          arrayPath={config.arrayPath}
          template={template}
          initialCard={editingCard ?? undefined}
          onClose={() => { setModalMode(null); setEditingCard(null); }}
          onSaved={handleCardSaved}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          title={(deleteTarget[config.titleField] as string) || "this card"}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeleting}
        />
      )}

      {showBulkDelete && (
        <BulkDeleteModal
          count={selected.size}
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowBulkDelete(false)}
          loading={isBulkDeleting}
        />
      )}

      {/* ── Live preview side panel ──────────────────────────────────── */}
      {previewOpen && (
        <PreviewPanel
          href={sectionPreviewHref}
          version={previewVersion}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}
