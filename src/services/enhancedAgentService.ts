import { toast } from "@/hooks/use-toast";

// ASI1 Protocol Models
export interface SessionInit {
  version: string;
  agent_address: string;
  context?: string;
  message: string;
}

export interface SessionEnd {
  version: string;
  agent_address: string;
  session_id: string;
  reason?: string;
}

export interface ChatMessage {
  version: string;
  agent_address: string;
  session_id: string;
  message: string;
  context?: string;
}

export interface AgentError {
  version: string;
  agent_address: string;
  session_id?: string;
  error: string;
  details?: string;
}

export interface AgentSession {
  session_id: string;
  sender: string;
  context?: string;
  history: Array<{ role: 'user' | 'agent' | 'system'; content: string; timestamp: Date }>;
  status: 'active' | 'ended' | 'error';
  created_at: Date;
  last_activity: Date;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  session_id?: string;
}

export interface AgentCapabilities {
  name: string;
  description: string;
  version: string;
  features: string[];
  endpoints: string[];
}

// Enhanced Agent Service
export class EnhancedAgentService {
  private static instance: EnhancedAgentService;
  private activeSessions: Map<string, AgentSession> = new Map();
  private agentAddress: string;
  private version: string = "0.1";
  private isConnected: boolean = false;
  private fallbackMode: boolean = false;

  private constructor() {
    this.agentAddress = process.env.REACT_APP_AGENT_ADDRESS || 'agent1qg4zsqrdmyac8j6nc97nz99dxgauyaer2k8zw8mjcktnjrjh4jjkqfkj8tj';
  }

  public static getInstance(): EnhancedAgentService {
    if (!EnhancedAgentService.instance) {
      EnhancedAgentService.instance = new EnhancedAgentService();
    }
    return EnhancedAgentService.instance;
  }

