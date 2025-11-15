type RequestCardProps = {
  id: number;
};

export default function RequestCard({ id }: RequestCardProps) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Request Details</h2>
      <p className="text-slate-700 mb-2">Request ID: #{id}</p>
      <p className="text-slate-500 text-sm"></p>
    </div>
  );
}
