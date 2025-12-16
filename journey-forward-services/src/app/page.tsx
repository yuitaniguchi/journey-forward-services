import Hero from "../components/landing/Hero";
import AvailabilityCheckSection from "../components/landing/AvailabilityCheckSection";
import { HowItWorks } from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import Pricing from "../components/landing/Pricing";
import FAQ from "../components/landing/FAQ";
import Contact from "@/components/contact/ContactSection";
import About from "@/components/landing/About";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col antialiased">
      <Hero />
      <HowItWorks />
      <AvailabilityCheckSection />
      <About />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Contact showWatermark />
    </main>
  );
}
