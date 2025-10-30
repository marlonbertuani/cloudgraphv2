// ---------- src/pages/DashboardMetrics.tsx ----------
import React, { useEffect, useRef, useState } from 'react'
import SidebarMenu from '../components/SidebarMenu'
import MetricCard from '../components/MetricCard'
import SectionCard from '../components/SectionCard'
import ExportButton from '../components/ExportButton'
import { motion } from 'framer-motion'

const sections = [
    { id: 'overview', title: 'Visão Geral' },
    { id: 'logs', title: 'Logs de Sincronização' },
    { id: 'performance', title: 'Performance' },
    { id: 'cache', title: 'Cache vs Origem' },
    { id: 'security', title: 'Segurança' },
]

export default function DashboardMetrics() {
    const pageRef = useRef<HTMLDivElement | null>(null)
    const [active, setActive] = useState('overview')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id)
                    }
                })
            },
            { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 }
        )

        sections.forEach((s) => {
            const el = document.getElementById(s.id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    return (
        <div className="min-h-screen flex">
            <SidebarMenu sections={sections} active={active} />

            <main className="flex-1 p-6 md:p-10">
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-md bg-white p-2 shadow">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="3" width="20" height="18" rx="3" stroke="#2563eb" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-lg font-semibold">Tripla • Cloudflare</div>
                                <div className="text-sm text-slate-500">Relatório unificado</div>
                            </div>
                        </div>
                        <div className="ml-6 flex items-center gap-3">
                            <select className="px-3 py-2 rounded-lg bg-white shadow text-sm">
                                <option>Cliente: Fazenda Viganó</option>
                                <option>Cliente: Exemplo</option>
                            </select>

                            <input type="month" defaultValue={new Date().toISOString().slice(0, 7)} className="px-3 py-2 rounded-lg bg-white shadow text-sm" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ExportButton rootRef={pageRef} />
                        <button className="px-4 py-2 bg-white rounded-lg shadow text-sm">Configurar</button>
                    </div>
                </header>

                <div ref={pageRef} id="report-root">
                    <section id="overview" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Visão Geral</h2>
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard title="Requisições (5m)" value="16.000" subtitle="média normal" />
                            <MetricCard title="Requisições (pico)" value="170.000" subtitle="durante ataque" tone="danger" />
                            <MetricCard title="Dados Transferidos" value="24.5 GB" subtitle="últimas 24h" />
                            <MetricCard title="Cache Hit" value="72%" subtitle="média" />
                        </motion.div>
                    </section>

                    <section id="logs" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Logs de Sincronização</h2>
                        <SectionCard>
                            <div className="space-y-2 h-56 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                                <div className="text-sm text-slate-600">🔄 Iniciando sincronização...</div>
                                <div className="text-sm text-slate-600">✅ Dados sincronizados com sucesso. (14:22)</div>
                                <div className="text-sm text-slate-600">⚠️ Aviso: tempo de resposta alto em zona X.</div>
                                <div className="text-sm text-slate-600">🔒 Bloqueios: 120 eventos (tipo: block)</div>
                            </div>
                        </SectionCard>
                    </section>

                    <section id="performance" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Performance</h2>
                        <SectionCard>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[680px] table-auto">
                                    <thead className="text-left text-sm text-slate-500">
                                        <tr>
                                            <th className="pb-3">Zona</th>
                                            <th className="pb-3">Requests (5m)</th>
                                            <th className="pb-3">Tempo Médio (ms)</th>
                                            <th className="pb-3">Cache Hit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <tr key={i} className="border-t last:border-b">
                                                <td className="py-3">zona-{i + 1}.exemplo</td>
                                                <td className="py-3">{(Math.random() * 20000 + 1000).toFixed(0)}</td>
                                                <td className="py-3">{(Math.random() * 200 + 20).toFixed(0)}</td>
                                                <td className="py-3">{(50 + Math.random() * 40).toFixed(0)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    </section>

                    <section id="cache" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Cache vs Origem</h2>
                        <SectionCard>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="h-64 rounded-lg bg-gradient-to-br from-white to-slate-50 shadow-inner flex items-center justify-center">Gráfico principal (placeholder)</div>
                                <div className="h-64 rounded-lg bg-gradient-to-br from-white to-slate-50 shadow-inner p-4">Distribuição temporal (placeholder)</div>
                            </div>
                        </SectionCard>
                    </section>

                    <section id="security" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Segurança</h2>
                        <SectionCard>
                            <div className="p-4 text-slate-600">Placeholder para eventos bloqueados, IPs suspeitos e histórico de ataques.</div>
                        </SectionCard>
                    </section>

                    <div className="h-24" />
                </div>
            </main>
        </div>
    )
}