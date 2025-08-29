// MCP Agent Service
// Integrates MCP server with ASI protocol for GreyGuard system

export interface MCPAgentConfig {
  name: string;
  version: string;
  description: string;
  mcpServerUrl: string;
  asiVersion: string;
  rateLimit: number;
  timeout: number;
  maxRetries: number;
}

export interface MCPAgentRequest {
  sessionId: string;
  tool: string;
  params: Record<string, any>;
  context?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface MCPAgentResponse {
  success: boolean;
  result?: any;
  error?: string;
  metadata: {
    tool: string;
    executionTime: number;
    timestamp: string;
    sessionId: string;
    retries: number;
    cacheHit: boolean;
  };
}

export interface MCPAgentStatus {
  isOnline: boolean;
  lastHealthCheck: string;
  activeSessions: number;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  cacheStats: {
    size: number;
    hitRate: number;
    totalRequests: number;
    cacheHits: number;
  };
}

export interface MCPToolExecution {
  toolName: string;
  params: Record<string, any>;
  result: any;
  executionTime: number;
  timestamp: string;
  sessionId: string;
  success: boolean;
  error?: string;
}

export class MCPAgent {
  private static instance: MCPAgent;
  private readonly config: MCPAgentConfig;
  private readonly mcpServer: any; // MCPServer instance
  private readonly activeSessions: Map<string, {
    sessionId: string;
    startTime: string;
    lastActivity: string;
    requestCount: number;
    tools: string[];
  }> = new Map();
  
  private readonly executionHistory: MCPToolExecution[] = [];
  private readonly requestQueue: MCPAgentRequest[] = [];
  private isProcessing: boolean = false;
  private totalRequests: number = 0;
  private successfulRequests: number = 0;
  private totalExecutionTime: number = 0;

  private constructor() {
    this.config = {
      name: 'GreyGuard_MCP_Agent',
      version: '1.2.0',
      description: 'MCP Agent providing weather data and other services through ASI protocol',
              mcpServerUrl: import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:8000',
      asiVersion: '0.1',
      rateLimit: 100,
      timeout: 30000,
      maxRetries: 3
    };

    // Initialize MCP server
    this.mcpServer = this.initializeMCPServer();
  }

  public static getInstance(): MCPAgent {
    if (!MCPAgent.instance) {
      MCPAgent.instance = new MCPAgent();
    }
    return MCPAgent.instance;
  }

  // MCP Server Initialization
  private initializeMCPServer(): any {
    try {
      // Import MCPServer dynamically to avoid circular dependencies
      const { default: MCPServer } = require('./mcpServer');
      return MCPServer.getInstance();
    } catch (error) {
      console.error('Failed to initialize MCP server:', error);
      return null;
    }
  }

  // ASI Protocol Integration
  public async handleASIRequest(
    sessionId: string,
    request: MCPAgentRequest
  ): Promise<MCPAgentResponse> {
    try {
      // Validate ASI session
      if (!this.validateASISession(sessionId)) {
        return {
          success: false,
          error: 'Invalid ASI session ID',
          metadata: {
            tool: request.tool,
            executionTime: 0,
            timestamp: new Date().toISOString(),
            sessionId,
            retries: 0,
            cacheHit: false
          }
        };
      }

      // Update session activity
      this.updateSessionActivity(sessionId, request.tool);

      // Execute MCP tool
      const response = await this.executeMCPTool(request);

      // Track metrics
      this.trackMetrics(response);

      return response;

    } catch (error) {
      console.error('ASI request handling error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          tool: request.tool,
          executionTime: 0,
          timestamp: new Date().toISOString(),
          sessionId,
          retries: 0,
          cacheHit: false
        }
      };
    }
  }

