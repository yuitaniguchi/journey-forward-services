import RequestCard from "@/components/admin/RequestCard";

type PageProps = {
  params: { id: string };
};

export default function RequestDetailsPage({ params }: PageProps) {
  const idNum = Number(params.id);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
        <p>URL の ID が正しくありません。</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <RequestCard id={idNum} />
    </main>
  );
}
