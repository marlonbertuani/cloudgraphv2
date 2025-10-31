import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "../ui/card";

interface DistributionOverTimeChartProps {
    data: { ts: string; servedByCloudflare?: number; servedByOrigin?: number }[];
}

export const DistributionOverTimeChart: React.FC<DistributionOverTimeChartProps> = ({ data }) => (
    <Card className="mb-4">
        <CardContent>
            <div className="text-center text-blue-900 font-bold text-lg mb-2">
                Distribuição ao Longo do Tempo
            </div>
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="ts" tick={{ fill: "#555555", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#555555", fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="servedByCloudflare" stroke="#F38020" dot={{ r: 4 }} strokeWidth={2} name="Servido pelo Cloudflare" />
                    <Line type="monotone" dataKey="servedByOrigin" stroke="#6495ED" dot={{ r: 4 }} strokeWidth={2} name="Servido pela Origem" />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);
