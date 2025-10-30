import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { LabelList, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import axios from "axios";
import { API_BASE_URL } from "../Core/config";
import moment from "moment";

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const BandwidthSaver = () => {
    const { clientName } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [data2, setData2] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(moment().subtract(1, "months").format("MM-YYYY"));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const hostResponse = await axios.get(`${API_BASE_URL}/clientes`);
                const data = hostResponse.data;
                const client = data.find(client => client.client_name === clientName);
                if (!client) return;

                const statsResponse = await axios.get(`${API_BASE_URL}/stats/${client.account_id}`);
                const stats = statsResponse.data;

                const formattedData = stats.map(item => {
                    const date = new Date(item.month_year);
                    date.setHours(date.getHours() + 27);
                    return {
                        name: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
                        cache: (item.cache_percentage).toFixed(2),
                        origin: (item.origin_percentage).toFixed(2),
                    };
                });

                setTimeout(() => setData(formattedData), 400);

                const encodedClientName = encodeURIComponent(clientName);
                const encodedMonth = encodeURIComponent(selectedMonth);
                const response = await fetch(`${API_BASE_URL}/graph-data/${encodedClientName}?monthRef=${encodedMonth}`);
                const result = await response.json();

                const groupedData = {};
                result.data.forEach(item => {
                    const { ts, type, count } = item;
                    if (!groupedData[ts]) groupedData[ts] = { ts };
                    groupedData[ts][type] = count;
                });

                const formattedData2 = Object.values(groupedData);
                await sleep(400);
                setData2(formattedData2);

            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchData();
    }, [clientName, selectedMonth]);

    const generateLast12Months = () => {
        const months = [];
        for (let i = 0; i < 3; i++) {
            months.push(moment().subtract(i + 1, "months").format("MM-YYYY"));
        }
        return months;
    };

    return (
        <Container maxWidth="lg" sx={{
            backgroundColor: "#f5f5f5",
            paddingBottom: 1,
            borderRadius: 4,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
            marginTop: 1,
        }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={2}>
                <Typography variant="h5" textAlign="center" sx={{ width: "100%", color: "#003366", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.2, padding: "8px 16px", backgroundColor: "#E6F0FF", borderRadius: 2, display: "inline-block" }}>
                    Análise de Performance - {clientName}
                </Typography>
                <FormControl sx={{ minWidth: 200, marginLeft: 2 }}>
                    <InputLabel id="month-select-label">Mês de Referência</InputLabel>
                    <Select
                        labelId="month-select-label"
                        value={selectedMonth}
                        label="Mês de Referência"
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {generateLast12Months().map((month) => (
                            <MenuItem key={month} value={month}>{month}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, marginBottom: 1 }}>
                <Typography variant="h6" textAlign="center" gutterBottom sx={{ color: "#003366", fontWeight: "bold" }}>
                    Cache vs Origem
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis dataKey="name" tick={{ fill: "#555555", fontSize: 12 }} />
                        <YAxis
                            tickFormatter={(value) => `${parseFloat(value).toFixed(2)}%`} // Limita a 2 casas decimais
                            tick={{ fill: "#555555", fontSize: 12 }}
                            domain={[0, (dataMax) => dataMax * 1.1]} // Ajuste dinâmico do domínio
                        />
                        <Tooltip
                            formatter={(value) => [`${value}%`, "Valor"]}
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                padding: "8px"
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        {/* Barra para "Entregue com Cache" */}
                        <Bar dataKey="cache" fill="url(#cacheGradient)" name="Entregue com Cache">
                            <LabelList
                                dataKey="cache"
                                position="top"
                                formatter={(value) => `${value}%`} // Formata os valores como porcentagem
                                fill="#555555" // Cor do texto
                                style={{ fontSize: 12, fontWeight: "bold" }} // Estilo do texto
                            />
                        </Bar>
                        {/* Barra para "Entregue pela Origem" */}
                        <Bar dataKey="origin" fill="url(#originGradient)" name="Entregue pela Origem">
                            <LabelList
                                dataKey="origin"
                                position="top"
                                formatter={(value) => `${value}%`} // Formata os valores como porcentagem
                                fill="#555555" // Cor do texto
                                style={{ fontSize: 12, fontWeight: "bold" }} // Estilo do texto
                            />
                        </Bar>
                        {/* Gradientes para as barras */}
                        <defs>
                            <linearGradient id="cacheGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop stopColor="#F38020" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="originGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop stopColor="#6495ED" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </Paper>
            <Typography variant="body1" textAlign="center" gutterBottom sx={{ color: "#555555", marginBottom: 2 }}>
                Conteúdo entregue como Cache pela Cloudflare, economizando recursos dos servidores, on-premise ou em nuvem.
            </Typography>
            <Box sx={{ overflow: "hidden", borderRadius: 2 }}>
                <Paper elevation={3} sx={{ padding: 0, borderRadius: 2, marginBottom: 1 }}>
                    <Typography variant="h6" textAlign="center" gutterBottom sx={{ color: "#003366", fontWeight: "bold" }}>
                        Distribuição ao Longo do Tempo
                    </Typography>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                            <XAxis dataKey="ts" tick={{ fill: "#555555", fontSize: 12 }} />
                            <YAxis
                                tickFormatter={(tick) => {
                                    if (tick >= 1000000) {
                                        return `${(tick / 1000000).toFixed(1)}M`;
                                    } else if (tick >= 1000) {
                                        return `${(tick / 1000).toFixed(1)}K`;
                                    }
                                    return tick;
                                }}
                                tick={{ fill: "#555555", fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value) => {
                                    if (value >= 1000000) {
                                        return `${(value / 1000000).toFixed(1)}M`;
                                    } else if (value >= 1000) {
                                        return `${(value / 1000).toFixed(1)}K`;
                                    }
                                    return value;
                                }}
                                contentStyle={{
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #ccc",
                                    borderRadius: 4,
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 10 }} />
                            {/* Linha para "Servido pelo Cloudflare" */}
                            <Line
                                type="monotone"
                                dataKey="servedByCloudflare"
                                stroke="#F38020"
                                name="Servido pelo Cloudflare"
                                dot={{ r: 4 }}
                                strokeWidth={2}
                                label={{
                                    position: "top", // Posiciona os valores acima dos pontos
                                    formatter: (value) => {
                                        if (value >= 1000000) {
                                            return `${(value / 1000000).toFixed(1)}M`; // Formata em milhões
                                        } else if (value >= 1000) {
                                            return `${(value / 1000).toFixed(1)}K`; // Formata em milhares
                                        }
                                        return value; // Mantém o valor original
                                    },
                                    fill: "#F38020", // Cor do texto
                                    fontSize: 10, // Tamanho da fonte
                                    fontWeight: "bold", // Peso da fonte
                                }}
                            />
                            {/* Linha para "Servido pela Origem" */}
                            <Line
                                type="monotone"
                                dataKey="servedByOrigin"
                                stroke="#6495ED"
                                name="Servido pela Origem"
                                dot={{ r: 4 }}
                                strokeWidth={2}
                                label={{
                                    position: "top", // Posiciona os valores acima dos pontos
                                    formatter: (value) => {
                                        if (value >= 1000000) {
                                            return `${(value / 1000000).toFixed(1)}M`; // Formata em milhões
                                        } else if (value >= 1000) {
                                            return `${(value / 1000).toFixed(1)}K`; // Formata em milhares
                                        }
                                        return value; // Mantém o valor original
                                    },
                                    fill: "#6495ED", // Cor do texto
                                    fontSize: 10, // Tamanho da fonte
                                    fontWeight: "bold", // Peso da fonte
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            </Box>
            <Box display="flex" justifyContent="space-between" marginBottom={2} mt={3}>
                <Button variant="contained" color="primary" onClick={() => window.history.back()} sx={{ flex: 1, mr: 2 }}>Voltar</Button>
                <Button variant="contained" color="secondary" onClick={() => navigate(`/TrafficAnalitic/${clientName}`)} sx={{ flex: 1 }}>Próximo</Button>
            </Box>
        </Container>
    );
};

export default BandwidthSaver;