import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/Core/config";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { formatDate, sleep, getFirstClientCreationDate } from "@/utils/format";

interface Client {
  account_id: string;
  client_name: string;
  created_at: string;
}

interface Stats {
  month_year: string;
  line_count: number;
}

interface Performance {
  created_at: string;
}

interface SecurityAnalytics {
  min_ts: string;
  max_ts: string;
}

interface InitResponse {
  clients: Client[];
  stats: Stats[];
  performance: Performance[];
  securityAnalytics: SecurityAnalytics[];
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      setLogs((prev) => (prev.includes("Iniciando") ? prev : prev + "\n🔄 Iniciando a sincronização dos dados!"));
      await fetchInitializationData();
    };
    init();
  }, []);

  const fetchInitializationData = async () => {
    setLoading(true);
    try {
      await sleep(400);
      const response = await axios.get<InitResponse>(`${API_BASE_URL}/initializing`);
      const { clients, stats, performance, securityAnalytics } = response.data;

      const uniqueClients = clients.filter(
        (client, index, self) => index === self.findIndex((c) => c.account_id === client.account_id)
      );
      setClients(uniqueClients);

      const creationDate = getFirstClientCreationDate(uniqueClients);
      if (creationDate) {
        const formattedDate = formatDate(creationDate);
        const newLog = `\n🔄 Clientes carregados com sucesso! Data da última atualização: ${formattedDate}`;
        setLogs((prev) => (prev.includes(newLog) ? prev : prev + newLog));
      }

      await sleep(400);
      const formattedStats = stats
        .map((s) => {
          const formattedDate = new Date(s.month_year).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          return `Data: ${formattedDate} - Linhas: ${s.line_count}`;
        })
        .join("\n");

      setLogs((prev) => {
        const sectionTitle = "\n🔄 Dados de Traffic:";
        const formatted = "\n" + formattedStats.split("\n").map((l) => `➡️ ${l}`).join("\n");
        let combined = prev;
        if (!prev.includes(sectionTitle)) combined += sectionTitle;
        if (!prev.includes(formatted)) combined += formatted;
        return combined;
      });

      await sleep(400);
      const formattedPerformance = performance
        .map((item) => {
          const formattedDate = formatDate(item.created_at);
          const doneday = new Date(item.created_at);
          doneday.setDate(doneday.getDate() - 1);
          const donedayStr = doneday.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
          return `⚠️ Dados dos Hosts coletados em: ${formattedDate} (30 dias antes de ${donedayStr})`;
        })
        .join("\n");

      setLogs((prev) => {
        const formatted = "\n" + formattedPerformance.split("\n").join("\n");
        return prev.includes(formatted) ? prev : prev + formatted;
      });

      await sleep(400);
      const minTs = formatDate(securityAnalytics[0].min_ts);
      const maxTs = formatDate(securityAnalytics[0].max_ts);
      const newSecurityLog = `\n⚠️ Dados para amostragem do gráfico: ${minTs} → ${maxTs}`;
      setLogs((prev) => (prev.includes(newSecurityLog) ? prev : prev + newSecurityLog));
    } catch (error: any) {
      console.error("Erro ao buscar dados de inicialização", error);
      setLogs((prev) => prev + `\n❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = async (value: string) => {
    const client = clients.find((c) => c.client_name === value);
    if (!client) return;
    setSelectedClient(value);
    setLoading(true);
    try {
      navigate(`/TrafficAnalisis/${client.client_name}`);
    } catch (err) {
      console.error("Erro ao navegar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Cabeçalho */}
      <div className="flex justify-center items-center gap-4">
        <img
          src="https://c5gwmsmjx1.execute-api.us-east-1.amazonaws.com/prod/empresa/logo/28323/logo.png"
          alt="Logo Tripla"
          className="w-32 h-12"
        />
        <img src="https://www.cloudflare.com/img/logo-cloudflare-dark.svg" alt="Logo Cloudflare" className="w-40 h-12" />
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Bem-vindo ao Dashboard de Métricas</h1>
        <p className="text-slate-500">
          Os dados exibidos são internos e de propriedade da empresa Tripla.
          <br />
          <strong>Cloudflare by Tripla</strong> - Soluções em segurança.
        </p>
      </div>

      {/* Select */}
      <div className="w-full flex justify-center mt-4">
        <Select onValueChange={handleClientChange} value={selectedClient}>
          <SelectTrigger className="w-full max-w-3xl bg-white border rounded-lg shadow-sm">
            <SelectValue placeholder="Selecione um cliente para iniciar a exibição" />
          </SelectTrigger>
          <SelectContent>
            {clients
              .sort((a, b) => a.client_name.localeCompare(b.client_name))
              .map((client) => (
                <SelectItem key={client.account_id} value={client.client_name}>
                  {client.client_name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs */}
      <Card className="w-full max-w-5xl mx-auto shadow-lg border border-slate-200">
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-800">Logs</h2>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[360px] rounded-md border p-3 bg-white">
            <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap">{logs}</pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Botão */}
      <div className="flex justify-center">
        <Button
          onClick={fetchInitializationData}
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Sincronizando..." : "Sincronizar dados"}
        </Button>
      </div>
    </div>
  );
};

export default Home;