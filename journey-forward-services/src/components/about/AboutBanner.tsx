"use client";

export default function AboutBanner() {
  return (
    <section className="relative w-full h-[500px] md:h-[340px] overflow-hidden flex items-center justify-center">
      <img
        src="/about/banner.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 bg-[#22503B] opacity-85 z-10" />

      <img
        src="/about/about-logo.png"
        alt=""
        className="md:hidden absolute bottom-0 right-0 w-[90%] max-w-[500px] h-auto object-contain opacity-[0.07] z-15 transform translate-x-1/3 translate-y-1/4 pointer-events-none"
      />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 h-full flex items-center justify-center">
        {/* Text */}
        <div className="text-center">
          <p className="font-poppins font-semibold text-[32px] sm:text-4xl md:text-[36px] leading-tight md:leading-[138%] text-white max-w-[300px] sm:max-w-sm md:max-w-none mx-auto drop-shadow-sm">
            We offer
            <span className="text-[#F9B301]">a wing out of the shadows</span>
            <br className="hidden md:block" /> through work and dignity.
          </p>
        </div>

        <img
          src="/about/about-logo.png"
          alt="Logo"
          className="hidden md:block absolute right-8 lg:right-16 bottom-0 w-44 lg:w-68 h-auto opacity-95"
        />
      </div>
    </section>
  );
}