  // MCP Tool Execution
  private async executeMCPTool(request: MCPAgentRequest): Promise<MCPAgentResponse> {
    const startTime = Date.now();
    let retries = 0;
    let lastError: string | undefined;

    while (retries <= this.config.maxRetries) {
      try {
        // Check if MCP server is available
        if (!this.mcpServer) {
          throw new Error('MCP server not available');
        }

        // Execute tool through MCP server
        const mcpResponse = await this.mcpServer.executeTool({
          tool: request.tool,
          params: request.params,
          sessionId: request.sessionId,
          context: request.context
        });

        if (mcpResponse.error) {
          throw new Error(mcpResponse.error);
        }

        // Create response
        const response: MCPAgentResponse = {
          success: true,
          result: mcpResponse.result,
          metadata: {
            tool: request.tool,
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            sessionId: request.sessionId,
            retries,
            cacheHit: mcpResponse.metadata?.cacheHit || false
          }
        };

        // Add to execution history
        this.addToExecutionHistory({
          toolName: request.tool,
          params: request.params,
          result: mcpResponse.result,
          executionTime: response.metadata.executionTime,
          timestamp: response.metadata.timestamp,
          sessionId: request.sessionId,
          success: true
        });

        return response;

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        retries++;
        
        if (retries <= this.config.maxRetries) {
          // Wait before retry with exponential backoff
          await this.delay(Math.pow(2, retries) * 1000);
        }
      }
    }

    // All retries failed
    const response: MCPAgentResponse = {
      success: false,
      error: `Tool execution failed after ${retries} retries: ${lastError}`,
      metadata: {
        tool: request.tool,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        sessionId: request.sessionId,
        retries,
        cacheHit: false
      }
    };

    // Add to execution history
    this.addToExecutionHistory({
      toolName: request.tool,
      params: request.params,
      result: null,
      executionTime: response.metadata.executionTime,
      timestamp: response.metadata.timestamp,
      sessionId: request.sessionId,
      success: false,
      error: lastError
    });

    return response;
  }

  // Session Management
  private validateASISession(sessionId: string): boolean {
    if (!sessionId || typeof sessionId !== 'string') {
      return false;
    }

    // Check if session exists and is active
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      // Create new session
      this.activeSessions.set(sessionId, {
        sessionId,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        requestCount: 0,
        tools: []
      });
    }

