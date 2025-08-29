// Image Generation Agent Service
// Integrates with ASI protocol and provides DALL-E 3 image generation

export interface ImageGenerationRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
  context?: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  assetId: string;
  assetUri: string;
  prompt: string;
  metadata: {
    size: string;
    quality: string;
    style: string;
    model: string;
    timestamp: string;
  };
}

export interface ImageGenerationError {
  error: string;
  details: string;
  code: string;
}

export interface GenerationHistory {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'processing';
  metadata: ImageGenerationResponse['metadata'];
}

export class ImageGenerationAgent {
  private static instance: ImageGenerationAgent;
  private readonly API_BASE_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1';
  private readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  private readonly AGENT_NAME = 'GreyGuard_Image_Generator';
  private readonly ASI_VERSION = '0.1';
  
  private generationHistory: Map<string, GenerationHistory> = new Map();
  private isProcessing: boolean = false;
  private rateLimitCount: number = 0;
  private rateLimitReset: number = Date.now() + 60000; // 1 minute window

  private constructor() {
    this.loadHistoryFromStorage();
  }

  public static getInstance(): ImageGenerationAgent {
    if (!ImageGenerationAgent.instance) {
      ImageGenerationAgent.instance = new ImageGenerationAgent();
    }
    return ImageGenerationAgent.instance;
  }

  // ASI Protocol Integration
  public async handleASIImageRequest(
    sessionId: string,
    prompt: string,
    context?: string
  ): Promise<ImageGenerationResponse | ImageGenerationError> {
    try {
      // Validate ASI session
      if (!sessionId) {
        return {
          error: 'Invalid session ID',
          details: 'Session ID is required for ASI protocol compliance',
          code: 'ASI_SESSION_ERROR'
        };
      }

      // Check rate limiting
      if (!this.checkRateLimit()) {
        return {
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please wait before making another request.',
          code: 'RATE_LIMIT_EXCEEDED'
        };
      }

      // Generate image
      const response = await this.generateImage({
        prompt,
        context,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid'
      });

      // Store in history
      this.addToHistory(response);

      return response;

    } catch (error) {
      console.error('ASI image generation error:', error);
      return {
        error: 'Image generation failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'GENERATION_ERROR'
      };
    }
  }

  // Core Image Generation
  public async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (!this.API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    if (!request.prompt.trim()) {
      throw new Error('Image prompt is required');
    }

    try {
      this.isProcessing = true;
      this.rateLimitCount++;

      // Optimize prompt for better results
      const optimizedPrompt = await this.optimizePrompt(request.prompt);
      
      // Generate image using OpenAI API
      const response = await fetch(`${this.API_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: optimizedPrompt,
          size: request.size || '1024x1024',
          quality: request.quality || 'hd',
          style: request.style || 'vivid',
          n: Math.min(request.n || 1, 1) // DALL-E 3 supports only 1 image
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const imageData = data.data[0];

      // Create response object
      const imageResponse: ImageGenerationResponse = {
        imageUrl: imageData.url,
        assetId: this.generateAssetId(),
        assetUri: `asset://${this.generateAssetId()}`,
        prompt: request.prompt,
        metadata: {
          size: request.size || '1024x1024',
          quality: request.quality || 'hd',
          style: request.style || 'vivid',
          model: 'dall-e-3',
          timestamp: new Date().toISOString()
        }
      };

      return imageResponse;

    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Prompt Optimization
  private async optimizePrompt(prompt: string): Promise<string> {
    if (!this.API_KEY) {
      return prompt; // Return original if no API key
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a DALL-E prompt optimization expert. Improve the given prompt to generate better images. Focus on clarity, detail, and artistic quality. Return only the optimized prompt, nothing else.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content?.trim() || prompt;
      }
    } catch (error) {
      console.warn('Prompt optimization failed, using original:', error);
    }

    return prompt;
  }

  // Content Moderation
  public async moderateContent(prompt: string): Promise<boolean> {
    if (!this.API_KEY) {
      return true; // Skip moderation if no API key
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/moderations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: prompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        return !data.results[0]?.flagged;
      }
    } catch (error) {
      console.warn('Content moderation failed:', error);
    }

    return true; // Allow if moderation fails
  }

