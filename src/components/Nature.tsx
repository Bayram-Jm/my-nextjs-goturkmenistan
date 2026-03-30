"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const natureCards = [
  { name: "Yangygala",                 location: "Canyon Yangygala/Balkan",  image: "/images/nature-1.jpg" },
  { name: "Yangygala",                 location: "Canyon Yangygala/Balkan",  image: "/images/nature-2.jpg" },
  { name: "Koytendag Mountains",       location: "Koytendag/Lebap",          image: "/images/nature-3.jpg" },
  { name: "Foothills of the Kopetdag", location: "Mountains Kopetdag/Ahal",  image: "/images/nature-4.jpg" },
  { name: "The Fire Gate of Darvaza",  location: "Desert Karakum/Ahal",      image: "/images/nature-5.jpg" },
  { name: "The Fire Gate of Darvaza",  location: "Desert Karakum/Ahal",      image: "/images/nature-6.jpg" },
  { name: "Craters in the desert",     location: "Desert Karakum/Ahal",      image: "/images/nature-7.jpg" },
  { name: "Health Path",               location: "Mountains Kopetdag/Ahal",  image: "/images/nature-8.jpg" },
  { name: "Kov Ata Cave",              location: "Mountains Kopetdag/Ahal",  image: "/images/nature-9.jpg" },
  { name: "Desert Karakum",            location: "Karakum/Ahal",             image: "/images/nature-10.jpg" },
  { name: "Desert Karakum",            location: "Karakum/Ahal",             image: "/images/nature-11.jpg" },
  { name: "Camp in Karakum",           location: "Karakum/Ahal",             image: "/images/nature-12.jpg" },
  { name: "Khauz-Khan Lakes",          location: "Mary",                     image: "/images/nature-13.jpg" },
  { name: "Nokhur Valley",             location: "Nokhur/Ahal",              image: "/images/nature-14.jpg" },
  { name: "Avaza",                     location: "Caspian Sea/Balkan",       image: "/images/nature-15.jpg" },
];

const DOT_COUNT = natureCards.length;

export default function Nature() {
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

  const selected = selectedId !== null ? natureCards[selectedId] : null;

  return (
    <section id="nature" className="bg-[#faf5f5] py-16 overflow-hidden">
      {/* Header */}
      <div className="px-5 lg:px-[120px] max-w-[1440px] lg:mx-auto">
        <h2 className="font-righteous uppercase text-[#100706] text-[34px] leading-[1.1] lg:text-[72px] lg:leading-[0.94] lg:max-w-[640px]">
          THE LAND BEFORE TOURISM
        </h2>
        <p className="font-inter text-base text-[#524442] leading-[1.6] max-w-[640px] mt-4">
          Turkmenistan doesn&apos;t choose one landscape — it claims them all.
          Burning deserts, snow-capped peaks, a glittering sea, endless steppe,
          and wildlife that roams free. All within one border. All waiting.
        </p>
      </div>

      {/* Nature Cards Carousel */}
      <div className="mt-10">
        <div ref={carouselRef} className="flex overflow-x-auto scrollbar-hide gap-2 lg:gap-3 carousel-pl snap-x snap-mandatory">
          {natureCards.map((card, index) => (
            <motion.div
              key={index}
              layoutId={`nature-card-${index}`}
              onClick={() => setSelectedId(index)}
              className="min-w-[280px] lg:min-w-[344px] flex flex-col flex-shrink-0 cursor-pointer snap-start"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <motion.div layoutId={`nature-image-${index}`} className="h-[400px] lg:h-[537px] rounded-[20px] overflow-hidden relative">
                <Image src={card.image} alt={card.name} fill className="object-cover" />
              </motion.div>
              <div className="mt-6">
                <motion.h3 layoutId={`nature-name-${index}`} className="font-righteous text-2xl text-[#100706] leading-[45px]">
                  {card.name}
                </motion.h3>
                <motion.div layoutId={`nature-location-${index}`} className="flex items-center gap-2 mt-1">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ transform: "scaleY(-1)" }}>
                    <path d="M7.5 1.25C5.43 1.25 3.75 2.93 3.75 5C3.75 7.969 7.5 12.5 7.5 12.5C7.5 12.5 11.25 7.969 11.25 5C11.25 2.11 9.57 1.25 7.5 1.25ZM7.5 6.562C6.638 6.562 5.938 5.862 5.938 5C5.938 4.138 6.638 3.438 7.5 3.438C8.362 3.438 9.062 4.138 9.062 5C9.062 5.862 8.362 6.562 7.5 6.562Z" fill="#524442" />
                  </svg>
                  <span className="font-redhat text-base text-[#524442]">{card.location}</span>
                </motion.div>
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
      </div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {selected !== null && selectedId !== null && (
          <>
            <motion.div
              key="nature-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none">
              <motion.div
                layoutId={`nature-card-${selectedId}`}
                className="pointer-events-auto w-full max-w-[420px] bg-[#faf5f5] rounded-[24px] overflow-hidden"
              >
                {/* Image */}
                <motion.div layoutId={`nature-image-${selectedId}`} className="relative w-full h-[420px]">
                  <Image src={selected.image} alt={selected.name} fill className="object-cover" sizes="420px" />
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

                {/* Info */}
                <div className="px-6 py-6">
                  <motion.h3 layoutId={`nature-name-${selectedId}`} className="font-righteous text-[28px] text-[#100706]">
                    {selected.name}
                  </motion.h3>
                  <motion.div layoutId={`nature-location-${selectedId}`} className="flex items-center gap-2 mt-2">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ transform: "scaleY(-1)" }}>
                      <path d="M7.5 1.25C5.43 1.25 3.75 2.93 3.75 5C3.75 7.969 7.5 12.5 7.5 12.5C7.5 12.5 11.25 7.969 11.25 5C11.25 2.11 9.57 1.25 7.5 1.25ZM7.5 6.562C6.638 6.562 5.938 5.862 5.938 5C5.938 4.138 6.638 3.438 7.5 3.438C8.362 3.438 9.062 4.138 9.062 5C9.062 5.862 8.362 6.562 7.5 6.562Z" fill="#524442" />
                    </svg>
                    <span className="font-redhat text-base text-[#524442]">{selected.location}</span>
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
