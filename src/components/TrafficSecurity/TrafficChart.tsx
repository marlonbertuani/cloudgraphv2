import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface EventData {
  eventType: string;
  ts: string;
  eventCount: number;
  accountTag: string;
}

interface ApiResponse {
  data: EventData[];
  totalBlockByWAF: number;
  totalManaged: number;
  totalChallange: number;
  totalRequests: number;
  requests_total: number;
  valid_requests: number;
  mitigated_requests: number;
  blockedPercentage: string;
}

interface TrafficChartProps {
  data: ApiResponse;
}

const TrafficChart: React.FC<TrafficChartProps> = ({ data }) => {
  // Processar os dados para agrupar por data e somar os diferentes tipos de eventos
  const processChartData = () => {
    if (!data?.data) return [];

    const groupedByDate: { [key: string]: { date: string; requests: number; threats: number; managed: number; challenges: number } } = {};

    data.data.forEach((item) => {
      if (!groupedByDate[item.ts]) {
        groupedByDate[item.ts] = {
          date: item.ts,
          requests: 0,
          threats: 0,
          managed: 0,
          challenges: 0
        };
      }

      // Soma todos os eventos como "requests" (visão geral do tráfego)
      groupedByDate[item.ts].requests += item.eventCount;

      // Separa por tipo de evento
      if (item.eventType === 'block') {
        groupedByDate[item.ts].threats += item.eventCount;
      } else if (item.eventType === 'managed_challenge') {
        groupedByDate[item.ts].managed += item.eventCount;
      } else if (item.eventType === 'jschallenge') {
        groupedByDate[item.ts].challenges += item.eventCount;
      }
    });

    // Converter objeto para array e ordenar por data
    return Object.values(groupedByDate).sort((a, b) => {
      const dateA = new Date(`2024-${a.date.split('-').reverse().join('-')}`);
      const dateB = new Date(`2024-${b.date.split('-').reverse().join('-')}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const chartData = processChartData();

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-700 mb-2 font-medium">Tendência de Tráfego e Segurança</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => value.toLocaleString()}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Legend />
          {/* Linha do tráfego total */}
          <Line 
            type="monotone" 
            dataKey="requests" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            name="Total de Tráfego"
            dot={{ r: 2 }}
          />
          {/* Linha das ameaças bloqueadas */}
          <Line 
            type="monotone" 
            dataKey="threats" 
            stroke="#ef4444" 
            strokeWidth={2} 
            name="Ameaças Bloqueadas"
            dot={{ r: 2 }}
          />
          {/* Linha dos challenges gerenciados */}
          <Line 
            type="monotone" 
            dataKey="managed" 
            stroke="#f59e0b" 
            strokeWidth={2} 
            name="Gerenciados"
            dot={{ r: 2 }}
          />
          {/* Linha dos challenges JS */}
          <Line 
            type="monotone" 
            dataKey="challenges" 
            stroke="#10b981" 
            strokeWidth={2} 
            name="Interativo"
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficChart;