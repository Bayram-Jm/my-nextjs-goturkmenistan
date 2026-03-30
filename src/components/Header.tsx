"use client";

import React from "react";

interface HeaderProps {
  onMenuOpen?: () => void;
  onBookNow?: () => void;
}

const navLinks = [
  { label: "Ashgabat", href: "#ashgabat" },
  { label: "Events", href: "#events" },
  { label: "Heritage", href: "#heritage" },
  { label: "Nature", href: "#nature" },
  { label: "Cuisine", href: "#cuisine" },
  { label: "Tours", href: "#tours" },
] as const;

const GRADIENT_STYLE = {
  background:
    "linear-gradient(90deg, rgb(233,55,37) 12%, rgb(233,54,77) 34%, rgb(233,54,131) 60%, rgb(233,56,201) 100%)",
} as const;

export default function Header({ onMenuOpen, onBookNow }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[90px] bg-[#100706] px-5 lg:px-20">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between">
        {/* Logo */}
        <a href="/" className="font-righteous text-2xl whitespace-nowrap">
          <span className="text-[#0ff216]">Go</span>
          <span className="text-[#faf5f5]"> Turkmenistan</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-inter text-sm text-[#faf5f5] transition-opacity hover:opacity-80"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <button
          type="button"
          onClick={onBookNow}
          style={GRADIENT_STYLE}
          className="hidden cursor-pointer rounded-lg px-7 py-3 font-righteous text-sm uppercase tracking-[0.28px] text-[#faf5f5] transition-opacity hover:opacity-90 lg:block"
        >
          Book Now
        </button>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#434343] lg:hidden"
        >
          <svg
            width="20"
            height="14"
            viewBox="0 0 20 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1h18M1 7h18M1 13h18"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
