// ---------- src/pages/DashboardMetrics.tsx ----------
import { useEffect, useRef, useState } from 'react'
import SidebarMenu from '../components/SidebarMenu'
import SectionCard from '../components/SectionCard'
import ExportButton from '../components/ExportButton'
import { motion } from 'framer-motion'
import ClientSelector from "../components/ClientSelector";
import LogViewer from "../components/LogViewer";
import TrafficAnalisis from "./TrafficAnalisis";
import { BandwidthStats } from "../components/bandwidth/BandwidthStats";
import moment from "moment";
import { MonthYearSelector } from '../components/selectedMonth';
import TrafficStats from '../components/TrafficSecurity/TrafficStats'

const sections = [
    { id: 'logs', title: 'Logs de Sincronização' },
    { id: 'overview', title: 'Visão Geral' },
    { id: 'performance', title: 'Performance' },
    { id: 'cache', title: 'Cache vs Origem' },
    { id: 'security', title: 'Segurança' },
]

export default function DashboardMetrics() {
    const pageRef = useRef<HTMLDivElement | null>(null)
    const [active, setActive] = useState('logs')
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(moment().subtract(1, "months").format("MM-YYYY"));

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
                            <ClientSelector onSelect={setSelectedClient} />

                            <div className="flex gap-2">
                                <MonthYearSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ExportButton rootRef={pageRef} />
                        <button className="px-4 py-2 bg-white rounded-lg shadow text-sm">Configurar</button>
                    </div>
                </header>

                <div ref={pageRef} id="report-root">
                    <section id="logs" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Logs de Sincronização</h2>
                        <SectionCard>
                            <LogViewer client={selectedClient ?? ""} />
                        </SectionCard>
                    </section>

                    <section id="performance" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Performance {selectedClient}</h2>
                        <SectionCard>
                            <div className="overflow-x-auto">
                                <TrafficAnalisis clientName={selectedClient} />
                            </div>
                        </SectionCard>
                    </section>

                    <section id="cache" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Cache vs Origem {selectedClient}</h2>
                        <BandwidthStats clientName={selectedClient ?? ""} selectedMonth={selectedMonth} />
                    </section>

                    <section id="security" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Segurança</h2>
                        <SectionCard>
                            <TrafficStats
                                clientName={selectedClient}
                                selectedMonth={selectedMonth}
                            />
                        </SectionCard>
                    </section>

                    <div className="h-24" />
                </div>
            </main>
        </div>
    )
}