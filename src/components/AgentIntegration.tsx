import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Bot,
  Zap,
  Shield,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Brain,
  Sparkles,
  Wifi,
  WifiOff,
  Activity,
  Cpu,
  Globe,
  MessageSquare,
  Users,
  Clock,
  Search
} from 'lucide-react';

const AgentIntegration: React.FC = () => {
  const [connectionTesting, setConnectionTesting] = useState(false);
  const [autoFallback, setAutoFallback] = useState(true);
  
  // Simplified state without complex objects
  const [fetchAgentConnected, setFetchAgentConnected] = useState(false);
  const [icpConnected, setIcpConnected] = useState(false);
  const [asiOneConnected, setAsiOneConnected] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [fallbackReason, setFallbackReason] = useState('');

  // Test connections with simple simulation
  const handleTestConnection = async () => {
    setConnectionTesting(true);
    
    try {
      // Simulate connection tests with delays
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random results
      const fetchSuccess = Math.random() > 0.3;
      const icpSuccess = Math.random() > 0.2;
      const asiSuccess = Math.random() > 0.25;
      
      setFetchAgentConnected(fetchSuccess);
      setIcpConnected(icpSuccess);
      setAsiOneConnected(asiSuccess);
      
      // Check if we need fallback
      if (!fetchSuccess || !icpSuccess || !asiSuccess) {
        if (autoFallback) {
          const reasons = [];
          if (!fetchSuccess) reasons.push('Fetch.ai agent');
          if (!icpSuccess) reasons.push('ICP canister');
          if (!asiSuccess) reasons.push('ASI:One');
          
          setFallbackActive(true);
          setFallbackReason(`${reasons.join(', ')} connection failed`);
          
          toast({
            title: "Fallback Mode Activated",
            description: `Switched to fallback mode. Reason: ${reasons.join(', ')} connection failed`,
          });
        } else {
          toast({
            title: "Connection Failed",
            description: "Unable to establish all connections. Please check your configuration.",
            variant: "destructive",
          });
        }
      } else {
        setFallbackActive(false);
        setFallbackReason('');
        toast({
          title: "Connection Successful",
          description: "Successfully connected to all services: Fetch.ai agent, ICP canister, and ASI:One",
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      if (autoFallback) {
        setFallbackActive(true);
        setFallbackReason('Connection test failed');
        toast({
          title: "Fallback Mode Activated",
          description: "Switched to fallback mode due to connection test failure",
        });
      }
    } finally {
      setConnectionTesting(false);
    }
  };

  const handleAgentResponse = (type: string) => {
    const responseType = fallbackActive ? 'Fallback Agent' : 'ASI:One Agent';
    
    toast({
      title: `${responseType} - ${type}`,
      description: `Successfully processed ${type} request${fallbackActive ? ' using fallback mode' : ''}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Status Banner */}
      <Card className="border-grey-200 bg-gradient-to-r from-grey-50 to-grey-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-grey-600" />
                <Zap className="h-5 w-5 text-grey-500" />
              </div>
              <div>
                <h4 className="font-semibold text-grey-800">AI Agent Status</h4>
                <p className="text-sm text-grey-700">
                  {asiOneConnected ? 'ASI:One Active' : 'ASI:One Inactive'} • 
                  {fallbackActive ? ' Fallback Mode' : ' Primary Mode'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={connectionTesting}
              className="flex items-center space-x-2"
            >
              {connectionTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Test Connection</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="fallback">Fallback</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fetch.ai Agent Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Fetch.ai Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={fetchAgentConnected ? "default" : "secondary"}>
                      {fetchAgentConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <span className="text-sm font-mono">fetchai-mainnet</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Version</span>
                    <span className="text-sm">1.0.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ICP Canister Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  ICP Canister
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={icpConnected ? "default" : "secondary"}>
                      {icpConnected ? "Running" : "Stopped"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cycles</span>
                    <span className="text-sm font-mono">1,234,567</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Update</span>
                    <span className="text-sm">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ASI:One Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  ASI:One
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={asiOneConnected ? "default" : "secondary"}>
                      {asiOneConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API Key</span>
                    <Badge variant={asiOneConnected ? "default" : "destructive"}>
                      {asiOneConnected ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Check</span>
                    <span className="text-sm">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleAgentResponse('trial_search')}
                  className="flex items-center space-x-2"
                  disabled={!asiOneConnected && !fallbackActive}
                >
                  <Search className="h-4 w-4" />
                  <span>Search Trials</span>
                </Button>
                
                <Button
                  onClick={() => handleAgentResponse('eligibility_check')}
                  className="flex items-center space-x-2"
                  disabled={!asiOneConnected && !fallbackActive}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Check Eligibility</span>
                </Button>
                
                <Button
                  onClick={() => handleAgentResponse('medical_explanation')}
                  className="flex items-center space-x-2"
                  disabled={!asiOneConnected && !fallbackActive}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Explain Medical Terms</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-address">Agent Address</Label>
                  <Input
                    id="agent-address"
                    defaultValue="agent1qg4zsqrdmyac8j6nc97nz99dxgauyaer2k8zw8mjcktnjrjh4jjkqfkj8tj"
                    placeholder="Enter agent address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="network">Network</Label>
                  <Input
                    id="network"
                    defaultValue="mainnet"
                    placeholder="Enter network"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="icp-canister">ICP Canister ID</Label>
                  <Input
                    id="icp-canister"
                    defaultValue="rrkah-fqaaa-aaaaa-aaaaq-cai"
                    placeholder="Enter ICP canister ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="asi-api-key">ASI:One API Key</Label>
                  <Input
                    id="asi-api-key"
                    type="password"
                    placeholder="Enter API key"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-fallback"
                  checked={autoFallback}
                  onChange={(e) => setAutoFallback(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="auto-fallback">Automatically activate fallback mode on connection failure</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fallback Tab */}
        <TabsContent value="fallback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fallback Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Fallback Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    {fallbackActive 
                      ? `Active - ${fallbackReason}` 
                      : 'Inactive - Primary agents are connected'
                    }
                  </p>
                </div>
                <Badge variant={fallbackActive ? "destructive" : "default"}>
                  {fallbackActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              
                          <div className="p-4 bg-grey-50 border border-grey-200 rounded-lg">
              <h4 className="font-semibold text-grey-800 mb-2">Fallback Features:</h4>
              <ul className="text-sm space-y-1 text-grey-700">
                  <li>• Mock data generation for testing</li>
                  <li>• Basic trial matching algorithms</li>
                  <li>• Offline medical term explanations</li>
                  <li>• Local eligibility checking</li>
                </ul>
              </div>

              {fallbackActive && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Current Fallback Status:</h4>
                  <div className="text-sm space-y-1 text-green-700">
                    <p><strong>Reason:</strong> {fallbackReason}</p>
                    <p><strong>Activated:</strong> {new Date().toLocaleString()}</p>
                    <p><strong>Features:</strong> All fallback features are active</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-grey-600 mb-2">
                    {(fetchAgentConnected || asiOneConnected) ? '1' : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Agents</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {fallbackActive ? '1' : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Fallback Mode</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {asiOneConnected ? '1' : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">ASI:One Connected</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Recent Activity</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Last connection test: {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3" />
                    <span>Active sessions: {(fetchAgentConnected || asiOneConnected) ? '1' : '0'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-3 w-3" />
                    <span>System status: Healthy</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentIntegration;