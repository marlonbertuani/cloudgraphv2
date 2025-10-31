import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../Core/config";
import moment from "moment";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { SecurityCards } from "@/components/TrafficSecurity/TrafficCards";
import { SecurityChart } from "@/components/TrafficSecurity/TrafficChart";
import { SecurityTable } from "@/components/TrafficSecurity/TrafficStats";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const generateLastMonths = (count = 3): string[] =>
  Array.from({ length: count }).map((_, i) =>
    moment().subtract(i + 1, "months").format("MM-YYYY")
  );

export default function TrafficSecurityPage() {
  const { clientName } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(moment().subtract(1, "months").format("MM-YYYY"));
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    totalMitigated: 0,
    validRequests: 0,
    blockedRequests: 0,
    totalblock: 0,
    totalManaged: 0,
    totalInteractive: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const encodedClientName = encodeURIComponent(clientName || "");
        const response = await fetch(`${API_BASE_URL}/graph-datasec/${encodedClientName}?monthRef=${selectedMonth}`);
        const result = await response.json();

        const grouped: Record<string, any> = {};
        result.data.forEach((item: any) => {
          const { ts, eventType, eventCount } = item;
          if (!grouped[ts]) grouped[ts] = { ts };
          grouped[ts][eventType] = eventCount;
        });

        await sleep(400);
        setData(Object.values(grouped));
        setMetrics({
          totalRequests: result.requests_total,
          validRequests: result.valid_requests,
          blockedRequests: result.blockedPercentage,
          totalMitigated: (result.mitigated_requests || 0) + (result.totalManaged || 0) + (result.totalInteractive || 0),
          totalblock: result.mitigated_requests,
          totalManaged: result.totalManaged,
          totalInteractive: result.totalChallange,
        });
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };

    fetchData();
  }, [clientName, selectedMonth]);

  return (
    <div className="bg-gray-100 p-4 rounded-2xl shadow-lg mt-2">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-bold text-center text-blue-900 uppercase tracking-wider bg-blue-50 px-4 py-2 rounded-lg"
        >
          Análise de Tráfego x Segurança – {clientName}
        </motion.h1>

        <div className="mt-3 md:mt-0">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Mês de Referência" />
            </SelectTrigger>
            <SelectContent>
              {generateLastMonths().map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SecurityCards metrics={metrics} />
      <SecurityChart data={data} />
      <SecurityTable
        totalblock={metrics.totalblock}
        totalManaged={metrics.totalManaged}
        totalInteractive={metrics.totalInteractive}
      />

      <div className="flex justify-between gap-2">
        <Button
          variant="default"
          className="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
          onClick={() => window.history.back()}
        >
          Voltar
        </Button>
        <Button
          variant="secondary"
          className="flex-1 bg-gray-200 hover:bg-gray-300"
          onClick={() => navigate(`/RequestMetricsPage/${clientName}`)}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
