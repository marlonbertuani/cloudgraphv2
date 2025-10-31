import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Globe, Shield, Network, User, Link, Server, Filter, AlertTriangle, Code, Monitor } from "lucide-react";
import { API_BASE_URL } from "../../Core/config";

interface Top5Item {
  value: string;
  count: number;
  percentage: string;
  avg_sample_interval: number;
}

interface Top5Response {
  success: boolean;
  message: string;
  data: {
    topCountries?: Top5Item[];
    topASNs?: Top5Item[];
    topUserAgents?: Top5Item[];
    topReferers?: Top5Item[];
    topUriPaths?: Top5Item[];
    topHosts?: Top5Item[];
    topManagedRules?: Top5Item[];
    topIPs?: Top5Item[];
    topHttpMethods?: Top5Item[];
    topFirewallRules?: Top5Item[];
    topZones?: Top5Item[];
    topRateLimitRules?: Top5Item[];
  };
  totalRequests: number;
  period: string;
  accountId: string;
}

interface Top5ChartProps {
  clientName: string;
  selectedMonth: string;
}

// Configuração dos top5 principais
const TOP5_CONFIG: {
  [key: string]: {
    title: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    formatValue?: (value: string) => string;
  }
} = {
  topCountries: {
    title: "Top Países",
    icon: <Globe className="w-4 h-4" />,
    color: "#3B82F6",
    description: "Países com maior volume de tráfego"
  },
  topASNs: {
    title: "Top Provedores",
    icon: <Network className="w-4 h-4" />,
    color: "#8B5CF6",
    description: "Provedores de internet com maior tráfego",
    formatValue: (value: string) => {
      // Encurta nomes longos de provedores
      if (value.includes("BRISANET")) return "Brisanet";
      if (value.includes("TELEFONICA")) return "Telefônica";
      if (value.includes("Claro")) return "Claro";
      return value.length > 50 ? value.substring(0, 50) + "..." : value;
    }
  },
  topManagedRules: {
    title: "Top Regras WAF",
    icon: <Shield className="w-4 h-4" />,
    color: "#EF4444",
    description: "Regras de segurança mais acionadas",
    formatValue: (value: string) => {
      // Limpa nomes de regras
      if (value.includes("Skip -")) return value.replace("Skip -", "").trim();
      if (value.includes("949110")) return "Anomaly Score Exceeded";
      if (value.length > 50) return value.substring(0, 50) + "...";
      return value;
    }
  },
  topUriPaths: {
    title: "Top URLs",
    icon: <Link className="w-4 h-4" />,
    color: "#10B981",
    description: "Endpoints mais acessados",
    formatValue: (value: string) => {
      if (value.length > 30) return value.substring(0, 50) + "...";
      return value;
    }
  },
  topReferers: {
    title: "Top Referers",
    icon: <User className="w-4 h-4" />,
    color: "#F59E0B",
    description: "Referers mais comuns",
    formatValue: (value: string) => {
      if (value === "") return "Empty";
      if (value.length > 25) return value.substring(0, 50) + "...";
      return value;
    }
  },
  topHosts: {
    title: "Top Hosts",
    icon: <Server className="w-4 h-4" />,
    color: "#6366F1",
    description: "Hosts com maior tráfego",
    formatValue: (value: string) => {
      if (value.length > 25) return value.substring(0, 50) + "...";
      return value;
    }
  },
  topIPs: {
    title: "Top IPs",
    icon: <Globe className="w-4 h-4" />, // Ou use <Ip className="w-4 h-4" /> se tiver
    color: "#DC2626",
    description: "Endereços IP com maior atividade",
    formatValue: (value: string) => {
      // Mantém o IP completo pois é importante para análise
      return value;
    }
  },
  topHttpMethods: {
    title: "Top Métodos HTTP",
    icon: <Code className="w-4 h-4" />, // Ou <Settings className="w-4 h-4" />
    color: "#7C3AED",
    description: "Métodos HTTP mais utilizados",
  },
  topUserAgents: {
    title: "Top Navegadores",
    icon: <Monitor className="w-4 h-4" />, // Ou <Smartphone className="w-4 h-4" />
    color: "#059669",
    description: "Agentes de usuário mais comuns",
    formatValue: (value: string) => {
      if (value.length > 30) return value.substring(0, 50) + "...";
      if (value === "") return "Empty";
      return value;
    }
  }
};

