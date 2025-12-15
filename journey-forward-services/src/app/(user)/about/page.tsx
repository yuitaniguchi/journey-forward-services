import AboutIntro from "@/components/about/AboutIntro";
import AboutStory from "@/components/about/AboutStory";
import AboutBanner from "@/components/about/AboutBanner";
import WhyDifferent from "@/components/about/WhyDifferent";
import WhatWeOffer from "@/components/about/WhatWeOffer";
import Partners from "@/components/about/Partners";
import AboutCTA from "@/components/about/AboutCTA";

export default function AboutPage() {
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
            About Us
          </p>
          <h1 className="text-3xl font-bold text-black md:text-5xl">
            we help people move forward{" "}
          </h1>
        </div>
      </section>
      <AboutIntro />
      <AboutStory />
      <AboutBanner />
      <WhyDifferent />
      <WhatWeOffer />
      <hr className="border-[#9D9D9D]" />
      <Partners />
      <AboutCTA />
    </main>
  );
}
