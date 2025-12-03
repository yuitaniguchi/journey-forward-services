'use client';

export default function AboutIntro() {
  return (
    <section className="section bg-white pb-16">
      <div className="section-inner md:flex md:items-center md:justify-between md:gap-16">
        {/* Text */}
        <div className="flex-1 space-y-4">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-snug text-slate-900">
            Metro Vancouver is stunning, <br className="hidden md:block" />
            but it hides deep brokenness.
          </h2>

          <p className="text-sm md:text-[15px] leading-relaxed text-slate-600 max-w-lg">
            Behind Vancouver&apos;s beauty lies a harsh truth: thousands
            struggle with addiction, homelessness, and hopelessness. Many fight
            their way toward recovery—but without stable work, most fall back.
          </p>

          <div className="flex flex-wrap gap-8 pt-4 text-brand-dark">
            <div>
              <p className="text-2xl font-semibold">5,000+</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Homeless
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold">2,500+</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Addiction
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold">70–80%</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Relapse rate
              </p>
            </div>
          </div>
        </div>

        {/* Image – matches Figma card position/size */}
        <div className="mt-10 flex-1 md:mt-0 flex justify-end">
          <div className="relative w-full max-w-[560px] h-[260px] md:h-[300px] lg:h-[320px]  overflow-hidden shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
            <img
              src="/street.webp" // your real image
              alt="Street scene in Vancouver"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
