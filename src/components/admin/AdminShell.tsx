"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Building2,
  CalendarDays,
  Landmark,
  Trees,
  ChefHat,
  CreditCard,
  Map,
  Smartphone,
  AlignJustify,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV_SECTIONS = [
  { label: "Hero",          href: "/admin/sections/hero",         icon: ImageIcon },
  { label: "Ashgabat",      href: "/admin/sections/ashgabat",     icon: Building2 },
  { label: "Events",        href: "/admin/sections/events",       icon: CalendarDays },
  { label: "Heritage",      href: "/admin/sections/heritage",     icon: Landmark },
  { label: "Nature",        href: "/admin/sections/nature",       icon: Trees },
  { label: "Cuisine",       href: "/admin/sections/cuisine",      icon: ChefHat },
  { label: "Pay With Ease", href: "/admin/sections/paywithease",  icon: CreditCard },
  { label: "Tours",         href: "/admin/sections/tours",        icon: Map },
  { label: "Apps",          href: "/admin/sections/apps",         icon: Smartphone },
  { label: "Footer",        href: "/admin/sections/footer",       icon: AlignJustify },
];

const GRADIENT = "linear-gradient(90deg, rgb(233,55,37) 12%, rgb(233,54,77) 34%, rgb(233,54,131) 60%, rgb(233,56,201) 100%)";

interface Props {
  children: React.ReactNode;
  username: string;
}

export default function AdminShell({ children, username }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Login page gets no shell — it handles its own layout
  if (pathname === "/admin/login") return <>{children}</>;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(250,245,245,0.08)]">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-righteous text-lg">
            <span className="text-[#0ff216]">Go</span>
            <span className="text-[#faf5f5]"> Turkmenistan</span>
          </span>
        </Link>
        <p className="font-inter text-[10px] text-[rgba(250,245,245,0.3)] mt-0.5 uppercase tracking-[1px]">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Dashboard */}
        <NavLink
          href="/admin"
          icon={LayoutDashboard}
          label="Dashboard"
          active={isActive("/admin") && pathname === "/admin"}
        />

        {/* Section label */}
        <p className="font-inter text-[10px] text-[rgba(250,245,245,0.25)] uppercase tracking-[1px] px-3 mt-5 mb-2">
          Sections
        </p>

        {NAV_SECTIONS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={isActive(item.href)}
          />
        ))}

        {/* Settings */}
        <p className="font-inter text-[10px] text-[rgba(250,245,245,0.25)] uppercase tracking-[1px] px-3 mt-5 mb-2">
          System
        </p>
        <NavLink href="/admin/settings" icon={Settings} label="Settings" active={isActive("/admin/settings")} />
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-[rgba(250,245,245,0.08)]">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[rgba(250,245,245,0.05)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-righteous text-[#100706] flex-shrink-0"
              style={{ background: GRADIENT }}>
              {username[0].toUpperCase()}
            </div>
            <span className="font-inter text-sm text-[rgba(250,245,245,0.7)] truncate">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-md text-[rgba(250,245,245,0.3)] hover:text-[rgba(250,245,245,0.8)] hover:bg-[rgba(250,245,245,0.07)] transition-colors flex-shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8f5f5] overflow-hidden">
      <Toaster position="top-right" richColors closeButton />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-[240px] bg-[#100706] flex-shrink-0 h-full">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-[240px] bg-[#100706] flex flex-col lg:hidden shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md text-[rgba(250,245,245,0.4)] hover:text-[#faf5f5] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="flex items-center justify-between h-[60px] px-5 lg:px-6 bg-white border-b border-[#e8e3e3] flex-shrink-0">
          {/* Left: hamburger (mobile) + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#524442] hover:bg-[#f3efef] transition-colors"
            >
              <Menu size={20} />
            </button>
            <Breadcrumb pathname={pathname} />
          </div>

          {/* Right: user info */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block font-inter text-sm text-[#524442]">{username}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-inter text-sm text-[rgba(82,68,66,0.6)] hover:text-[#524442] transition-colors"
            >
              <LogOut size={15} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Internal components ── */

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 font-inter text-sm transition-all ${
        active
          ? "text-white"
          : "text-[rgba(250,245,245,0.55)] hover:text-[rgba(250,245,245,0.9)] hover:bg-[rgba(250,245,245,0.07)]"
      }`}
      style={active ? { background: GRADIENT } : undefined}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight size={14} className="opacity-70" />}
    </Link>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);
  // e.g. ['admin', 'sections', 'hero']

  if (parts.length <= 1) {
    return <span className="font-righteous text-base text-[#100706]">Dashboard</span>;
  }

  const labels: Record<string, string> = {
    admin: "Admin",
    sections: "Sections",
    settings: "Settings",
    hero: "Hero",
    ashgabat: "Ashgabat",
    events: "Events",
    heritage: "Heritage",
    nature: "Nature",
    cuisine: "Cuisine",
    paywithease: "Pay With Ease",
    tours: "Tours",
    apps: "Apps",
    footer: "Footer",
  };

  return (
    <div className="flex items-center gap-1.5">
      {parts.slice(1).map((part, i, arr) => (
        <div key={part} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={14} className="text-[#999]" />}
          <span
            className={`font-inter text-sm ${
              i === arr.length - 1
                ? "text-[#100706] font-medium"
                : "text-[#999]"
            }`}
          >
            {labels[part] ?? part}
          </span>
        </div>
      ))}
    </div>
  );
}