  // Session Management
  private createSessionId(sender: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${sender.slice(0, 8)}_${timestamp}_${random}`;
  }

  private _endSessionInternal(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      session.last_activity = new Date();
      this.activeSessions.delete(sessionId);
      return true;
    }
    return false;
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 minutes

          for (const [sessionId, session] of this.activeSessions.entries()) {
        if (now.getTime() - session.last_activity.getTime() > maxAge) {
          this._endSessionInternal(sessionId);
        }
      }
  }

  // ASI1 Protocol Implementation
  public async initializeSession(message: string, context?: string): Promise<AgentResponse> {
    try {
      this.cleanupExpiredSessions();
      
      const sessionId = this.createSessionId('user');
      const session: AgentSession = {
        session_id: sessionId,
        sender: 'user',
        context,
        history: [
          { role: 'user', content: message, timestamp: new Date() }
        ],
        status: 'active',
        created_at: new Date(),
        last_activity: new Date()
      };

      this.activeSessions.set(sessionId, session);

      // Generate welcome response
      const welcomeMessage = await this.generateResponse(session.history, context);
      session.history.push({ role: 'agent', content: welcomeMessage, timestamp: new Date() });
      session.last_activity = new Date();

      return {
        success: true,
        session_id: sessionId,
        data: {
          message: welcomeMessage,
          session_id: sessionId,
          status: 'active'
        }
      };
    } catch (error) {
      console.error('Session initialization failed:', error);
      return {
        success: false,
        error: 'Failed to initialize session'
      };
    }
  }

  public async sendMessage(sessionId: string, message: string): Promise<AgentResponse> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || session.status !== 'active') {
        return {
          success: false,
          error: 'Invalid or expired session'
        };
      }

      // Add user message to history
      session.history.push({ role: 'user', content: message, timestamp: new Date() });
      session.last_activity = new Date();

      // Generate agent response
      const response = await this.generateResponse(session.history, session.context);
      session.history.push({ role: 'agent', content: response, timestamp: new Date() });
      session.last_activity = new Date();

      return {
        success: true,
        session_id: sessionId,
        data: {
          message: response,
          session_id: sessionId,
          history: session.history
        }
      };
    } catch (error) {
      console.error('Message processing failed:', error);
      return {
        success: false,
        error: 'Failed to process message'
      };
    }
  }

  public async endSession(sessionId: string, reason?: string): Promise<AgentResponse> {
    try {
      const success = this._endSessionInternal(sessionId);
      if (success) {
        return {
          success: true,
          session_id: sessionId,
          data: { reason: reason || 'Session ended by user' }
        };
      } else {
        return {
          success: false,
          error: 'Session not found or already ended'
        };
      }
    } catch (error) {
      console.error('Session termination failed:', error);
      return {
        success: false,
        error: 'Failed to terminate session'
      };
    }
  }

  // Enhanced Response Generation
  private async generateResponse(history: Array<{ role: string; content: string }>, context?: string): Promise<string> {
    try {
      const lastUserMessage = history[history.length - 1]?.content.toLowerCase() || '';
      
      // Enhanced response logic based on context and message content
      if (this.fallbackMode) {
        return this.generateFallbackResponse(lastUserMessage, context);
      }

      // Try Fetch.ai agent first
      const fetchResponse = await this.callFetchAgent(history, context);
      if (fetchResponse) {
        return fetchResponse;
      }

      // Fallback to Gemini or local logic
      this.fallbackMode = true;
      return this.generateFallbackResponse(lastUserMessage, context);
    } catch (error) {
      console.error('Response generation failed:', error);
      return this.generateFallbackResponse('', context);
    }
  }

  private async callFetchAgent(history: Array<{ role: string; content: string }>, context?: string): Promise<string | null> {
    try {
      // Simulate Fetch.ai agent call
      const response = await fetch('/api/fetch-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, context, agent_address: this.agentAddress })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      }
      return null;
    } catch (error) {
      console.error('Fetch.ai agent call failed:', error);
      return null;
    }
  }

  private generateFallbackResponse(message: string, context?: string): string {
    // Enhanced fallback responses
    const responses = {
      greeting: [
        "Hello! I'm your GreyGuard Trials AI assistant. I can help you find clinical trials, explain medical terms, and guide you through the matching process.",
        "Hi there! I'm here to help you navigate clinical trials. What would you like to know?",
        "Welcome to GreyGuard Trials! I'm your AI companion for finding the right clinical trials."
      ],
      trial_search: [
        "I can help you find relevant clinical trials. Please tell me about your condition, symptoms, or what you're looking for.",
        "Let me search for clinical trials that match your needs. What medical condition or symptoms are you experiencing?",
        "I'll help you discover clinical trials. Can you share more details about your health situation?"
      ],
      location: [
        "I can search for trials in your area. What's your location or preferred travel distance?",
        "Location is important for trial matching. Where are you located?",
        "Let me find trials near you. What's your city or region?"
      ],
      general: [
        "I'm here to help with clinical trial information. What specific questions do you have?",
        "I can assist with trial matching, eligibility criteria, and medical information. What do you need help with?",
        "I'm your clinical trial guide. How can I assist you today?"
      ]
    };

    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    }
    
    if (message.includes('trial') || message.includes('study') || message.includes('research')) {
      return responses.trial_search[Math.floor(Math.random() * responses.trial_search.length)];
    }
    
    if (message.includes('location') || message.includes('where') || message.includes('near')) {
      return responses.location[Math.floor(Math.random() * responses.location.length)];
    }

    return responses.general[Math.floor(Math.random() * responses.general.length)];
  }

  // Agent Status and Health
  public getAgentStatus(): { connected: boolean; fallbackMode: boolean; activeSessions: number } {
    return {
      connected: this.isConnected,
      fallbackMode: this.fallbackMode,
      activeSessions: this.activeSessions.size
    };
  }

  public getActiveSessions(): AgentSession[] {
    return Array.from(this.activeSessions.values());
  }

  public getSession(sessionId: string): AgentSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  // Connection Management
  public async testConnection(): Promise<boolean> {
    try {
      // Test Fetch.ai agent connection
      const response = await fetch('/api/fetch-agent/health');
      this.isConnected = response.ok;
      this.fallbackMode = !this.isConnected;
      return this.isConnected;
    } catch (error) {
      console.error('Connection test failed:', error);
      this.isConnected = false;
      this.fallbackMode = true;
      return false;
    }
  }

  // Advanced Features
  public async analyzeMessage(message: string): Promise<{
    intent: string;
    confidence: number;
    entities: string[];
    suggestedActions: string[];
  }> {
    // Simple intent analysis (enhance with proper NLP in production)
    const analysis = {
      intent: 'general_inquiry',
      confidence: 0.7,
      entities: [],
      suggestedActions: []
    };

    if (message.toLowerCase().includes('trial')) {
      analysis.intent = 'trial_search';
      analysis.confidence = 0.9;
      analysis.suggestedActions = ['search_trials', 'explain_criteria', 'check_eligibility'];
    } else if (message.toLowerCase().includes('location')) {
      analysis.intent = 'location_query';
      analysis.confidence = 0.8;
      analysis.suggestedActions = ['find_nearby_trials', 'check_travel_options'];
    }

    return analysis;
  }

  public async getAgentCapabilities(): Promise<AgentCapabilities> {
    return {
      name: "GreyGuard Trials AI Agent",
      description: "Advanced clinical trial matching and medical information assistant",
      version: this.version,
      features: [
        "Clinical trial search and matching",
        "Medical terminology explanation",
        "Eligibility assessment",
        "Location-based trial finding",
        "Session management",
        "Fallback response generation",
        "Intent analysis",
        "Multi-turn conversations"
      ],
      endpoints: [
        "/api/agent/session/init",
        "/api/agent/session/chat",
        "/api/agent/session/end",
        "/api/agent/status",
        "/api/agent/capabilities"
      ]
    };
  }
}

// Export singleton instance
export const enhancedAgentService = EnhancedAgentService.getInstance();
