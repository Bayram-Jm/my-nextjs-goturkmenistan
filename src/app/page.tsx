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

export default function Home() {
  const [isBookOpen, setIsBookOpen] = useState(false);

  return (
    <main>
      <Header />
      <Hero />
      <Ashgabat />
      <Events />
      <Heritage />
      <Tours onBookNow={() => setIsBookOpen(true)} />
      <Nature />
      <Cuisine />
      <PayWithEase />
      <BookTicket isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />
      <AppUse />
      <Footer />
    </main>
  );
}
