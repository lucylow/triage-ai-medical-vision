// ASI1 LLM Compatible uAgent Service
// Implements the Agent Standards Interface protocol for GreyGuard AI Agent

export interface ASISession {
  sessionId: string;
  sender: string;
  context?: string;
  history: Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: string;
    intent?: string;
    entities?: string[];
  }>;
  lastActivity: string;
  status: 'active' | 'ended' | 'expired';
}

export interface ASIMessage {
  version: string;
  agentAddress: string;
  sessionId?: string;
  message?: string;
  context?: string;
  error?: string;
  details?: string;
}

export interface SessionInit extends ASIMessage {
  message: string;
}

export interface ChatMessage extends ASIMessage {
  sessionId: string;
  message: string;
}

export interface SessionEnd extends ASIMessage {
  sessionId: string;
  reason?: string;
}

export interface ErrorMessage extends ASIMessage {
  error: string;
  details?: string;
}

export interface LLMResponse {
  content: string;
  intent: string;
  confidence: number;
  entities: string[];
  suggestedActions: string[];
  context?: string;
}

export class ASIAgent {
  private static instance: ASIAgent;
  private activeSessions: Map<string, ASISession> = new Map();
  private readonly ASI_VERSION = "0.1";
  private readonly AGENT_NAME = "GreyGuard_ASI_Agent";
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_HISTORY = 50; // Maximum messages per session

  private constructor() {
    this.startSessionCleanup();
  }

  public static getInstance(): ASIAgent {
    if (!ASIAgent.instance) {
      ASIAgent.instance = new ASIAgent();
    }
    return ASIAgent.instance;
  }

  // Session Management
  private initializeSession(sender: string, context?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ASISession = {
      sessionId,
      sender,
      context,
      history: [],
      lastActivity: new Date().toISOString(),
      status: 'active'
    };

    this.activeSessions.set(sessionId, session);
    console.log(`🔄 New ASI session created: ${sessionId} for ${sender}`);
    
    return sessionId;
  }

