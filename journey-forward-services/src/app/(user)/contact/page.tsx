import ContactSection from "@/components/contact/ContactSection";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="relative flex w-full flex-col items-center justify-center overflow-hidden border-b border-slate-100 bg-[#F5F5F5] py-10 md:py-14">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "url('/header-pattern.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="relative z-10 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#367D5E]">
            CONTACT
          </p>
          <h1 className="text-3xl font-bold text-black md:text-5xl">
            Let's talk with us
          </h1>
        </div>
      </section>
      <ContactSection />
    </main>
  );
}
