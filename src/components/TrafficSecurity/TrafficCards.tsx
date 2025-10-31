import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Activity, Shield, Server } from "lucide-react";

interface TrafficData {
  date: string;
  requests: number;
  threats: number;
  bandwidth: number;
}

interface TrafficCardsProps {
  data: TrafficData[];
}

const TrafficCards: React.FC<TrafficCardsProps> = ({ data }) => {
  const totalRequests = Array.isArray(data) ? data.reduce((sum, d) => sum + d.requests, 0) : 0;
  const totalThreats = Array.isArray(data) ? data.reduce((sum, d) => sum + d.threats, 0) : 0;
  const totalBandwidth = Array.isArray(data) ? data.reduce((sum, d) => sum + d.bandwidth, 0) : 0;


  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <Activity className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Total de Requests</p>
            <p className="text-lg font-semibold">{totalRequests.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <Shield className="text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Ameaças Bloqueadas</p>
            <p className="text-lg font-semibold">{totalThreats.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <Server className="text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Consumo de Banda</p>
            <p className="text-lg font-semibold">{(totalBandwidth / 1024).toFixed(2)} GB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficCards;
