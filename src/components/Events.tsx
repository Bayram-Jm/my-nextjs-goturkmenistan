"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import content from "../../content/events.json";

const DOT_COUNT = 3;

export default function Events() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setActiveDot(Math.round(progress * (DOT_COUNT - 1)));
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (selectedId !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedId]);

  const scrollToDot = (index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (index / (DOT_COUNT - 1)) * maxScroll, behavior: "smooth" });
  };

  const selected = selectedId !== null ? content.events[selectedId] : null;

  return (
    <section id="events" className="bg-[#100706] py-[60px]">
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-5 lg:px-[120px] mb-10">
        <h2 className="font-righteous uppercase text-[#faf5f5] text-[34px] leading-[1.1] lg:text-[78px] lg:leading-normal">
          {content.sectionTitle}
        </h2>
        <p className="font-inter text-[16px] text-[rgba(250,245,245,0.7)] leading-[1.6] max-w-[457px] mt-4">
          {content.sectionSubtitle}
        </p>
      </div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide gap-2 snap-x snap-mandatory lg:pl-[120px]"
        style={{ paddingLeft: "max(20px, calc((100vw - 1440px) / 2 + 20px))", scrollPaddingLeft: "max(20px, calc((100vw - 1440px) / 2 + 20px))" }}
      >
        {content.events.map((event, index) => (
          <motion.div
            key={index}
            layoutId={`event-card-${index}`}
            onClick={() => setSelectedId(index)}
            className="flex-shrink-0 w-[324px] h-[569px] border border-[#434343] rounded-[10px] overflow-hidden flex flex-col cursor-pointer snap-start"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <motion.div layoutId={`event-image-${index}`} className="relative w-full h-[417px] flex-shrink-0">
              <Image src={event.image} alt={event.title} fill className="object-cover" sizes="324px" />
            </motion.div>
            <div className="flex flex-col justify-between px-5 pt-4 pb-5 flex-1">
              <div className="flex flex-col gap-1">
                <motion.p layoutId={`event-title-${index}`} className="font-redhat font-bold text-[16px] leading-[19.2px] text-white">
                  {event.title}
                </motion.p>
                <motion.p layoutId={`event-category-${index}`} className="font-redhat text-[12px] leading-[17px] text-white">
                  {event.category}
                </motion.p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-[5px]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 mt-[1px]">
                    <path d="M9 1.5C6.1 1.5 3.75 3.85 3.75 6.75C3.75 10.6875 9 16.5 9 16.5C9 16.5 14.25 10.6875 14.25 6.75C14.25 3.85 11.9 1.5 9 1.5ZM9 8.625C7.965 8.625 7.125 7.785 7.125 6.75C7.125 5.715 7.965 4.875 9 4.875C10.035 4.875 10.875 5.715 10.875 6.75C10.875 7.785 10.035 8.625 9 8.625Z" fill="white" />
                  </svg>
                  <span className="font-redhat text-[13px] leading-[18.57px] text-white">{event.location}</span>
                </div>
                <div className="flex items-center gap-[5px]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
                    <path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM9 15C5.6925 15 3 12.3075 3 9C3 5.6925 5.6925 3 9 3C12.3075 3 15 5.6925 15 9C15 12.3075 12.3075 15 9 15ZM9.375 5.25H8.25V9.75L12.1875 12.1125L12.75 11.1825L9.375 9.1875V5.25Z" fill="white" />
                  </svg>
                  <span className="font-redhat text-[13px] leading-[18.57px] text-white">{event.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToDot(i)}
            className={`transition-all duration-300 rounded-full ${
              i === activeDot ? "w-2.5 h-2.5 bg-[#f01e0e]" : "w-2 h-2 bg-[#524442]"
            }`}
          />
        ))}
      </div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {selected !== null && selectedId !== null && (
          <>
            <motion.div
              key="event-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none">
              <motion.div
                layoutId={`event-card-${selectedId}`}
                className="pointer-events-auto w-full max-w-[420px] bg-[#1a0c0b] border border-[#434343] rounded-[20px] overflow-hidden flex flex-col"
                style={{ maxHeight: "90vh" }}
              >
                {/* Image */}
                <motion.div layoutId={`event-image-${selectedId}`} className="relative w-full h-[320px] flex-shrink-0">
                  <Image src={selected.image} alt={selected.title} fill className="object-cover" sizes="420px" />
                  {/* Close button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedId(null)}
                    className="absolute top-4 right-4 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.button>
                </motion.div>

                {/* Content */}
                <div className="px-6 py-6 flex flex-col gap-4">
                  <div>
                    <motion.p layoutId={`event-category-${selectedId}`} className="font-redhat text-[11px] font-bold uppercase tracking-[1px] text-[rgba(250,245,245,0.45)] mb-1">
                      {selected.category}
                    </motion.p>
                    <motion.p layoutId={`event-title-${selectedId}`} className="font-righteous text-[22px] text-white leading-tight">
                      {selected.title}
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col gap-3 border-t border-[rgba(67,67,67,0.4)] pt-4"
                  >
                    <div className="flex items-start gap-3">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 mt-0.5">
                        <path d="M9 1.5C6.1 1.5 3.75 3.85 3.75 6.75C3.75 10.6875 9 16.5 9 16.5C9 16.5 14.25 10.6875 14.25 6.75C14.25 3.85 11.9 1.5 9 1.5ZM9 8.625C7.965 8.625 7.125 7.785 7.125 6.75C7.125 5.715 7.965 4.875 9 4.875C10.035 4.875 10.875 5.715 10.875 6.75C10.875 7.785 10.035 8.625 9 8.625Z" fill="rgba(250,245,245,0.5)" />
                      </svg>
                      <span className="font-inter text-[14px] text-[rgba(250,245,245,0.75)]">{selected.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
                        <path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM9 15C5.6925 15 3 12.3075 3 9C3 5.6925 5.6925 3 9 3C12.3075 3 15 5.6925 15 9C15 12.3075 12.3075 15 9 15ZM9.375 5.25H8.25V9.75L12.1875 12.1125L12.75 11.1825L9.375 9.1875V5.25Z" fill="rgba(250,245,245,0.5)" />
                      </svg>
                      <span className="font-inter text-[14px] text-[rgba(250,245,245,0.75)]">{selected.time}</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
