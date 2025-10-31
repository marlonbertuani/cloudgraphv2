// ---------- src/pages/DashboardMetrics.tsx ----------
import { useEffect, useRef, useState } from 'react'
import SidebarMenu from '../components/SidebarMenu'
import SectionCard from '../components/SectionCard'
import ExportButton from '../components/ExportButton'
import { motion } from 'framer-motion'
import ClientSelector from "../components/ClientSelector";
import LogViewer from "../components/LogViewer";
import TrafficAnalisis from "../components/TrafficAnalisis/TrafficAnalisis";
import { BandwidthStats } from "../components/bandwidth/BandwidthStats";
import moment from "moment";
import { MonthYearSelector } from '../components/selectedMonth';
import TrafficStats from '../components/TrafficSecurity/TrafficStats'
import RequestMetrics from '../components/Metrics/RequestMetrics';
import AttackChart from '../components/Attack/AttackChart';
import MitigaredSummary from '../components/Attack/MitigatedSummary';
import SecurityChart from '../components/Attack/SecurityChart';
import Top5Chart from '../components/Attack/top5Details';

const sections = [
    { id: 'home', title: 'Inicio' },
    { id: 'list', title: 'Logs de Sincronização' },
    { id: 'requests', title: 'Performance' },
    { id: 'Server', title: 'Cache vs Origem' },
    { id: 'security', title: 'Segurança' },
    { id: 'analytics', title: 'Métricas Sobre Request' },
    { id: 'attacks', title: 'Principais Atacantes' },
    { id: 'zap', title: 'Mitigações Cloudflare' },
    { id: 'network', title: 'Análise de Ataques' },
    { id: 'piechart', title: 'Top Five' },
]

export default function DashboardMetrics() {
    const pageRef = useRef<HTMLDivElement | null>(null)
    const [active, setActive] = useState('home')
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(moment().subtract(1, "months").format("MM-YYYY"));

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visibleSections.length > 0) {
                    setActive(visibleSections[0].target.id);
                }
            },
            { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0.3 }
        );

        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);



    return (
        <div className="min-h-screen flex">
            <SidebarMenu sections={sections} active={active} />

            <main className="flex-1 p-6 md:p-10">
                <header ref={pageRef} className="flex items-center justify-between mb-6">
                    <div id="home" className="flex items-center gap-4">
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
                    <section id="list" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Logs de Sincronização</h2>
                        <SectionCard>
                            <LogViewer client={selectedClient ?? ""} />
                        </SectionCard>
                    </section>

                    <section id="requests" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Performance - {selectedClient}</h2>
                        <SectionCard>
                            <div className="overflow-x-auto">
                                <TrafficAnalisis clientName={selectedClient} />
                            </div>
                        </SectionCard>
                    </section>

                    <section id="Server" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Cache vs Origem - {selectedClient}</h2>
                        <BandwidthStats clientName={selectedClient ?? ""} selectedMonth={selectedMonth} />
                    </section>

                    <section id="security" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Tráfego x Segurança - {selectedClient}</h2>
                        <SectionCard>
                            <TrafficStats
                                clientName={selectedClient}
                                selectedMonth={selectedMonth}
                            />
                        </SectionCard>
                    </section>

                    <section id="analytics" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Métricas Sobre as Requisições - {selectedClient}</h2>
                        <RequestMetrics
                            clientName={selectedClient}
                        />
                    </section>

                    <section id="attacks" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Principais atacantes por países - {selectedClient}</h2>
                        <AttackChart
                            clientName={selectedClient} selectedMonth={selectedMonth}
                        />
                    </section>

                    <section id="zap" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Mitigações Cloudflare - {selectedClient}</h2>
                        <MitigaredSummary
                            clientName={selectedClient} selectedMonth={selectedMonth}
                        />
                    </section>

                    <section id="network" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Análise de Ataques - {selectedClient}</h2>
                        <SecurityChart
                            clientName={selectedClient} selectedMonth={selectedMonth}
                        />
                    </section>

                    <section id="piechart" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">TOP5 - {selectedClient}</h2>
                        <Top5Chart
                            clientName={selectedClient} selectedMonth={selectedMonth}
                        />
                    </section>

                    <div className="h-24" />
                </div>
            </main>
        </div>
    )
}