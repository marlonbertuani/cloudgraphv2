import { Activity, Home, List, Database, Server, Shield, BarChart3, LineChart, Globe, Bug, Zap, Network, Star, PieChart, ChevronRight } from "lucide-react";

type Section = { id: string; title: string; icon?: string };

const iconMap: Record<string, React.ReactNode> = {
  // Ícones básicos
  home: <Home size={16} />,
  list: <List size={16} />,
  zap: <Zap size={16} />,
  server: <Server size={16} />,
  security: <Shield size={16} />,
  analytics: <BarChart3 size={16} />,
  database: <Database size={16} />,
  network: <Network size={16} />,
  attacks: <Bug size={16} />,
  requests: <Activity size={16} />,
  traffic: <Globe size={16} />,
  piechart: <PieChart size={16} />,
  linechart: <LineChart size={16} />,
  star: <Star size={16} />,
};

export default function SidebarMenu({
  sections,
  active,
  onSelect,
}: {
  sections: Section[];
  active: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <aside className="w-60 hidden md:block border-r bg-white shadow-sm">
      <div className="p-4 sticky top-0">
        <div className="text-sm text-slate-500 mb-4">NAVEGAÇÃO</div>
        <nav className="space-y-1">
          {sections.map((s) => {
            const icon =
              s.icon && iconMap[s.icon.toLowerCase()]
                ? iconMap[s.icon.toLowerCase()]
                : iconMap[s.id.toLowerCase()] || <ChevronRight size={16} />;

            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => onSelect?.(s.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm cursor-pointer
                  ${active === s.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-700 hover:bg-slate-50 hover:text-blue-500"
                  }`}
              >
                {icon}
                <span>{s.title}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

