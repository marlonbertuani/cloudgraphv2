import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Container, Typography, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../Core/config";

// Função para causar pausa no código
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const TrafficAnalisis = () => {
    const navigate = useNavigate();
    const { clientName } = useParams();  // Captura o nome do cliente da URL
    const [clients, setClients] = useState([]);
    const [accountId, setClientid] = useState([]);
    const [hosts, setHosts] = useState([]);
    const [stats, setStats] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleClick = () => {
        setOpenDialog(true);
    };

    const handleConfirm = async () => {
        setIsUpdating(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/certificates/expirations/${accountId}`);
            console.log('Datas atualizadas:', response.data);
            // Adicione aqui qualquer lógica de atualização do estado
        } catch (error) {
            console.error('Erro ao atualizar vencimentos:', error);
        } finally {
            setIsUpdating(false);
            setOpenDialog(false);
        }
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (clientName) {
            fetchClientData(clientName);  // Atualiza os dados ao mudar o nome do cliente
        }
    }, [clientName, clients, isUpdating]);

    const fetchClients = async () => {
        setLoading(true);
        await sleep(400); // Pausa
        try {
            const response = await axios.get(`${API_BASE_URL}/clientes`);
            setClients(response.data);
        } catch (error) {
            console.error("Erro ao buscar clientes", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientData = async (clientName) => {
        setLoading(true);
        const client = clients.find(c => c.client_name === clientName);
        if (!client) return;
        setClientid(client.account_id);

        try {
            // Busca hosts e formata os dados
            const hostsResponse = await axios.get(`${API_BASE_URL}/hosts/${clientName}`);

            // Processa os hosts para tratar vencimento nulo
            const processedHosts = hostsResponse.data.map(host => ({
                ...host,
                vencimento: host.vencimento ?
                    new Date(host.vencimento).toLocaleDateString('pt-BR') :
                    '0/0/0'
            }));

            setHosts(processedHosts);

            // Busca estatísticas
            const statsResponse = await axios.get(`${API_BASE_URL}/stats/${client.account_id}`);
            const statsData = statsResponse.data;

            // Encontrar o objeto com o maior ID
            const latestStats = statsData.reduce((max, item) =>
                (item.id > max.id ? item : max), statsData[0]);
            setStats(latestStats);

        } catch (error) {
            console.error("Erro ao buscar dados do cliente", {
                error: error.message,
                response: error.response?.data
            });
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (!num) return "0";
        if (num >= 1e9) return (num / 1e9).toFixed(1) + " B";
        if (num >= 1e6) return (num / 1e6).toFixed(1) + " M";
        if (num >= 1e3) return (num / 1e3).toFixed(3) + "";
        return num.toString();
    };

    const formatBandwidth = (bytes) => {
        if (!bytes) return "0";
        const tb = bytes / 1e12;
        const gb = bytes / 1e9;
        if (tb >= 1) return tb.toFixed(1) + " TB";
        if (gb >= 1) return gb.toFixed(3) + " GB";
        return bytes.toFixed(0) + " B";
    };

    // Formata a data para garantir consistência
    function formatDate(dateString) {
        if (!dateString || dateString === '0/0/0') return 'N/D';

        try {
            const [day, month, year] = dateString.split('/');
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        } catch {
            return dateString; // Retorna o original se não puder formatar
        }
    }

    function isDateWithin45Days(dateString) {
        if (!dateString || dateString === '0/0/0') return false;

        try {
            // Converte a data no formato DD/MM/YYYY para objeto Date
            const [day, month, year] = dateString.split('/').map(Number);
            const expiryDate = new Date(year, month - 1, day);
            const today = new Date();

            // Calcula a diferença em dias
            const diffTime = expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays <= 45 && diffDays >= 0;
        } catch {
            return false;
        }
    }
    console.log(accountId);
    return (
        <Container
            maxWidth="lg"
            sx={{
                backgroundColor: "#f5f5f5",
                paddingBottom: 1,
                borderRadius: 4,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                marginTop: 2,
                minHeight: "98vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Título */}
            <Box
                display="flex"
                justifyContent="center"
                marginTop={0}
                marginBottom={1}
            >
                <Typography
                    variant="h5"
                    textAlign="center"
                    sx={{
                        color: "#003366",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        padding: "8px 16px",
                        backgroundColor: "#E6F0FF",
                        borderRadius: 2,
                        display: "inline-block",
                        width: "100%",
                    }}
                >
                    Análise de Performance - {clientName}
                </Typography>
            </Box>

            {/* Loading */}
            {loading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress size={60} thickness={4} sx={{ color: "#003366" }} />
                </Box>
            )}

            {/* Conteúdo principal */}
            {!loading && (
                <>
                    <Typography variant="h6" textAlign="center" gutterBottom sx={{ color: "#003366", fontWeight: "bold" }}>
                        Estatísticas de Tráfego Mensal
                    </Typography>

                    {/* Estatísticas */}
                    <Grid container spacing={2} justifyContent="center" marginBottom={1}>
                        {[
                            { label: "Total de Requisições", value: formatNumber(stats.total_requests) },
                            { label: "Dados Transferidos", value: formatBandwidth(stats.bandwidth_used) },
                            { label: "Total de Visitas", value: formatNumber(stats.unique_visits) },
                            { label: "Páginas Visualizadas", value: formatNumber(stats.page_views) },
                        ].map((stat, index) => (
                            <Grid item xs={12} md={3} key={index}>
                                <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, textAlign: "center", backgroundColor: "#E3F2FD" }}>
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
                    {/* Tabela */}
                    <Typography variant="h5" textAlign="center" paddingTop={2} color="#003366">
                        Análise de Performance
                    </Typography>
                    <TableContainer
                        component={Paper}
                        sx={{
                            marginTop: 2,
                            borderRadius: 2,
                            overflow: "hidden",
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#003366" }}>
                                    <TableCell align="center" sx={{ padding: "6px 16px" }}>
                                        <Typography fontWeight="bold" color="white">
                                            Zones
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ padding: "6px 16px" }}>
                                        <Typography fontWeight="bold" color="white">
                                            Total
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ padding: "6px 16px" }}>
                                        <Typography fontWeight="bold" color="white">
                                            Served By Cloudflare
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ padding: "6px 16px" }}>
                                        <Typography fontWeight="bold" color="white">
                                            Served By Origin
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ padding: "6px 16px" }}>
                                        <Typography fontWeight="bold" color="white">
                                            Traffic Accelerated
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ padding: "6px 16px" }}>
                                        <Typography fontWeight="bold" color="white">
                                            Latency Improvement
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ padding: "6px 16px" }} onClick={handleClick}>
                                        <Typography fontWeight="bold" color="white">
                                            Vencimento
                                        </Typography>
                                    </TableCell>
                                    <Dialog open={openDialog} onClose={handleClose}>
                                        <DialogTitle>Atualizar datas de vencimento</DialogTitle>
                                        <DialogContent>
                                            <Typography>Deseja atualizar todas as datas de vencimento para esta conta?</Typography>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleClose}>Cancelar</Button>
                                            <Button onClick={handleConfirm} disabled={isUpdating} color="primary" variant="contained">
                                                {isUpdating ? 'Atualizando...' : 'Confirmar'}
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {hosts.length > 0 ? (
                                    hosts.map((host, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                backgroundColor: index % 2 === 0 ? "#E6F0FF" : "white",
                                                "&:hover": {
                                                    backgroundColor: "#B3D1FF",
                                                    cursor: "pointer",
                                                },
                                            }}
                                        >
                                            <TableCell sx={{ padding: "6px 16px" }}>{host.name}</TableCell>
                                            <TableCell align="right" sx={{ padding: "8px 16px" }}>
                                                {formatNumber(host.total_requests)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ padding: "8px 16px" }}>
                                                {formatNumber(host.cache_hit)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ padding: "8px 16px" }}>
                                                {formatNumber(host.origin_fetch)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ padding: "8px 16px" }}>
                                                {host.acceleration_percentage !== null
                                                    ? `${host.acceleration_percentage.toFixed(2)}%`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell align="right" sx={{ padding: "8px 16px" }}>
                                                {host.latency_improvement !== null
                                                    ? `${host.latency_improvement.toFixed(2)}%`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell align="right" sx={{
                                                padding: "8px 16px",
                                                ...(isDateWithin45Days(host.vencimento) && {
                                                    color: 'error.main'
                                                })
                                            }}>
                                                {host.vencimento === '0/0/0' ? 'Não disponível' : formatDate(host.vencimento)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="textSecondary">
                                                Nenhum dado disponível para o cliente selecionado.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Botões */}
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        marginBottom={0}
                        mt={3}
                        sx={{
                            position: "sticky",
                            bottom: 0,
                            left: "50%",
                            maxWidth: "lg",
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate("/")}
                            sx={{ flex: 1, mr: 2 }}
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate(`/BandwidthSaver/${clientName}`)}
                            sx={{ flex: 1 }}
                        >
                            Próximo
                        </Button>
                    </Box>
                </>
            )}
        </Container>
    );
};

export default TrafficAnalisis;