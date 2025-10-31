// ---------- src/components/LogViewer.tsx ----------
import React, { useEffect, useState } from "react";
import axios from "axios";
// Em outros arquivos .ts
import { API_BASE_URL } from '../Core/config';

interface LogViewerProps {
  client?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function LogViewer({ client }: LogViewerProps) {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client) return;
    const fetchData = async () => {
      setLogs(`🔄 Iniciando sincronização para ${client}...`);
      setLoading(true);
      try {
        await sleep(400);
        const { data } = await axios.get(`${API_BASE_URL}/initializing`);

        const stats = data.stats || [];
        const performance = data.performance || [];
        const securityAnalytics = data.securityAnalytics || [];

        const formattedStats = stats
          .map((s: any) => {
            const d = new Date(s.month_year).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
            return `➡️ ${d} - Linhas: ${s.line_count}`;
          })
          .join("\n");

        const formattedPerformance = performance
          .map((i: any) => `⚠️ Host coletado em: ${new Date(i.created_at).toLocaleDateString("pt-BR")}`)
          .join("\n");

        const minTs = new Date(securityAnalytics[0]?.min_ts).toLocaleDateString("pt-BR");
        const maxTs = new Date(securityAnalytics[0]?.max_ts).toLocaleDateString("pt-BR");

        setLogs(
          (prev) =>
            prev +
            `\n✅ Dados sincronizados!\n\n🔄 Dados de Traffic:\n${formattedStats}\n${formattedPerformance}\n⚠️ Amostragem: ${minTs} → ${maxTs}`
        );
      } catch (err: any) {
        setLogs((prev) => prev + `\n❌ Erro: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client]);

  return (
    <div className="rounded-lg bg-white shadow-inner p-3 h-64 overflow-y-auto text-sm font-mono whitespace-pre-line mt-4">
      {loading ? "Carregando..." : logs || "Nenhum log ainda."}
    </div>
  );
}
