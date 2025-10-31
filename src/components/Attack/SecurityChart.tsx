import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Target, Zap } from "lucide-react";
import { API_BASE_URL } from "../../Core/config";

interface DayData {
    attack: {
        count: number;
        avg_sample_interval: number;
    };
    clean: {
        count: number;
        avg_sample_interval: number;
    };
    likely_attack: {
        count: number;
        avg_sample_interval: number;
    };
    likely_clean: {
        count: number;
        avg_sample_interval: number;
    };
}

interface SecurityResponse {
    success: boolean;
    message: string;
    data: {
        [date: string]: DayData;
    };
    totals: {
        attack: number;
        clean: number;
        likely_attack: number;
        likely_clean: number;
    };
    summary: {
        totalRequests: number;
        period: string;
        accountId: string;
    };
}

interface SecurityChartProps {
    clientName: string;
    selectedMonth: string;
}

// Configuração dos tipos de tráfego
const TRAFFIC_CONFIG: { [key: string]: { name: string; color: string; icon: React.ReactNode; description: string } } = {
    likely_clean: {
        name: "Provavelmente Limpo",
        color: "#3B82F6",
        icon: <Shield className="w-4 h-4" />,
        description: "Tráfego com baixa probabilidade de ser malicioso"
    },
    clean: {
        name: "Tráfego Limpo",
        color: "#10B981",
        icon: <CheckCircle className="w-4 h-4" />,
        description: "Tráfego identificado como legítimo"
    },
    attack: {
        name: "Ataque Confirmado",
        color: "#EF4444",
        icon: <AlertTriangle className="w-4 h-4" />,
        description: "Tráfego identificado como malicioso"
    },
    likely_attack: {
        name: "Possível Ataque",
        color: "#F59E0B",
        icon: <Target className="w-4 h-4" />,
        description: "Tráfego com alta probabilidade de ser malicioso"
    }
};

