"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

function parseDate(str: string): Date | null {
  const match = str.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (!match) return null;
  const [, dd, mm, yy] = match;
  return new Date(2000 + parseInt(yy), parseInt(mm) - 1, parseInt(dd));
}

interface DatePickerProps {
  placeholder?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
}

export default function DatePicker({
  placeholder = "dd.mm.yy",
  className = "",
  value,
  onChange,
  minDate,
}: DatePickerProps) {
  const today = new Date();
  const parsed = parseDate(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const [calPos, setCalPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updatePos = useCallback(() => {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    const calW = 280;
    const calH = 320; // approximate calendar height
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = Math.max(8, Math.min(vw / 2 - calW / 2, vw - calW - 8));
    const top = Math.max(8, Math.min(vh / 2 - calH / 2, vh - calH - 8));
    setCalPos({ top, left, width: r.width });
  }, []);

  // Close on outside click / scroll
  useEffect(() => {
    if (!open) return;
    updatePos();
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("scroll", updatePos, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("scroll", updatePos, true);
    };
  }, [open, updatePos]);

  // Days in month grid (Mon-first)
  function getDays() {
    const first = new Date(viewYear, viewMonth, 1);
    // getDay(): 0=Sun..6=Sat → convert to Mon-first offset
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day: number) {
    const selected = new Date(viewYear, viewMonth, day);
    onChange(formatDate(selected));
    setOpen(false);
  }

  function isSelected(day: number) {
    if (!parsed) return false;
    return (
      parsed.getDate() === day &&
      parsed.getMonth() === viewMonth &&
      parsed.getFullYear() === viewYear
    );
  }

  function isToday(day: number) {
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  }

  function isDisabled(day: number) {
    if (!minDate) return false;
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    return d < min;
  }

  const days = getDays();

  return (
    <div ref={ref} className="relative">
      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        readOnly
        placeholder={placeholder}
        value={value}
        onClick={() => { updatePos(); setOpen(o => !o); }}
        className={`${className} cursor-pointer select-none`}
      />

      {/* Calendar dropdown — fixed to escape overflow clipping */}
      {open && (
        <div
          className="fixed z-[9999] w-[280px] bg-[#1a0c0b] border border-[rgba(67,67,67,0.5)] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden"
          style={{ top: calPos.top, left: Math.max(8, calPos.left) }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(67,67,67,0.4)]">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[rgba(250,245,245,0.08)] transition-colors text-[rgba(250,245,245,0.6)]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7.5 9L4.5 6l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <span className="font-redhat text-[13px] font-bold text-[#faf5f5] uppercase tracking-[0.8px]">
              {MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[rgba(250,245,245,0.08)] transition-colors text-[rgba(250,245,245,0.6)]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 3L7.5 6l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center font-redhat text-[10px] font-bold text-[rgba(250,245,245,0.3)] uppercase tracking-[0.5px] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
            {days.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const sel = isSelected(day);
              const tod = isToday(day);
              const dis = isDisabled(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={dis}
                  onClick={() => selectDay(day)}
                  className={`
                    relative h-9 w-full flex items-center justify-center rounded-lg
                    font-inter text-[13px] transition-colors
                    ${dis ? "text-[rgba(250,245,245,0.2)] cursor-not-allowed" : "cursor-pointer"}
                    ${sel
                      ? "text-white"
                      : tod
                        ? "text-[#f01e0e] font-bold hover:bg-[rgba(250,245,245,0.08)]"
                        : dis
                          ? ""
                          : "text-[rgba(250,245,245,0.75)] hover:bg-[rgba(250,245,245,0.08)]"
                    }
                  `}
                  style={sel ? {
                    background: "linear-gradient(90deg, #e93725 0%, #e938c9 100%)",
                  } : undefined}
                >
                  {day}
                  {tod && !sel && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#f01e0e]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
