import type { Host } from "../Core/types";

interface HostsTableProps {
  hosts: Host[];
}

const HostsTable: React.FC<HostsTableProps> = ({ hosts }) => {
  const isDateWithin45Days = (dateStr: string) => {
    if (!dateStr || dateStr === "0/0/0") return false;
    const [day, month, year] = dateStr.split("/").map(Number);
    const expiry = new Date(year, month-1, day);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000*60*60*24));
    return diffDays <= 45 && diffDays >= 0;
  };

  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="px-4 py-2">Zones</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Served By Cloudflare</th>
            <th className="px-4 py-2">Served By Origin</th>
            <th className="px-4 py-2">Traffic Accelerated</th>
            <th className="px-4 py-2">Latency Improvement</th>
            <th className="px-4 py-2">Vencimento</th>
          </tr>
        </thead>
        <tbody>
          {hosts.length > 0 ? hosts.map((host, idx) => (
            <tr key={idx} className={`bg-white ${idx % 2 === 0 ? "bg-blue-100" : ""} hover:bg-blue-200 transition-colors cursor-pointer border-t last:border-b`}>
              <td className="px-4 py-2">{host.name}</td>
              <td className="px-4 py-2 text-right">{host.total_requests}</td>
              <td className="px-4 py-2 text-right">{host.cache_hit}</td>
              <td className="px-4 py-2 text-right">{host.origin_fetch}</td>
              <td className="px-4 py-2 text-right">{host.acceleration_percentage?.toFixed(2) || "-"}</td>
              <td className="px-4 py-2 text-right">{host.latency_improvement?.toFixed(2) || "-"}</td>
              <td className={`px-4 py-2 text-right ${isDateWithin45Days(host.vencimento) ? "text-red-600" : ""}`}>
                {host.vencimento === "0/0/0" ? "N/D" : host.vencimento}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">Nenhum dado disponível.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HostsTable;