const SecurityChart: React.FC<SecurityChartProps> = ({ clientName, selectedMonth }) => {
    const [data, setData] = useState<SecurityResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSecurityData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/graph-sec/${clientName}?monthRef=${selectedMonth}`);
                const result: SecurityResponse = await response.json();

                if (result.success) {
                    setData(result);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError("Erro ao carregar dados de segurança");
                console.error("Erro:", err);
            } finally {
                setLoading(false);
            }
        };

        if (clientName && selectedMonth) {
            fetchSecurityData();
        }
    }, [clientName, selectedMonth]);

    // Processar dados para o gráfico de barras
    const processChartData = () => {
        if (!data?.data) return [];

        return Object.entries(data.data)
            .map(([date, dayData]) => ({
                date: date.split('-').slice(2).join('/'), // Formata para "01/10"
                fullDate: date,
                attack: dayData.attack.count,
                likely_attack: dayData.likely_attack.count,
                likely_clean: dayData.likely_clean.count,
                clean: dayData.clean.count,
                total: dayData.attack.count + dayData.likely_attack.count + dayData.likely_clean.count + dayData.clean.count
            }))
            .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    };

    // Calcular estatísticas importantes
    const calculateStats = () => {
        if (!data) return null;

        const totalMalicious = data.totals.attack + data.totals.likely_attack;
        const totalClean = data.totals.clean + data.totals.likely_clean;
        const totalRequests = data.summary.totalRequests;
        const attackRate = (totalMalicious / totalRequests) * 100;
        const cleanRate = (totalClean / totalRequests) * 100;

        // Calcular dias com dados válidos
        const daysWithData = Object.keys(data.data).length;

        // Calcular média CORRETA de ataques por dia
        const dailyMaliciousTotals = Object.values(data.data).map(day =>
            day.attack.count + day.likely_attack.count
        );
        const avgAttackPerDay = dailyMaliciousTotals.reduce((sum, count) => sum + count, 0) / daysWithData;

        // Encontrar pico CORRETO
        const maxAttackDay = Math.max(...dailyMaliciousTotals);

        return {
            totalMalicious,
            totalClean,
            attackRate,
            cleanRate,
            avgAttackPerDay,
            maxAttackDay,
            daysWithData
        };
    };


    const chartData = processChartData();
    const stats = calculateStats();
    const totals = data?.totals;
    const summary = data?.summary;

    if (loading) {
        return (
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Carregando análise de segurança...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    <div className="text-center text-red-600">
                        <Shield className="w-12 h-12 mx-auto mb-2" />
                        <p>{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header com estatísticas principais */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Análise de Segurança - {clientName}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {/* Total de Requests */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Total de Requisições</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">
                                {((summary?.totalRequests || 0) / 1000000).toFixed(2)}M
                            </p>
                            <p className="text-sm text-blue-700">
                                {summary?.totalRequests?.toLocaleString() || 0} requisições
                            </p>
                        </div>

                        {/* Tráfego Limpo */}
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Tráfego Limpo</span>
                            </div>
                            <p className="text-2xl font-bold text-green-900">
                                {stats?.cleanRate.toFixed(2)}%
                            </p>
                            <p className="text-sm text-green-700">
                                {stats?.totalClean.toLocaleString()} requisições legítimas
                            </p>
                        </div>

                        {/* Taxa de Ataque */}
                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Taxa de Ataque</span>
                            </div>
                            <p className="text-2xl font-bold text-red-900">
                                {stats?.attackRate.toFixed(2)}%
                            </p>
                            <p className="text-sm text-red-700">
                                {stats?.totalMalicious.toLocaleString()} requisições maliciosas
                            </p>
                        </div>

                        {/* Dias Monitorados */}
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">Período</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-900">
                                {Object.keys(data?.data || {}).length}
                            </p>
                            <p className="text-sm text-purple-700">
                                dias analisados
                            </p>
                        </div>
                    </div>

                    {/* Cards de Tipos de Tráfego */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(TRAFFIC_CONFIG).map(([key, config]) => (
                            <Card key={key} className="shadow border-0">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 rounded-full"
                                            style={{ backgroundColor: `${config.color}20` }}
                                        >
                                            <div style={{ color: config.color }}>
                                                {config.icon}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600">{config.name}</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {((totals?.[key as keyof typeof totals] || 0) / 1000000).toFixed(1)}M
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {summary?.totalRequests ?
                                                    (((totals?.[key as keyof typeof totals] || 0) / summary.totalRequests) * 100).toFixed(1)
                                                    : 0}% do total
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Gráfico de Barras - Distribuição Diária */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Distribuição de Tráfego por Dia
                    </h3>

                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                    return value;
                                }}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    value.toLocaleString(),
                                    TRAFFIC_CONFIG[name]?.name || name
                                ]}
                                labelFormatter={(label) => `Data: ${label}`}
                            />
                            <Legend
                                formatter={(value) => TRAFFIC_CONFIG[value]?.name || value}
                            />

                            {/* Barras empilhadas */}
                            <Bar
                                dataKey="clean"
                                stackId="a"
                                fill={TRAFFIC_CONFIG.clean.color}
                                name="clean"
                            />
                            <Bar
                                dataKey="likely_clean"
                                stackId="a"
                                fill={TRAFFIC_CONFIG.likely_clean.color}
                                name="likely_clean"
                            />
                            <Bar
                                dataKey="likely_attack"
                                stackId="a"
                                fill={TRAFFIC_CONFIG.likely_attack.color}
                                name="likely_attack"
                            />
                            <Bar
                                dataKey="attack"
                                stackId="a"
                                fill={TRAFFIC_CONFIG.attack.color}
                                name="attack"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Análises e Insights */}
            {stats && (
                <Card className="shadow-lg border-0">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            📊 Insights de Segurança
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-yellow-800 mb-2">🔍 Comportamento do Tráfego</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        <li>• {stats.attackRate.toFixed(2).replace('.', ',')}% do tráfego foi identificado como malicioso</li>
                                        <li>• Média de {stats.avgAttackPerDay.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ataques por dia</li>
                                        <li>• Pico de {stats.maxAttackDay.toLocaleString('pt-BR')} ataques em um único dia</li>
                                    </ul>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">🛡️ Eficácia da Proteção</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• {stats.cleanRate.toFixed(2)}% do tráfego é considerado legítimo</li>
                                        <li>• Sistema detecta possíveis ataques proativamente</li>
                                        <li>• Alto volume de tráfego limpo indica boa reputação</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Recomendações baseadas na taxa de ataques */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-800 mb-2">✅ Recomendações</h4>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        {stats.attackRate > 10 ? (
                                            <li>• 🚨 <strong>Taxa crítica de ataques</strong> - Ação imediata necessária</li>
                                        ) : stats.attackRate > 5 ? (
                                            <li>• ⚠️ <strong>Alta taxa de ataques</strong> - Considere reforçar regras WAF</li>
                                        ) : stats.attackRate > 2 ? (
                                            <li>• 📈 <strong>Taxa moderada de ataques</strong> - Monitore de perto</li>
                                        ) : stats.attackRate > 1 ? (
                                            <li>• ✅ <strong>Taxa baixa de ataques</strong> - Situação controlada</li>
                                        ) : (
                                            <li>• 🎉 <strong>Taxa muito baixa de ataques</strong> - Segurança excelente</li>
                                        )}
                                        <li>• 📈 Monitore dias com picos de atividade maliciosa</li>
                                        <li>• 🔄 Mantenha atualizações de segurança regulares</li>
                                    </ul>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <h4 className="font-semibold text-purple-800 mb-2">📈 Métricas Chave</h4>
                                    <ul className="text-sm text-purple-700 space-y-2">
                                        <li className="flex justify-between">
                                            <span>Confiança Média:</span>
                                            <span className="font-semibold text-purple-900">Alta</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Dias Críticos:</span>
                                            <span className="font-semibold text-purple-900">
                                                {chartData.filter(day => day.attack > 1000).length}
                                            </span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Risco Calculado:</span>
                                            <span className={`font-semibold ${stats.attackRate > 10 ? 'text-red-600' :
                                                    stats.attackRate > 5 ? 'text-orange-600' :
                                                        'text-green-600'
                                                }`}>
                                                {stats.attackRate > 10 ? 'Alto' : stats.attackRate > 5 ? 'Médio' : 'Baixo'}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabela Detalhada */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo por Tipo de Tráfego</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left p-3 font-semibold text-gray-700">Tipo</th>
                                    <th className="text-right p-3 font-semibold text-gray-700">Total</th>
                                    <th className="text-right p-3 font-semibold text-gray-700">Percentual</th>
                                    <th className="text-left p-3 font-semibold text-gray-700">Confiança</th>
                                    <th className="text-left p-3 font-semibold text-gray-700">Descrição</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(TRAFFIC_CONFIG).map(([key, config], index) => (
                                    <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div style={{ color: config.color }}>
                                                    {config.icon}
                                                </div>
                                                {config.name}
                                            </div>
                                        </td>
                                        <td className="p-3 text-right font-medium">
                                            {(totals?.[key as keyof typeof totals] || 0).toLocaleString()}
                                        </td>
                                        <td className="p-3 text-right font-semibold" style={{ color: config.color }}>
                                            {summary?.totalRequests ?
                                                (((totals?.[key as keyof typeof totals] || 0) / summary.totalRequests) * 100).toFixed(2)
                                                : 0}%
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${key === 'attack' ? 'bg-red-100 text-red-800' :
                                                key === 'likely_attack' ? 'bg-orange-100 text-orange-800' :
                                                    key === 'likely_clean' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {key === 'attack' ? 'Alta' :
                                                    key === 'likely_attack' ? 'Média' :
                                                        key === 'likely_clean' ? 'Baixa' : 'Máxima'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-600 text-sm">
                                            {config.description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SecurityChart;