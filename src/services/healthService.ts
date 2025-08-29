/**
 * Health Service for Clinical Trial Matching System
 * 
 * Monitors the health status of all system components including:
 * - Frontend application
 * - ICP canisters
 * - uAgents
 * - External services
 * - Database connections
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  components: {
    [key: string]: ComponentHealth;
  };
  checks: HealthCheck[];
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  lastCheck: string;
  responseTime?: number;
  details?: any;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  timestamp: string;
  responseTime?: number;
}

export class HealthService {
  private static instance: HealthService;
  private startTime: number = Date.now();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private componentHealth: Map<string, ComponentHealth> = new Map();

  private constructor() {
    this.initializeHealthChecks();
  }

  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  private initializeHealthChecks(): void {
    // Initialize component health status
    this.componentHealth.set('frontend', {
      status: 'healthy',
      message: 'Frontend application is running',
      lastCheck: new Date().toISOString()
    });

    this.componentHealth.set('icp_canister', {
      status: 'unknown',
      message: 'ICP canister status unknown',
      lastCheck: new Date().toISOString()
    });

    this.componentHealth.set('patient_agent', {
      status: 'unknown',
      message: 'Patient agent status unknown',
      lastCheck: new Date().toISOString()
    });

    this.componentHealth.set('trial_agent', {
      status: 'unknown',
      message: 'Trial agent status unknown',
      lastCheck: new Date().toISOString()
    });

    this.componentHealth.set('matching_agent', {
      status: 'unknown',
      message: 'Matching agent status unknown',
      lastCheck: new Date().toISOString()
    });

    this.componentHealth.set('mcp_server', {
      status: 'unknown',
      message: 'MCP server status unknown',
      lastCheck: new Date().toISOString()
    });

    this.componentHealth.set('redis', {
      status: 'unknown',
      message: 'Redis connection status unknown',
      lastCheck: new Date().toISOString()
    });

    this.componentHealth.set('postgres', {
      status: 'unknown',
      message: 'PostgreSQL connection status unknown',
      lastCheck: new Date().toISOString()
    });
  }

  /**
   * Get overall system health status
   */
  public async getHealthStatus(): Promise<HealthStatus> {
    const checks = await this.performHealthChecks();
    const overallStatus = this.calculateOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      components: Object.fromEntries(this.componentHealth),
      checks
    };
  }

  /**
   * Perform all health checks
   */
  private async performHealthChecks(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Frontend health check
    checks.push(await this.checkFrontendHealth());

    // ICP canister health check
    checks.push(await this.checkICPCanisterHealth());

    // Agent health checks
    checks.push(await this.checkAgentHealth('patient_agent', 8002));
    checks.push(await this.checkAgentHealth('trial_agent', 8003));
    checks.push(await this.checkAgentHealth('matching_agent', 8004));
    checks.push(await this.checkAgentHealth('mcp_server', 8005));

    // Service health checks
    checks.push(await this.checkServiceHealth('redis', 'http://localhost:6379'));
    checks.push(await this.checkServiceHealth('postgres', 'http://localhost:5432'));

    // External API health checks
    checks.push(await this.checkExternalAPIHealth());

    return checks;
  }

  /**
   * Check frontend health
   */
  private async checkFrontendHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check if frontend is responsive
      const response = await fetch('/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      const status = response.ok ? 'pass' : 'fail';
      
      const check: HealthCheck = {
        name: 'frontend',
        status,
        message: response.ok ? 'Frontend is healthy' : 'Frontend health check failed',
        timestamp: new Date().toISOString(),
        responseTime
      };

      this.updateComponentHealth('frontend', check);
      return check;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const check: HealthCheck = {
        name: 'frontend',
        status: 'fail',
        message: `Frontend health check error: ${error}`,
        timestamp: new Date().toISOString(),
        responseTime
      };

      this.updateComponentHealth('frontend', check);
      return check;
    }
  }

  /**
   * Check ICP canister health
   */
  private async checkICPCanisterHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check if DFX local network is accessible
      const response = await fetch('http://localhost:8000', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      const status = response.ok ? 'pass' : 'fail';
      
      const check: HealthCheck = {
        name: 'icp_canister',
        status,
        message: response.ok ? 'ICP canister is accessible' : 'ICP canister health check failed',
        timestamp: new Date().toISOString(),
        responseTime
      };

      this.updateComponentHealth('icp_canister', check);
      return check;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const check: HealthCheck = {
        name: 'icp_canister',
        status: 'fail',
        message: `ICP canister health check error: ${error}`,
        timestamp: new Date().toISOString(),
        responseTime
      };

      this.updateComponentHealth('icp_canister', check);
      return check;
    }
  }

  /**
   * Check agent health
   */
  private async checkAgentHealth(agentName: string, port: number): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check if agent endpoint is accessible
      const response = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      const status = response.ok ? 'pass' : 'fail';
      
      const check: HealthCheck = {
        name: agentName,
        status,
        message: response.ok ? `${agentName} is healthy` : `${agentName} health check failed`,
        timestamp: new Date().toISOString(),
        responseTime
      };

      this.updateComponentHealth(agentName, check);
      return check;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const check: HealthCheck = {
        name: agentName,
        status: 'fail',
        message: `${agentName} health check error: ${error}`,
        timestamp: new Date().toISOString(),
        responseTime
      };

      this.updateComponentHealth(agentName, check);
      return check;
    }
  }

  /**
   * Check service health
   */
  private async checkServiceHealth(serviceName: string, url: string): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // For Redis and PostgreSQL, we'll do a basic connectivity check
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      const status = response.ok ? 'pass' : 'warn';
      
      const check: HealthCheck = {
        name: serviceName,
        status,
        message: response.ok ? `${serviceName} is accessible` : `${serviceName} accessibility unknown`,
        timestamp: new Date().toISOString(),
        responseTime
      };

      this.updateComponentHealth(serviceName, check);
      return check;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const check: HealthCheck = {
        name: serviceName,
        status: 'warn',
        message: `${serviceName} health check error: ${error}`,
        timestamp: new Date().toISOString(),
        responseTime
      };

      this.updateComponentHealth(serviceName, check);
      return check;
    }
  }

  /**
   * Check external API health
   */
  private async checkExternalAPIHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check if required API keys are configured
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const agentverseKey = import.meta.env.VITE_AGENTVERSE_API_KEY;
      
      const responseTime = Date.now() - startTime;
      const hasKeys = openaiKey && anthropicKey && agentverseKey;
      const status = hasKeys ? 'pass' : 'warn';
      
      const check: HealthCheck = {
        name: 'external_apis',
        status,
        message: hasKeys ? 'External API keys are configured' : 'Some external API keys are missing',
        timestamp: new Date().toISOString(),
        responseTime
      };

      return check;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'external_apis',
        status: 'fail',
        message: `External API health check error: ${error}`,
        timestamp: new Date().toISOString(),
        responseTime
      };
    }
  }

  /**
   * Update component health status
   */
  private updateComponentHealth(componentName: string, check: HealthCheck): void {
    if (this.componentHealth.has(componentName)) {
      const component = this.componentHealth.get(componentName)!;
      component.status = check.status === 'pass' ? 'healthy' : 
                       check.status === 'warn' ? 'degraded' : 'unhealthy';
      component.message = check.message;
      component.lastCheck = check.timestamp;
      component.responseTime = check.responseTime;
    }
  }

  /**
   * Calculate overall system status
   */
  private calculateOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
    const passCount = checks.filter(c => c.status === 'pass').length;
    const failCount = checks.filter(c => c.status === 'fail').length;
    const warnCount = checks.filter(c => c.status === 'warn').length;
    
    if (failCount > 0) {
      return 'unhealthy';
    } else if (warnCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Get component health status
   */
  public getComponentHealth(componentName: string): ComponentHealth | undefined {
    return this.componentHealth.get(componentName);
  }

  /**
   * Get all component health statuses
   */
  public getAllComponentHealth(): { [key: string]: ComponentHealth } {
    return Object.fromEntries(this.componentHealth);
  }

  /**
   * Reset health checks
   */
  public resetHealthChecks(): void {
    this.healthChecks.clear();
    this.initializeHealthChecks();
  }
}

export default HealthService;
