export interface CSRMatchParams {
  indication: string;
  phase: string;
  endpoints?: string[];
}

export interface CSRRecord {
  title: string;
  phase?: string;
  indication?: string;
  outcome?: string;
  [key: string]: any;
}

/**
 * Call the external CSR API to find similar CSRs for a protocol
 */
export async function matchProtocol(params: CSRMatchParams): Promise<CSRRecord[]> {
  const baseUrl = process.env.CSR_API_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${baseUrl}/api/match-protocol`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Protocol',
        indication: params.indication,
        phase: params.phase,
        primary_endpoints: params.endpoints || []
      })
    });

    if (!res.ok) {
      throw new Error(`CSR API error: ${res.status}`);
    }

    const data = await res.json();
    return data.similar_csrs || [];
  } catch (err) {
    console.error('CSR API request failed:', err);
    return [];
  }
}
