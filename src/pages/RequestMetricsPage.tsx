import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, Button } from "@mui/material";
import { LabelList, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Label } from "recharts";
import axios from "axios";
import { API_BASE_URL } from "../Core/config";
import { useParams, useNavigate } from "react-router-dom";

// Função para causar pausa no código
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const RequestMetricsPage = () => {
    const { clientName } = useParams();
    const [data, setData] = useState([]); // Estado para armazenar os dados da API
    const navigate = useNavigate();

    // Requisição HTTP para buscar os dados da API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/security_analysis/${clientName}`);
                const apiData = response.data;

                // Transformar e ordenar os dados em ordem decrescente por data
                const formattedData = apiData
                    .map(item => {
                        const createdAt = new Date(item.created_at);
                        const month = createdAt.toLocaleString('default', { month: 'short', year: '2-digit', timeZone: 'UTC' });

                        return {
                            month,
                            total: item.requests_total / 1000000,
                            valid: item.valid_requests / 1000000,
                            mitigated: item.total_mitigated / 1000000,
                            blockPercentage: parseFloat(item.blocked_requests),
                        };
                    })
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Ordenação decrescente por data

                await sleep(400); // Pausa
                setData(formattedData); // Atualiza o estado com os dados formatados e ordenados
            } catch (error) {
                console.error("Erro ao buscar dados da API:", error);
            }
        };

        fetchData();
    }, [clientName]);

    // Formatação personalizada para o tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper elevation={3} sx={{ padding: 2, backgroundColor: "#FFFFFF" }}>
                    <Typography variant="body1" sx={{ color: "#003366", fontWeight: "bold" }}>
                        {label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#003366" }}>
                        Total de Requisições: {payload[0].value.toFixed(2)}M
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                        Requisições Válidas: {payload[1].value.toFixed(2)}M
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#FF9800" }}>
                        Requisições Mitigadas: {payload[2].value.toFixed(2)}M
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#FF0000" }}>
                        Percentual de Bloqueios: {payload[3].value.toFixed(2)}%
                    </Typography>
                </Paper>
            );
        }
        return null;
    };

    return (
        <Container maxWidth="lg" sx={{
            backgroundColor: "#e8e8e8", // Fundo cinza claro
            paddingBottom: 1,
            borderRadius: 4,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)", // Sombra suave
            marginTop: 1,
            minHeight: "98vh"
        }}>
            <Box
                display="flex"
                justifyContent="center" // Centraliza horizontalmente
                marginTop={1}
                marginBottom={2}
            >
                <Typography
                    variant="h5"
                    textAlign="center"
                    sx={{
                        color: "#003366", // Azul marinho
                        fontWeight: "bold", // Texto em negrito
                        textTransform: "uppercase", // Transforma o texto em maiúsculas
                        letterSpacing: 1.2, // Aumenta o espaçamento entre as letras
                        padding: "8px 16px", // Adiciona um espaçamento interno
                        backgroundColor: "#E6F0FF", // Azul claro de fundo
                        borderRadius: 2, // Bordas levemente arredondadas
                        display: "inline-block", // Faz o título ocupar apenas o espaço necessário
                        width: "100%"
                    }}
                >
                    Métricas de Requisições - {clientName}
                </Typography>
            </Box>

            {/* Gráfico de Barras com Linha */}
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, marginBottom: 4 }}>
                <Typography variant="h6" textAlign="center" gutterBottom sx={{ color: "#003366", fontWeight: "bold" }}>
                    Requisições ao Longo do Tempo
                </Typography>
                <ResponsiveContainer width="100%" height={600}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="#003366" domain={[0, (dataMax) => {
                            const clientMaxValues = {
                                // "Estrelabet Enterprise Account": Math.ceil(dataMax + 500),  // Defina um limite específico para um cliente específico
                                // "Bankei Account": Math.ceil(dataMax + 1),   // Outro exemplo
                                // "Atacadao's Account": Math.ceil(dataMax + 30),   // Outro exemplo
                            };
                            return clientMaxValues[clientName] || Math.ceil(dataMax * 1.08); // Padrão para outros clientes
                        }]}>
                            <Label
                                value="Requisições (Em Milhões)"
                                angle={-90}
                                position="insideLeft"
                                style={{ textAnchor: "middle", fill: "#003366" }}
                            />
                        </YAxis>
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#FF0000"
                            domain={[0, 50]} // Força o eixo Y da direita a ir de 0 a 50%
                            tickFormatter={(value) => `${value}%`} // Formata os valores como porcentagem
                        >
                            <Label
                                value="Percentual de Bloqueios (%)"
                                angle={-90}
                                position="insideRight"
                                style={{ textAnchor: "middle", fill: "#FF0000" }}
                            />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} /> {/* Tooltip personalizado */}
                        <Legend />
                        {/* Barras para Total, Válidas e Mitigadas */}
                        <Bar yAxisId="left" dataKey="total" fill="#003366" name="Total de Requisições">
                            <LabelList
                                dataKey="total"
                                position="top"
                                formatter={(value) => {
                                    if (value >= 1_000) {
                                        return `${(value / 1000).toFixed(1)} B`;
                                    } else {
                                        return `${value.toFixed(1)} M`;
                                    }
                                }}
                                fill="#003366"
                            />
                        </Bar>

                        <Bar yAxisId="left" dataKey="valid" fill="#4CAF50" name="Requisições Válidas">
                            <LabelList
                                dataKey="valid"
                                position="top"
                                formatter={(value) => {
                                    if (value >= 1_000) {
                                        return `${(value / 1000).toFixed(1)} B`;
                                    } else {
                                        return `${value.toFixed(1)} M`;
                                    }
                                }}
                                fill="#4CAF50"
                            />
                        </Bar>
                        <Bar yAxisId="left" dataKey="mitigated" fill="#FF9800" name="Requisições Mitigadas">
                            <LabelList
                                dataKey="mitigated"
                                position="top"
                                formatter={(value) => `${value.toLocaleString('pt-BR')} M`}
                                fill="#FF9800"
                            />
                        </Bar>
                        {/* Linha para Percentual de Bloqueios */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="blockPercentage"
                            stroke="#FF0000"
                            name="Percentual de Bloqueios"
                            strokeWidth={2}
                            dot={{ r: 6 }} // Aumenta o tamanho dos pontos
                            label={{
                                position: "top",
                                formatter: (value) => `${value.toFixed(2)}%`, // Exibe os valores acima da linha
                                fill: "#FF0000",
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </Paper>
            <Box display="flex" justifyContent="space-between" marginBottom={2} mt={3}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.history.back()}
                    sx={{ flex: 1, mr: 2 }} // flex: 1 para garantir o mesmo tamanho
                >
                    Voltar
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => navigate(`/`)}
                    sx={{ flex: 1 }}
                >
                    Home
                </Button>
            </Box>
        </Container>
    );
};

export default RequestMetricsPage;