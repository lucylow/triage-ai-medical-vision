// Image Analysis Agent Service
// Integrates with ASI protocol and provides AI-powered image analysis using Claude 3.5

export interface ImageAnalysisRequest {
  imageUrl?: string;
  imageFile?: File;
  prompt?: string;
  context?: string;
  analysisType?: 'general' | 'medical' | 'technical' | 'creative' | 'detailed';
  maxTokens?: number;
}

export interface ImageAnalysisResponse {
  analysisId: string;
  analysis: string;
  confidence: number;
  detectedObjects: string[];
  detectedText?: string;
  metadata: {
    model: string;
    timestamp: string;
    analysisType: string;
    imageSize?: { width: number; height: number };
    processingTime: number;
  };
  suggestions: string[];
}

export interface ImageAnalysisError {
  error: string;
  details: string;
  code: string;
}

export interface AnalysisHistory {
  id: string;
  imageUrl?: string;
  prompt?: string;
  analysis: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'processing';
  metadata: ImageAnalysisResponse['metadata'];
}

export interface AnalysisCapabilities {
  supportedFormats: string[];
  maxFileSize: string;
  analysisTypes: string[];
  objectDetection: boolean;
  textExtraction: boolean;
  medicalAnalysis: boolean;
  technicalAnalysis: boolean;
}

export class ImageAnalysisAgent {
  private static instance: ImageAnalysisAgent;
  private readonly API_BASE_URL = import.meta.env.VITE_ANTHROPIC_API_URL || 'https://api.anthropic.com/v1';
  private readonly API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
  private readonly AGENT_NAME = 'GreyGuard_Image_Analyzer';
  private readonly ASI_VERSION = '0.1';
  private readonly DEFAULT_MODEL = 'claude-3-5-sonnet-20240620';
  private readonly MAX_TOKENS = 4096;
  
  private analysisHistory: Map<string, AnalysisHistory> = new Map();
  private isProcessing: boolean = false;
  private rateLimitCount: number = 0;
  private rateLimitReset: number = Date.now() + 60000; // 1 minute window

  private constructor() {
    this.loadHistoryFromStorage();
  }

  public static getInstance(): ImageAnalysisAgent {
    if (!ImageAnalysisAgent.instance) {
      ImageAnalysisAgent.instance = new ImageAnalysisAgent();
    }
    return ImageAnalysisAgent.instance;
  }