  private endSession(sessionId: string, reason?: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      session.history.push({
        role: 'agent',
        content: `Session ended${reason ? `: ${reason}` : ''}`,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🔚 ASI session ended: ${sessionId}${reason ? ` - ${reason}` : ''}`);
      return true;
    }
    return false;
  }

  private updateSessionActivity(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date().getTime();
    const expired: string[] = [];

    this.activeSessions.forEach((session, sessionId) => {
      const lastActivity = new Date(session.lastActivity).getTime();
      if (now - lastActivity > this.SESSION_TIMEOUT) {
        expired.push(sessionId);
      }
    });

    expired.forEach(sessionId => {
      this.endSession(sessionId, 'Session expired due to inactivity');
      this.activeSessions.delete(sessionId);
    });

    if (expired.length > 0) {
      console.log(`🧹 Cleaned up ${expired.length} expired ASI sessions`);
    }
  }

  private startSessionCleanup(): void {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  // ASI Protocol Handlers
  public async handleSessionInit(sender: string, message: SessionInit): Promise<ChatMessage | ErrorMessage> {
    try {
      // Verify ASI version compatibility
      if (message.version !== this.ASI_VERSION) {
        return {
          version: this.ASI_VERSION,
          agentAddress: this.AGENT_NAME,
          error: "Version mismatch",
          details: `Agent requires ASI ${this.ASI_VERSION}, received ${message.version}`
        };
      }

      // Initialize new session
      const sessionId = this.initializeSession(sender, message.context);
      
      // Generate welcome message using NLP
      const welcomeResponse = await this.generateWelcomeResponse(message.message, message.context);
      
      // Store initial interaction
      const session = this.activeSessions.get(sessionId)!;
      session.history.push(
        { role: 'user', content: message.message, timestamp: new Date().toISOString() },
        { 
          role: 'agent', 
          content: welcomeResponse.content, 
          timestamp: new Date().toISOString(),
          intent: welcomeResponse.intent,
          entities: welcomeResponse.entities
        }
      );

      return {
        version: this.ASI_VERSION,
        agentAddress: this.AGENT_NAME,
        sessionId,
        message: welcomeResponse.content,
        context: welcomeResponse.context
      };

    } catch (error) {
      console.error('Session initialization error:', error);
      return {
        version: this.ASI_VERSION,
        agentAddress: this.AGENT_NAME,
        error: "Session initialization failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async handleChatMessage(sender: string, message: ChatMessage): Promise<ChatMessage | ErrorMessage> {
    try {
      // Validate session
      const session = this.activeSessions.get(message.sessionId);
      if (!session || session.status !== 'active') {
        return {
          version: this.ASI_VERSION,
          agentAddress: this.AGENT_NAME,
          sessionId: message.sessionId,
          error: "Invalid session ID",
          details: "Session not found or has ended"
        };
      }

      // Update session activity
      this.updateSessionActivity(message.sessionId);

      // Add user message to history
      session.history.push({
        role: 'user',
        content: message.message,
        timestamp: new Date().toISOString()
      });

      // Generate response using NLP and LLM
      const response = await this.generateLLMResponse(session.history, message.context);
      
      // Add agent response to history
      session.history.push({
        role: 'agent',
        content: response.content,
        timestamp: new Date().toISOString(),
        intent: response.intent,
        entities: response.entities
      });

      // Limit history size
      if (session.history.length > this.MAX_HISTORY) {
        session.history = session.history.slice(-this.MAX_HISTORY);
      }

      return {
        version: this.ASI_VERSION,
        agentAddress: this.AGENT_NAME,
        sessionId: message.sessionId,
        message: response.content,
        context: response.context
      };

    } catch (error) {
      console.error('Chat message processing error:', error);
      return {
        version: this.ASI_VERSION,
        agentAddress: this.AGENT_NAME,
        sessionId: message.sessionId,
        error: "Message processing failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async handleSessionEnd(sender: string, message: SessionEnd): Promise<SessionEnd | ErrorMessage> {
    try {
      const session = this.activeSessions.get(message.sessionId);
      if (session) {
        // Generate session summary
        const summary = await this.generateSessionSummary(session);
        
        // End session
        this.endSession(message.sessionId, message.reason);
        
        // Clean up
        this.activeSessions.delete(message.sessionId);
        
        console.log(`📊 Session ${message.sessionId} ended. Summary: ${summary}`);
        
        return {
          version: this.ASI_VERSION,
          agentAddress: this.AGENT_NAME,
          sessionId: message.sessionId,
          reason: `Session ended successfully. ${summary}`
        };
      } else {
        return {
          version: this.ASI_VERSION,
          agentAddress: this.AGENT_NAME,
          sessionId: message.sessionId,
          error: "Invalid session ID",
          details: "Session not found"
        };
      }
    } catch (error) {
      console.error('Session end error:', error);
      return {
        version: this.ASI_VERSION,
        agentAddress: this.AGENT_NAME,
        sessionId: message.sessionId,
        error: "Session termination failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // LLM Integration
  private async generateWelcomeResponse(userMessage: string, context?: string): Promise<LLMResponse> {
    // Use the existing NLP service for intent classification
    const { NLPService } = await import('./nlpService');
    const nlpService = NLPService.getInstance();
    
    const intent = nlpService.classifyIntent(userMessage);
    
    let welcomeMessage = `Hello! I'm your GreyGuard AI agent with ASI protocol support. I can help you with:\n\n`;
    welcomeMessage += `• **Clinical Trial Matching** - Find trials using natural language\n`;
    welcomeMessage += `• **Health Profile Management** - Secure, encrypted data handling\n`;
    welcomeMessage += `• **Consent Control** - Manage trial participation permissions\n`;
    welcomeMessage += `• **Privacy & Security** - Learn about our protection measures\n\n`;
    
    if (intent.intent !== 'general_inquiry') {
      welcomeMessage += `I detected you're interested in: **${intent.intent.replace('_', ' ')}**\n`;
      welcomeMessage += `Let me help you with that!`;
    } else {
      welcomeMessage += `How can I assist you today?`;
    }

    return {
      content: welcomeMessage,
      intent: intent.intent,
      confidence: intent.confidence,
      entities: intent.entities,
      suggestedActions: intent.suggestedActions,
      context: context
    };
  }

  private async generateLLMResponse(history: ASISession['history'], context?: string): Promise<LLMResponse> {
    try {
      // Use the existing NLP service for processing
      const { NLPService } = await import('./nlpService');
      const nlpService = NLPService.getInstance();
      
      // Get the last user message
      const lastUserMessage = history.filter(h => h.role === 'user').pop()?.content || '';
      
      if (!lastUserMessage) {
        return {
          content: "I didn't receive a message to process. Could you please try again?",
          intent: 'error',
          confidence: 0,
          entities: [],
          suggestedActions: ['retry_message', 'start_new_session']
        };
      }

      // Classify intent
      const intent = nlpService.classifyIntent(lastUserMessage);
      
      // Generate contextual response
      const response = await this.generateContextualResponse(intent, lastUserMessage, history, context);
      
      return {
        content: response,
        intent: intent.intent,
        confidence: intent.confidence,
        entities: intent.entities,
        suggestedActions: intent.suggestedActions,
        context: context
      };

    } catch (error) {
      console.error('LLM response generation error:', error);
      return {
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        intent: 'error',
        confidence: 0,
        entities: [],
        suggestedActions: ['retry_message', 'contact_support']
      };
    }
  }

  private async generateContextualResponse(
    intent: any, 
    userMessage: string, 
    history: ASISession['history'], 
    context?: string
  ): Promise<string> {
    // Use the existing response generation logic from AgentChat
    const { NLPService } = await import('./nlpService');
    const nlpService = NLPService.getInstance();
    
    // Create a temporary session for context
    const tempSessionId = `temp_${Date.now()}`;
    nlpService.updateContext(tempSessionId, {
      sessionId: tempSessionId,
      conversationHistory: history.map(h => ({
        role: h.role,
        content: h.content,
        timestamp: h.timestamp,
        intent: h.intent,
        entities: h.entities
      }))
    });

    // Generate response using the existing NLP service
    const response = nlpService.generateContextualResponse(tempSessionId, userMessage);
    
    // Clean up temporary session
    nlpService.clearContext(tempSessionId);
    
    return response;
  }

  private async generateSessionSummary(session: ASISession): Promise<string> {
    const totalMessages = session.history.length;
    const userMessages = session.history.filter(h => h.role === 'user').length;
    const agentMessages = session.history.filter(h => h.role === 'agent').length;
    
    // Analyze conversation topics
    const intents = session.history
      .filter(h => h.intent)
      .map(h => h.intent);
    
    const uniqueIntents = [...new Set(intents)];
    
    let summary = `Total messages: ${totalMessages} (${userMessages} user, ${agentMessages} agent)`;
    
    if (uniqueIntents.length > 0) {
      summary += `. Topics covered: ${uniqueIntents.join(', ')}`;
    }
    
    return summary;
  }

  // Public API Methods
  public getActiveSessions(): ASISession[] {
    return Array.from(this.activeSessions.values());
  }

  public getSession(sessionId: string): ASISession | undefined {
    return this.activeSessions.get(sessionId);
  }

  public getSessionStats(): {
    total: number;
    active: number;
    ended: number;
    expired: number;
  } {
    const sessions = Array.from(this.activeSessions.values());
    return {
      total: sessions.length,
      active: sessions.filter(s => s.status === 'active').length,
      ended: sessions.filter(s => s.status === 'ended').length,
      expired: sessions.filter(s => s.status === 'expired').length
    };
  }

  public getAgentInfo(): {
    name: string;
    version: string;
    capabilities: string[];
    status: 'online' | 'offline';
  } {
    return {
      name: this.AGENT_NAME,
      version: this.ASI_VERSION,
      capabilities: [
        'ASI Protocol Compliance',
        'Natural Language Processing',
        'Clinical Trial Matching',
        'Health Profile Management',
        'Consent Control',
        'Privacy & Security',
        'Session Management',
        'Context Awareness'
      ],
      status: 'online'
    };
  }
}

export default ASIAgent;
