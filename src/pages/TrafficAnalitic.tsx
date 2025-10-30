import React, { useState, useEffect } from "react";
import {
    Container, Typography, Box, Paper, Grid, Button,
    TableContainer, Table, TableBody, TableCell, TableRow,
    TableHead, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { API_BASE_URL } from "../Core/config";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + " B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + " M";
    if (num >= 1e3) return (num / 1e3).toFixed(3);
    return num.toString();
};

const generateLast12Months = () => {
    const months = [];
    for (let i = 0; i < 3; i++) {
        months.push(moment().subtract(i + 1, "months").format("MM-YYYY"));
    }
    return months;
};

const TrafficSecurityPage = () => {
    const { clientName } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(moment().subtract(1, "months").format("MM-YYYY"));
    const [metrics, setMetrics] = useState({
        totalRequests: 0,
        totalMitigated: 0,
        validRequests: 0,
        blockedRequests: 0,
        totalblock: 0,
        totalManaged: 0,
        totalInteractive: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const encodedClientName = encodeURIComponent(clientName);
                const response = await fetch(`${API_BASE_URL}/graph-datasec/${encodedClientName}?monthRef=${selectedMonth}`);
                const result = await response.json();

                const groupedData = {};
                result.data.forEach(item => {
                    const { ts, eventType, eventCount } = item;
                    if (!groupedData[ts]) groupedData[ts] = { ts };
                    groupedData[ts][eventType] = eventCount;
                });

                const formattedData = Object.values(groupedData);
                await sleep(400);

                setData(formattedData);
                setMetrics({
                    totalRequests: result.requests_total,
                    validRequests: result.valid_requests,
                    blockedRequests: result.blockedPercentage,
                    totalMitigated: (result.mitigated_requests || 0) + (result.totalManaged || 0) + (result.totalInteractive || 0),
                    totalManaged: result.totalManaged,
                    totalInteractive: result.totalChallange,
                    totalblock: result.mitigated_requests,
                });
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchData();
    }, [clientName, selectedMonth]);

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
                    Análise de Tráfego x Segurança - {clientName}
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

            <Grid container spacing={2} sx={{ marginBottom: 1 }}>
                {[
                    { label: "Total Requisições", value: formatNumber(metrics.totalRequests), color: "#E3F2FD" },
                    { label: "Total Mitigados", value: formatNumber(metrics.totalMitigated), color: "#E3F2FD" },
                    { label: "Requisições válidas", value: formatNumber(metrics.validRequests), color: "#E8F5E9" },
                    { label: "Requisições bloqueadas", value: `${metrics.blockedRequests}%`, color: "#FFEBEE" },
                ].map((stat, index) => (
                    <Grid item xs={12} md={3} key={index}>
                        <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, textAlign: "center", backgroundColor: stat.color }}>
                            <Typography variant="h4" sx={{ color: "#003366" }}>
                                {stat.value.split(" ")[0]}
                                {stat.value.includes(" ") && (
                                    <span style={{ fontSize: "0.5em", marginLeft: "2px", color: "black" }}>
                                        {stat.value.split(" ")[1]}
                                    </span>
                                )}
                            </Typography>
                            <Typography variant="body" sx={{ color: "#555555" }}>
                                {stat.label}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, marginBottom: 2 }}>
                <Typography variant="h6" textAlign="center" gutterBottom sx={{ color: "#003366", fontWeight: "bold" }}>
                    Distribuição de Mitigações ao Longo do Tempo
                </Typography>
                <ResponsiveContainer width="100%" height={380}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis dataKey="ts" tick={{ fill: "#555555", fontSize: 12 }} />
                        <YAxis tickFormatter={(tick) => {
                            if (tick >= 1000000) return `${(tick / 1000000).toFixed(1)}M`;
                            if (tick >= 1000) return `${(tick / 1000).toFixed(1)}K`;
                            return tick;
                        }} tick={{ fill: "#555555", fontSize: 12 }} />
                        <Tooltip formatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                            return value;
                        }} contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #ccc", borderRadius: 4, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }} />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        <Line type="monotone" dataKey="block" stroke="#D2691E" name="Mitigado pelo WAF" dot={{ r: 4 }} strokeWidth={2} />
                        <Line type="monotone" dataKey="challenge" stroke="#6495ED" name="Desafio Interativo" dot={{ r: 4 }} strokeWidth={2} />
                        <Line type="monotone" dataKey="managed_challenge" stroke="#008B8B" name="Desafio Gerenciado" dot={{ r: 4 }} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>

            <Typography variant="h6" textAlign="center" gutterBottom sx={{ color: "#003366", fontWeight: "bold", paddingTop: 0 }}>
                Detalhes de Mitigações
            </Typography>
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, marginBottom: 1 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#003366" }}>
                            <TableCell align="center" sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Tipo</TableCell>
                            <TableCell align="center" sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Valor</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[
                            { label: "Bloqueio", value: formatNumber(metrics.totalblock) },
                            { label: "Desafio Interativo", value: metrics.totalInteractive ? formatNumber(metrics.totalInteractive) : "-" },
                            { label: "Desafio Gerenciado", value: metrics.totalManaged ? formatNumber(metrics.totalManaged) : "-" },
                        ].map((row, index) => (
                            <TableRow
                                key={index}
                                sx={{
                                    backgroundColor: index % 2 === 0 ? "#E6F0FF" : "white",
                                    "&:hover": { backgroundColor: "#B3D1FF", cursor: "pointer" },
                                }}
                            >
                                <TableCell align="center" sx={{ padding: "8px 16px" }}>
                                    <Typography variant="body1">{row.label}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ padding: "8px 16px" }}>
                                    <Typography variant="body1">{row.value}</Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="space-between" marginBottom={1} mt={3}>
                <Button variant="contained" color="primary" onClick={() => window.history.back()} sx={{ flex: 1, mr: 2 }}>Voltar</Button>
                <Button variant="contained" color="secondary" onClick={() => navigate(`/RequestMetricsPage/${clientName}`)} sx={{ flex: 1 }}>Próximo</Button>
            </Box>
        </Container>
    );
};

export default TrafficSecurityPage;