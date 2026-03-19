"use client";

export default function NfcTable({ scans = [] }) {
  if (!scans || scans.length === 0) return <div>Aucun scan récent</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-2">Tag ID</th>
            <th className="p-2">User</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((s, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{s.tagId}</td>
              <td className="p-2">{s.user}</td>
              <td className="p-2">{new Date(s.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
