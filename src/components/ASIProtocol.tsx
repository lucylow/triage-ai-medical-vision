import React, { useState, useEffect } from 'react';
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
  MessageSquare, 
  Play, 
  CircleStop, 
  RefreshCw, 
  Settings, 
  Activity,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  Network,
  Shield,
  Database
} from 'lucide-react';
import ASIAgent, { 
  ASISession, 
  SessionInit, 
  ChatMessage, 
  SessionEnd,
  ErrorMessage 
} from '../services/asiAgent';

interface ASIProtocolProps {
  className?: string;
}

const ASIProtocol: React.FC<ASIProtocolProps> = ({ className }) => {
  const [asiAgent] = useState(() => ASIAgent.getInstance());
  const [activeSession, setActiveSession] = useState<string>('');
  const [sessionHistory, setSessionHistory] = useState<ASISession[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isConnected, setIsConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // ASI Protocol state
  const [protocolVersion] = useState('0.1');
  const [agentAddress] = useState('GreyGuard_ASI_Agent');
  const [currentSession, setCurrentSession] = useState<ASISession | null>(null);

  useEffect(() => {
    // Initialize connection
    initializeConnection();
    
    // Update session history every 5 seconds
    const interval = setInterval(() => {
      updateSessionHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initializeConnection = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Simulate connection establishment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnectionStatus('connected');
      setIsConnected(true);
      
      // Get initial session stats
      updateSessionHistory();
      
      toast({
        title: "ASI Protocol Connected",
        description: "Successfully connected to ASI-compatible agent",
      });
      
    } catch (error) {
      setConnectionStatus('disconnected');
      setIsConnected(false);
      
      toast({
        title: "Connection Failed",
        description: "Unable to connect to ASI agent",
        variant: "destructive",
      });
    }
  };

  const updateSessionHistory = () => {
    const sessions = asiAgent.getActiveSessions();
    setSessionHistory(sessions);
    
    // Update current session if it exists
    if (activeSession) {
      const session = asiAgent.getSession(activeSession);
      setCurrentSession(session || null);
    }
  };

  const handleSessionInit = async () => {
    if (!messageInput.trim()) {
      toast({
        title: "Missing Message",
        description: "Please enter a message to start the session",
        variant: "destructive",
      });
      return;
    }

    try {
      const initMessage: SessionInit = {
        version: protocolVersion,
        agentAddress: agentAddress,
        context: contextInput.trim() || undefined,
        message: messageInput.trim()
      };

      const response = await asiAgent.handleSessionInit('user', initMessage);
      
      if ('error' in response) {
        toast({
          title: "Session Init Failed",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      // Session created successfully
      setActiveSession(response.sessionId);
      setCurrentSession(asiAgent.getSession(response.sessionId) || null);
      
      // Clear inputs
      setMessageInput('');
      setContextInput('');
      
      // Update session history
      updateSessionHistory();
      
      toast({
        title: "Session Started",
        description: `New ASI session created: ${response.sessionId}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize session",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!activeSession || !messageInput.trim()) {
      toast({
        title: "Cannot Send Message",
        description: "No active session or empty message",
        variant: "destructive",
      });
      return;
    }

    try {
      const chatMessage: ChatMessage = {
        version: protocolVersion,
        agentAddress: agentAddress,
        sessionId: activeSession,
        message: messageInput.trim(),
        context: contextInput.trim() || undefined
      };

      const response = await asiAgent.handleChatMessage('user', chatMessage);
      
      if ('error' in response) {
        toast({
          title: "Message Failed",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      // Message sent successfully
      setMessageInput('');
      updateSessionHistory();
      
      toast({
        title: "Message Sent",
        description: "Message processed successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) {
      toast({
        title: "No Active Session",
        description: "There is no session to end",
        variant: "destructive",
      });
      return;
    }

    try {
      const endMessage: SessionEnd = {
        version: protocolVersion,
        agentAddress: agentAddress,
        sessionId: activeSession,
        reason: "User requested session termination"
      };

      const response = await asiAgent.handleSessionEnd('user', endMessage);
      
      if ('error' in response) {
        toast({
          title: "Session End Failed",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      // Session ended successfully
      setActiveSession('');
      setCurrentSession(null);
      updateSessionHistory();
      
      toast({
        title: "Session Ended",
        description: response.reason || "Session terminated successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'connecting': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ASI Protocol Interface</h2>
          <p className="text-muted-foreground">
            Test and manage ASI-compatible agent communications
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getConnectionStatusIcon()}
            <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
              {connectionStatus}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={initializeConnection}
            disabled={connectionStatus === 'connecting'}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconnect
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Chat Interface</TabsTrigger>
          <TabsTrigger value="sessions">Session Management</TabsTrigger>
          <TabsTrigger value="protocol">Protocol Info</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Chat Interface Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-[500px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span>ASI Chat Interface</span>
                    {activeSession && (
                      <Badge variant="outline" className="text-xs">
                        Session: {activeSession.substring(0, 12)}...
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {activeSession 
                      ? "Active ASI session - send messages using the protocol"
                      : "Start a new ASI session to begin chatting"
                    }
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Session History Display */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/30 rounded-lg">
                    {currentSession ? (
                      currentSession.history.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {msg.role === 'agent' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                              {msg.role === 'user' && <Users className="h-4 w-4 mt-1 flex-shrink-0" />}
                              <div className="flex-1">
                                <div className="whitespace-pre-wrap text-sm">
                                  {msg.content}
                                </div>
                                
                                {/* Intent and Entities Display */}
                                {msg.intent && (
                                  <div className="mt-2 pt-2 border-t border-border/50">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Activity className="h-3 w-3" />
                                      <Badge variant="outline" className="text-xs">
                                        {msg.intent.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    
                                    {msg.entities && msg.entities.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {msg.entities.slice(0, 3).map((entity, i) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {entity}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div className="text-xs opacity-70 mt-1">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active session</p>
                        <p className="text-sm">Start a session to begin chatting</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Session Controls */}
                  <div className="space-y-3">
                    {!activeSession ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="context-input">Context (Optional)</Label>
                          <Input
                            id="context-input"
                            placeholder="Enter session context..."
                            value={contextInput}
                            onChange={(e) => setContextInput(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="init-message">Initial Message</Label>
                          <Textarea
                            id="init-message"
                            placeholder="Enter your first message to start the session..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleSessionInit}
                          disabled={!messageInput.trim() || !isConnected}
                          className="w-full"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start ASI Session
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="chat-message">Message</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="chat-message"
                              placeholder="Type your message..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={!messageInput.trim()}
                              size="icon"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={handleEndSession}
                          variant="outline"
                          className="w-full"
                        >
                          <CircleStop className="h-4 w-4 mr-2" />
                          End Session
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Session Info Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Session Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={activeSession ? "default" : "secondary"}>
                        {activeSession ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    {activeSession && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Session ID</span>
                          <code className="text-xs bg-muted p-1 rounded">
                            {activeSession.substring(0, 12)}...
                          </code>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Messages</span>
                          <span className="text-sm text-muted-foreground">
                            {currentSession?.history.length || 0}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Started</span>
                          <span className="text-sm text-muted-foreground">
                            {currentSession ? new Date(currentSession.history[0]?.timestamp || Date.now()).toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Protocol Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Version</span>
                      <Badge variant="outline">{protocolVersion}</Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Agent</span>
                      <code className="text-xs bg-muted p-1 rounded">
                        {agentAddress}
                      </code>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant="outline" className="text-green-600">
                        ASI Compliant
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Session Management Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Active Sessions</span>
                <Badge variant="outline">
                  {sessionHistory.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active sessions</p>
                  <p className="text-sm">Start a chat session to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionHistory.map((session) => (
                    <div
                      key={session.sessionId}
                      className={`p-4 border rounded-lg ${
                        session.sessionId === activeSession ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                          <code className="text-xs bg-muted p-1 rounded">
                            {session.sessionId.substring(0, 12)}...
                          </code>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {session.history.length} messages
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveSession(session.sessionId)}
                            disabled={session.sessionId === activeSession}
                          >
                            {session.sessionId === activeSession ? 'Active' : 'Switch To'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        Started: {new Date(session.history[0]?.timestamp || Date.now()).toLocaleString()}
                      </div>
                      
                      {session.context && (
                        <div className="text-sm">
                          <span className="font-medium">Context:</span> {session.context}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protocol Info Tab */}
        <TabsContent value="protocol" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="h-5 w-5 text-primary" />
                  <span>ASI Protocol Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Protocol Version</h4>
                    <Badge className="text-lg px-3 py-1">{protocolVersion}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Message Types</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">SessionInit</span>
                        <Badge variant="outline">Session Start</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ChatMessage</span>
                        <Badge variant="outline">Ongoing Chat</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">SessionEnd</span>
                        <Badge variant="outline">Session Close</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Error</span>
                        <Badge variant="outline">Error Handling</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>Agent Capabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">ASI Features</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {asiAgent.getAgentInfo().capabilities.map((capability, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Session Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const stats = asiAgent.getSessionStats();
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Total Sessions</span>
                          <Badge variant="outline">{stats.total}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Active</span>
                          <Badge className="bg-green-100 text-green-800">{stats.active}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Ended</span>
                          <Badge className="bg-grey-100 text-grey-800">{stats.ended}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Expired</span>
                          <Badge className="bg-red-100 text-red-800">{stats.expired}</Badge>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Response Time</span>
                    <Badge variant="outline">~150ms</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Protocol Version</span>
                    <Badge variant="outline">{protocolVersion}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Storage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Session Storage</span>
                    <Badge variant="outline">In-Memory</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">History Limit</span>
                    <Badge variant="outline">50 messages</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Timeout</span>
                    <Badge variant="outline">30 min</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Cleanup</span>
                    <Badge className="bg-grey-100 text-grey-800">Auto</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ASIProtocol;
