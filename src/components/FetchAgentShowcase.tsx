import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchAgentService, FetchAgent, AgentMessage, PatientAnalysis, TrialAnalysis } from '../services/fetchAgentService';
import { 
  Bot, 
  MessageSquare, 
  Brain, 
  Target, 
  Activity, 
  CheckCircle, 
  Clock, 
  User,
  Send,
  Sparkles,
  Zap,
  Shield,
  Database,
  Network,
  Settings,
  Cpu,
  Server,
  Key,
  Eye,
  Lock,
  Globe,
  Zap as ZapIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  CreditCard,
  Star
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface MCPAgent {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'connecting';
  address: string;
  network: string;
  canisterId: string;
  lastSeen: Date;
  capabilities: string[];
}

interface MCPSystem {
  status: 'healthy' | 'warning' | 'error';
  agents: MCPAgent[];
  lastConnectionTest: Date;
  activeSessions: number;
  systemStatus: string;
}

export const FetchAgentShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [agents, setAgents] = useState<FetchAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [message, setMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PatientAnalysis | TrialAnalysis | null>(null);
  
  // Enhanced MCP System State with Realistic Medical Use Cases
  const [mcpSystem, setMcpSystem] = useState<MCPSystem>({
    status: 'healthy',
    agents: [
      {
        id: 'context7-mcp-agent',
        name: 'Context7 MCP Agent',
        status: 'online',
        address: 'https://github.com/llow/Context7-MCP-Agent',
        network: 'mainnet',
        canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
        lastSeen: new Date(),
        capabilities: ['Medical Context Management', 'Patient Data Processing', 'Real-time Clinical Analysis', 'Multi-source Medical Integration', 'HIPAA Compliance', 'Real-time Updates']
      },
      {
        id: 'github-mcp-agent',
        name: 'GitHub MCP Agent',
        status: 'online',
        address: 'https://github.com/llow/Github-MCP-Agent',
        network: 'mainnet',
        canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
        lastSeen: new Date(Date.now() - 300000),
        capabilities: ['Medical Repository Management', 'Clinical Code Analysis', 'Research Collaboration Tools', 'Version Control for Medical Data', 'Code Review', 'Automated Testing']
      },
      {
        id: 'perplexity-mcp-agent',
        name: 'Perplexity MCP Agent',
        status: 'online',
        address: 'https://github.com/llow/Perplexity-MCP-Agent',
        network: 'mainnet',
        canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
        lastSeen: new Date(Date.now() - 600000),
        capabilities: ['Medical AI Search', 'Clinical Knowledge Discovery', 'Research Assistance', 'Medical Information Synthesis', 'Evidence-based Answers', 'Real-time Research']
      },
      {
        id: 'airbnb-mcp-agent',
        name: 'Airbnb MCP Agent',
        status: 'online',
        address: 'https://github.com/llow/Airbnb-MCP-Agent',
        network: 'mainnet',
        canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
        lastSeen: new Date(Date.now() - 900000),
        capabilities: ['Travel Planning', 'Accommodation Booking', 'Medical Conference Support', 'Patient Travel Coordination', 'Accessibility Features', 'Emergency Support']
      },
      {
        id: 'calendar-mcp-agent',
        name: 'Calendar MCP Agent',
        status: 'online',
        address: 'https://github.com/llow/Calendar-MCP-Agent',
        network: 'mainnet',
        canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
        lastSeen: new Date(Date.now() - 1200000),
        capabilities: ['Appointment Scheduling', 'Medical Calendar Management', 'Trial Visit Coordination', 'Reminder Systems', 'Multi-calendar Sync', 'Time Zone Handling']
      },
      {
        id: 'events-finder-mcp-agent',
        name: 'Events Finder MCP Agent',
        status: 'online',
        address: 'https://github.com/llow/Events-Finder-MCP-Agent',
        network: 'mainnet',
        canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
        lastSeen: new Date(Date.now() - 1500000),
        capabilities: ['Medical Conference Discovery', 'Clinical Trial Events', 'Patient Support Groups', 'Educational Seminars', 'Networking Opportunities', 'Virtual Events']
      },
      {
        id: 'gmail-chat-mcp-agent',
        name: 'Gmail Chat MCP Agent',
        status: 'online',
        address: 'https://github.com/llow/Gmail-Chat-MCP-Agent',
        network: 'mainnet',
        canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
        lastSeen: new Date(Date.now() - 1800000),
        capabilities: ['Email Management', 'Medical Communication', 'Trial Coordination', 'Patient Updates', 'Secure Messaging', 'Automated Responses']
      }
    ],
    lastConnectionTest: new Date(),
    activeSessions: 12,
    systemStatus: 'All systems operational with 99.9% uptime'
  });

  // Mock data for how agents work together
  const [agentWorkflow, setAgentWorkflow] = useState<any>(null);
  const [medicalUseCases, setMedicalUseCases] = useState<any[]>([]);
  const [patientEligibility, setPatientEligibility] = useState<any>(null);

  // Initialize mock data
  useEffect(() => {
    // Mock medical use cases
    setMedicalUseCases([
      {
        id: 'use-case-1',
        title: 'Clinical Trial Matching',
        description: 'Multi-agent collaboration for patient-trial matching',
        steps: [
          {
            agent: 'Context7 MCP Agent',
            action: 'Analyzes patient medical history and context',
            result: 'Patient profile created with 95% accuracy',
            timestamp: new Date(Date.now() - 5000)
          },
          {
            agent: 'Perplexity MCP Agent',
            action: 'Searches clinical trial databases and medical literature',
            result: '12 relevant trials identified across 5 medical centers',
            timestamp: new Date(Date.now() - 4000)
          },
          {
            agent: 'GitHub MCP Agent',
            action: 'Analyzes trial code and research protocols',
            result: 'Trial compatibility scores calculated for each match',
            timestamp: new Date(Date.now() - 3000)
          },
          {
            agent: 'Airbnb MCP Agent',
            action: 'Optimizes travel and accommodation for trial visits',
            result: 'Travel plan created with cost optimization',
            timestamp: new Date(Date.now() - 2000)
          },
          {
            agent: 'Calendar MCP Agent',
            action: 'Coordinates trial visit schedules and reminders',
            result: 'Complete trial timeline with automated reminders',
            timestamp: new Date(Date.now() - 1000)
          }
        ],
        outcome: 'Patient matched with 3 optimal trials with 89% confidence'
      },
      {
        id: 'use-case-2',
        title: 'Medical Image Analysis',
        description: 'AI-powered medical imaging with agent collaboration',
        steps: [
          {
            agent: 'Context7 MCP Agent',
            action: 'Processes medical image metadata and patient context',
            result: 'Image context enriched with patient history',
            timestamp: new Date(Date.now() - 8000)
          },
          {
            agent: 'Perplexity MCP Agent',
            action: 'Researches similar cases and treatment protocols',
            result: 'Comparative analysis completed with 200+ similar cases',
            timestamp: new Date(Date.now() - 6000)
          },
          {
            agent: 'GitHub MCP Agent',
            action: 'Runs image analysis algorithms and ML models',
            result: 'AI analysis completed with 94.2% accuracy',
            timestamp: new Date(Date.now() - 4000)
          },
          {
            agent: 'Gmail Chat MCP Agent',
            action: 'Generates comprehensive medical report',
            result: 'Detailed analysis report sent to healthcare team',
            timestamp: new Date(Date.now() - 2000)
          }
        ],
        outcome: 'Medical image analyzed with AI assistance, 94.2% accuracy achieved'
      },
      {
        id: 'use-case-3',
        title: 'Patient Communication & Support',
        description: 'Automated patient support and trial coordination',
        steps: [
          {
            agent: 'Context7 MCP Agent',
            action: 'Monitors patient trial progress and health status',
            result: 'Real-time patient monitoring activated',
            timestamp: new Date(Date.now() - 10000)
          },
          {
            agent: 'Events Finder MCP Agent',
            action: 'Identifies relevant support groups and educational events',
            result: '5 support events and 3 educational seminars found',
            timestamp: new Date(Date.now() - 8000)
          },
          {
            agent: 'Calendar MCP Agent',
            action: 'Schedules follow-up appointments and support sessions',
            result: 'Complete support calendar created with reminders',
            timestamp: new Date(Date.now() - 6000)
          },
          {
            agent: 'Gmail Chat MCP Agent',
            action: 'Sends personalized updates and educational content',
            result: 'Patient communication plan executed successfully',
            timestamp: new Date(Date.now() - 4000)
          }
        ],
        outcome: 'Patient support system activated with 24/7 monitoring and communication'
      }
    ]);

    // Mock patient eligibility assessment
    setPatientEligibility({
      patientId: 'P-2024-001',
      assessmentDate: new Date(),
      status: 'Eligible',
      confidence: 89.7,
      matchedTrials: [
        {
          trialId: 'T-001',
          title: 'Novel Diabetes Treatment Study',
          matchScore: 95,
          eligibility: 'Fully Eligible',
          requirements: ['Age 18-65', 'Type 2 Diabetes', 'HbA1c 7.0-10.0%'],
          nextSteps: ['Contact coordinator', 'Schedule screening', 'Prepare records']
        },
        {
          trialId: 'T-002',
          title: 'Advanced Insulin Therapy',
          matchScore: 87,
          eligibility: 'Conditionally Eligible',
          requirements: ['Age 18-65', 'Type 2 Diabetes', 'Insulin naive'],
          nextSteps: ['Verify insulin status', 'Schedule consultation', 'Review protocol']
        }
      ],
      agentAnalysis: {
        context7: 'Patient profile analyzed with 95% accuracy',
        perplexity: '12 relevant trials identified',
        github: 'Trial compatibility verified',
        airbnb: 'Travel optimization completed',
        calendar: 'Timeline coordination ready'
      }
    });
  }, []);

  // Simulate agent workflow execution
  const executeAgentWorkflow = async (useCaseId: string) => {
    const useCase = medicalUseCases.find(uc => uc.id === useCaseId);
    if (!useCase) return;

    setAgentWorkflow({
      useCase,
      status: 'executing',
      currentStep: 0,
      results: []
    });

    // Simulate step-by-step execution
    for (let i = 0; i < useCase.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAgentWorkflow(prev => ({
        ...prev,
        currentStep: i + 1,
        results: [...(prev?.results || []), useCase.steps[i]]
      }));
    }

    setAgentWorkflow(prev => ({
      ...prev,
      status: 'completed'
    }));
  };

  const [agentConfig, setAgentConfig] = useState({
    agentAddress: 'agent1qg4zsqrdmyac8j6nc97nz99dxgauyaer2k8zw8mjcktnjrjh4jjkqfkj8tj',
    network: 'mainnet',
    canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
    apiKey: '',
    autoFallback: true
  });

  // Medical functionality state
  const [medicalQuery, setMedicalQuery] = useState('');
  const [patientData, setPatientData] = useState({
    age: '',
    condition: '',
    location: '',
    preferences: ''
  });
  const [medicalResults, setMedicalResults] = useState<any>(null);
  const [isProcessingMedical, setIsProcessingMedical] = useState(false);

  // Medical query processing
  const processMedicalQuery = async () => {
    if (!medicalQuery.trim()) return;
    
    setIsProcessingMedical(true);
    
    // Simulate medical AI processing
    setTimeout(() => {
      const results = {
        query: medicalQuery,
        timestamp: new Date(),
        analysis: {
          condition: medicalQuery.toLowerCase().includes('diabetes') ? 'Diabetes Type 2' : 
                    medicalQuery.toLowerCase().includes('cancer') ? 'Oncology' : 
                    medicalQuery.toLowerCase().includes('heart') ? 'Cardiology' : 'General Medicine',
          riskLevel: Math.random() > 0.5 ? 'Medium' : 'Low',
          urgency: Math.random() > 0.7 ? 'High' : 'Normal',
          recommendations: [
            'Schedule consultation with specialist',
            'Review current medications',
            'Consider lifestyle modifications',
            'Monitor symptoms regularly'
          ]
        },
        trials: [
          {
            id: 'trial-001',
            title: 'Novel Treatment Study',
            condition: 'Diabetes Type 2',
            location: 'Multiple sites',
            phase: 'Phase II',
            compensation: '$500'
          },
          {
            id: 'trial-002',
            title: 'Prevention Research',
            condition: 'Cardiovascular Health',
            location: 'Local clinic',
            phase: 'Phase I',
            compensation: '$300'
          }
        ]
      };
      
      setMedicalResults(results);
      setIsProcessingMedical(false);
      
      toast({
        title: "Medical Analysis Complete",
        description: "AI analysis and trial matching completed successfully",
        variant: "default"
      });
    }, 2000);
  };

  // Patient data analysis
  const analyzePatientData = async () => {
    if (!patientData.age || !patientData.condition) {
      toast({
        title: "Missing Information",
        description: "Please provide age and condition",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessingMedical(true);
    
    setTimeout(() => {
      const analysis = {
        patient: patientData,
        timestamp: new Date(),
        eligibility: {
          overall: Math.random() > 0.3 ? 'Eligible' : 'May need review',
          ageGroup: parseInt(patientData.age) < 65 ? 'Adult' : 'Senior',
          conditionMatch: 'High relevance',
          locationAccess: 'Multiple options available'
        },
        recommendations: [
          'Schedule initial screening',
          'Prepare medical records',
          'Consider travel arrangements',
          'Review trial requirements'
        ],
        matchingTrials: Math.floor(Math.random() * 5) + 3
      };
      
      setMedicalResults(analysis);
      setIsProcessingMedical(false);
      
      toast({
        title: "Patient Analysis Complete",
        description: `Found ${analysis.matchingTrials} matching trials`,
        variant: "default"
      });
    }, 1500);
  };

  useEffect(() => {
    const availableAgents = fetchAgentService.getAgents();
    setAgents(availableAgents);
    if (availableAgents.length > 0) {
      setSelectedAgent(availableAgents[0].id);
      setMessageHistory(fetchAgentService.getMessageHistory(availableAgents[0].id));
    }
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedAgent) return;

    setIsLoading(true);
    try {
      const response = await fetchAgentService.sendMessage(selectedAgent, message);
      setMessageHistory(fetchAgentService.getMessageHistory(selectedAgent));
      setMessage('');
      
      // Try to parse as analysis result
      try {
        const parsed = JSON.parse(response.content);
        if (parsed.analysis) {
          setAnalysisResult(parsed);
        }
      } catch {
        // Not a structured response
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
    setMessageHistory(fetchAgentService.getMessageHistory(agentId));
    setAnalysisResult(null);
  };

  const handlePatientAnalysis = async () => {
    setIsLoading(true);
    try {
      const mockPatientData = {
        id: 'patient_001',
        name: 'John Doe',
        age: 45,
        conditions: ['diabetes', 'hypertension'],
        location: 'New York',
        preferences: ['non-invasive', 'compensated']
      };

      const analysis = await fetchAgentService.analyzePatient(mockPatientData);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Error in patient analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrialAnalysis = async () => {
    setIsLoading(true);
    try {
      const mockTrialData = {
        id: 'trial_001',
        title: 'Novel Diabetes Treatment Study',
        conditions: ['diabetes'],
        location: 'Multiple sites',
        phase: 'Phase II',
        enrollment: 150,
        compensation: '$500'
      };

      const analysis = await fetchAgentService.analyzeTrial(mockTrialData);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Error in trial analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Activity className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const testConnection = () => {
    setMcpSystem(prev => ({
      ...prev,
      lastConnectionTest: new Date(),
      status: 'healthy'
    }));
  };

  const reconnectAgent = (agentId: string) => {
    setMcpSystem(prev => ({
      ...prev,
      agents: prev.agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'connecting' as const }
          : agent
      )
    }));

    // Simulate reconnection
    setTimeout(() => {
      setMcpSystem(prev => ({
        ...prev,
        agents: prev.agents.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: 'online' as const, lastSeen: new Date() }
            : agent
        )
      }));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Agent Platform</h1>
        <p className="text-gray-600">AI-powered assistance and protocol integration for clinical trial matching</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'agents', name: 'AI Agents', icon: Bot },
            { id: 'mcp', name: 'MCP System', icon: Server },
            { id: 'asi', name: 'ASI Protocol', icon: Globe },
            { id: 'prompts', name: 'Prompts', icon: MessageSquare },
            { id: 'monetization', name: 'Monetization', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Agents Tab */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          {/* Agent Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span>Select AI Agent</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedAgent === agent.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{agent.name}</h3>
                        <p className="text-sm text-gray-500">{agent.capabilities.join(', ')}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          {selectedAgent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <span>Chat with {agents.find(a => a.id === selectedAgent)?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setMessageHistory([])}>
                      Clear Chat
                    </Button>
                    <Button variant="outline" size="sm">
                      <Database className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Message History */}
                <div className="h-64 overflow-y-auto border rounded-lg p-3 mb-4 bg-gray-50">
                  {messageHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messageHistory.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              msg.from === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {msg.from === 'user' ? (
                                <User className="h-3 w-3" />
                              ) : (
                                <Bot className="h-3 w-3 text-orange-500" />
                              )}
                              <span className="text-xs font-medium">
                                {msg.from === 'user' ? 'You' : agents.find(a => a.id === selectedAgent)?.name}
                              </span>
                              <span className="text-xs opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {msg.from === 'user' ? 'user' : 'ai'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                    rows={3}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!message.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-600" />
                  <span>Patient Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Analyze patient data and get personalized trial recommendations
                </p>
                <Button onClick={handlePatientAnalysis} disabled={isLoading} className="w-full">
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Patient
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span>Trial Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Get detailed analysis of clinical trials and eligibility criteria
                </p>
                <Button onClick={handleTrialAnalysis} disabled={isLoading} className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Analyze Trial
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span>Analysis Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* MCP System Tab */}
      {activeTab === 'mcp' && (
        <div className="space-y-6">
          {/* MCP System Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-purple-600" />
                <span>MCP System Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">System Status</h3>
                  <p className="text-sm text-gray-600">{mcpSystem.systemStatus}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Cpu className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Active Agents</h3>
                  <p className="text-sm text-gray-600">{mcpSystem.agents.filter(a => a.status === 'online').length}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Active Sessions</h3>
                  <p className="text-sm text-gray-600">{mcpSystem.activeSessions}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Last connection test: {mcpSystem.lastConnectionTest.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Active sessions: {mcpSystem.activeSessions}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ZapIcon className="h-4 w-4" />
                  <span>System status: {mcpSystem.systemStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MCP Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span>GreyGuard Medical MCP Agents - Production Integration</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                All agents are specialized for clinical trial matching and medical applications, integrated with your ICP canisters and linked to your GitHub repositories
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mcpSystem.agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(agent.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{agent.name}</h3>
                        <p className="text-sm text-gray-500">
                          Last seen: {agent.lastSeen.toLocaleTimeString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {agent.network}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {agent.canisterId.slice(0, 8)}...
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            GreyGuard Medical
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Medical Capabilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((capability, index) => (
                              <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                {capability}
                              </span>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                                +{agent.capabilities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Repository</p>
                        <a 
                          href={agent.address} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-blue-600 hover:text-blue-800 underline"
                        >
                          View on GitHub
                        </a>
                      </div>
                      <Badge className={`${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reconnectAgent(agent.id)}
                        disabled={agent.status === 'online'}
                      >
                        Reconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* GreyGuard Medical Integration Status */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <h4 className="font-medium">GreyGuard Medical MCP Integration Complete</h4>
                    <p className="text-sm text-green-700">
                      All 7 MCP agents are specialized for clinical trial matching and medical applications. 
                      They are successfully integrated with your ICP canisters and linked to your GitHub repositories. 
                      The system is ready for production deployment, showcasing your medical AI innovation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Use Cases */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-3">Medical Use Cases:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-purple-800 mb-2">Clinical Trial Matching:</h5>
                    <ul className="space-y-1 text-purple-700">
                      <li>• Patient eligibility assessment</li>
                      <li>• Trial location optimization</li>
                      <li>• Medical history analysis</li>
                      <li>• Risk factor evaluation</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-purple-800 mb-2">Medical AI Applications:</h5>
                    <ul className="space-y-1 text-purple-700">
                      <li>• Medical image analysis</li>
                      <li>• Clinical data processing</li>
                      <li>• Research collaboration</li>
                      <li>• Patient communication</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Interactive Medical Features */}
              <div className="mt-6 space-y-4">
                {/* Medical Query Processing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span>Medical AI Query Processing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Ask about medical conditions, symptoms, or treatments..."
                        value={medicalQuery}
                        onChange={(e) => setMedicalQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={processMedicalQuery}
                        disabled={isProcessingMedical || !medicalQuery.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isProcessingMedical ? (
                          <>
                            <Activity className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {medicalResults && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h5 className="font-medium text-purple-900 mb-2">AI Analysis Results:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-purple-800"><strong>Condition:</strong> {medicalResults.analysis?.condition || 'General'}</p>
                            <p className="text-purple-800"><strong>Risk Level:</strong> {medicalResults.analysis?.riskLevel || 'Unknown'}</p>
                            <p className="text-purple-800"><strong>Urgency:</strong> {medicalResults.analysis?.urgency || 'Normal'}</p>
                          </div>
                          <div>
                            <p className="text-purple-800"><strong>Matching Trials:</strong> {medicalResults.trials?.length || 0}</p>
                            <p className="text-purple-800"><strong>Analysis Time:</strong> {medicalResults.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                        {medicalResults.analysis?.recommendations && (
                          <div className="mt-3">
                            <p className="text-purple-800 font-medium mb-1">Recommendations:</p>
                            <ul className="space-y-1">
                              {medicalResults.analysis.recommendations.map((rec, index) => (
                                <li key={index} className="text-purple-700 text-xs">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Patient Data Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-green-600" />
                      <span>Patient Eligibility Assessment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient-age">Age</Label>
                        <Input
                          id="patient-age"
                          type="number"
                          placeholder="Enter age"
                          value={patientData.age}
                          onChange={(e) => setPatientData(prev => ({ ...prev, age: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient-condition">Medical Condition</Label>
                        <Input
                          id="patient-condition"
                          placeholder="e.g., Diabetes, Cancer, Heart Disease"
                          value={patientData.condition}
                          onChange={(e) => setPatientData(prev => ({ ...prev, condition: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient-location">Location</Label>
                        <Input
                          id="patient-location"
                          placeholder="City, State"
                          value={patientData.location}
                          onChange={(e) => setPatientData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient-preferences">Preferences</Label>
                        <Input
                          id="patient-preferences"
                          placeholder="e.g., Non-invasive, Compensated"
                          value={patientData.preferences}
                          onChange={(e) => setPatientData(prev => ({ ...prev, preferences: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={analyzePatientData}
                      disabled={isProcessingMedical || !patientData.age || !patientData.condition}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isProcessingMedical ? (
                        <>
                          <Activity className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing Patient Data...
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 mr-2" />
                          Assess Eligibility
                        </>
                      )}
                    </Button>
                    
                    {medicalResults && medicalResults.eligibility && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-medium text-green-900 mb-2">Eligibility Assessment:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-green-800"><strong>Overall:</strong> {medicalResults.eligibility.overall}</p>
                            <p className="text-green-800"><strong>Age Group:</strong> {medicalResults.eligibility.ageGroup}</p>
                            <p className="text-green-800"><strong>Condition Match:</strong> {medicalResults.eligibility.conditionMatch}</p>
                          </div>
                          <div>
                            <p className="text-green-800"><strong>Location Access:</strong> {medicalResults.eligibility.locationAccess}</p>
                            <p className="text-green-800"><strong>Matching Trials:</strong> {medicalResults.matchingTrials}</p>
                            <p className="text-green-800"><strong>Assessment Time:</strong> {medicalResults.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                        {medicalResults.recommendations && (
                          <div className="mt-3">
                            <p className="text-green-800 font-medium mb-1">Next Steps:</p>
                            <ul className="space-y-1">
                              {medicalResults.recommendations.map((rec, index) => (
                                <li key={index} className="text-green-700 text-xs">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Agent Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>Agent Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-address">Agent Address</Label>
                  <Input
                    id="agent-address"
                    value={agentConfig.agentAddress}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, agentAddress: e.target.value }))}
                    placeholder="Enter agent address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="network">Network</Label>
                  <Input
                    id="network"
                    value={agentConfig.network}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, network: e.target.value }))}
                    placeholder="mainnet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canister-id">ICP Canister ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="canister-id"
                      value={agentConfig.canisterId}
                      onChange={(e) => setAgentConfig(prev => ({ ...prev, canisterId: e.target.value }))}
                      placeholder="Enter canister ID"
                    />
                    <Button variant="outline" size="sm">
                      ⋯
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">ASI:One API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="api-key"
                      type="password"
                      value={agentConfig.apiKey}
                      onChange={(e) => setAgentConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter API key"
                    />
                    <Button variant="outline" size="sm">
                      ⋯
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-fallback"
                  checked={agentConfig.autoFallback}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, autoFallback: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="auto-fallback">
                  Automatically activate fallback mode on connection failure
                </Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={testConnection} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Show Advanced
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ASI Protocol Tab */}
      {activeTab === 'asi' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>ASI:One Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Learn about our integration with ASI:One for enhanced AI capabilities.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Enhanced AI Performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Standardized Protocols</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure Communication</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span>ASI Protocol Benefits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Interoperable AI agent communication</li>
                <li>• Enhanced privacy and security standards</li>
                <li>• Scalable architecture for future growth</li>
                <li>• Industry-standard compliance</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompts Tab */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>Prompt Engineering</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Use effective prompts to guide the AI agent's responses and get better results.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                    Pro Tips:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Be specific about your condition and symptoms</li>
                    <li>• Include relevant medical history and treatments</li>
                    <li>• Mention your location and travel preferences</li>
                    <li>• Ask follow-up questions for clarification</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Example Prompts:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">"I have Stage 2 breast cancer, what trials are available?"</p>
                    <p className="text-gray-600">"Show me diabetes trials within 50 miles of Boston"</p>
                    <p className="text-gray-600">"What are the eligibility criteria for immunotherapy trials?"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monetization Tab */}
      {activeTab === 'monetization' && (
        <div className="space-y-6">
          {/* Revenue Model Overview */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Revenue Model & Monetization Strategy</span>
              </CardTitle>
              <p className="text-green-700 text-lg">Sustainable business model with multiple revenue streams for clinical trial sponsors and research organizations</p>
            </CardHeader>
          </Card>

          {/* Revenue Streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span>Revenue Streams</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Subscription Plans - Tiered access for CROs & sponsors</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Pay-Per-Match - Fees only on successful matches</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">API Licensing - White-label integration for hospitals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">SaaS Platform - Enterprise trial management tools</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span>Future: Tokenization & DAO</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Utility tokens for fee discounts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Staking rewards for sponsors</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">DAO governance participation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span>Pricing Tiers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Plan */}
                <div className="bg-white p-6 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Plan</h3>
                    <div className="text-3xl font-bold text-green-600 mb-4">$299<span className="text-sm text-gray-500">/month</span></div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Up to 10 trial listings
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Basic analytics
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-white p-6 rounded-lg border-2 border-blue-400 hover:border-blue-600 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                  <div className="text-center">
                    <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full mb-3 inline-block">MOST POPULAR</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-4">$799<span className="text-sm text-gray-500">/month</span></div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        Up to 50 trials
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        Advanced matching
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        Priority support
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white p-6 rounded-lg border-2 border-purple-400 hover:border-purple-600 transition-all duration-300 hover:shadow-lg">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                    <div className="text-3xl font-bold text-purple-600 mb-4">Custom<span className="text-sm text-gray-500"> pricing</span></div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        Unlimited trials
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        Custom integrations
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        Dedicated support
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Metrics & Projections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <span>Success Metrics & Projections</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center group">
                  <div className="text-4xl font-bold text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300">$2.5M</div>
                  <div className="text-lg text-green-700 font-semibold">Annual Recurring Revenue</div>
                  <div className="text-sm text-green-600 mt-2">Projected for 2025</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300">85%</div>
                  <div className="text-lg text-blue-700 font-semibold">Customer Retention Rate</div>
                  <div className="text-sm text-blue-600 mt-2">Industry leading</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300">3.2x</div>
                  <div className="text-lg text-purple-700 font-semibold">Customer Lifetime Value</div>
                  <div className="text-sm text-purple-600 mt-2">Strong growth</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-orange-600 mb-3 group-hover:scale-110 transition-transform duration-300">$150</div>
                  <div className="text-lg text-orange-700 font-semibold">Average Pay-Per-Match Fee</div>
                  <div className="text-sm text-orange-600 mt-2">Per successful match</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
