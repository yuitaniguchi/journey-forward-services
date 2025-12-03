'use client';

export default function Partners() {
  return (
    <section className="section bg-white py-9">
      <div className="section-inner text-center space-y-6">
        <p className="text-xs md:text-sm text-slate-500">
          We&apos;re partnership with
        </p>

        <div className="flex flex-wrap items-center justify-center gap-10">
          <img
            src="/journey.webp"
            alt="Journey Home Community"
            className="h-10 md:h-12 object-contain"
          />
          <img
            src="/union.webp"
            alt="Union Gospel Mission"
            className="h-25 md:h-25 object-contain"
          />
        </div>
      </div>
    </section>
  );
}
