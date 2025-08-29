import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Activity,
  Settings,
  Play,
  Stop,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  BarChart3,
  Server,
  Wrench,
  Eye,
  Download,
  Copy,
  Trash2,
  Plus,
  Minus,
  Zap,
  Shield,
  Globe,
  Layers,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import MCPServer from '../services/mcpServer';
import MCPAgent from '../services/mcpAgent';

interface MCPSystemProps {
  className?: string;
}

const MCPSystem: React.FC<MCPSystemProps> = ({ className }) => {
  const [mcpServer] = useState(() => MCPServer.getInstance());
  const [mcpAgent] = useState(() => MCPAgent.getInstance());
  
  // System State
  const [activeTab, setActiveTab] = useState('tools');
  const [serverStatus, setServerStatus] = useState<'healthy' | 'degraded' | 'unhealthy'>('healthy');
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  

  
  // Tool Execution State
  const [selectedTool, setSelectedTool] = useState('');
  const [toolParams, setToolParams] = useState<Record<string, any>>({});
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Session State
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  
  // Monitoring State
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);

  useEffect(() => {
    // Initialize system
    initializeSystem();
    
    // Set up periodic updates
    const interval = setInterval(updateSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeSystem = async () => {
    try {
      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSessionId(sessionId);
      
      // Initialize ASI session
      await mcpAgent.handleASISessionInit(sessionId, 'MCP System Initialization');
      
      // Update system status
      await updateSystemStatus();
      
      toast({
        title: "MCP System Initialized",
        description: `Session ${sessionId.substring(0, 12)}... created successfully`,
      });
      
    } catch (error) {
      console.error('System initialization error:', error);
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize MCP system",
        variant: "destructive",
      });
    }
  };

  const updateSystemStatus = async () => {
    try {
      // Check server health
      const serverHealth = await mcpServer.healthCheck();
      setServerStatus(serverHealth.status);
      
      // Get agent status
      const agentStatusData = mcpAgent.getAgentStatus();
      setAgentStatus(agentStatusData);
      
      // Get cache stats
      const cacheStatsData = mcpServer.getCacheStats();
      setCacheStats(cacheStatsData);
      
      // Get execution history
      const historyData = mcpAgent.getExecutionHistory(50);
      setExecutionHistory(historyData);
      
      // Get active sessions
      const sessionsData = mcpAgent.getActiveSessions();
      setSessionHistory(sessionsData);
      
    } catch (error) {
      console.error('Status update error:', error);
    }
  };



  // Tool Execution Functions
  const handleExecuteTool = async () => {
    if (!selectedTool) {
      toast({
        title: "No Tool Selected",
        description: "Please select a tool to execute",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExecuting(true);
      
      const response = await mcpAgent.executeTool(selectedTool, toolParams, currentSessionId);
      
      const executionResult = {
        tool: selectedTool,
        params: toolParams,
        result: response.result,
        success: response.success,
        error: response.error,
        metadata: response.metadata,
        timestamp: new Date().toISOString()
      };
      
      setExecutionResults(prev => [executionResult, ...prev.slice(0, 19)]);
      
      if (response.success) {
        toast({
          title: "Tool Executed Successfully",
          description: `${selectedTool} completed in ${response.metadata.executionTime}ms`,
        });
      } else {
        toast({
          title: "Tool Execution Failed",
          description: response.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Tool execution error:', error);
      toast({
        title: "Execution Error",
        description: "Failed to execute tool",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToolSelection = (toolName: string) => {
    setSelectedTool(toolName);
    
    // Get tool info and set default parameters
    const toolInfo = mcpServer.getTool(toolName);
    if (toolInfo) {
      const defaultParams: Record<string, any> = {};
      Object.entries(toolInfo.parameters).forEach(([key, param]: [string, any]) => {
        if (param.default !== undefined) {
          defaultParams[key] = param.default;
        }
      });
      setToolParams(defaultParams);
    }
  };

  const updateToolParam = (key: string, value: any) => {
    setToolParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Utility Functions
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };



  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MCP System</h2>
          <p className="text-muted-foreground">
            Model Context Protocol server with tool execution and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant={serverStatus === 'healthy' ? 'default' : 'secondary'}>
              {getStatusIcon(serverStatus)}
              <span className="ml-1">Server: {serverStatus}</span>
            </Badge>
            <Badge variant={agentStatus?.isOnline ? 'default' : 'secondary'}>
              <Server className="h-3 w-3 mr-1" />
              Agent: {agentStatus?.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">Tool Execution</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>



        {/* Tool Execution Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tool Controls */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    <span>Tool Execution</span>
                  </CardTitle>
                  <CardDescription>
                    Execute MCP tools with custom parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tool-select">Select Tool</Label>
                    <Select value={selectedTool} onValueChange={handleToolSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tool..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mcpServer.getTools().map((tool) => (
                          <SelectItem key={tool.name} value={tool.name}>
                            {tool.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTool && (
                    <div className="space-y-4">
                      <div className="text-sm">
                        <span className="font-medium">Description:</span>
                        <p className="text-muted-foreground mt-1">
                          {mcpServer.getTool(selectedTool)?.description}
                        </p>
                      </div>

                      {/* Dynamic Parameter Inputs */}
                      {Object.entries(mcpServer.getTool(selectedTool)?.parameters || {}).map(([key, param]: [string, any]) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={key}>
                            {key} {param.required && <span className="text-red-500">*</span>}
                          </Label>
                          {param.type === 'string' && (
                            <Input
                              id={key}
                              placeholder={param.description}
                              value={toolParams[key] || ''}
                              onChange={(e) => updateToolParam(key, e.target.value)}
                            />
                          )}
                          {param.type === 'number' && (
                            <Input
                              id={key}
                              type="number"
                              placeholder={param.description}
                              value={toolParams[key] || ''}
                              onChange={(e) => updateToolParam(key, parseFloat(e.target.value) || 0)}
                              min={param.minimum}
                              max={param.maximum}
                            />
                          )}
                          {param.type === 'boolean' && (
                            <Select value={String(toolParams[key] || false)} onValueChange={(value) => updateToolParam(key, value === 'true')}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <p className="text-xs text-muted-foreground">{param.description}</p>
                        </div>
                      ))}

                      <Button
                        onClick={handleExecuteTool}
                        disabled={isExecuting}
                        className="w-full"
                        size="lg"
                      >
                        {isExecuting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Execute Tool
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Execution Results */}
            <div className="space-y-4">
              <Card className="min-h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Execution Results</span>
                    <Badge variant="outline">{executionResults.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {executionResults.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {executionResults.map((result, index) => (
                        <Card key={index} className="text-sm">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{result.tool}</CardTitle>
                              <Badge variant={result.success ? 'default' : 'destructive'}>
                                {result.success ? 'Success' : 'Failed'}
                              </Badge>
                            </div>
                            <CardDescription>
                              {new Date(result.timestamp).toLocaleString()} • {result.metadata.executionTime}ms
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {result.success ? (
                              <div className="space-y-2">
                                <div className="text-xs text-muted-foreground">
                                  Parameters: {JSON.stringify(result.params)}
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                  <pre className="text-xs bg-muted p-2 rounded">
                                    {JSON.stringify(result.result, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            ) : (
                              <div className="text-red-600">
                                Error: {result.error}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                      <div>
                        <Wrench className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No executions yet</p>
                        <p className="text-sm">Select a tool and execute it to see results</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Metrics */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span>System Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agentStatus && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {agentStatus.successRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-grey-600">
                          {agentStatus.totalRequests}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Requests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {agentStatus.averageResponseTime.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Response</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {agentStatus.activeSessions}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Sessions</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cache Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-primary" />
                    <span>Cache Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cacheStats && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Cache Size</span>
                        <span className="text-sm text-muted-foreground">{cacheStats.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Hit Rate</span>
                        <span className="text-sm text-muted-foreground">{(cacheStats.hitRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Requests</span>
                        <span className="text-sm text-muted-foreground">{cacheStats.totalRequests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Cache Hits</span>
                        <span className="text-sm text-muted-foreground">{cacheStats.cacheHits}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Execution History */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Recent Executions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {executionHistory.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {executionHistory.slice(0, 20).map((exec, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{exec.toolName}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(exec.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={exec.success ? 'default' : 'destructive'} className="text-xs">
                              {exec.success ? '✓' : '✗'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {exec.executionTime}ms
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No execution history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Session */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-primary" />
                    <span>Current Session</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Session ID</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {currentSessionId.substring(0, 12)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tools Available</span>
                    <span className="text-sm text-muted-foreground">
                      {mcpServer.getTools().length}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => copyToClipboard(currentSessionId)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Session ID
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Session History */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <span>Session History</span>
                    <Badge variant="outline">{sessionHistory.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionHistory.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {sessionHistory.map((session, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {session.sessionId.substring(0, 12)}...
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {session.requestCount} requests
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Started: {new Date(session.startTime).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last: {new Date(session.lastActivity).toLocaleString()}
                          </div>
                          <div className="mt-2">
                            <span className="text-xs font-medium">Tools:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {session.tools.slice(0, 3).map((tool, toolIndex) => (
                                <Badge key={toolIndex} variant="secondary" className="text-xs">
                                  {tool}
                                </Badge>
                              ))}
                              {session.tools.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{session.tools.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active sessions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MCPSystem;
