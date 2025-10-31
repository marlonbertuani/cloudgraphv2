import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Shield, AlertTriangle, CheckCircle, FileText, SkipForward, Code, Settings } from "lucide-react";
import { API_BASE_URL } from "../../Core/config";

interface SummaryData {
  ts: string;
  metric: string;
  count: number;
}

interface SummaryResponse {
  data: SummaryData[];
  totalAllow?: number;
  totalBlock?: number;
  totalLog?: number;
  totalManaged?: number;
  totalSkip?: number;
  totalChallenge?: number;
  totalJSChallenge?: number;
  totalRewrite?: number;
  totalRequests?: number;
}

interface SummaryChartProps {
  clientName: string;
  selectedMonth: string;
}

// Configuração das métricas
const METRIC_CONFIG: { [key: string]: { name: string; color: string; icon: React.ReactNode; description: string } } = {
  block: {
    name: "Bloqueios",
    color: "#EF4444",
    icon: <Shield className="w-4 h-4" />,
    description: "Requisições bloqueadas pelo WAF"
  },
  managed_challenge: {
    name: "Desafios Gerenciados",
    color: "#F59E0B",
    icon: <AlertTriangle className="w-4 h-4" />,
    description: "Desafios de segurança gerenciados"
  },
  jschallenge: {
    name: "Desafios JS",
    color: "#8B5CF6",
    icon: <Code className="w-4 h-4" />,
    description: "Desafios JavaScript aplicados"
  },
  log: {
    name: "Logs",
    color: "#6B7280",
    icon: <FileText className="w-4 h-4" />,
    description: "Requisições registradas em log"
  },
  skip: {
    name: "Pulados",
    color: "#10B981",
    icon: <SkipForward className="w-4 h-4" />,
    description: "Requisições que passaram sem verificação"
  },
  allow: {
    name: "Permitidos",
    color: "#10B981",
    icon: <CheckCircle className="w-4 h-4" />,
    description: "Requisições explicitamente permitidas"
  },
  rewrite: {
    name: "Reescritos",
    color: "#3B82F6",
    icon: <Settings className="w-4 h-4" />,
    description: "Requisições reescritas/modificadas"
  },
  challenge: {
    name: "Desafios",
    color: "#F59E0B",
    icon: <AlertTriangle className="w-4 h-4" />,
    description: "Desafios de segurança aplicados"
  }
};

