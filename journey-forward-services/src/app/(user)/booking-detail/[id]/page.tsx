// src/app/(user)/booking-detail/[id]/page.tsx
import BookingDetailClient from "./BookingDetailClient";

type PageParams = Promise<{ id: string }>;

type BookingDetailPageProps = {
  params: PageParams;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  // サーバー側で Promise を unwrap
  const { id } = await params;

  return <BookingDetailClient requestId={id} />;
}
