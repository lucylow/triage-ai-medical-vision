import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ASIOneService } from '../asiOneService';

// Mock fetch globally
global.fetch = vi.fn();

describe('ASIOneService', () => {
  let asiService: ASIOneService;
  const mockApiKey = 'test-api-key-123';

  beforeEach(() => {
    asiService = new ASIOneService(mockApiKey);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('initializes with API key', () => {
      expect(asiService['apiKey']).toBe(mockApiKey);
      expect(asiService['baseUrl']).toBe('https://api.asi.one');
    });

    it('sets default headers', () => {
      expect(asiService['headers']).toEqual({
        'Authorization': `Bearer ${mockApiKey}`,
        'Content-Type': 'application/json',
      });
    });
  });

  describe('searchAgents', () => {
    it('searches agents successfully', async () => {
      const mockResponse = {
        agents: [
          {
            id: 'agent-1',
            name: 'Medical Trial Agent',
            description: 'Specialized in clinical trial matching',
            capabilities: ['trial_search', 'patient_matching']
          }
        ],
        total: 1
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      });

      const result = await asiService.searchAgents('medical trial');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.asi.one/agents/search?query=medical%20trial',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles search with filters', async () => {
      const mockResponse = { agents: [], total: 0 };
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      });

      await asiService.searchAgents('diabetes', {
        category: 'healthcare',
        capabilities: ['trial_matching']
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=healthcare'),
        expect.any(Object)
      );
    });

    it('handles API errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(asiService.searchAgents('test')).rejects.toThrow('API request failed: 401 Unauthorized');
    });

    it('handles network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(asiService.searchAgents('test')).rejects.toThrow('Network error');
    });
  });

  describe('getAgentDetails', () => {
    it('retrieves agent details successfully', async () => {
      const mockAgent = {
        id: 'agent-123',
        name: 'Test Agent',
        description: 'A test agent for clinical trials',
        capabilities: ['trial_search'],
        metadata: {
          version: '1.0.0',
          author: 'Test Author'
        }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAgent,
        status: 200
      });

      const result = await asiService.getAgentDetails('agent-123');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.asi.one/agents/agent-123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      );

      expect(result).toEqual(mockAgent);
    });

    it('handles agent not found', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(asiService.getAgentDetails('nonexistent')).rejects.toThrow('API request failed: 404 Not Found');
    });
  });

  describe('invokeAgent', () => {
    it('invokes agent successfully', async () => {
      const mockResponse = {
        result: 'Found 5 clinical trials for diabetes',
        metadata: {
          confidence: 0.95,
          processing_time: 1.2
        }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      });

      const result = await asiService.invokeAgent('agent-123', {
        query: 'Find diabetes trials',
        context: { patient_age: 45, location: 'Boston' }
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.asi.one/agents/agent-123/invoke',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify({
            query: 'Find diabetes trials',
            context: { patient_age: 45, location: 'Boston' }
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles invocation errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(asiService.invokeAgent('agent-123', { query: 'test' }))
        .rejects.toThrow('API request failed: 500 Internal Server Error');
    });
  });

  describe('listAgentCategories', () => {
    it('retrieves agent categories successfully', async () => {
      const mockCategories = [
        { id: 'healthcare', name: 'Healthcare', count: 150 },
        { id: 'finance', name: 'Finance', count: 89 },
        { id: 'education', name: 'Education', count: 67 }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
        status: 200
      });

      const result = await asiService.listAgentCategories();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.asi.one/agents/categories',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      );

      expect(result).toEqual(mockCategories);
    });
  });

  describe('getAgentCapabilities', () => {
    it('retrieves agent capabilities successfully', async () => {
      const mockCapabilities = [
        'trial_search',
        'patient_matching',
        'data_analysis',
        'report_generation'
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCapabilities,
        status: 200
      });

      const result = await asiService.getAgentCapabilities();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.asi.one/agents/capabilities',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      );

      expect(result).toEqual(mockCapabilities);
    });
  });

  describe('rateAgent', () => {
    it('rates agent successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Rating submitted successfully'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      });

      const result = await asiService.rateAgent('agent-123', {
        rating: 5,
        feedback: 'Excellent service, very helpful'
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.asi.one/agents/agent-123/rate',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify({
            rating: 5,
            feedback: 'Excellent service, very helpful'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('validates rating range', async () => {
      await expect(asiService.rateAgent('agent-123', { rating: 6, feedback: 'test' }))
        .rejects.toThrow('Rating must be between 1 and 5');

      await expect(asiService.rateAgent('agent-123', { rating: 0, feedback: 'test' }))
        .rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('getAgentAnalytics', () => {
    it('retrieves agent analytics successfully', async () => {
      const mockAnalytics = {
        total_invocations: 1250,
        success_rate: 0.94,
        average_response_time: 1.8,
        user_satisfaction: 4.6,
        popular_queries: [
          'diabetes trials',
          'cancer research',
          'patient matching'
        ]
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
        status: 200
      });

      const result = await asiService.getAgentAnalytics('agent-123', {
        timeframe: '30d',
        metrics: ['invocations', 'success_rate']
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('timeframe=30d'),
        expect.any(Object)
      );

      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('error handling', () => {
    it('handles malformed JSON responses', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') },
        status: 200
      });

      await expect(asiService.searchAgents('test')).rejects.toThrow('Invalid JSON');
    });

    it('handles timeout scenarios', async () => {
      (fetch as any).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(asiService.searchAgents('test')).rejects.toThrow('Request timeout');
    });

    it('retries failed requests with exponential backoff', async () => {
      const mockFetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ agents: [], total: 0 }),
          status: 200
        });

      (global as any).fetch = mockFetch;

      const result = await asiService.searchAgents('test', {}, { maxRetries: 3 });

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ agents: [], total: 0 });
    });
  });

  describe('utility methods', () => {
    it('builds query parameters correctly', () => {
      const params = {
        query: 'diabetes',
        category: 'healthcare',
        capabilities: ['trial_matching', 'data_analysis']
      };

      const queryString = asiService['buildQueryString'](params);
      
      expect(queryString).toContain('query=diabetes');
      expect(queryString).toContain('category=healthcare');
      expect(queryString).toContain('capabilities=trial_matching');
      expect(queryString).toContain('capabilities=data_analysis');
    });

    it('handles empty parameters', () => {
      const queryString = asiService['buildQueryString']({});
      expect(queryString).toBe('');
    });

    it('encodes special characters in query parameters', () => {
      const params = {
        query: 'diabetes & heart disease',
        location: 'New York, NY'
      };

      const queryString = asiService['buildQueryString'](params);
      
      expect(queryString).toContain('query=diabetes%20%26%20heart%20disease');
      expect(queryString).toContain('location=New%20York%2C%20NY');
    });
  });
});