    return true;
  }

  private updateSessionActivity(sessionId: string, tool: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
      session.requestCount++;
      if (!session.tools.includes(tool)) {
        session.tools.push(tool);
      }
    }
  }

  // Metrics Tracking
  private trackMetrics(response: MCPAgentResponse): void {
    this.totalRequests++;
    
    if (response.success) {
      this.successfulRequests++;
    }
    
    this.totalExecutionTime += response.metadata.executionTime;
  }

  private addToExecutionHistory(execution: MCPToolExecution): void {
    this.executionHistory.push(execution);
    
    // Keep only last 1000 executions
    if (this.executionHistory.length > 1000) {
      this.executionHistory.splice(0, this.executionHistory.length - 1000);
    }
  }

  // Utility Methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API Methods
  public async executeTool(
    tool: string,
    params: Record<string, any>,
    sessionId: string,
    context?: string
  ): Promise<MCPAgentResponse> {
    const request: MCPAgentRequest = {
      sessionId,
      tool,
      params,
      context,
      priority: 'normal'
    };

    return this.handleASIRequest(sessionId, request);
  }

  public getAvailableTools(): string[] {
    if (!this.mcpServer) {
      return [];
    }
    
    return this.mcpServer.getTools().map(tool => tool.name);
  }

  public getToolInfo(toolName: string): any {
    if (!this.mcpServer) {
      return null;
    }
    
    return this.mcpServer.getTool(toolName);
  }

  public getAgentStatus(): MCPAgentStatus {
    const successRate = this.totalRequests > 0 
      ? (this.successfulRequests / this.totalRequests) * 100 
      : 0;
    
    const averageResponseTime = this.totalRequests > 0 
      ? this.totalExecutionTime / this.totalRequests 
      : 0;

    return {
      isOnline: this.mcpServer !== null,
      lastHealthCheck: new Date().toISOString(),
      activeSessions: this.activeSessions.size,
      totalRequests: this.totalRequests,
      successRate,
      averageResponseTime,
      cacheStats: this.mcpServer?.getCacheStats() || {
        size: 0,
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0
      }
    };
  }

  public getSessionInfo(sessionId: string): any {
    return this.activeSessions.get(sessionId);
  }

  public getActiveSessions(): any[] {
    return Array.from(this.activeSessions.values());
  }

  public getExecutionHistory(limit: number = 100): MCPToolExecution[] {
    return this.executionHistory.slice(-limit);
  }

  public getToolExecutionStats(toolName: string): {
    totalExecutions: number;
    successCount: number;
    failureCount: number;
    averageExecutionTime: number;
    lastExecuted: string | null;
  } {
    const toolExecutions = this.executionHistory.filter(exec => exec.toolName === toolName);
    
    if (toolExecutions.length === 0) {
      return {
        totalExecutions: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTime: 0,
        lastExecuted: null
      };
    }

    const successCount = toolExecutions.filter(exec => exec.success).length;
    const failureCount = toolExecutions.length - successCount;
    const totalExecutionTime = toolExecutions.reduce((sum, exec) => sum + exec.executionTime, 0);
    const averageExecutionTime = totalExecutionTime / toolExecutions.length;
    const lastExecuted = toolExecutions[toolExecutions.length - 1]?.timestamp || null;

    return {
      totalExecutions: toolExecutions.length,
      successCount,
      failureCount,
      averageExecutionTime,
      lastExecuted
    };
  }

  public clearExecutionHistory(): void {
    this.executionHistory.length = 0;
  }

  public clearSessions(): void {
    this.activeSessions.clear();
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: string;
    timestamp: string;
  }> {
    try {
      if (!this.mcpServer) {
        return {
          status: 'unhealthy',
          details: 'MCP server not available',
          timestamp: new Date().toISOString()
        };
      }

      // Check MCP server health
      const mcpHealth = await this.mcpServer.healthCheck();
      
      if (mcpHealth.status === 'healthy') {
        return {
          status: 'healthy',
          details: 'All services operational',
          timestamp: new Date().toISOString()
        };
      } else if (mcpHealth.status === 'degraded') {
        return {
          status: 'degraded',
          details: `MCP server: ${mcpHealth.details}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          status: 'unhealthy',
          details: `MCP server: ${mcpHealth.details}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Configuration Management
  public updateConfig(updates: Partial<MCPAgentConfig>): void {
    Object.assign(this.config, updates);
  }

  public getConfig(): MCPAgentConfig {
    return { ...this.config };
  }

  // ASI Protocol Specific Methods
  public async handleASISessionInit(sessionId: string, context?: string): Promise<{
    success: boolean;
    availableTools: string[];
    sessionInfo: any;
  }> {
    try {
      // Validate and create session
      if (!this.validateASISession(sessionId)) {
        return {
          success: false,
          availableTools: [],
          sessionInfo: null
        };
      }

      const availableTools = this.getAvailableTools();
      const sessionInfo = this.getSessionInfo(sessionId);

      return {
        success: true,
        availableTools,
        sessionInfo
      };
    } catch (error) {
      console.error('ASI session init error:', error);
      return {
        success: false,
        availableTools: [],
        sessionInfo: null
      };
    }
  }

  public async handleASISessionEnd(sessionId: string, reason?: string): Promise<{
    success: boolean;
    sessionSummary: any;
  }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          sessionSummary: null
        };
      }

      // Get execution history for this session
      const sessionExecutions = this.executionHistory.filter(exec => exec.sessionId === sessionId);
      
      const sessionSummary = {
        sessionId,
        startTime: session.startTime,
        endTime: new Date().toISOString(),
        totalRequests: session.requestCount,
        toolsUsed: session.tools,
        executions: sessionExecutions.length,
        successRate: sessionExecutions.length > 0 
          ? (sessionExecutions.filter(exec => exec.success).length / sessionExecutions.length) * 100 
          : 0,
        reason: reason || 'Session ended normally'
      };

      // Remove session
      this.activeSessions.delete(sessionId);

      return {
        success: true,
        sessionSummary
      };
    } catch (error) {
      console.error('ASI session end error:', error);
      return {
        success: false,
        sessionSummary: null
      };
    }
  }

  // Weather-Specific Convenience Methods
  public async getWeatherAlerts(state: string, sessionId: string): Promise<MCPAgentResponse> {
    return this.executeTool('get_weather_alerts', { state }, sessionId);
  }

  public async getWeatherForecast(
    latitude: number, 
    longitude: number, 
    sessionId: string
  ): Promise<MCPAgentResponse> {
    return this.executeTool('get_weather_forecast', { latitude, longitude }, sessionId);
  }

  public async getWeatherSummary(
    location: string, 
    sessionId: string, 
    includeAlerts: boolean = true
  ): Promise<MCPAgentResponse> {
    return this.executeTool('get_weather_summary', { location, includeAlerts }, sessionId);
  }

  public async getAirQuality(
    latitude: number, 
    longitude: number, 
    sessionId: string
  ): Promise<MCPAgentResponse> {
    return this.executeTool('get_air_quality', { latitude, longitude }, sessionId);
  }

  public async getWeatherHistory(
    latitude: number, 
    longitude: number, 
    date: string, 
    sessionId: string
  ): Promise<MCPAgentResponse> {
    return this.executeTool('get_weather_history', { latitude, longitude, date }, sessionId);
  }
}

export default MCPAgent;
