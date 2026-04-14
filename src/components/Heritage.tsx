"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import content from "../../content/heritage.json";

const DOT_COUNT = content.sites.length;

export default function Heritage() {
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

  const selected = selectedId !== null ? content.sites[selectedId] : null;

  return (
    <section id="heritage" className="bg-[#f01e0e] py-16 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-[120px]">
        {/* Top area */}
        <div className="flex flex-col lg:flex-row lg:justify-between">
          <div className="lg:max-w-[639px]">
            <h2 className="font-righteous uppercase text-[#faf5f5] text-[34px] leading-[0.94] lg:text-[72px]">
              {content.sectionTitle}
            </h2>
            <div className="lg:hidden mt-8 w-full h-[441px] rounded-[20px] overflow-hidden relative">
              <Image src={content.mainImage} alt="Heritage" fill className="object-cover" />
            </div>
            <p className="font-righteous text-2xl text-[#faf5f5] mt-10">{content.subheading}</p>
            <p className="font-inter text-base text-[rgba(250,245,245,0.85)] leading-[1.6] max-w-[571px] mt-4">
              {content.description}
            </p>
          </div>
          <div className="hidden lg:block w-[384px] h-[423px] rounded-[20px] overflow-hidden relative flex-shrink-0">
            <Image src={content.mainImage} alt="Heritage" fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* Heritage Story Carousel */}
      <div className="mt-12">
        <div ref={carouselRef} className="flex overflow-x-auto scrollbar-hide gap-2 lg:gap-6 carousel-pl snap-x snap-mandatory">
          {content.sites.map((story, index) => (
            <motion.div
              key={story.id}
              layoutId={`heritage-card-${index}`}
              onClick={() => setSelectedId(index)}
              className="min-w-[353px] lg:min-w-[384px] h-[214px] lg:h-[280px] rounded-[20px] overflow-hidden relative flex-shrink-0 cursor-pointer snap-start"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <motion.div layoutId={`heritage-image-${index}`} className="absolute inset-0">
                <Image src={story.image} alt={story.name} fill className="object-cover" />
              </motion.div>
              <div className="absolute bottom-0 w-full h-[56px] bg-[rgba(0,0,0,0.7)] rounded-b-[20px] flex items-center px-8">
                <motion.span
                  layoutId={`heritage-name-${index}`}
                  className="font-righteous text-2xl text-white"
                  style={{ textShadow: "0px 1px 4px black" }}
                >
                  {story.name}
                </motion.span>
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
                i === activeDot ? "w-2.5 h-2.5 bg-[#faf5f5]" : "w-2 h-2 bg-[rgba(250,245,245,0.3)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {selected !== null && selectedId !== null && (
          <>
            <motion.div
              key="heritage-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none">
              <motion.div
                layoutId={`heritage-card-${selectedId}`}
                className="pointer-events-auto w-full max-w-[420px] rounded-[24px] overflow-hidden relative"
                style={{ height: "520px" }}
              >
                <motion.div layoutId={`heritage-image-${selectedId}`} className="absolute inset-0">
                  <Image src={selected.image} alt={selected.name} fill className="object-cover" sizes="420px" />
                </motion.div>

                {/* Gradient overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                />

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

                {/* Name at bottom */}
                <div className="absolute bottom-0 w-full px-8 pb-8">
                  <motion.span
                    layoutId={`heritage-name-${selectedId}`}
                    className="font-righteous text-[32px] text-white block"
                    style={{ textShadow: "0px 2px 8px black" }}
                  >
                    {selected.name}
                  </motion.span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
