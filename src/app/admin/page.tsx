import path from "path";
import fs from "fs";
import {
  LayoutGrid,
  ImageIcon,
  Clock,
  FileText,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getAllContent } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { key: "hero",        label: "Hero",          href: "/admin/sections/hero" },
  { key: "ashgabat",    label: "Ashgabat",       href: "/admin/sections/ashgabat" },
  { key: "events",      label: "Events",         href: "/admin/sections/events" },
  { key: "heritage",    label: "Heritage",       href: "/admin/sections/heritage" },
  { key: "nature",      label: "Nature",         href: "/admin/sections/nature" },
  { key: "cuisine",     label: "Cuisine",        href: "/admin/sections/cuisine" },
  { key: "paywithease", label: "Pay With Ease",  href: "/admin/sections/paywithease" },
  { key: "tours",       label: "Tours",          href: "/admin/sections/tours" },
  { key: "apps",        label: "Apps",           href: "/admin/sections/apps" },
  { key: "footer",      label: "Footer",         href: "/admin/sections/footer" },
];

function countImagesInValue(val: unknown): number {
  if (typeof val === "string") {
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(val) ? 1 : 0;
  }
  if (Array.isArray(val)) {
    return val.reduce((acc, item) => acc + countImagesInValue(item), 0);
  }
  if (val && typeof val === "object") {
    return Object.values(val).reduce(
      (acc: number, v) => acc + countImagesInValue(v),
      0
    );
  }
  return 0;
}

export default async function AdminDashboard() {
  /* ── Load content and compute stats ────────────────────────────────── */
  const allContent = await getAllContent(SECTIONS.map((s) => s.key)).catch(() => ({}));

  let totalImages = 0;
  for (const c of Object.values(allContent)) {
    totalImages += countImagesInValue(c);
  }

  /* ── Per-section modification times ────────────────────────────────── */
  const sectionMtimes: Record<string, string | null> = {};
  let latestMtime = new Date(0);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: "content/", limit: 20 });
      for (const blob of blobs) {
        const section = blob.pathname
          .replace(/^content\//, "")
          .replace(/\.json$/, "");
        const d = new Date(blob.uploadedAt);
        sectionMtimes[section] = d.toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        });
        if (d > latestMtime) latestMtime = d;
      }
    } catch { /* non-critical */ }
  } else {
    for (const section of SECTIONS) {
      try {
        const fp = path.join(process.cwd(), "content", `${section.key}.json`);
        const stat = fs.statSync(fp);
        sectionMtimes[section.key] = stat.mtime.toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        });
        if (stat.mtime > latestMtime) latestMtime = stat.mtime;
      } catch {
        sectionMtimes[section.key] = null;
      }
    }
  }

  const lastModifiedLabel =
    latestMtime.getTime() === 0
      ? "—"
      : latestMtime.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

  const stats = [
    {
      label: "Total Sections",
      value: SECTIONS.length,
      icon: LayoutGrid,
      color: "text-[#f01e0e]",
      bg: "bg-[rgba(240,30,14,0.08)]",
    },
    {
      label: "Content Files",
      value: SECTIONS.length,
      icon: FileText,
      color: "text-[#7c4dff]",
      bg: "bg-[rgba(124,77,255,0.08)]",
    },
    {
      label: "Images in Content",
      value: totalImages,
      icon: ImageIcon,
      color: "text-[#0091ea]",
      bg: "bg-[rgba(0,145,234,0.08)]",
    },
    {
      label: "Last Modified",
      value: lastModifiedLabel,
      icon: Clock,
      color: "text-[#00897b]",
      bg: "bg-[rgba(0,137,123,0.08)]",
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-righteous text-[28px] text-[#100706]">Dashboard</h1>
        <p className="font-inter text-sm text-[#7a6f6e] mt-1">
          Overview of your site content
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-[16px] border border-[#ede9e8] p-5 flex flex-col gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="font-righteous text-[26px] text-[#100706] leading-none">
                {stat.value}
              </p>
              <p className="font-inter text-xs text-[#9e9090] mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sections list */}
      <div className="bg-white rounded-[16px] border border-[#ede9e8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ede9e8]">
          <h2 className="font-righteous text-base text-[#100706]">Site Sections</h2>
          <p className="font-inter text-xs text-[#9e9090] mt-0.5">
            Click a section to edit its content
          </p>
        </div>

        <div className="divide-y divide-[#f2eeee]">
          {SECTIONS.map((section) => {
            const mtime = sectionMtimes[section.key];
            return (
              <Link
                key={section.key}
                href={section.href}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#faf8f8] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0ff216] flex-shrink-0" />
                  <div>
                    <p className="font-inter text-sm font-medium text-[#100706]">
                      {section.label}
                    </p>
                    {mtime && (
                      <p className="font-inter text-xs text-[#b5afae]">
                        Modified {mtime}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-[#ccc] group-hover:text-[#f01e0e] transition-colors"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
