import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Activity, Shield, ShieldAlert, CheckCircle } from "lucide-react";

interface EventData {
  eventType: string;
  ts: string;
  eventCount: number;
  accountTag: string;
}

interface TrafficCardsProps {
  data: EventData[] | {
    data: EventData[];
    totalBlockByWAF?: number;
    totalManaged?: number;
    totalChallange?: number;
    totalRequests?: number;
    requests_total?: number;
    valid_requests?: number;
    mitigated_requests?: number;
    blockedPercentage?: string;
  };
}

const TrafficCards: React.FC<TrafficCardsProps> = ({ data }) => {
  // Verifica se data é array ou objeto ApiResponse de forma segura
  const isArray = Array.isArray(data);

  // Extrai os dados de evento de forma segura
  const eventData = isArray ? data : data.data;

  // Calcula totais baseado no tipo de dados recebido
  const totalRequests = isArray
    ? eventData.reduce((sum, item) => sum + item.eventCount, 0)
    : (data as any).totalRequests || eventData.reduce((sum, item) => sum + item.eventCount, 0);

  const totalBlockByWAF = isArray
    ? eventData.filter(item => item.eventType === 'block').reduce((sum, item) => sum + item.eventCount, 0)
    : (data as any).totalBlockByWAF || eventData.filter(item => item.eventType === 'block').reduce((sum, item) => sum + item.eventCount, 0);

  const totalManaged = isArray
    ? eventData.filter(item => item.eventType === 'managed_challenge').reduce((sum, item) => sum + item.eventCount, 0)
    : (data as any).totalManaged || eventData.filter(item => item.eventType === 'managed_challenge').reduce((sum, item) => sum + item.eventCount, 0);

  const validRequests = isArray
    ? totalRequests - totalBlockByWAF
    : (data as any).valid_requests || totalRequests - totalBlockByWAF;

  const blockedPercentage = isArray
    ? (totalRequests > 0 ? ((totalBlockByWAF / totalRequests) * 100).toFixed(2) : "0")
    : (data as any).blockedPercentage || "0";

  const totalThreats = totalBlockByWAF + totalManaged;

  // Função para formatar números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Função auxiliar para obter WAF de forma segura
  const getWAFCount = (): number => {
    if (isArray) {
      return eventData.filter(item => item.eventType === 'block').reduce((sum, item) => sum + item.eventCount, 0);
    } else {
      return (data as any).totalBlockByWAF || eventData.filter(item => item.eventType === 'block').reduce((sum, item) => sum + item.eventCount, 0);
    }
  };

  const wafCount = getWAFCount();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de Requests */}
      <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Total de Requests</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(totalRequests)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totalRequests.toLocaleString()} requisições
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Requisições Válidas */}
      <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Requisições Válidas</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(validRequests)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totalRequests > 0 ? `${((validRequests / totalRequests) * 100).toFixed(1)}% do total` : '0% do total'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ameaças Bloqueadas */}
      <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-full">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Ameaças Bloqueadas</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(totalThreats)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              WAF: {wafCount.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Porcentagem de Bloqueio */}
      <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-full">
            <ShieldAlert className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Taxa de Bloqueio</p>
            <p className="text-2xl font-bold text-gray-900">
              {blockedPercentage}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totalThreats.toLocaleString()} ameaças detectadas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficCards;