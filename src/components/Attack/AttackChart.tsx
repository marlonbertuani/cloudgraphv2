import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, Cell } from "recharts";
import { Globe, Shield, TrendingUp } from "lucide-react";
import { API_BASE_URL } from "../../Core/config";

interface AttackData {
  ts: string;
  country: string;
  eventCount: string;
  accountId: string;
}

interface CountryStats {
  country: string;
  total: string;
  percentage: string;
}

interface AttackResponse {
  success: boolean;
  message: string;
  data: AttackData[];
  top5Countries: CountryStats[];
  totalRequests: string;
}

interface AttackChartProps {
  clientName: string;
  selectedMonth: string;
}

// Cores para os países
const COUNTRY_COLORS: { [key: string]: string } = {
  BR: "#00A859", // Verde Brasil
  US: "#3C3B6E", // Azul EUA
  JP: "#BC002D", // Vermelho Japão
  DE: "#000000", // Preto Alemanha
  NL: "#FF4F00", // Laranja Holanda
  FR: "#0055A4", // Azul França
  AR: "#75AADB", // Azul Argentina
  UK: "#C8102E", // Vermelho UK
  CN: "#DE2910", // Vermelho China
  IN: "#FF9933", // Laranja India
};

// Nomes completos dos países
const COUNTRY_NAMES: { [key: string]: string } = {
  BR: "Brazil",
  US: "United States",
  JP: "Japan",
  DE: "Germany",
  NL: "Netherlands",
  FR: "France",
  AR: "Argentina",
  UK: "United Kingdom",
  CN: "China",
  IN: "India",
};

const AttackChart: React.FC<AttackChartProps> = ({ clientName, selectedMonth }) => {
  const [data, setData] = useState<AttackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttackData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/graph-attack/${clientName}?monthRef=${selectedMonth}`);
        const result: AttackResponse = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Erro ao carregar dados de ataque");
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };

    if (clientName && selectedMonth) {
      fetchAttackData();
    }
  }, [clientName, selectedMonth]);

  // Processar dados para o gráfico de linhas
  const processLineChartData = () => {
    if (!data?.data) return [];

    const dailyData: { [key: string]: { date: string } & { [country: string]: number } } = {};

    data.data.forEach((item) => {
      if (!dailyData[item.ts]) {
        dailyData[item.ts] = { date: item.ts };
      }
      
      dailyData[item.ts][item.country] = (dailyData[item.ts][item.country] || 0) + parseInt(item.eventCount);
    });

    // Ordenar por data
    return Object.values(dailyData).sort((a, b) => {
      const dateA = new Date(`2024-${a.date.split('-').reverse().join('-')}`);
      const dateB = new Date(`2024-${b.date.split('-').reverse().join('-')}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Preparar dados para gráfico horizontal (comparação entre países)
  const prepareHorizontalData = () => {
    if (!data?.top5Countries) return [];

    return data.top5Countries.map(country => ({
      country: COUNTRY_NAMES[country.country] || country.country,
      value: parseInt(country.total),
      percentage: country.percentage,
      fill: COUNTRY_COLORS[country.country] || "#8884d8"
    }));
  };

  const lineChartData = processLineChartData();
  const horizontalData = prepareHorizontalData();
  const topCountries = data?.top5Countries || [];

  if (loading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando dados de ataque...</p>
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
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Tráfego por País - {clientName}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total de Requests */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total de Requisições</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {(parseInt(data?.totalRequests || "0") / 1000000).toFixed(2)}M
              </p>
              <p className="text-sm text-blue-700">
                {data?.totalRequests ? parseInt(data.totalRequests).toLocaleString() : 0} requisições
              </p>
            </div>

            {/* Top 5 Países */}
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Top Países</span>
              </div>
              <div className="space-y-1">
                {topCountries.slice(0, 3).map((country, index) => (
                  <div key={country.country} className="flex justify-between text-sm">
                    <span className="text-red-800">
                      {COUNTRY_NAMES[country.country] || country.country}
                    </span>
                    <span className="font-semibold text-red-900">{country.percentage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Linhas Horizontais - Comparação entre países */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Comparação entre Países (Total de Requisições)
          </h3>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={horizontalData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis 
                type="number"
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
              />
              <YAxis 
                type="category" 
                dataKey="country"
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [
                  value.toLocaleString(),
                  'Total de Requisições'
                ]}
                labelFormatter={(label) => `País: ${label}`}
              />
              <Bar 
                dataKey="value" 
                name="Requisições"
                radius={[0, 4, 4, 0]}
              >
                {horizontalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Linhas - Evolução temporal */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Evolução do Tráfego por País
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
                  COUNTRY_NAMES[name] || name
                ]}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend 
                formatter={(value) => COUNTRY_NAMES[value] || value}
              />
              
              {/* Linhas para cada país do top 5 */}
              {topCountries.map((country) => (
                <Line 
                  key={country.country}
                  type="monotone"
                  dataKey={country.country}
                  stroke={COUNTRY_COLORS[country.country] || "#8884d8"}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={country.country}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Países */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas por País</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-700">País</th>
                  <th className="text-right p-3 font-semibold text-gray-700">Total</th>
                  <th className="text-right p-3 font-semibold text-gray-700">Percentual</th>
                </tr>
              </thead>
              <tbody>
                {topCountries.map((country, index) => (
                  <tr key={country.country} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COUNTRY_COLORS[country.country] || "#8884d8" }}
                        />
                        {COUNTRY_NAMES[country.country] || country.country}
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {parseInt(country.total).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-semibold text-blue-600">
                      {country.percentage}
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

export default AttackChart;