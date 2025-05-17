import axios from 'axios';

// Resolve CSR API base URL from environment variable
const baseURL =
  (typeof window === 'undefined'
    ? process.env.CSR_API_URL
    : (import.meta as any).env?.CSR_API_URL) || '';

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export interface QueryParams {
  query_text?: string;
  indication?: string;
  phase?: string;
  outcome?: string;
  min_sample_size?: number;
  limit?: number;
}

export async function queryCsrs(params: QueryParams) {
  const res = await client.get('/api/csrs/query', { params });
  return res.data;
}

export async function fastQueryCsrs(params: QueryParams) {
  const res = await client.get('/api/csrs/fast-query', { params });
  return res.data;
}

export async function getCsrById(id: string | number) {
  const res = await client.get(`/api/csrs/${id}`);
  return res.data;
}

export async function getCsrStats() {
  const res = await client.get('/api/csrs/stats');
  return res.data;
}

export interface ProtocolMatchRequest {
  title: string;
  indication: string;
  phase: string;
  primary_endpoints: string[];
  secondary_endpoints?: string[];
  arms?: string[];
  sample_size?: number;
}

export async function matchProtocol(data: ProtocolMatchRequest) {
  const res = await client.post('/api/match-protocol', data);
  return res.data;
}
