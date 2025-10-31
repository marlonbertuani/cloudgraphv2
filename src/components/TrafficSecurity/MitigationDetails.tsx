import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Shield, ShieldAlert, ShieldCheck, Activity } from "lucide-react";

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

interface EventData {
  eventType: string;
  ts: string;
  eventCount: number;
  accountTag: string;
}

interface MitigationDetailsProps {
  data: ApiResponse;
}

const MitigationDetails: React.FC<MitigationDetailsProps> = ({ data }) => {
  // Função para formatar números
  const formatNumber = (num: number) => {
    return num?.toLocaleString() || "0";
  };

  // Calcular totalInteractive (jschallenge) a partir dos dados
  const totalInteractive = data.data
    ?.filter(item => item.eventType === 'jschallenge')
    .reduce((sum, item) => sum + item.eventCount, 0) || 0;

  const mitigationData = [
    {
      label: "Bloqueio",
      value: formatNumber(data.mitigated_requests),
      icon: ShieldAlert,
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      label: "Desafio Gerenciado",
      value: formatNumber(data.totalManaged),
      icon: ShieldCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      label: "Desafio Interativo",
      value: formatNumber(totalInteractive),
      icon: Shield,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#003366] pt-0">
          Detalhes de Mitigações
        </h2>
      </div>

      {/* Cards de Mitigação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mitigationData.map((item, index) => (
          <Card 
            key={index} 
            className="shadow-lg border-0 transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${item.bgColor}`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {item.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela Alternativa (se preferir o estilo de tabela) */}
      {/* <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <div className="bg-[#003366] rounded-t-lg p-4">
            <h3 className="text-white font-bold text-center">
              Resumo de Mitigações
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mitigationData.map((item, index) => (
              <div 
                key={index}
                className={`p-4 flex items-center justify-between transition-colors hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <span className="font-bold text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default MitigationDetails;