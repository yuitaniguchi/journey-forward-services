import BookingForm from "@/components/forms/BookingForm";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative flex w-full items-center justify-center overflow-hidden border-b border-slate-100 bg-[#F5F5F5] py-10 md:py-14">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "url('/header-pattern.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <h1 className="relative z-10 text-center text-3xl font-bold text-[#1f2933] md:text-5xl">
          Get an Estimate
        </h1>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <BookingForm />
      </section>
    </main>
  );
}
