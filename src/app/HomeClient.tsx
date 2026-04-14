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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HomeClient({ content }: { content: Record<string, any> }) {
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
      <Hero content={content.hero} onBookNow={() => setIsBookOpen(true)} />
      <Ashgabat content={content.ashgabat} />
      <Events content={content.events} />
      <Heritage content={content.heritage} />
      <Nature content={content.nature} />
      <Cuisine content={content.cuisine} />
      <PayWithEase content={content.paywithease} />
      <Tours content={content.tours} onBookNow={() => setIsBookOpen(true)} />
      <BookTicket isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />
      <AppUse content={content.apps} />
      <Footer content={content.footer} />
    </main>
  );
}
