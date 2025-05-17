import { protocolOptimizerService } from '../protocol-optimizer-service';
import * as csrClient from '../csr-api-client';

jest.mock('../csr-api-client');

const mockMatch = csrClient as jest.Mocked<typeof csrClient>;

describe('ProtocolOptimizerService - CSR integration', () => {
  beforeEach(() => {
    mockMatch.matchProtocol.mockResolvedValue([
      { title: 'Study A', outcome: 'Positive response' },
      { title: 'Study B', outcome: 'Neutral outcome' }
    ] as any);
  });

  test('includes CSR evidence in optimization recommendations', async () => {
    const result = await protocolOptimizerService.optimizeProtocol({
      phase: 'Phase I',
      indication: 'Oncology',
      sponsor: 'Test',
      sample_size: 30,
      duration_weeks: 8,
      primary_endpoint: 'Overall Survival'
    } as any);

    expect(mockMatch.matchProtocol).toHaveBeenCalled();
    const evidenceStr = 'Study A';
    expect(result.recommendations.some(r => r.reason.includes(evidenceStr))).toBe(true);
  });
});
