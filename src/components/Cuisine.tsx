"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import defaultContent from "../../content/cuisine.json";

type CuisineContent = typeof defaultContent;

interface CuisineProps {
  content?: CuisineContent;
}

const DOT_COUNT = 5;

export default function Cuisine({ content = defaultContent }: CuisineProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Loop at 20s
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handleTimeUpdate = () => {
      if (vid.currentTime >= 20) vid.currentTime = 0;
    };
    vid.addEventListener("timeupdate", handleTimeUpdate);
    return () => vid.removeEventListener("timeupdate", handleTimeUpdate);
  }, [videoOpen]);

  useEffect(() => {
    if (videoOpen || selectedDish !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (videoRef.current && !videoOpen) videoRef.current.pause();
    }
    return () => { document.body.style.overflow = ""; };
  }, [videoOpen, selectedDish]);

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

  const scrollToDot = (index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (index / (DOT_COUNT - 1)) * maxScroll, behavior: "smooth" });
  };

  return (
    <section id="cuisine" className="bg-[#100706] py-16 overflow-hidden">
      {/* Header */}
      <div className="px-5 lg:px-[120px] max-w-[1440px] lg:mx-auto">
        <h2 className="font-righteous text-[34px] lg:text-[72px] uppercase text-[#faf5f5] leading-[0.94] text-left">
          {content.titleLeft}
        </h2>
        <h2 className="font-righteous text-[34px] lg:text-[72px] uppercase text-[#faf5f5] leading-[0.94] text-right">
          {content.titleRight}
        </h2>
        <p className="font-inter text-base text-[#faf5f5] leading-[1.6] max-w-[558px] mx-auto text-center mt-6">
          {content.description}
        </p>
      </div>

      {/* Video Card */}
      <div className="mt-10 flex justify-center px-5 lg:px-[120px] max-w-[1440px] lg:mx-auto">
        <div
          className="w-[353px] lg:w-[384px] h-[416px] lg:h-[503px] rounded-[20px] relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url('${content.videoThumbnail}')` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setVideoOpen(true)}
              className="w-[94px] h-[94px] bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path d="M8 5.5V24.5L24 15L8 5.5Z" fill="white" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dish Cards Carousel */}
      <div className="mt-10">
        <div className="px-5 lg:hidden">
          <h3 className="font-righteous text-2xl text-[#faf5f5] mb-4">{content.mustTryLabel}</h3>
        </div>
        <div ref={carouselRef} className="flex gap-3.5 overflow-x-auto scrollbar-hide carousel-pl snap-x snap-mandatory">
          {content.dishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              layoutId={`dish-card-${index}`}
              onClick={() => setSelectedDish(index)}
              className="min-w-[167px] flex flex-col flex-shrink-0 cursor-pointer snap-start"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <motion.div layoutId={`dish-image-${index}`} className="h-[179px] rounded-[10px] overflow-hidden relative">
                <Image src={dish.image} alt={dish.name} fill className="object-cover" />
              </motion.div>
              <motion.span layoutId={`dish-name-${index}`} className="font-righteous text-sm text-[#faf5f5] mt-3.5">{dish.name}</motion.span>
              <span className="font-inter text-xs text-[#524442]">{dish.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToDot(i)}
              className={`transition-all duration-300 rounded-[3px] ${
                i === activeDot
                  ? "w-5 h-1.5 bg-[#f01e0e]"
                  : "w-1.5 h-1.5 bg-[rgba(250,245,245,0.3)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Credit Text */}
      <div className="mt-10 flex justify-center px-5 lg:px-[120px] max-w-[1440px] lg:mx-auto">
        <ul className="list-disc">
          <li className="font-inter text-base text-[#524442]">
            We thank the restaurant of national cuisine{" "}
            <span className="underline text-[#faf5f5]">{content.creditRestaurant}</span> for the provided food photographs.
          </li>
        </ul>
      </div>

      {/* ── Dish Expanded Modal ── */}
      <AnimatePresence>
        {selectedDish !== null && (
          <>
            <motion.div
              key="dish-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedDish(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none">
              <motion.div
                layoutId={`dish-card-${selectedDish}`}
                className="pointer-events-auto w-full max-w-[360px] bg-[#1a0c0b] rounded-[20px] overflow-hidden"
              >
                <motion.div layoutId={`dish-image-${selectedDish}`} className="relative w-full h-[320px]">
                  <Image src={content.dishes[selectedDish].image} alt={content.dishes[selectedDish].name} fill className="object-cover" sizes="360px" />
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedDish(null)}
                    className="absolute top-4 right-4 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.button>
                </motion.div>
                <div className="px-6 py-5">
                  <motion.span layoutId={`dish-name-${selectedDish}`} className="font-righteous text-[22px] text-[#faf5f5] block">
                    {content.dishes[selectedDish].name}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-inter text-sm text-[#524442] mt-1 block"
                  >
                    {content.dishes[selectedDish].label}
                  </motion.span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── Video Modal ── */}
      <AnimatePresence>
        {videoOpen && (
          <>
            <motion.div
              key="vbackdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
              onClick={() => setVideoOpen(false)}
            />
            <motion.div
              key="vmodal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-[720px] relative">
                {/* Close */}
                <button
                  onClick={() => setVideoOpen(false)}
                  className="absolute -top-12 right-0 w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(250,245,245,0.25)] text-[#faf5f5] hover:border-[rgba(250,245,245,0.6)] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Video */}
                <video
                  ref={videoRef}
                  src={content.videoSrc}
                  autoPlay
                  playsInline
                  className="w-full rounded-[16px] object-cover max-h-[80vh]"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}
