"use client";

import React from "react";
import { motion } from "framer-motion";

interface HeroProps {
  onBookNow?: () => void;
}

const GRADIENT_STYLE = {
  background:
    "linear-gradient(90deg, rgb(233,55,37) 12%, rgb(233,54,77) 34%, rgb(233,54,131) 60%, rgb(233,56,201) 100%)",
} as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function Hero({ onBookNow }: HeroProps) {
  return (
    <section className="relative h-screen w-full lg:h-[800px]">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-[20%_center] lg:object-center"
      >
        {/* Safari — MP4 */}
        <source src="/videos/fromsafari.mp4" type="video/mp4" />
        {/* Chrome, Firefox, Edge — WebM */}
        <source src="/videos/forchrome.webm" type="video/webm" />
      </video>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.93) 100%)",
        }}
      />

      {/* Text container */}
      <motion.div
        className="absolute bottom-[100px] left-0 right-0 px-5 lg:bottom-[97px] lg:px-[120px] max-w-[1440px] lg:mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={childVariants}
          className="w-[215px] font-righteous text-[34px] leading-none text-[#faf5f5] lg:w-auto lg:max-w-[747px] lg:uppercase lg:text-[84px] lg:leading-[0.94] lg:tracking-[-1.5px]"
        >
          Welcome to Turkmenistan
        </motion.h1>

        <motion.p
          variants={childVariants}
          className="mt-[18px] max-w-[215px] font-inter text-base text-[#faf5f5] lg:max-w-none lg:mt-6 lg:text-xl"
        >
          World&apos;s last great undiscovered destination
        </motion.p>

        <motion.button
          variants={childVariants}
          type="button"
          onClick={onBookNow}
          style={GRADIENT_STYLE}
          className="mt-[38px] cursor-pointer rounded-lg px-5 py-3.5 font-righteous text-sm uppercase tracking-[0.28px] text-white transition-opacity hover:opacity-90 lg:mt-6 lg:px-9 lg:py-4 lg:text-base"
        >
          Book Your Ticket &rarr;
        </motion.button>
      </motion.div>
    </section>
  );
}
