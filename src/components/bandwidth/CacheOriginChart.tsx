import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from "recharts";
import { Card, CardContent } from "../ui/card";

interface CacheOriginChartProps {
    data: { name: string; cache: number; origin: number }[];
}

export const CacheOriginChart: React.FC<CacheOriginChartProps> = ({ data }) => (
    <Card className="mb-4">
        <CardContent>
            <div className="text-center text-blue-900 font-bold text-lg mb-2">
                Cache vs Origem
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="name" tick={{ fill: "#555555", fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${v.toFixed(2)}%`} tick={{ fill: "#555555", fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Bar dataKey="cache" fill="#F38020" name="Entregue com Cache">
                        <LabelList dataKey="cache" position="top" formatter={(v: number) => `${v.toFixed(2)}%`} />
                    </Bar>
                    <Bar dataKey="origin" fill="#6495ED" name="Entregue pela Origem">
                        <LabelList dataKey="origin" position="top" formatter={(v: number) => `${v.toFixed(2)}%`} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);
