// ---------- src/components/MetricCard.tsx ----------

export default function MetricCard({ title, value, subtitle, tone = 'normal' }: { title: string; value: string; subtitle?: string; tone?: 'normal' | 'danger' }) {
  return (
    <div className={`bg-white p-4 rounded-2xl shadow-md border ${tone === 'danger' ? 'border-red-50' : 'border-transparent'}`}>
      <div className="text-sm text-slate-500">{title}</div>
      <div className={`mt-2 text-2xl font-semibold ${tone === 'danger' ? 'text-red-600' : 'text-slate-800'}`}>{value}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  )
}