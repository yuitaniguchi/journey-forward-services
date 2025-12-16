"use client";

export default function Partners() {
  return (
    <section className="bg-[#F7F7F7] py-12 md:py-16">
      {" "}
      <div className="container mx-auto px-4 text-center space-y-8">
        {" "}
        <p className="text-sm md:text-base text-gray-600 font-medium">
          {" "}
          We’re partnership with
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <img
            src="/about/journey.webp"
            alt="Journey Home Community"
            className="h-12 w-auto md:h-14 object-contain"
          />
          <img
            src="/about/union.webp"
            alt="Union Gospel Mission"
            className="h-16 w-auto md:h-24 object-contain"
          />
        </div>
      </div>
    </section>
  );
}
