"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import content from "../../content/tours.json";

interface ToursProps {
  onBookNow?: () => void;
}

export default function Tours({ onBookNow }: ToursProps) {
  const [planOpen, setPlanOpen] = useState(false);
  const { tour } = content;

  return (
    <section id="tours">

      {/* ── Dark Section ─────────────────────────────────────────── */}
      {/* overflow-hidden clips the white title at the bottom edge   */}
      <div className="bg-[#100706] relative overflow-hidden h-[480px] lg:h-[561px]">

        {/* Featured image — centred */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[40px] lg:top-[60px] w-[280px] h-[360px] lg:w-[353px] lg:h-[441px] rounded-[20px] overflow-hidden">
          <Image
            src={content.featuredImage}
            alt="Tour featured"
            fill
            className="object-cover"
          />
        </div>

        {/* WHITE title — bottom ~half clipped by overflow-hidden */}
        <h2
          className="absolute font-righteous uppercase text-[#faf5f5] whitespace-nowrap
                     text-[44px] leading-[44px] -bottom-[22px]
                     lg:text-[72px] lg:leading-[52.8px] lg:-bottom-[27px]"
          style={{ left: "max(20px, calc((100vw - 1440px) / 2 + 120px))" }}
        >
          {content.sectionTitle}
        </h2>
      </div>

      {/* ── Light Section ────────────────────────────────────────── */}
      {/* overflow-hidden clips the dark title at the top edge       */}
      <div className="bg-[#faf5f5] relative overflow-hidden pt-[36px] lg:pt-[50px]">

        {/* DARK title — top ~half clipped by overflow-hidden */}
        <h2
          className="absolute font-righteous uppercase text-[#100706] whitespace-nowrap
                     text-[44px] leading-[44px] -top-[22px]
                     lg:text-[72px] lg:leading-[52.8px] lg:-top-[27px]"
          style={{ left: "max(20px, calc((100vw - 1440px) / 2 + 120px))" }}
        >
          {content.sectionTitle}
        </h2>

        {/* Content */}
        <div className="max-w-[1440px] mx-auto px-5 lg:px-[120px]">
          <p className="font-inter text-base text-[#524442] mb-8">
            {content.subtitle}
          </p>

          {/* Tour Card */}
          <div className="w-full max-w-[1200px] bg-white rounded-[20px] shadow-[0px_4px_24px_0px_rgba(16,7,6,0.08)] overflow-hidden flex flex-col lg:flex-row mb-16">

            {/* Image */}
            <div className="w-full lg:w-[500px] h-[240px] lg:h-[480px] relative flex-shrink-0">
              <Image
                src={tour.cardImage}
                alt={tour.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 lg:p-10 flex flex-col flex-1">

              {/* Badge */}
              <span className="inline-block self-start bg-[#f01e0e] text-white font-redhat text-[11px] font-bold uppercase tracking-[0.5px] px-3 py-1 rounded">
                {tour.badge}
              </span>

              {/* Title */}
              <h3 className="font-righteous text-2xl lg:text-[32px] text-[#100706] mt-4">
                {tour.title}
              </h3>

              {/* Description */}
              <p className="font-inter text-base text-[#524442] leading-[1.5] mt-2 max-w-[570px]">
                {tour.description}
              </p>

              {/* Read more */}
              <button
                onClick={() => setPlanOpen(true)}
                className="self-start mt-3 font-inter text-sm text-[#f01e0e] underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Read more →
              </button>

              {/* Details */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🕐</span>
                  <span className="font-inter text-base text-[#524442]">{tour.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📍</span>
                  <span className="font-inter text-base text-[#524442]">{tour.route}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#eee] my-6 max-w-[620px]" />

              {/* Price and CTA */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="font-inter text-xs text-[#524442] uppercase tracking-[0.5px]">
                    {tour.priceLabel}
                  </span>
                  <div className="font-righteous text-[28px] lg:text-[36px] text-[#100706]">
                    {tour.price}
                  </div>
                  <span className="font-inter text-xs text-[#524442]">{tour.priceNote}</span>
                </div>
                <button
                  onClick={onBookNow}
                  className="rounded lg:rounded-lg px-6 py-3.5 font-righteous text-sm text-white uppercase tracking-[0.28px]"
                  style={{
                    background:
                      "linear-gradient(90deg, #e93725 12%, #e9364d 34%, #e93683 60%, #e938c9 100%)",
                  }}
                >
                  BOOK NOW &rarr;
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Tour Plan Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {planOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[#100706]/70 backdrop-blur-sm"
              onClick={() => setPlanOpen(false)}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-[560px] bg-[#100706] rounded-[20px] shadow-[0px_16px_64px_0px_rgba(16,7,6,0.6)] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-[rgba(67,67,67,0.4)]">
                  <div>
                    <span className="block font-redhat text-[11px] font-bold uppercase tracking-[1.2px] text-[rgba(250,245,245,0.45)] mb-1">
                      {tour.title}
                    </span>
                    <h3 className="font-righteous text-[22px] text-[#faf5f5] uppercase">
                      Tour Plan
                    </h3>
                  </div>
                  <button
                    onClick={() => setPlanOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(250,245,245,0.15)] text-[#faf5f5] hover:border-[rgba(250,245,245,0.4)] transition-colors"
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Days */}
                <div className="px-8 py-6 flex flex-col gap-6">
                  {tour.plan.map((item, i) => (
                    <div key={i} className="flex gap-5">
                      {/* Day indicator */}
                      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-redhat font-bold text-[#100706]"
                          style={{ background: "linear-gradient(90deg, #e93725 12%, #e938c9 100%)" }}>
                          {i + 1}
                        </div>
                        {i < tour.plan.length - 1 && (
                          <div className="w-px flex-1 mt-2 bg-[rgba(67,67,67,0.5)]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-2">
                        <span className="block font-redhat text-[11px] font-bold uppercase tracking-[1px] text-[rgba(250,245,245,0.4)] mb-0.5">
                          {item.day}
                        </span>
                        <h4 className="font-righteous text-[16px] text-[#faf5f5] mb-1.5">
                          {item.title}
                        </h4>
                        <p className="font-inter text-[14px] text-[rgba(250,245,245,0.6)] leading-[1.6]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-8 pb-8">
                  <button
                    onClick={() => { setPlanOpen(false); onBookNow?.(); }}
                    className="w-full py-3.5 rounded-lg font-righteous text-sm text-white uppercase tracking-[0.28px]"
                    style={{ background: "linear-gradient(90deg, #e93725 12%, #e9364d 34%, #e93683 60%, #e938c9 100%)" }}
                  >
                    BOOK NOW →
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}
