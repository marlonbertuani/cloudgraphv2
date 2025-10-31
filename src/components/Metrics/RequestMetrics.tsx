import React, { useEffect, useState } from "react";
import {
    Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Line, ComposedChart, LabelList
} from "recharts";
import axios from "axios";
import { API_BASE_URL } from "../../Core/config";
import { Card, CardContent } from "../../components/ui/card";

// Interfaces TypeScript
interface ApiData {
    created_at: string;
    requests_total: number;
    valid_requests: number;
    total_mitigated: number;
    blocked_requests: string;
}

interface FormattedData {
    month: string;
    total: number;
    valid: number;
    mitigated: number;
    blockPercentage: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

interface BandwidthStatsProps {
    clientName: string | null;
}

// Função para causar pausa no código
const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const RequestMetricsPage: React.FC<BandwidthStatsProps> = ({ clientName }) => {
    const [data, setData] = useState<FormattedData[]>([]);

    // Requisição HTTP para buscar os dados da API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<ApiData[]>(`${API_BASE_URL}/security_analysis/${clientName}`);
                const apiData = response.data;

                // Transformar e ordenar os dados em ordem decrescente por data
                const formattedData: FormattedData[] = apiData
                    .map(item => {
                        // Validações para evitar erros
                        const createdAt = item?.created_at ? new Date(item.created_at) : new Date();
                        const month = createdAt.toLocaleString('default', {
                            month: 'short',
                            year: '2-digit',
                            timeZone: 'UTC'
                        }) || '';

                        return {
                            month,
                            total: (item?.requests_total || 0) / 1000000,
                            valid: (item?.valid_requests || 0) / 1000000,
                            mitigated: (item?.total_mitigated || 0) / 1000000,
                            blockPercentage: item?.blocked_requests ? parseFloat(item.blocked_requests) : 0,
                        };
                    })
                    .sort((a, b) => {
                        // Validação adicional para o sort
                        try {
                            const dateA = new Date(`01-${a.month}`).getTime();
                            const dateB = new Date(`01-${b.month}`).getTime();
                            return dateB - dateA;
                        } catch (error) {
                            return 0; // Em caso de erro, mantém a ordem original
                        }
                    });

                await sleep(400);
                setData(formattedData);
            } catch (error) {
                console.error("Erro ao buscar dados da API:", error);
            }
        };

        fetchData();
    }, [clientName]);

    // Formatação personalizada para o tooltip
    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-[#003366] font-bold text-sm">
                        {label}
                    </p>
                    <p className="text-[#003366] text-sm">
                        Total de Requisições: {payload[0]?.value?.toFixed(2)}M
                    </p>
                    <p className="text-green-600 text-sm">
                        Requisições Válidas: {payload[1]?.value?.toFixed(2)}M
                    </p>
                    <p className="text-orange-500 text-sm">
                        Requisições Mitigadas: {payload[2]?.value?.toFixed(2)}M
                    </p>
                    <p className="text-red-500 text-sm">
                        Percentual de Bloqueios: {payload[3]?.value?.toFixed(2)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // Função para formatar valores do LabelList
    const formatLabelValue = (value: number) => {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)} B`;
        } else {
            return `${value.toFixed(1)} M`;
        }
    };

    // Componente reutilizável CORRIGIDO
    const CustomLabel: React.FC<any> = ({ x, y, width, value, fill }) => {
        if (typeof value !== 'number') return null;

        const formattedValue = value >= 1000
            ? `${(value / 1000).toFixed(1)} B`
            : `${value.toFixed(1)} M`;

        return (
            <text
                x={x + (width / 2)} // ✅ Centraliza no meio da barra
                y={y}
                dy={-10}
                fill={fill}
                fontSize={16}
                textAnchor="middle"
                fontWeight="bold"
            >
                {formattedValue}
            </text>
        );
    };

    return (
        <div>
            {/* Gráfico */}
            <Card className="shadow-lg border-0 mb-6">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-[#003366] text-center mb-6">
                        Requisições ao Longo do Tempo
                    </h2>

                    <ResponsiveContainer width="100%" height={600}>
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />

                            {/* Eixo Y esquerdo - Requisições */}
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="#003366"
                                domain={[0, (dataMax) => {
                                    const clientMaxValues: { [key: string]: number } = {
                                        // "Estrelabet Enterprise Account": Math.ceil(dataMax + 500),
                                        // "Bankei Account": Math.ceil(dataMax + 1),
                                        // "Atacadao's Account": Math.ceil(dataMax + 30),
                                    };
                                    return clientMaxValues[clientName!] || Math.ceil(dataMax * 1.08);
                                }]}
                                label={{
                                    value: "Requisições (Em Milhões)",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: "middle", fill: "#003366" }
                                }}
                            />

                            {/* Eixo Y direito - Percentual */}
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#FF0000"
                                domain={[0, 50]}
                                tickFormatter={(value) => `${value}%`}
                                label={{
                                    value: "Percentual de Bloqueios (%)",
                                    angle: -90,
                                    position: "insideRight",
                                    style: { textAnchor: "middle", fill: "#FF0000" }
                                }}
                            />

                            <Tooltip content={<CustomTooltip />} />
                            <Legend />

                            {/* Barras */}
                            <Bar yAxisId="left" dataKey="total" fill="#003366" name="Total de Requisições">
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    content={<CustomLabel fill="#003366" />}
                                />
                            </Bar>

                            <Bar yAxisId="left" dataKey="valid" fill="#4CAF50" name="Requisições Válidas">
                                <LabelList
                                    dataKey="valid"
                                    position="top"
                                    content={<CustomLabel fill="#4CAF50" />}
                                />
                            </Bar>

                            <Bar yAxisId="left" dataKey="mitigated" fill="#FF9800" name="Requisições Mitigadas">
                                <LabelList
                                    dataKey="mitigated"
                                    position="top"
                                    content={<CustomLabel fill="#FF9800" />}
                                />
                            </Bar>

                            {/* Linha para Percentual de Bloqueios */}
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="blockPercentage"
                                stroke="#FF0000"
                                name="Percentual de Bloqueios"
                                strokeWidth={2}
                                dot={{ r: 6 }}
                                label={{
                                    position: "top",
                                    formatter: (label: any) => {
                                        const value = typeof label === 'number' ? label : parseFloat(label);
                                        return `${value.toFixed(2)}%`;
                                    },
                                    fill: "#FF0000",
                                }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default RequestMetricsPage;