"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Image from "next/image";
import DatePicker from "./DatePicker";

interface BookTicketProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
}

const inputClass =
  "w-full h-[48px] bg-[rgba(250,245,245,0.06)] border border-[rgba(67,67,67,0.6)] rounded-xl px-4 font-inter text-[15px] text-[#faf5f5] placeholder:text-[rgba(250,245,245,0.25)] outline-none focus:border-[rgba(240,30,14,0.6)] transition-colors";

const labelClass =
  "block font-redhat text-[11px] font-bold text-[rgba(250,245,245,0.45)] uppercase tracking-[1.2px] mb-1.5";

export default function BookTicket({ isOpen, onClose }: BookTicketProps) {
  const { register, handleSubmit, watch, setValue } = useForm<FormData>();
  const startDate = watch("startDate") ?? "";
  const endDate = watch("endDate") ?? "";

  const onSubmit = (data: FormData) => {
    console.log("Booking submitted:", data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* ─────────────────── MOBILE bottom sheet ─────────────────── */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="lg:hidden relative w-full max-w-[391px] bg-[#100706] border-t border-l border-r border-[rgba(67,67,67,0.4)] rounded-t-[28px] overflow-y-auto max-h-[90vh]"
          >
            {/* Drag handle */}
            <div className="flex justify-center mt-3">
              <div className="w-[40px] h-[4px] bg-[#434343] rounded-[2px]" />
            </div>

            {/* Header */}
            <div className="px-6 mt-4 flex items-center justify-between">
              <h2 className="font-righteous text-[22px] leading-[1.1] text-[#faf5f5]">
                Book Your<br />Adventure
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 border border-[#434343] rounded-full flex items-center justify-center shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className="px-6 mt-2 font-inter text-[13px] text-[rgba(250,245,245,0.5)] leading-[1.5] max-w-[268px]">
              Fill in your details and we&apos;ll craft the perfect Turkmenistan experience for you.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 mt-6 flex flex-col gap-5 pb-8">
              <div>
                <label className={labelClass}>Full Name</label>
                <input {...register("fullName")} type="text" placeholder="e.g. Doe Jones" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input {...register("email")} type="email" placeholder="jones@mail.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input {...register("phone")} type="tel" placeholder="+X XXX XXX" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Travel Dates</label>
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    placeholder="dd.mm.yy"
                    className={`${inputClass} text-center`}
                    value={startDate}
                    onChange={(v) => setValue("startDate", v)}
                  />
                  <DatePicker
                    placeholder="dd.mm.yy"
                    className={`${inputClass} text-center`}
                    value={endDate}
                    onChange={(v) => setValue("endDate", v)}
                    minDate={startDate ? (() => { const [dd,mm,yy] = startDate.split("."); return new Date(2000+parseInt(yy), parseInt(mm)-1, parseInt(dd)); })() : undefined}
                  />
                </div>
              </div>

              <div className="h-px bg-[rgba(67,67,67,0.3)]" />

              <div className="flex items-center gap-3.5 bg-[rgba(250,245,245,0.04)] border border-[rgba(67,67,67,0.3)] rounded-[14px] px-[15px] py-4">
                <div className="w-14 h-14 rounded-[10px] bg-blue-500/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-redhat text-sm font-bold text-[#faf5f5] leading-[1.2]">Gates of Hell &amp; Ancient Merw</p>
                  <p className="font-inter text-xs text-[rgba(250,245,245,0.5)] mt-0.5">5 Days · All inclusive</p>
                </div>
                <span className="font-righteous text-lg text-[#0ff216] shrink-0">$850</span>
              </div>

              <button
                type="submit"
                className="w-full h-[51px] rounded-[14px] bg-gradient-to-r from-[#f01e0e] to-[#ff6b3d] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="font-righteous text-[15px] text-white uppercase tracking-[0.5px]">CONFIRM BOOKING</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <p className="text-center text-[11px] font-inter text-[rgba(250,245,245,0.3)] leading-[1.5]">
                No payment required now. Our team will contact you within 24 hours to finalize your trip.
              </p>
            </form>
          </motion.div>

          {/* ─────────────────── DESKTOP centered modal ─────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            className="hidden lg:flex relative w-full max-w-[900px] mx-6 bg-[#100706] rounded-[24px] overflow-hidden shadow-2xl"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(67,67,67,0.35)" }}
          >
            {/* ── LEFT: Form panel ── */}
            <div className="flex-1 px-10 py-10 flex flex-col overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="font-righteous text-[32px] leading-[1.1] text-[#faf5f5]">
                    Book Your<br />Adventure
                  </h2>
                  <p className="mt-3 font-inter text-[13px] text-[rgba(250,245,245,0.45)] leading-[1.6] max-w-[280px]">
                    Fill in your details and we&apos;ll craft the perfect Turkmenistan experience for you.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 border border-[rgba(67,67,67,0.7)] rounded-full flex items-center justify-center shrink-0 hover:border-[#faf5f5] transition-colors mt-1"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5 flex-1">
                {/* Name + Email row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input {...register("fullName")} type="text" placeholder="e.g. Doe Jones" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input {...register("email")} type="email" placeholder="jones@mail.com" className={inputClass} />
                  </div>
                </div>

                {/* Phone + Dates row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input {...register("phone")} type="tel" placeholder="+X XXX XXX" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Arrival Date</label>
                    <DatePicker
                      placeholder="dd.mm.yy"
                      className={`${inputClass} text-center`}
                      value={startDate}
                      onChange={(v) => setValue("startDate", v)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Departure Date</label>
                    <DatePicker
                      placeholder="dd.mm.yy"
                      className={`${inputClass} text-center`}
                      value={endDate}
                      onChange={(v) => setValue("endDate", v)}
                      minDate={startDate ? (() => { const [dd,mm,yy] = startDate.split("."); return new Date(2000+parseInt(yy), parseInt(mm)-1, parseInt(dd)); })() : undefined}
                    />
                  </div>
                </div>

                <div className="h-px bg-[rgba(67,67,67,0.3)] my-1" />

                {/* Tour card */}
                <div>
                  <label className={labelClass}>Selected Tour</label>
                  <div className="flex items-center gap-4 bg-[rgba(250,245,245,0.04)] border border-[rgba(67,67,67,0.3)] rounded-[14px] px-4 py-4 hover:border-[rgba(67,67,67,0.6)] transition-colors">
                    <div className="w-[52px] h-[52px] rounded-[10px] bg-gradient-to-br from-[#1a2a4a] to-[#0d1a2e] shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="rgba(250,245,245,0.3)" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-redhat text-sm font-bold text-[#faf5f5]">Gates of Hell &amp; Ancient Merw</p>
                      <p className="font-inter text-xs text-[rgba(250,245,245,0.45)] mt-0.5">5 Days · All inclusive · Private guide</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-righteous text-2xl text-[#0ff216]">$850</span>
                      <p className="font-inter text-[10px] text-[rgba(250,245,245,0.35)] mt-0.5">per person</p>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full h-[54px] rounded-[14px] flex items-center justify-center gap-2.5 font-righteous text-[15px] text-white uppercase tracking-[0.8px] hover:opacity-90 active:scale-[0.99] transition-all"
                  style={{ background: "linear-gradient(90deg, #e93725 12%, #e9364d 34%, #e93683 60%, #e938c9 100%)" }}
                >
                  CONFIRM BOOKING
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <p className="text-center text-[11px] font-inter text-[rgba(250,245,245,0.3)] leading-[1.5]">
                  No payment required now. Our team will contact you within 24 hours to finalize your trip.
                </p>
              </form>
            </div>

            {/* ── RIGHT: Showcase panel ── */}
            <div className="w-[300px] shrink-0 relative overflow-hidden">
              {/* Background image */}
              <Image
                src="/images/tour-featured.jpg"
                alt="Tour"
                fill
                className="object-cover"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#100706] via-[rgba(16,7,6,0.55)] to-[rgba(16,7,6,0.2)]" />
              {/* Red top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, #e93725, #e938c9)" }} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                {/* Top badge */}
                <div className="self-start bg-[rgba(16,7,6,0.6)] backdrop-blur-md border border-[rgba(250,245,245,0.15)] rounded-full px-4 py-1.5">
                  <span className="font-redhat text-[11px] font-bold text-[rgba(250,245,245,0.8)] uppercase tracking-[1px]">
                    Most Popular
                  </span>
                </div>

                {/* Bottom info */}
                <div>
                  {/* Stats row */}
                  <div className="flex gap-4 mb-5">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1.75C4.1 1.75 1.75 4.1 1.75 7s2.35 5.25 5.25 5.25S12.25 9.9 12.25 7 9.9 1.75 7 1.75zm0 9.5C4.7 11.25 2.75 9.3 2.75 7S4.7 2.75 7 2.75 11.25 4.7 11.25 7 9.3 11.25 7 11.25zm.44-5.69H6.56v3.5l2.97 1.8.47-.76-2.56-1.52V5.56z" fill="rgba(250,245,245,0.6)" />
                      </svg>
                      <span className="font-inter text-[12px] text-[rgba(250,245,245,0.6)]">5 Days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1.17C4.89 1.17 3.17 2.89 3.17 5c0 3.06 3.83 7.83 3.83 7.83S10.83 8.06 10.83 5c0-2.11-1.72-3.83-3.83-3.83zm0 5.19c-.75 0-1.36-.61-1.36-1.36S6.25 3.64 7 3.64s1.36.61 1.36 1.36S7.75 6.36 7 6.36z" fill="rgba(250,245,245,0.6)" />
                      </svg>
                      <span className="font-inter text-[12px] text-[rgba(250,245,245,0.6)]">Darvaza &amp; Merw</span>
                    </div>
                  </div>

                  <h3 className="font-righteous text-[22px] text-[#faf5f5] leading-[1.15] mb-3">
                    Gates of Hell<br />&amp; Ancient Merw
                  </h3>

                  {/* Divider */}
                  <div className="h-px bg-[rgba(250,245,245,0.15)] mb-4" />

                  {/* Inclusions */}
                  <div className="flex flex-col gap-2 mb-6">
                    {["Private guide", "All inclusive", "Camp stay"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0ff216] shrink-0" />
                        <span className="font-inter text-[12px] text-[rgba(250,245,245,0.65)]">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-righteous text-[40px] text-[#0ff216] leading-none">$850</span>
                    <span className="font-inter text-[12px] text-[rgba(250,245,245,0.45)]">/ person</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
