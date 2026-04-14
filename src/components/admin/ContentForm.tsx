"use client";

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import {
  ImageIcon,
  Building2,
  CalendarDays,
  Landmark,
  Trees,
  ChefHat,
  CreditCard,
  Map,
  Smartphone,
  AlignJustify,
} from "lucide-react";
import { toast } from "sonner";
import {
  Save,
  RotateCcw,
  Eye,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import ImageUploader, { type ImageSpec } from "./ImageUploader";
import { setDeep, normalizePathForSpec } from "@/lib/jsonUtils";
import rawImageSpecs from "../../../content/image-specs.json";
import CardListEditor from "./CardListEditor";
import { CAROUSEL_CONFIG } from "@/lib/carouselConfig";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Primitive = string | number | boolean | null;
type JsonValue = Primitive | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

/* ─── Form context ───────────────────────────────────────────────────────── */
interface FormContextValue {
  section: string;
  getImageSpec: (fieldPath: string) => ImageSpec | null;
  onImageSaved: (fieldPath: string, newPath: string) => void;
  /** Updates both content and saved state — used by CarouselManager so
   *  carousel mutations don't leave the form in a "dirty" state. */
  onImmediateSave: (dotPath: string, newValue: JsonValue) => void;
  /** Href for the live-preview iframe in CardListEditor. */
  previewHref: string;
}

export const FormContext = createContext<FormContextValue>({
  section: "",
  getImageSpec: () => null,
  onImageSaved: () => {},
  onImmediateSave: () => {},
  previewHref: "/",
});

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function labelFromKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function isImageField(key: string, value: string): boolean {
  return (
    /^(image|img|src|icon|thumbnail|screenshot|video|bg|backgroundImage)/i.test(key) ||
    /^\/images\/|^\/videos\/|^\/uploads\//.test(value)
  );
}

function isLongTextField(key: string, value: string): boolean {
  return (
    /^(description|desc|body|subheading|subtitle)/i.test(key) ||
    value.length > 120
  );
}

/* ─── Section icon map (resolved client-side from section key) ───────────── */
const SECTION_ICONS: Record<string, React.ElementType> = {
  hero: ImageIcon,
  ashgabat: Building2,
  events: CalendarDays,
  heritage: Landmark,
  nature: Trees,
  cuisine: ChefHat,
  paywithease: CreditCard,
  tours: Map,
  apps: Smartphone,
  footer: AlignJustify,
};

const GRADIENT =
  "linear-gradient(90deg, rgb(233,55,37) 12%, rgb(233,54,77) 34%, rgb(233,54,131) 60%, rgb(233,56,201) 100%)";

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface ContentFormProps {
  section: string;
  sectionLabel: string;
  sectionDescription: string;
  initialContent: JsonObject;
  previewHref: string;
}

/* ─── ContentForm ────────────────────────────────────────────────────────── */
export default function ContentForm({
  section,
  sectionLabel,
  sectionDescription,
  initialContent,
  previewHref,
}: ContentFormProps) {
  const SectionIcon = SECTION_ICONS[section] ?? ImageIcon;
  const [content, setContent] = useState<JsonObject>(initialContent);
  const [saved, setSaved] = useState<JsonObject>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty = JSON.stringify(content) !== JSON.stringify(saved);

  /* Warn on browser close/reload when dirty */
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [isDirty]);

  /* Cmd/Ctrl+S keyboard shortcut — always calls the latest handleSave via ref */
  const saveRef = useRef<() => void>(() => {});
  useEffect(() => { saveRef.current = handleSave; });
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveRef.current();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback((path: string, value: JsonValue) => {
    setContent((prev) => setDeep(prev, path, value));
    setErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  /* Image saved: update BOTH content and saved so it doesn't mark the form
     as dirty — the upload API already persisted the JSON file. */
  const handleImageSaved = useCallback((fieldPath: string, newPath: string) => {
    setContent((prev) => setDeep(prev, fieldPath, newPath));
    setSaved((prev) => setDeep(prev, fieldPath, newPath));
    toast.success("Image uploaded successfully");
  }, []);

  /* Carousel mutation: also syncs saved so isDirty stays false */
  const handleImmediateSave = useCallback((dotPath: string, newValue: JsonValue) => {
    setContent((prev) => setDeep(prev, dotPath, newValue));
    setSaved((prev) => setDeep(prev, dotPath, newValue));
  }, []);

  /* Resolve spec for a given field path in this section */
  const getImageSpec = useCallback(
    (fieldPath: string): ImageSpec | null => {
      const sectionSpecs = (
        rawImageSpecs as Record<string, Record<string, ImageSpec>>
      )[section];
      if (!sectionSpecs) return null;
      const normalized = normalizePathForSpec(fieldPath);
      return sectionSpecs[normalized] ?? null;
    },
    [section]
  );

  function validate(): boolean {
    const errs: Record<string, string> = {};
    for (const [key, value] of Object.entries(content)) {
      if (
        typeof value === "string" &&
        !isImageField(key, value) &&
        value.trim() === ""
      ) {
        errs[key] = "This field is required";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) {
      toast.error("Fix validation errors before saving");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/content/${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        setSaved(content);
        toast.success("Changes saved successfully");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(
          (err as { error?: string }).error ?? "Failed to save changes"
        );
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm("Discard all unsaved changes?")) return;
    setContent(saved);
    setErrors({});
  }

  return (
    <FormContext.Provider value={{ section, getImageSpec, onImageSaved: handleImageSaved, onImmediateSave: handleImmediateSave, previewHref }}>
      <div className="max-w-[860px]">
        {/* Back */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 font-inter text-sm text-[#9e9090] hover:text-[#100706] transition-colors mb-5"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        {/* Unsaved-changes banner */}
        {isDirty && (
          <div className="flex items-center gap-2 bg-[rgba(240,30,14,0.07)] border border-[rgba(240,30,14,0.2)] rounded-xl px-4 py-2.5 mb-5">
            <AlertTriangle size={14} className="text-[#f01e0e] flex-shrink-0" />
            <span className="font-inter text-sm text-[#c02010]">
              You have unsaved changes
            </span>
          </div>
        )}

        {/* Header + action buttons */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(240,30,14,0.08)] flex items-center justify-center flex-shrink-0">
              <SectionIcon size={22} className="text-[#f01e0e]" />
            </div>
            <div>
              <h1 className="font-righteous text-[26px] text-[#100706] leading-tight">
                {sectionLabel}
              </h1>
              <p className="font-inter text-sm text-[#7a6f6e] mt-0.5">
                {sectionDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <a
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-inter text-sm text-[#524442] border border-[#ede9e8] rounded-lg px-4 py-2 hover:bg-[#f8f5f5] transition-colors"
            >
              <Eye size={14} />
              Preview
            </a>
            <button
              onClick={handleCancel}
              disabled={!isDirty}
              className="inline-flex items-center gap-1.5 font-inter text-sm text-[#524442] border border-[#ede9e8] rounded-lg px-4 py-2 hover:bg-[#f8f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              title="Save (⌘S / Ctrl+S)"
              style={{ background: GRADIENT }}
              className="inline-flex items-center gap-1.5 font-inter text-sm text-white rounded-lg px-5 py-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {isSaving ? "Saving…" : "Save"}
              {!isSaving && (
                <span className="font-inter text-[10px] text-white/50 ml-0.5 hidden sm:inline">
                  ⌘S
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic form */}
        <div className="bg-white rounded-[16px] border border-[#ede9e8] p-6 lg:p-8">
          <ObjectFields
            obj={content}
            basePath=""
            onChange={updateField}
            errors={errors}
            depth={0}
          />
        </div>
      </div>
    </FormContext.Provider>
  );
}

/* ─── ObjectFields ───────────────────────────────────────────────────────── */
function ObjectFields({
  obj,
  basePath,
  onChange,
  errors,
  depth,
}: {
  obj: JsonObject;
  basePath: string;
  onChange: (path: string, value: JsonValue) => void;
  errors: Record<string, string>;
  depth: number;
}) {
  const { section, onImmediateSave } = useContext(FormContext);
  const carouselConfig = CAROUSEL_CONFIG[section];

  const p = (key: string) => (basePath ? `${basePath}.${key}` : key);
  const entries = Object.entries(obj);

  const primitives = entries.filter(
    ([, v]) => typeof v !== "object" || v === null
  );
  const nested = entries.filter(
    ([, v]) => v !== null && !Array.isArray(v) && typeof v === "object"
  );
  const arrays = entries.filter(([, v]) => Array.isArray(v));

  return (
    <div className="flex flex-col gap-5">
      {/* ── Primitive fields ──────────────────────────────────────── */}
      {primitives.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {primitives.map(([key, value]) => {
            const isImg =
              typeof value === "string" && isImageField(key, value);
            const isLong =
              typeof value === "string" &&
              !isImg &&
              isLongTextField(key, value);
            return (
              <div
                key={p(key)}
                className={isImg || isLong ? "sm:col-span-2" : undefined}
              >
                <PrimitiveField
                  fieldKey={key}
                  value={value as Primitive}
                  path={p(key)}
                  onChange={onChange}
                  error={errors[p(key)]}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Nested object fields ──────────────────────────────────── */}
      {nested.map(([key, value]) => (
        <ObjectGroup
          key={p(key)}
          fieldKey={key}
          value={value as JsonObject}
          path={p(key)}
          onChange={onChange}
          errors={errors}
          depth={depth + 1}
        />
      ))}

      {/* ── Array fields ──────────────────────────────────────────── */}
      {arrays.map(([key, value]) => {
        const fullPath = p(key);
        /* Use CarouselManager when this array is the configured carousel
           for the current section (match by arrayPath at any nesting level) */
        const isCarousel =
          carouselConfig &&
          (carouselConfig.arrayPath === fullPath ||
            carouselConfig.arrayPath === key) &&
          Array.isArray(value) &&
          (value as JsonValue[]).length > 0 &&
          typeof ((value as JsonValue[])[0] as JsonObject)?.id === "string";

        if (isCarousel) {
          return (
            <CardListEditor
              key={fullPath}
              fieldKey={key}
              items={value as JsonObject[]}
              section={section}
              config={carouselConfig}
              onMutation={(newItems: JsonObject[]) => onImmediateSave(fullPath, newItems)}
            />
          );
        }

        return (
          <ArrayGroup
            key={fullPath}
            fieldKey={key}
            items={value as JsonValue[]}
            path={fullPath}
            onChange={onChange}
            errors={errors}
            depth={depth + 1}
          />
        );
      })}
    </div>
  );
}

/* ─── PrimitiveField ─────────────────────────────────────────────────────── */
function PrimitiveField({
  fieldKey,
  value,
  path,
  onChange,
  error,
}: {
  fieldKey: string;
  value: Primitive;
  path: string;
  onChange: (path: string, value: JsonValue) => void;
  error?: string;
}) {
  const { section, getImageSpec, onImageSaved } = useContext(FormContext);
  const label = labelFromKey(fieldKey);

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-3 cursor-pointer select-none py-1">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(path, e.target.checked)}
          className="w-4 h-4 accent-[#f01e0e] cursor-pointer"
        />
        <span className="font-inter text-sm text-[#524442]">{label}</span>
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        <FieldLabel label={label} />
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(path, parseFloat(e.target.value) || 0)}
          className={inputClass(!!error)}
        />
        <FieldError error={error} />
      </div>
    );
  }

  if (typeof value === "string") {
    if (isImageField(fieldKey, value)) {
      return (
        <ImageUploader
          label={label}
          currentPath={value}
          fieldPath={path}
          section={section}
          spec={getImageSpec(path)}
          onSaved={(newPath) => onImageSaved(path, newPath)}
        />
      );
    }

    if (isLongTextField(fieldKey, value)) {
      return (
        <div>
          <FieldLabel label={label} />
          <textarea
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            rows={3}
            className={`w-full px-3.5 py-2.5 font-inter text-sm text-[#100706] bg-white border rounded-lg outline-none transition-colors resize-y min-h-[80px] ${
              error
                ? "border-[#e93725] focus:border-[#e93725]"
                : "border-[#e0dada] focus:border-[#f01e0e]"
            }`}
          />
          <FieldError error={error} />
        </div>
      );
    }

    return (
      <div>
        <FieldLabel label={label} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(path, e.target.value)}
          className={inputClass(!!error)}
        />
        <FieldError error={error} />
      </div>
    );
  }

  return null; // null values skipped
}

/* ─── ObjectGroup ────────────────────────────────────────────────────────── */
function ObjectGroup({
  fieldKey,
  value,
  path,
  onChange,
  errors,
  depth,
}: {
  fieldKey: string;
  value: JsonObject;
  path: string;
  onChange: (path: string, value: JsonValue) => void;
  errors: Record<string, string>;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const label = labelFromKey(fieldKey);

  return (
    <div className="border border-[#ede9e8] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[#faf8f8] hover:bg-[#f5f0f0] transition-colors text-left"
      >
        <span className="font-righteous text-sm text-[#100706]">{label}</span>
        {open ? (
          <ChevronDown size={16} className="text-[#9e9090]" />
        ) : (
          <ChevronRight size={16} className="text-[#9e9090]" />
        )}
      </button>
      {open && (
        <div className="p-5 border-t border-[#f2eeee]">
          <ObjectFields
            obj={value}
            basePath={path}
            onChange={onChange}
            errors={errors}
            depth={depth}
          />
        </div>
      )}
    </div>
  );
}

/* ─── ArrayGroup ─────────────────────────────────────────────────────────── */
function ArrayGroup({
  fieldKey,
  items,
  path,
  onChange,
  errors,
  depth,
}: {
  fieldKey: string;
  items: JsonValue[];
  path: string;
  onChange: (path: string, value: JsonValue) => void;
  errors: Record<string, string>;
  depth: number;
}) {
  const [openItems, setOpenItems] = useState<boolean[]>(() =>
    items.map((_, i) => i < 3)
  );
  const label = labelFromKey(fieldKey);
  const allOpen = openItems.every(Boolean);

  function toggleItem(i: number) {
    setOpenItems((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  function toggleAll() {
    setOpenItems(items.map(() => !allOpen));
  }

  const itemPath = (i: number) => `${path}.${i}`;

  return (
    <div className="border border-[#ede9e8] rounded-xl overflow-hidden">
      {/* Array header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#faf8f8]">
        <span className="font-righteous text-sm text-[#100706]">
          {label}
          <span className="ml-2 font-inter text-xs text-[#9e9090] font-normal">
            ({items.length})
          </span>
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="font-inter text-xs text-[#9e9090] hover:text-[#524442] transition-colors"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {/* Items */}
      <div className="divide-y divide-[#f2eeee]">
        {items.map((item, i) => {
          if (
            typeof item === "object" &&
            item !== null &&
            !Array.isArray(item)
          ) {
            const obj = item as JsonObject;
            const displayTitle =
              (obj.title as string) ??
              (obj.name as string) ??
              (obj.label as string) ??
              (obj.day as string) ??
              `Item ${i + 1}`;

            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => toggleItem(i)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#faf8f8] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-righteous text-white flex-shrink-0"
                      style={{ background: GRADIENT }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-inter text-sm text-[#524442] truncate">
                      {displayTitle}
                    </span>
                  </div>
                  {openItems[i] ? (
                    <ChevronDown size={15} className="text-[#9e9090] flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronRight size={15} className="text-[#9e9090] flex-shrink-0 ml-2" />
                  )}
                </button>
                {openItems[i] && (
                  <div className="px-5 pb-5 pt-2">
                    <ObjectFields
                      obj={obj}
                      basePath={itemPath(i)}
                      onChange={onChange}
                      errors={errors}
                      depth={depth + 1}
                    />
                  </div>
                )}
              </div>
            );
          }

          // Primitive array item (string/number)
          return (
            <div key={i} className="px-5 py-3">
              <PrimitiveField
                fieldKey={`Item ${i + 1}`}
                value={item as Primitive}
                path={itemPath(i)}
                onChange={onChange}
                error={errors[itemPath(i)]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Shared mini-components ─────────────────────────────────────────────── */
function FieldLabel({ label }: { label: string }) {
  return (
    <label className="block font-inter text-xs text-[#9e9090] uppercase tracking-[0.7px] mb-1.5">
      {label}
    </label>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="font-inter text-xs text-[#e93725] mt-1">{error}</p>;
}

function inputClass(hasError: boolean): string {
  return `w-full h-10 px-3.5 font-inter text-sm text-[#100706] bg-white border rounded-lg outline-none transition-colors ${
    hasError
      ? "border-[#e93725] focus:border-[#e93725]"
      : "border-[#e0dada] focus:border-[#f01e0e]"
  }`;
}
