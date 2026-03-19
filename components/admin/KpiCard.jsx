export default function KpiCard({ title, value, icon }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
