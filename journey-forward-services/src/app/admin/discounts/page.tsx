import { prisma } from "@/lib/prisma";
import DiscountManager from "@/components/admin/DiscountManager";

export const dynamic = "force-dynamic";

export default async function DiscountPage() {
  const discounts = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f8faf9] px-6 py-8 md:px-12 md:py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900">
          Discount Codes
        </h1>
        <p className="mt-2 text-slate-600">
          Manage promotional codes, coupons, and discounts.
        </p>
      </div>

      <DiscountManager initialDiscounts={discounts} />
    </main>
  );
}
