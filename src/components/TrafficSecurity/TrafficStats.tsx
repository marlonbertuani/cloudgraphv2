import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";
import TrafficCards from "./TrafficCards";
import TrafficChart from "./TrafficCards";

interface TrafficData {
  date: string;
  requests: number;
  threats: number;
  bandwidth: number;
}

interface TrafficStatsProps {
  apiBaseUrl: string;
  clientName: string;
  selectedMonth: string;
}

const TrafficStats: React.FC<TrafficStatsProps> = ({ apiBaseUrl, clientName, selectedMonth }) => {
  const [data, setData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrafficData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiBaseUrl}/graph-traffic/${clientName}?month=${selectedMonth}`);
        setData(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados de tráfego:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficData();
  }, [apiBaseUrl, clientName, selectedMonth]);

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
    </div>
  );
};

export default TrafficStats;
