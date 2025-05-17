import axios from 'axios';
import * as svc from '../msCopilotService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const globalAny: any = global;

beforeAll(() => {
  globalAny.localStorage = {
    getItem: jest.fn(() => 'abc123'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
});

describe('msCopilotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializeCopilot posts to init endpoint', async () => {
    mockedAxios.post.mockResolvedValue({ data: { sessionId: 's1' } });

    const result = await svc.initializeCopilot('doc1');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/microsoft-office/copilot/init',
      { documentId: 'doc1' },
      { headers: { Authorization: 'Bearer abc123' } }
    );
    expect(result).toEqual({ sessionId: 's1' });
  });

  test('generateContent posts to generate endpoint', async () => {
    mockedAxios.post.mockResolvedValue({ data: { content: 'text' } });

    const result = await svc.generateContent('hello', 'sid1');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/microsoft-office/copilot/generate',
      { prompt: 'hello', sessionId: 'sid1' },
      { headers: { Authorization: 'Bearer abc123' } }
    );
    expect(result).toEqual({ content: 'text' });
  });

  test('analyzeDocument posts to analyze endpoint', async () => {
    mockedAxios.post.mockResolvedValue({ data: { readability: { score: 90 } } });

    const result = await svc.analyzeDocument('doc1', 'sid1');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/microsoft-office/copilot/analyze',
      { documentId: 'doc1', sessionId: 'sid1' },
      { headers: { Authorization: 'Bearer abc123' } }
    );
    expect(result).toEqual({ readability: { score: 90 } });
  });

  test('endCopilotSession posts to end endpoint', async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });

    const result = await svc.endCopilotSession('sid1');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/microsoft-office/copilot/end',
      { sessionId: 'sid1' },
      { headers: { Authorization: 'Bearer abc123' } }
    );
    expect(result).toBe(true);
  });
});