  // ASI Protocol Integration
  public async handleASIAnalysisRequest(
    sessionId: string,
    imageUrl: string,
    prompt?: string,
    context?: string
  ): Promise<ImageAnalysisResponse | ImageAnalysisError> {
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

      // Analyze image
      const response = await this.analyzeImage({
        imageUrl,
        prompt,
        context,
        analysisType: 'detailed'
      });

      // Store in history
      this.addToHistory(response);

      return response;

    } catch (error) {
      console.error('ASI image analysis error:', error);
      return {
        error: 'Image analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'ANALYSIS_ERROR'
      };
    }
  }

  // Core Image Analysis
  public async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    if (!this.API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    if (!request.imageUrl && !request.imageFile) {
      throw new Error('Image URL or file is required');
    }

    try {
      this.isProcessing = true;
      this.rateLimitCount++;

      const startTime = Date.now();
      
      // Prepare content for Claude
      const content = await this.prepareContent(request);
      
      // Get system prompt based on analysis type
      const systemPrompt = this.getSystemPrompt(request.analysisType || 'general');
      
      // Analyze using Claude API
      const response = await fetch(`${this.API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.DEFAULT_MODEL,
          max_tokens: request.maxTokens || this.MAX_TOKENS,
          messages: [
            {
              role: 'user',
              content: content
            }
          ],
          system: systemPrompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.content[0]?.text || 'No analysis generated';

      // Extract detected objects and text
      const detectedObjects = this.extractDetectedObjects(analysisText);
      const detectedText = this.extractDetectedText(analysisText);
      const suggestions = this.generateSuggestions(request.analysisType || 'general', detectedObjects);

      const processingTime = Date.now() - startTime;

      // Create response object
      const analysisResponse: ImageAnalysisResponse = {
        analysisId: this.generateAnalysisId(),
        analysis: analysisText,
        confidence: this.calculateConfidence(analysisText),
        detectedObjects,
        detectedText,
        metadata: {
          model: this.DEFAULT_MODEL,
          timestamp: new Date().toISOString(),
          analysisType: request.analysisType || 'general',
          processingTime
        },
        suggestions
      };

      return analysisResponse;

    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Content Preparation
  private async prepareContent(request: ImageAnalysisRequest): Promise<any[]> {
    const content: any[] = [];

    // Add text prompt if provided
    if (request.prompt) {
      content.push({
        type: 'text',
        text: request.prompt
      });
    }

    // Add image content
    if (request.imageFile) {
      const base64Image = await this.fileToBase64(request.imageFile);
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: request.imageFile.type,
          data: base64Image
        }
      });
    } else if (request.imageUrl) {
      content.push({
        type: 'image',
        source: {
          type: 'url',
          url: request.imageUrl
        }
      });
    }

    // Add context if provided
    if (request.context) {
      content.push({
        type: 'text',
        text: `Context: ${request.context}`
      });
    }

    return content;
  }

  // System Prompt Generation
  private getSystemPrompt(analysisType: string): string {
    const basePrompt = "You are a professional image analyst. Provide detailed, accurate descriptions and answer questions about images.";

    const typeSpecificPrompts: Record<string, string> = {
      'medical': `${basePrompt} Focus on medical aspects, symptoms, anatomical features, and potential medical conditions. Be precise and use medical terminology when appropriate.`,
      'technical': `${basePrompt} Focus on technical details, specifications, measurements, and technical analysis. Provide precise technical observations.`,
      'creative': `${basePrompt} Focus on artistic elements, composition, style, mood, and creative interpretation. Be imaginative and expressive.`,
      'detailed': `${basePrompt} Provide comprehensive analysis covering all visible elements, details, and aspects of the image. Be thorough and systematic.`,
      'general': basePrompt
    };

    return typeSpecificPrompts[analysisType] || basePrompt;
  }

  // File Processing
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Analysis Processing
  private extractDetectedObjects(analysis: string): string[] {
    // Simple extraction - in production, use more sophisticated NLP
    const objects: string[] = [];
    const commonObjects = [
      'person', 'people', 'car', 'building', 'tree', 'animal', 'furniture',
      'food', 'clothing', 'technology', 'nature', 'architecture', 'vehicle'
    ];

    commonObjects.forEach(obj => {
      if (analysis.toLowerCase().includes(obj)) {
        objects.push(obj);
      }
    });

    return objects;
  }

  private extractDetectedText(analysis: string): string | undefined {
    // Look for quoted text which might indicate detected text
    const textMatches = analysis.match(/"([^"]+)"/g);
    if (textMatches && textMatches.length > 0) {
      return textMatches.map(match => match.replace(/"/g, '')).join(', ');
    }
    return undefined;
  }

  private calculateConfidence(analysis: string): number {
    // Simple confidence calculation based on analysis length and detail
    const baseConfidence = 0.7;
    const lengthBonus = Math.min(analysis.length / 1000, 0.2);
    const detailBonus = analysis.includes('detailed') || analysis.includes('specific') ? 0.1 : 0;
    
    return Math.min(baseConfidence + lengthBonus + detailBonus, 0.95);
  }

  private generateSuggestions(analysisType: string, detectedObjects: string[]): string[] {
    const suggestions: string[] = [];

    if (analysisType === 'medical') {
      suggestions.push('Consider consulting a healthcare professional for medical concerns');
      suggestions.push('Request additional medical imaging if needed');
    }

    if (detectedObjects.includes('person')) {
      suggestions.push('Consider privacy implications of person detection');
    }

    if (detectedObjects.includes('text')) {
      suggestions.push('Verify extracted text accuracy');
    }

    suggestions.push('Use analysis results for informed decision-making');
    suggestions.push('Consider context when interpreting results');

    return suggestions;
  }

  // Content Moderation
  public async moderateContent(imageUrl: string): Promise<boolean> {
    if (!this.API_KEY) {
      return true; // Skip moderation if no API key
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.DEFAULT_MODEL,
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Is this image appropriate and safe for analysis? Respond with only "yes" or "no".'
                },
                {
                  type: 'image',
                  source: {
                    type: 'url',
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          system: 'You are a content safety checker. Determine if an image is appropriate for analysis.'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.content[0]?.text?.toLowerCase() || '';
        return responseText.includes('yes');
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

    // Allow 20 requests per minute (Claude has higher limits)
    const maxRequests = 20;
    return this.rateLimitCount <= maxRequests;
  }

  // History Management
  private addToHistory(response: ImageAnalysisResponse): void {
    const historyItem: AnalysisHistory = {
      id: response.analysisId,
      prompt: response.metadata.analysisType,
      analysis: response.analysis,
      timestamp: response.metadata.timestamp,
      status: 'completed',
      metadata: response.metadata
    };

    this.analysisHistory.set(response.analysisId, historyItem);
    this.saveHistoryToStorage();
  }

  public getAnalysisHistory(): AnalysisHistory[] {
    return Array.from(this.analysisHistory.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getAnalysisById(id: string): AnalysisHistory | undefined {
    return this.analysisHistory.get(id);
  }

  public clearHistory(): void {
    this.analysisHistory.clear();
    this.saveHistoryToStorage();
  }

  // Storage Management
  private saveHistoryToStorage(): void {
    try {
      const historyData = Array.from(this.analysisHistory.values());
      localStorage.setItem('imageAnalysisHistory', JSON.stringify(historyData));
    } catch (error) {
      console.warn('Failed to save history to storage:', error);
    }
  }

  private loadHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem('imageAnalysisHistory');
      if (stored) {
        const historyData: AnalysisHistory[] = JSON.parse(stored);
        historyData.forEach(item => {
          this.analysisHistory.set(item.id, item);
        });
      }
    } catch (error) {
      console.warn('Failed to load history from storage:', error);
    }
  }

  // Utility Methods
  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getCapabilities(): AnalysisCapabilities {
    return {
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxFileSize: '10MB',
      analysisTypes: ['general', 'medical', 'technical', 'creative', 'detailed'],
      objectDetection: true,
      textExtraction: true,
      medicalAnalysis: true,
      technicalAnalysis: true
    };
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
        'Claude 3.5 Sonnet Integration',
        'ASI Protocol Compliance',
        'Multi-Format Support',
        'Content Moderation',
        'Object Detection',
        'Text Extraction',
        'Medical Analysis',
        'Technical Analysis',
        'Creative Interpretation'
      ],
      status: this.API_KEY ? 'online' : 'offline',
      rateLimit: {
        current: this.rateLimitCount,
        max: 20,
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
      rateLimitRemaining: Math.max(0, 20 - this.rateLimitCount)
    };
  }

  // Batch Analysis (for future use)
  public async analyzeMultipleImages(
    images: Array<{ url: string; prompt?: string }>,
    options: Partial<ImageAnalysisRequest> = {}
  ): Promise<ImageAnalysisResponse[]> {
    const results: ImageAnalysisResponse[] = [];
    
    for (const image of images) {
      try {
        const result = await this.analyzeImage({
          imageUrl: image.url,
          prompt: image.prompt,
          ...options
        });
        results.push(result);
        
        // Add delay between requests to respect rate limits
        if (images.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to analyze image: ${image.url}`, error);
      }
    }
    
    return results;
  }

  // Medical Analysis Enhancement
  public async performMedicalAnalysis(
    imageUrl: string,
    symptoms?: string,
    medicalHistory?: string
  ): Promise<ImageAnalysisResponse> {
    const medicalPrompt = `Please perform a detailed medical analysis of this image. ${
      symptoms ? `Patient reports: ${symptoms}` : ''
    } ${
      medicalHistory ? `Medical history: ${medicalHistory}` : ''
    } Focus on identifying any visible medical conditions, anatomical features, or concerning findings.`;

    return this.analyzeImage({
      imageUrl,
      prompt: medicalPrompt,
      analysisType: 'medical',
      maxTokens: 2048
    });
  }

  // Technical Analysis Enhancement
  public async performTechnicalAnalysis(
    imageUrl: string,
    technicalContext?: string
  ): Promise<ImageAnalysisResponse> {
    const technicalPrompt = `Please perform a detailed technical analysis of this image. ${
      technicalContext ? `Context: ${technicalContext}` : ''
    } Focus on technical specifications, measurements, materials, and technical details.`;

    return this.analyzeImage({
      imageUrl,
      prompt: technicalPrompt,
      analysisType: 'technical',
      maxTokens: 2048
    });
  }
}

export default ImageAnalysisAgent;