  // Rate Limiting
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now > this.rateLimitReset) {
      this.rateLimitCount = 0;
      this.rateLimitReset = now + 60000; // 1 minute window
    }

    // Allow 10 requests per minute
    const maxRequests = 10;
    return this.rateLimitCount <= maxRequests;
  }

  // History Management
  private addToHistory(response: ImageGenerationResponse): void {
    const historyItem: GenerationHistory = {
      id: response.assetId,
      prompt: response.prompt,
      imageUrl: response.imageUrl,
      timestamp: response.metadata.timestamp,
      status: 'completed',
      metadata: response.metadata
    };

    this.generationHistory.set(response.assetId, historyItem);
    this.saveHistoryToStorage();
  }

  public getGenerationHistory(): GenerationHistory[] {
    return Array.from(this.generationHistory.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getGenerationById(id: string): GenerationHistory | undefined {
    return this.generationHistory.get(id);
  }

  public clearHistory(): void {
    this.generationHistory.clear();
    this.saveHistoryToStorage();
  }

  // Storage Management
  private saveHistoryToStorage(): void {
    try {
      const historyData = Array.from(this.generationHistory.values());
      localStorage.setItem('imageGenerationHistory', JSON.stringify(historyData));
    } catch (error) {
      console.warn('Failed to save history to storage:', error);
    }
  }

  private loadHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem('imageGenerationHistory');
      if (stored) {
        const historyData: GenerationHistory[] = JSON.parse(stored);
        historyData.forEach(item => {
          this.generationHistory.set(item.id, item);
        });
      }
    } catch (error) {
      console.warn('Failed to load history from storage:', error);
    }
  }

  // Utility Methods
  private generateAssetId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getAgentInfo(): {
    name: string;
    version: string;
    capabilities: string[];
    status: 'online' | 'offline';
    rateLimit: { current: number; max: number; resetTime: number };
  } {
    return {
      name: this.AGENT_NAME,
      version: this.ASI_VERSION,
      capabilities: [
        'DALL-E 3 Integration',
        'ASI Protocol Compliance',
        'Prompt Optimization',
        'Content Moderation',
        'High-Quality Generation',
        'Multiple Size Support',
        'Style Customization'
      ],
      status: this.API_KEY ? 'online' : 'offline',
      rateLimit: {
        current: this.rateLimitCount,
        max: 10,
        resetTime: this.rateLimitReset
      }
    };
  }

  public getStatus(): {
    isProcessing: boolean;
    hasApiKey: boolean;
    rateLimitRemaining: number;
  } {
    return {
      isProcessing: this.isProcessing,
      hasApiKey: !!this.API_KEY,
      rateLimitRemaining: Math.max(0, 10 - this.rateLimitCount)
    };
  }

  // Batch Generation (for future use)
  public async generateMultipleImages(
    prompts: string[],
    options: Partial<ImageGenerationRequest> = {}
  ): Promise<ImageGenerationResponse[]> {
    const results: ImageGenerationResponse[] = [];
    
    for (const prompt of prompts) {
      try {
        const result = await this.generateImage({ prompt, ...options });
        results.push(result);
        
        // Add delay between requests to respect rate limits
        if (prompts.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to generate image for prompt: ${prompt}`, error);
      }
    }
    
    return results;
  }

  // Image Editing (for future use)
  public async editImage(
    imageFile: File,
    prompt: string,
    maskFile?: File
  ): Promise<ImageGenerationResponse> {
    if (!this.API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('prompt', prompt);
      if (maskFile) {
        formData.append('mask', maskFile);
      }
      formData.append('n', '1');
      formData.append('size', '1024x1024');

      const response = await fetch(`${this.API_BASE_URL}/images/edits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const imageData = data.data[0];

      return {
        imageUrl: imageData.url,
        assetId: this.generateAssetId(),
        assetUri: `asset://${this.generateAssetId()}`,
        prompt: prompt,
        metadata: {
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid',
          model: 'dall-e-2',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Image editing error:', error);
      throw error;
    }
  }
}

export default ImageGenerationAgent;
