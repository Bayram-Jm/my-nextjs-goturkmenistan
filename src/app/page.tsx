"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MobileMenu from "@/components/MobileMenu";
import BookTicket from "@/components/BookTicket";
import Ashgabat from "@/components/Ashgabat";
import Events from "@/components/Events";
import Heritage from "@/components/Heritage";
import Nature from "@/components/Nature";
import Cuisine from "@/components/Cuisine";
import PayWithEase from "@/components/PayWithEase";
import Tours from "@/components/Tours";
import AppUse from "@/components/AppUse";
import Footer from "@/components/Footer";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <main className="bg-dark min-h-screen">
      <Header
        onMenuOpen={() => setMenuOpen(true)}
        onBookNow={() => setBookingOpen(true)}
      />
      <Hero onBookNow={() => setBookingOpen(true)} />
      <Ashgabat />
      <Events />
      <Heritage />
      <Nature />
      <Cuisine />
      <PayWithEase />
      <Tours onBookNow={() => setBookingOpen(true)} />
      <AppUse />
      <Footer />

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <BookTicket isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </main>
  );
}
