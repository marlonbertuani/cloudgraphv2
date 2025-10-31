export interface Client {
  account_id: string;
  client_name: string;
  created_at: string;
}

export interface Host {
  name: string;
  total_requests: number;
  cache_hit: number;
  origin_fetch: number;
  acceleration_percentage: number | null;
  latency_improvement: number | null;
  vencimento: string;
}

export interface Stats {
  id: number;
  total_requests: number;
  bandwidth_used: number;
  unique_visits: number;
  page_views: number;
}
