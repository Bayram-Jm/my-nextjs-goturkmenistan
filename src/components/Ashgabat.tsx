"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

const DOT_COUNT = 5;

const images = [
  { src: "/images/ashgabat-1.jpg",  label: "Sunset in Ashgabat" },
  { src: "/images/ashgabat-2.jpg",  label: "Sunset in Ashgabat" },
  { src: "/images/ashgabat-3.jpg",  label: "Holiday in Ashgabat" },
  { src: "/images/ashgabat-4.jpg",  label: "Independence Park" },
  { src: "/images/ashgabat-5.jpg",  label: "Independence Monument" },
  { src: "/images/ashgabat-6.jpg",  label: "Indoor Ferris wheel" },
  { src: "/images/ashgabat-7.jpg",  label: "Hotel Ashgabat" },
  { src: "/images/ashgabat-8.jpg",  label: "Hotel Yyldyz" },
  { src: "/images/ashgabat-9.jpg",  label: "Wedding House" },
  { src: "/images/ashgabat-10.jpg", label: "Monument to Neutrality" },
  { src: "/images/ashgabat-11.jpg", label: "Indoor Ferris wheel" },
];

export default function Ashgabat() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

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
    <section id="ashgabat" className="bg-[#faf5f5] py-16">

      {/* Headings */}
      <motion.div
        className="max-w-[1440px] mx-auto px-5 lg:px-[120px] flex flex-col gap-[18px] lg:gap-0"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h2 className="font-righteous text-[34px] lg:text-[72px] uppercase text-[#100706] leading-[1.1] lg:leading-[0.94] w-[353px] lg:w-[879px]">
          GUINNESS-CERTIFIED BEAUTIFUL
        </h2>
        <h2 className="font-righteous text-[34px] lg:text-[72px] uppercase text-[#100706] leading-[1.1] lg:leading-[0.94] text-right w-[353px] lg:w-[663px] lg:ml-auto">
          THE ONE AND ONLY ASHGABAT
        </h2>
      </motion.div>

      {/* Carousel */}
      <div className="mt-10">
        <div ref={carouselRef} className="flex overflow-x-auto scrollbar-hide gap-2 carousel-pl snap-x snap-mandatory">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-[280px] h-[420px] lg:w-[344px] lg:h-[537px] rounded-[20px] overflow-hidden snap-start"
            >
              <Image src={img.src} alt={img.label} fill className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 h-[81px] bg-[rgba(0,0,0,0.7)] rounded-b-[20px] flex items-center px-[30px]">
                <span className="font-righteous text-white whitespace-nowrap" style={{ fontSize: "clamp(13px, 4.5vw, 24px)" }}>{img.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToDot(i)}
              className={`transition-all duration-300 rounded-[3px] ${
                i === activeDot
                  ? "w-5 h-1.5 bg-[#f01e0e]"
                  : "w-1.5 h-1.5 bg-[rgba(16,7,6,0.2)]"
              }`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
