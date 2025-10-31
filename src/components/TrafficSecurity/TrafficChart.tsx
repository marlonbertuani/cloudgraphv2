import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

interface TrafficData {
  date: string;
  requests: number;
  threats: number;
  bandwidth: number;
}

interface TrafficChartProps {
  data: TrafficData[];
}

const TrafficChart: React.FC<TrafficChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-700 mb-2 font-medium">Tendência de Tráfego</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" />
          <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} name="Ameaças" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficChart;