const Top5Chart: React.FC<Top5ChartProps> = ({ clientName, selectedMonth }) => {
  const [data, setData] = useState<Top5Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTop5Data = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/top5-sec/${clientName}?monthRef=${selectedMonth}`);
        const result: Top5Response = await response.json();

        if (result.success) {
          setData(result);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Erro ao carregar dados top5");
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };

    if (clientName && selectedMonth) {
      fetchTop5Data();
    }
  }, [clientName, selectedMonth]);

  // Função de formatação
  const formatNumber = {
    compact: (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.', ',')}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toLocaleString('pt-BR');
    },
    integer: (num: number) => num.toLocaleString('pt-BR')
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando análises...</p>
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
            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Análise de Top 5 - {clientName}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total de Requisições</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {formatNumber.compact(data?.totalRequests || 0)}
              </p>
              <p className="text-sm text-blue-700">
                {formatNumber.integer(data?.totalRequests || 0)} requisições
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Categorias Analisadas</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {Object.keys(TOP5_CONFIG).length}
              </p>
              <p className="text-sm text-green-700">
                tipos de métricas
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Período</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {data?.period?.split('-')[0] || 'N/A'}
              </p>
              <p className="text-sm text-purple-700">
                Mês {data?.period?.split('-')[1] || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Top5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(TOP5_CONFIG).map(([key, config]) => {
          const items = data?.data[key as keyof typeof data.data] as Top5Item[] | undefined;

          if (!items || items.length === 0) return null;

          return (
            <Card key={key} className="shadow-lg border-0 hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                {/* Header do Card */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <div style={{ color: config.color }}>
                      {config.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{config.title}</h3>
                    <p className="text-xs text-gray-500">{config.description}</p>
                  </div>
                </div>

                {/* Lista de Itens */}
                <div className="space-y-3">
                  {items.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {config.formatValue ? config.formatValue(item.value) : item.value}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatNumber.compact(item.count)} requisições
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color: config.color }}>
                          {item.percentage}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.avg_sample_interval}x
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer com estatística */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Total do Top 5:</span>
                    <span className="font-medium">
                      {items.slice(0, 5).reduce((sum, item) => sum + parseFloat(item.percentage), 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights Gerais */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📊 Insights dos Dados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🌎 Distribuição Geográfica</h4>
                <p className="text-sm text-blue-700">
                  {data?.data.topCountries?.[0] ? (
                    <>
                      <strong>{data.data.topCountries[0].value}</strong> representa{' '}
                      <strong>{data.data.topCountries[0].percentage}</strong> do tráfego total
                    </>
                  ) : 'Dados de países não disponíveis'}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">🛡️ Segurança</h4>
                <p className="text-sm text-green-700">
                  {data?.data.topManagedRules?.[0] ? (
                    <>
                      Regra <strong>"{data.data.topManagedRules[0].value.substring(0, 30)}..."</strong>{' '}
                      é a mais acionada com <strong>{data.data.topManagedRules[0].percentage}</strong>
                    </>
                  ) : 'Dados de segurança não disponíveis'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">📱 Dispositivos</h4>
                <p className="text-sm text-purple-700">
                  {data?.data.topUserAgents?.[0] ? (
                    <>
                      <strong>{data.data.topUserAgents[0].value.includes('Mobile') ? 'Mobile' : 'Desktop'}</strong>{' '}
                      representa <strong>{data.data.topUserAgents[0].percentage}</strong> dos acessos
                    </>
                  ) : 'Dados de user agents não disponíveis'}
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">🔗 Tráfego</h4>
                <p className="text-sm text-orange-700">
                  {data?.data.topReferers?.[0] ? (
                    <>
                      Principal referer: <strong>{data.data.topReferers[0].value || 'Direto'}</strong>{' '}
                      com <strong>{data.data.topReferers[0].percentage}</strong>
                    </>
                  ) : 'Dados de referers não disponíveis'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Top5Chart;