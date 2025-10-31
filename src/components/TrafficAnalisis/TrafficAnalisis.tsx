import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Stats, Host, Client } from "../../Core/types";
import { API_BASE_URL } from "../../Core/config";

import TrafficStats from "./TrafficStats";
import HostsTable from "./HostsTable";
import UpdateExpirationDialog from "./UpdateExpirationDialog";

interface TrafficAnalisisProps {
  clientName?: string | null;
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const TrafficAnalisis: React.FC<TrafficAnalisisProps> = ({ clientName }) => {

  const [clients, setClients] = useState<Client[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [hosts, setHosts] = useState<Host[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => { fetchClients(); }, []);
  useEffect(() => { if (clientName) fetchClientData(clientName); }, [clientName, clients, isUpdating]);

  const fetchClients = async () => {
    setLoading(true);
    await sleep(400);
    try {
      const response = await axios.get<Client[]>(`${API_BASE_URL}/clientes`);
      setClients(response.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchClientData = async (clientName: string) => {
    setLoading(true);
    const client = clients.find(c => c.client_name === clientName);
    if (!client) return;
    setAccountId(client.account_id);

    try {
      const hostsResponse = await axios.get<Host[]>(`${API_BASE_URL}/hosts/${clientName}`);
      const processedHosts = hostsResponse.data.map(h => ({
        ...h,
        vencimento: h.vencimento ? new Date(h.vencimento).toLocaleDateString('pt-BR') : '0/0/0'
      }));
      setHosts(processedHosts);

      const statsResponse = await axios.get<Stats[]>(`${API_BASE_URL}/stats/${client.account_id}`);
      const latestStats = statsResponse.data.reduce((max, item) => item.id > max.id ? item : max, statsResponse.data[0]);
      setStats(latestStats);
    } catch (err: any) { console.error(err.message); }
    finally { setLoading(false); }
  };

  const handleConfirmUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/certificates/expirations/${accountId}`);
      console.log("Datas atualizadas", response.data);
    } catch (err) { console.error(err); }
    finally { setIsUpdating(false); setOpenDialog(false); }
  };

  return (
    <div>
      {loading && (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {!loading && stats && (
        <>
          <TrafficStats stats={stats} />
          <HostsTable hosts={hosts} />
          <UpdateExpirationDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            onConfirm={handleConfirmUpdate}
            isUpdating={isUpdating}
          />
        </>
      )}
    </div>
  );
};

export default TrafficAnalisis;