const SummaryChart: React.FC<SummaryChartProps> = ({ clientName, selectedMonth }) => {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/graph-summary/${clientName}?monthRef=${selectedMonth}`);
        const result: SummaryResponse = await response.json();
        
        setData(result);
      } catch (err) {
        setError("Erro ao carregar dados de resumo");
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };

    if (clientName && selectedMonth) {
      fetchSummaryData();
    }
  }, [clientName, selectedMonth]);

  // Processar dados para o gráfico de linhas
  const processLineChartData = () => {
    if (!data?.data) return [];

    const dailyData: { [key: string]: { date: string } & { [metric: string]: number } } = {};

    data.data.forEach((item) => {
      if (!dailyData[item.ts]) {
        dailyData[item.ts] = { date: item.ts };
      }
      
      dailyData[item.ts][item.metric] = (dailyData[item.ts][item.metric] || 0) + item.count;
    });

    // Ordenar por data
    return Object.values(dailyData).sort((a, b) => {
      const dateA = new Date(`2024-${a.date.split('-').reverse().join('-')}`);
      const dateB = new Date(`2024-${b.date.split('-').reverse().join('-')}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Preparar dados para gráfico de pizza (distribuição)
  const preparePieData = () => {
    if (!data) return [];

    const metrics = [
      { key: 'totalBlock', metric: 'block' },
      { key: 'totalManaged', metric: 'managed_challenge' },
      { key: 'totalJSChallenge', metric: 'jschallenge' },
      { key: 'totalLog', metric: 'log' },
      { key: 'totalSkip', metric: 'skip' },
      { key: 'totalAllow', metric: 'allow' },
      { key: 'totalRewrite', metric: 'rewrite' },
      { key: 'totalChallenge', metric: 'challenge' },
    ];

    return metrics
      .filter(({ key }) => data[key as keyof SummaryResponse] > 0)
      .map(({ key, metric }) => ({
        name: METRIC_CONFIG[metric]?.name || metric,
        value: data[key as keyof SummaryResponse] as number,
        color: METRIC_CONFIG[metric]?.color || "#6B7280",
        metric
      }));
  };

  // Obter métricas ativas (não zeradas)
  const getActiveMetrics = () => {
    if (!data) return [];

    const metricTotals = {
      block: data.totalBlock || 0,
      managed_challenge: data.totalManaged || 0,
      jschallenge: data.totalJSChallenge || 0,
      log: data.totalLog || 0,
      skip: data.totalSkip || 0,
      allow: data.totalAllow || 0,
      rewrite: data.totalRewrite || 0,
      challenge: data.totalChallenge || 0,
    };

    return Object.entries(metricTotals)
      .filter(([_, total]) => total > 0)
      .map(([metric, total]) => ({
        metric,
        total,
        ...METRIC_CONFIG[metric]
      }))
      .sort((a, b) => b.total - a.total);
  };

  const lineChartData = processLineChartData();
  const pieData = preparePieData();
  const activeMetrics = getActiveMetrics();
  const totalRequests = data?.totalRequests || 0;

  if (loading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando dados de segurança...</p>
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
      {/* Header com estatísticas */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Resumo de Segurança - {clientName}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total de Requests */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total de Requisições</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {(totalRequests / 1000000).toFixed(2)}M
              </p>
              <p className="text-sm text-blue-700">
                {totalRequests.toLocaleString()} requisições
              </p>
            </div>

            {/* Métricas Ativas */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Métricas Ativas</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {activeMetrics.length}
              </p>
              <p className="text-sm text-green-700">
                tipos de ação registrados
              </p>
            </div>

            {/* Taxa de Bloqueio */}
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Taxa de Bloqueio</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {totalRequests > 0 ? ((data?.totalBlock || 0) / totalRequests * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-red-700">
                {(data?.totalBlock || 0).toLocaleString()} bloqueios
              </p>
            </div>
          </div>

          {/* Cards de Métricas Ativas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeMetrics.map((metric) => (
              <div 
                key={metric.metric}
                className="bg-white border rounded-lg p-3 text-center"
                style={{ borderLeftColor: metric.color, borderLeftWidth: '4px' }}
              >
                <div className="flex justify-center mb-2" style={{ color: metric.color }}>
                  {metric.icon}
                </div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-lg font-bold text-gray-900">
                  {(metric.total / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-500">
                  {totalRequests > 0 ? ((metric.total / totalRequests) * 100).toFixed(1) : 0}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Distribuição */}
      {pieData.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Distribuição de Ações de Segurança
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legenda */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Detalhes das Métricas:</h4>
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {METRIC_CONFIG[item.metric]?.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {(item.value / 1000).toFixed(1)}K
                      </p>
                      <p className="text-sm text-gray-600">
                        {totalRequests > 0 ? ((item.value / totalRequests) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Linhas - Evolução temporal */}
      {lineChartData.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Evolução das Ações de Segurança
            </h3>
            
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={lineChartData}>
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
                    METRIC_CONFIG[name]?.name || name
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Legend 
                  formatter={(value) => METRIC_CONFIG[value]?.name || value}
                />
                
                {/* Linhas apenas para métricas ativas */}
                {activeMetrics.map((metric) => (
                  <Line 
                    key={metric.metric}
                    type="monotone"
                    dataKey={metric.metric}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={metric.metric}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabela Detalhada */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhes das Métricas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-700">Ação</th>
                  <th className="text-right p-3 font-semibold text-gray-700">Total</th>
                  <th className="text-right p-3 font-semibold text-gray-700">Percentual</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {activeMetrics.map((metric, index) => (
                  <tr key={metric.metric} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div style={{ color: metric.color }}>
                          {metric.icon}
                        </div>
                        {metric.name}
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {metric.total.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-semibold" style={{ color: metric.color }}>
                      {totalRequests > 0 ? ((metric.total / totalRequests) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="p-3 text-gray-600 text-sm">
                      {metric.description}
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

export default SummaryChart;