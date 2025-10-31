import { Card, CardContent } from "../../components/ui/card";
import type { Stats } from "../../Core/types";
import { motion } from "framer-motion";

interface TrafficStatsProps {
  stats: Stats;
}

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1e9) return (num / 1e9).toFixed(1) + " B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + " M";
  if (num >= 1e3) return (num / 1e3).toFixed(3) + "";
  return num.toString();
};

const formatBandwidth = (bytes) => {
  if (!bytes) return "0";
  const tb = bytes / 1e12;
  const gb = bytes / 1e9;
  if (tb >= 1) return tb.toFixed(1) + " TB";
  if (gb >= 1) return gb.toFixed(3) + " GB";
  return bytes.toFixed(0) + " B";
};

const TrafficStats: React.FC<TrafficStatsProps> = ({ stats }) => {
  const data = [
    { label: "Total de Requisições", value: formatNumber(stats.total_requests) },
    { label: "Dados Transferidos", value: formatBandwidth(stats.bandwidth_used) },
    { label: "Total de Visitas", value: formatNumber(stats.unique_visits) },
    { label: "Páginas Visualizadas", value: formatNumber(stats.page_views) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-2">
      {data.map((stat, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.04 }}
          className="overflow-hidden px-2 pt-2"
        >
          <Card className="bg-blue-50">
            <CardContent className="flex flex-col justify-center items-center py-3">
              <div className="text-2xl font-bold text-blue-900">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

  );
};

export default TrafficStats;
