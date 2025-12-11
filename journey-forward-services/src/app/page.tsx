import Hero from "../components/landing/Hero";
import AvailabilityCheckSection from "../components/landing/AvailabilityCheckSection";
import { HowItWorks } from "../components/landing/HowItWorks";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import { FAQContact } from "../components/landing/FAQContact";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col antialiased">
      <Hero />
      <HowItWorks />
      <AvailabilityCheckSection />
      <Pricing />
      <Features />

      <FAQContact />
    </main>
  );
}
