'use client';

export default function AboutBanner() {
  return (
    <section className="relative w-full h-[340px] overflow-hidden flex items-center justify-center">
      {/* Background image */}
      <img
        src="/banner.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* GREEN OVERLAY — Figma color #22503B at 20% opacity */}
      <div className="absolute inset-0 bg-[#22503B]/80 opacity-[0.60]" />

      {/* Text */}
      <div className="relative z-10 text-center px-4">
        <p className="font-poppins font-semibold text-[36px] leading-[138%] text-white">
          We offer{' '}
          <span className="text-[#F4C34C]">a wing out of the shadows</span>
          <br />
          through work and dignity.
        </p>
      </div>
    </section>
  );
}
