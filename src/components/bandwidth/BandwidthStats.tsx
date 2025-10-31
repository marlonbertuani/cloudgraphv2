import { useEffect, useState } from "react";
import { CacheOriginChart } from "./CacheOriginChart";
import { DistributionOverTimeChart } from "./DistributionOverTimeChart";
import { API_BASE_URL } from "../../Core/config";
import axios from "axios";
import moment from "moment";

interface BandwidthStatsProps {
  clientName: string;
  selectedMonth: string;
}

export const BandwidthStats: React.FC<BandwidthStatsProps> = ({ clientName, selectedMonth }) => {
  const [data, setData] = useState<{ name: string; cache: number; origin: number }[]>([]);
  const [data2, setData2] = useState<{ ts: string; servedByCloudflare?: number; servedByOrigin?: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsRes = await axios.get(`${API_BASE_URL}/clientes`);
        const client = clientsRes.data.find((c: any) => c.client_name === clientName);
        if (!client) return;

        const statsRes = await axios.get(`${API_BASE_URL}/stats/${client.account_id}`);
        const formattedData = statsRes.data.map((item: any) => {
          const date = new Date(item.month_year);
          date.setHours(date.getHours() + 27);
          return {
            name: date.toLocaleString("pt-BR", { month: "short", year: "2-digit" }),
            cache: Number(item.cache_percentage.toFixed(2)),
            origin: Number(item.origin_percentage.toFixed(2)),
          };
        });
        setData(formattedData);

        const resultRes = await axios.get(
          `${API_BASE_URL}/graph-data/${encodeURIComponent(clientName)}?monthRef=${encodeURIComponent(selectedMonth)}`
        );

        const grouped: any = {};
        resultRes.data.data.forEach((item: any) => {
          const { ts, type, count } = item;
          if (!grouped[ts]) grouped[ts] = { ts };
          grouped[ts][type] = count;
        });
        setData2(Object.values(grouped));
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [clientName, selectedMonth]);

  const months = Array.from({ length: 3 }).map((_, i) =>
    moment().subtract(i + 1, "months").format("MM-YYYY")
  );

  return (
    <div>
      <CacheOriginChart data={data} />
      <DistributionOverTimeChart data={data2} />
    </div>
  );
};
