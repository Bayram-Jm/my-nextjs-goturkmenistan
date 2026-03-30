import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppUse from "@/components/AppUse";
import Ashgabat from "@/components/Ashgabat";
import BookTicket from "@/components/BookTicket";
import Cuisine from "@/components/Cuisine";
import Events from "@/components/Events";
import Footer from "@/components/Footer";
import Heritage from "@/components/Heritage";
import Nature from "@/components/Nature";
import PayWithEase from "@/components/PayWithEase";
import Tours from "@/components/Tours";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <AppUse />
      <Tours />
      <Ashgabat />
      <Heritage />
      <Nature />
      <Cuisine />
      <Events />
      <PayWithEase />
      <BookTicket />
      <Footer />
    </main>
  );
}