"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/home/hero-iamge.png"
          alt="Journey Forward crew"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/75 to-white/10 md:hidden" />
      </div>

      <div className="section-inner relative z-10 container mx-auto px-4">
        <div className="max-w-[640px] space-y-6 text-center md:text-left mx-auto md:mx-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-black leading-tight">
            <span className="relative inline-block text-[#22503B]">
              Quickly
              <Image
                src="/home/hero-underline.svg"
                alt=""
                width={200}
                height={20}
                className="absolute left-[55%] -translate-x-1/2 top-full -mt-0.5 w-[70%] h-auto"
              />
            </span>{" "}
            book and
            <br />
            clear out unwanted items
          </h1>

          <p className="text-xl text-black">
            Book your junk removal or delivery service in minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
