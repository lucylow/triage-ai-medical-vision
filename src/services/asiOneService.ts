import { toast } from "@/hooks/use-toast";

// ASI:One API Configuration
const ASI_API_URL = 'https://api.asi1.ai/v1/chat/completions';
const ASI_API_KEY = import.meta.env.VITE_ASI_API_KEY || '';

// ASI:One API Models
export interface ASIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ASIChatRequest {
  model: string;
  messages: ASIMessage[];
  temperature?: number;
  stream?: boolean;
  max_tokens?: number;
  context?: string;
}

export interface ASIChatResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
    stop_reason?: string;
  }>;
  created: number;
  conversation_id?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ASIStreamChunk {
  type: 'content' | 'thought' | 'init_thought' | 'done' | 'error';
  content?: string;
  thought?: string;
  error?: string;
}

// Enhanced ASI:One Service
export class ASIOneService {
  private static instance: ASIOneService;
  private isConnected: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): ASIOneService {
    if (!ASIOneService.instance) {
      ASIOneService.instance = new ASIOneService();
    }
    return ASIOneService.instance;
  }

  // Health Check and Connection Status
  public async checkHealth(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.isConnected;
    }

    try {
      const response = await fetch(`${ASI_API_URL.replace('/chat/completions', '/health')}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ASI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      this.isConnected = response.ok;
      this.lastHealthCheck = now;
      return this.isConnected;
    } catch (error) {
      console.error('ASI:One health check failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Main Chat Completion Method
  public async createChatCompletion(
    messages: ASIMessage[],
    options: {
      temperature?: number;
      stream?: boolean;
      max_tokens?: number;
      context?: string;
    } = {}
  ): Promise<ASIStreamChunk[]> {
    try {
      const request: ASIChatRequest = {
        model: 'asi1-mini',
        messages,
        temperature: options.temperature ?? 0.7,
        stream: options.stream ?? true,
        max_tokens: options.max_tokens ?? 0
      };

      const response = await fetch(ASI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${ASI_API_KEY}`,
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`ASI:One API error: ${response.status} ${response.statusText}`);
      }

      if (options.stream) {
        return this.handleStreamingResponse(response);
      } else {
        return this.handleNonStreamingResponse(response);
      }
    } catch (error) {
      console.error('ASI:One chat completion failed:', error);
      throw error;
    }
  }

  // Handle Streaming Response
  private async handleStreamingResponse(response: Response): Promise<ASIStreamChunk[]> {
    const chunks: ASIStreamChunk[] = [];
    
    try {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const chunk = this.parseStreamChunk(line);
            if (chunk) {
              chunks.push(chunk);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming response handling failed:', error);
      chunks.push({
        type: 'error',
        error: 'Failed to process streaming response'
      });
    }

    return chunks;
  }

  // Handle Non-Streaming Response
  private async handleNonStreamingResponse(response: Response): Promise<ASIStreamChunk[]> {
    try {
      const data: ASIChatResponse = await response.json();
      const content = data.choices[0]?.delta?.content || '';
      
      return [{
        type: 'content',
        content
      }];
    } catch (error) {
      console.error('Non-streaming response handling failed:', error);
      return [{
        type: 'error',
        error: 'Failed to process response'
      }];
    }
  }

  // Parse Stream Chunk
  private parseStreamChunk(line: string): ASIStreamChunk | null {
    try {
      const jsonStr = line.replace(/^data:\s*/, '').trim();
      
      if (jsonStr === '[DONE]') {
        return { type: 'done' };
      }

      const parsed: ASIChatResponse = JSON.parse(jsonStr);
      
      // Handle different chunk types
      if (parsed.choices?.[0]?.delta?.content) {
        return {
          type: 'content',
          content: parsed.choices[0].delta.content
        };
      }

      if (parsed.choices?.[0]?.delta?.role === 'assistant') {
        return { type: 'init_thought' };
      }

      // Handle thought chunks (ASI:One specific)
      if ('thought' in parsed) {
        return {
          type: 'thought',
          thought: parsed.thought
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to parse stream chunk:', error);
      return null;
    }
  }

  // Clinical Trial Specific Methods
  public async getTrialRecommendations(
    symptoms: string,
    location: string,
    medicalHistory: string = ''
  ): Promise<string> {
    const systemMessage: ASIMessage = {
      role: 'system',
      content: `You are a clinical trial matching specialist. Your role is to help patients find relevant clinical trials based on their symptoms, location, and medical history. Provide clear, helpful information and suggest specific types of trials to look for.`
    };

    const userMessage: ASIMessage = {
      role: 'user',
      content: `I'm looking for clinical trials. My symptoms are: ${symptoms}. I'm located in: ${location}. ${medicalHistory ? `My medical history includes: ${medicalHistory}` : ''}`
    };

    try {
      const chunks = await this.createChatCompletion([systemMessage, userMessage], {
        temperature: 0.3,
        stream: false
      });

      return chunks[0]?.content || 'Unable to generate trial recommendations at this time.';
    } catch (error) {
      console.error('Trial recommendations failed:', error);
      return 'I apologize, but I encountered an error while searching for trial recommendations. Please try again or contact support.';
    }
  }

  public async explainMedicalTerm(term: string): Promise<string> {
    const systemMessage: ASIMessage = {
      role: 'system',
      content: `You are a medical terminology expert. Explain medical terms in simple, easy-to-understand language that patients can comprehend. Use analogies when helpful and always prioritize clarity.`
    };

    const userMessage: ASIMessage = {
      role: 'user',
      content: `Can you explain what "${term}" means in simple terms?`
    };

    try {
      const chunks = await this.createChatCompletion([systemMessage, userMessage], {
        temperature: 0.2,
        stream: false
      });

      return chunks[0]?.content || 'Unable to explain this term at this time.';
    } catch (error) {
      console.error('Medical term explanation failed:', error);
      return 'I apologize, but I encountered an error while explaining this term. Please try again or consult with your healthcare provider.';
    }
  }

  public async checkEligibility(
    trialCriteria: string,
    patientProfile: string
  ): Promise<string> {
    const systemMessage: ASIMessage = {
      role: 'system',
      content: `You are a clinical trial eligibility specialist. Analyze whether a patient profile matches trial criteria and provide clear reasoning. Be honest about uncertainties and suggest what additional information might be needed.`
    };

    const userMessage: ASIMessage = {
      role: 'user',
      content: `Trial Criteria: ${trialCriteria}\n\nPatient Profile: ${patientProfile}\n\nBased on this information, what's your assessment of eligibility?`
    };

    try {
      const chunks = await this.createChatCompletion([systemMessage, userMessage], {
        temperature: 0.1,
        stream: false
      });

      return chunks[0]?.content || 'Unable to assess eligibility at this time.';
    } catch (error) {
      console.error('Eligibility check failed:', error);
      return 'I apologize, but I encountered an error while checking eligibility. Please try again or consult with the trial coordinator.';
    }
  }

  // Utility Methods
  public formatMessagesForAPI(messages: Array<{ role: string; content: string }>): ASIMessage[] {
    return messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));
  }

  public async validateAPIKey(): Promise<boolean> {
    if (!ASI_API_KEY) {
      toast({
        title: "API Key Missing",
        description: "ASI:One API key is not configured. Please add REACT_APP_ASI_API_KEY to your environment variables.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }

  // Rate Limiting and Error Handling
  public async handleRateLimit(): Promise<void> {
    toast({
      title: "Rate Limit Reached",
      description: "You've reached the API rate limit. Please wait a moment before trying again.",
      variant: "destructive",
    });
  }

  public async handleAPIError(error: any): Promise<void> {
    let message = 'An unexpected error occurred with the AI service.';
    
    if (error.message?.includes('401')) {
      message = 'Invalid API key. Please check your ASI:One configuration.';
    } else if (error.message?.includes('429')) {
      message = 'Rate limit exceeded. Please wait before trying again.';
    } else if (error.message?.includes('500')) {
      message = 'Server error. Please try again later.';
    }

    toast({
      title: "AI Service Error",
      description: message,
      variant: "destructive",
    });
  }
}

// Export singleton instance
export const asiOneService = ASIOneService.getInstance();
