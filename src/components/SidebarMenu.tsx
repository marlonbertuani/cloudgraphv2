// ---------- src/components/SidebarMenu.tsx ----------
import { ChevronRight, Home, List, Zap, Shield } from 'lucide-react'

type Section = { id: string; title: string }

export default function SidebarMenu({ sections, active }: { sections: Section[]; active: string }) {
  return (
    <aside className="w-60 hidden md:block border-r bg-white shadow-sm">
      <div className="p-4 sticky top-0">
        <div className="text-sm text-slate-500 mb-4">NAVEGAÇÃO</div>
        <nav className="space-y-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${active === s.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {s.id === 'overview' && <Home size={16} />}
              {s.id === 'logs' && <List size={16} />}
              {s.id === 'performance' && <Zap size={16} />}
              {s.id === 'cache' && <ChevronRight size={16} />}
              {s.id === 'security' && <Shield size={16} />}
              <span>{s.title}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}