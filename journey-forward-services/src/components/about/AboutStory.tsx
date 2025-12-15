"use client";

export default function AboutStory() {
  return (
    <section className="section bg-white pb-20">
      <div className="section-inner md:flex md:items-center md:justify-between md:gap-16">
        {/* Image – left side, matching Figma card */}
        <div className="flex-1 flex justify-start">
          <div className="relative w-full max-w-[560px] h-[260px] md:h-[300px] lg:h-[320px] overflow-hidden shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
            <img
              src="/about/friends.webp"
              alt="Two friends smiling"
              className="h-full w-full object-cover rounded-md"
            />
          </div>
        </div>

        {/* Text – right side */}
        <div className="flex-1 mt-10 md:mt-0 space-y-4">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-snug text-slate-900">
            Cleaning Up Lives, <br className="hidden md:block" />
            Not Just Junk
          </h2>

          <p className="text-sm md:text-[15px] leading-relaxed text-slate-600 max-w-lg">
            Journey Forward Services exists to change that. We give people in
            recovery a real second chance through honest work, hands-on
            training, and purpose. Every junk removal, move, or delivery we do
            isn&apos;t just a job—it&apos;s a step toward healing and dignity.
          </p>
        </div>
      </div>
    </section>
  );
}
