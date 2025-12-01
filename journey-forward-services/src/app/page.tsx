import NavBar from '../components/landing/NavBar';
import Hero from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import { FAQContact } from '../components/landing/FAQContact';
import { Footer } from '../components/landing/Footer'; // <-- change this line

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col antialiased">
      <NavBar />
      <Hero />
      <HowItWorks />
      <Pricing />
      <Features />

      <FAQContact />
      <Footer />
    </main>
  );
}
