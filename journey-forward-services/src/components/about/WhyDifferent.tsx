'use client';

export default function WhyDifferent() {
  return (
    <section className="section bg-white py-16">
      <div className="section-inner space-y-10">
        {/* Heading */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Why We&apos;re Different
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Your support doesn&apos;t just clean a space—it changes a life. Help
            someone journey forward.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className=" border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Creates opportunity
            </h3>
            <p className="text-xs text-slate-600">
              Every job creates opportunity for someone to rebuild their life.
            </p>
          </div>

          <div className=" border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Reuse and recycle
            </h3>
            <p className="text-xs text-slate-600">
              We reuse and recycle to help both people and the planet.
            </p>
          </div>

          <div className=" border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              We keep prices low
            </h3>
            <p className="text-xs text-slate-600">
              Because purpose matters more than profit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
