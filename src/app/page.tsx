"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ashgabat from "@/components/Ashgabat";
import Events from "@/components/Events";
import Heritage from "@/components/Heritage";
import Tours from "@/components/Tours";
import Nature from "@/components/Nature";
import Cuisine from "@/components/Cuisine";
import PayWithEase from "@/components/PayWithEase";
import BookTicket from "@/components/BookTicket";
import AppUse from "@/components/AppUse";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";

export default function Home() {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main>
      <Header
        onMenuOpen={() => setIsMenuOpen(true)}
        onBookNow={() => setIsBookOpen(true)}
      />
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <Hero onBookNow={() => setIsBookOpen(true)} />
      <Ashgabat />
      <Events />
      <Heritage />
      <Nature />
      <Cuisine />
      <PayWithEase />
      <Tours onBookNow={() => setIsBookOpen(true)} />
      <BookTicket isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />
      <AppUse />
      <Footer />
    </main>
  );
}
