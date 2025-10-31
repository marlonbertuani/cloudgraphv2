import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../Core/config";

interface Client {
  account_id: string;
  client_name: string;
  created_at: string;
}

interface ClientSelectorProps {
  onSelect?: (client: string) => void;
}

export default function ClientSelector({ onSelect }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/initializing`);
        const uniqueClients = data.clients.filter(
          (c: Client, i: number, self: Client[]) =>
            i === self.findIndex((x) => x.account_id === c.account_id)
        );
        setClients(uniqueClients);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClient(value);
    onSelect?.(value);
  };

  return (
    <div className="w-full">
      <select
        value={selectedClient}
        onChange={handleChange}
        disabled={loading}
        className="px-3 py-2 rounded-lg bg-white shadow w-full text-sm"
      >
        <option value="">Selecione um cliente...</option>
        {clients
          .sort((a, b) => a.client_name.localeCompare(b.client_name))
          .map((client) => (
            <option key={client.account_id} value={client.client_name}>
              {client.client_name}
            </option>
          ))}
      </select>
    </div>
  );
}
