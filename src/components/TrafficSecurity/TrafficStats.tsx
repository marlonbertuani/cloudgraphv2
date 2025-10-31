import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";
import TrafficCards from "./TrafficCards";
import TrafficChart from "./TrafficChart";
import MitigationDetails from "./MitigationDetails";
import { API_BASE_URL } from "../../Core/config";

interface EventData {
  eventType: string;
  ts: string; // ou Date
  eventCount: number;
  accountTag: string;
  // Adicione aqui outras propriedades que possam existir, como as que você usava
  requests?: number;
  threats?: number;
  bandwidth?: number;
}

interface TrafficStatsProps {
  clientName: string | null;
  selectedMonth: string;
}

const TrafficStats: React.FC<TrafficStatsProps> = ({ clientName, selectedMonth }) => {
  const [data, setData] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrafficData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/graph-datasec/${clientName}?monthRef=${selectedMonth}`);
        setData(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados de tráfego:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficData();
  }, [clientName, selectedMonth]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-gray-500">
          Carregando dados de tráfego...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <TrafficCards data={data} />
      <TrafficChart data={data} />
      <MitigationDetails data={data} />
    </div>
  );
};

export default TrafficStats;
