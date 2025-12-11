// src/app/contact/page.tsx
import NavBar from '@/components/landing/NavBar';
import Footer from '@/components/landing/Footer';
import ContactSection from '@/components/contact/ContactSection';

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-neutralBg antialiased">
      <ContactSection showPageHeading />
    </main>
  );
}
