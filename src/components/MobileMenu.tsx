"use client";

import { AnimatePresence, motion } from "framer-motion";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Ashgabat", href: "#ashgabat" },
  { label: "Events", href: "#events" },
  { label: "Heritage", href: "#heritage" },
  { label: "Nature", href: "#nature" },
  { label: "Cuisine", href: "#cuisine" },
  { label: "Tours", href: "#tours" },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-[#100706] flex flex-col"
        >
          {/* Top bar */}
          <div className="px-5 h-[95px] flex items-center justify-between shrink-0">
            <span className="font-righteous text-xl">
              <span className="text-[#0ff216]">Go</span>
              <span className="text-[#faf5f5]"> Turkmenistan</span>
            </span>
            <button
              onClick={onClose}
              className="w-12 h-12 border border-[#434343] rounded-full flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L17 17M17 1L1 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <nav className="mt-[24px] mx-[28px] flex-1">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={onClose}
                className={`block py-3.5 border-b border-[rgba(67,67,67,0.3)] font-righteous text-[20px] leading-[20px] text-[#faf5f5] ${
                  index === 0 ? "border-t" : ""
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Footer */}
          <div className="pb-10 flex flex-col items-center gap-4 shrink-0">
            {/* CTA Button */}
            <a
              href="#tours"
              onClick={onClose}
              className="font-righteous text-sm uppercase tracking-[0.28px] text-white rounded-lg py-4 text-center transition-opacity hover:opacity-90"
              style={{ marginLeft: 20, marginRight: 20, width: "calc(100% - 40px)", background: "linear-gradient(90deg, rgb(233, 55, 37) 12%, rgb(233, 54, 77) 34%, rgb(233, 54, 131) 60%, rgb(233, 56, 201) 100%)" }}
            >
              BOOK YOUR TICKET →
            </a>
            {/* Social icons */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 border border-[#434343] rounded-full flex items-center justify-center" aria-label="Instagram">
                <img src="/icons/instagram.svg" alt="Instagram" width={18} height={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#434343] rounded-full flex items-center justify-center" aria-label="Telegram">
                <img src="/icons/telegram.svg" alt="Telegram" width={18} height={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#434343] rounded-full flex items-center justify-center" aria-label="WhatsApp">
                <img src="/icons/whatssapp.svg" alt="WhatsApp" width={18} height={18} />
              </a>
            </div>
            {/* Branding */}
            <span className="font-righteous text-xs text-[rgba(250,245,245,0.25)] uppercase tracking-[2px]">
              GO TURKMENISTAN
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
