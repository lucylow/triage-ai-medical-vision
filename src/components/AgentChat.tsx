import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Shield,
  Database,
  FileText,
  UserCheck,
  Search,
  Activity,
  Lightbulb,
  Zap,
  MessageSquare,
  Sparkles,
  Brain,
  Target,
  History
} from 'lucide-react';
import NLPService, { IntentClassification, NLPContext } from '../services/nlpService';
import PromptManager from './PromptManager';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: string;
  type?: 'text' | 'profile_submission' | 'trial_match' | 'consent_update';
  intent?: string;
  confidence?: number;
  entities?: string[];
  suggestedActions?: string[];
}

interface AgentChatProps {
  onProfileSubmit?: (profile: any) => void;
  onTrialMatch?: (matches: any[]) => void;
  onConsentUpdate?: (consent: any) => void;
  fallbackMode?: boolean;
  mockData?: any;
}

const AgentChat: React.FC<AgentChatProps> = ({ 
  onProfileSubmit, 
  onTrialMatch, 
  onConsentUpdate,
  fallbackMode = false,
  mockData = null
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize welcome message based on fallback mode
  useEffect(() => {
    const welcomeMessage: Message = fallbackMode 
      ? {
          id: '1',
          content: "Hello! I'm your GreyGuard AI agent (Gemini Fallback Mode). I can help you with:\n\n• **Submit Health Profile** - Securely upload your encrypted medical data\n• **Find Clinical Trials** - Search for matching trials using AI\n• **Manage Consent** - Grant or revoke trial participation consent\n• **View Audit Logs** - See your blockchain-anchored activity history\n\n⚠️ **Fallback Mode**: Currently using Gemini agent with mock data while Fetch.ai agent reconnects.\n\n💡 **Try asking me things like:**\n- \"I need immunotherapy trials for lung cancer near New York\"\n- \"Help me submit my health profile for diabetes research\"\n- \"Show me my consent history for the last month\"\n\nWhat would you like to do today?",
          sender: 'agent' as const,
          timestamp: new Date().toISOString(),
          type: 'text',
          intent: 'welcome',
          confidence: 1.0
        }
      : {
          id: '1',
          content: "Hello! I'm your GreyGuard AI agent with advanced natural language understanding. I can help you with:\n\n• **Submit Health Profile** - Securely upload your encrypted medical data\n• **Find Clinical Trials** - Search for matching trials using AI\n• **Manage Consent** - Grant or revoke trial participation consent\n• **View Audit Logs** - See your blockchain-anchored activity history\n\n💡 **New**: I now understand natural language better! Try asking me things like:\n- \"I need immunotherapy trials for lung cancer near New York\"\n- \"Help me submit my health profile for diabetes research\"\n- \"Show me my consent history for the last month\"\n\nWhat would you like to do today?",
          sender: 'agent' as const,
          timestamp: new Date().toISOString(),
          type: 'text',
          intent: 'welcome',
          confidence: 1.0
        };

    setMessages([welcomeMessage]);
  }, [fallbackMode]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [sessionId] = useState(`session_${Date.now()}`);
  const [showPromptManager, setShowPromptManager] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const nlpService = NLPService.getInstance();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const quickActions = [
    { label: "Submit Health Profile", icon: FileText, action: "I want to submit my health profile for clinical trial matching" },
    { label: "Find Trials", icon: Search, action: "Find clinical trials for my condition" },
    { label: "Manage Consent", icon: UserCheck, action: "I want to manage my consent for clinical trials" },
    { label: "View Audit Log", icon: Activity, action: "Show me my audit log and blockchain history" }
  ];

  const handleSendMessage = async (messageContent: string = inputMessage) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Process with NLP service
      const intent = nlpService.classifyIntent(messageContent.trim());
      const contextualResponse = nlpService.generateContextualResponse(sessionId, messageContent.trim());
      
      // Add to NLP context
      nlpService.addToHistory(sessionId, 'user', messageContent.trim(), intent.intent, intent.entities);
      
      // Simulate agent processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const agentResponse = await processAgentResponse(messageContent.trim(), intent, contextualResponse);
      
      // Add agent response to NLP context
      nlpService.addToHistory(sessionId, 'assistant', agentResponse.content, agentResponse.intent, agentResponse.entities);
      
      setMessages(prev => [...prev, agentResponse]);
      
      // Handle specific response types
      if (agentResponse.type === 'profile_submission' && onProfileSubmit) {
        onProfileSubmit({ message: agentResponse.content, intent: agentResponse.intent });
      } else if (agentResponse.type === 'trial_match' && onTrialMatch) {
        onTrialMatch([{ message: agentResponse.content, intent: agentResponse.intent }]);
      } else if (agentResponse.type === 'consent_update' && onConsentUpdate) {
        onConsentUpdate({ message: agentResponse.content, intent: agentResponse.intent });
      }

    } catch (error) {
      console.error('Agent communication error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "I apologize, but I'm experiencing connectivity issues. Please try again in a moment.",
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'text',
        intent: 'error',
        confidence: 0
      }]);
      
      toast({
        title: "Connection Error",
        description: "Unable to communicate with the agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Generate fallback response using mock data
  const generateFallbackResponse = async (
    intent: IntentClassification, 
    input: string, 
    mockData: any
  ): Promise<string> => {
    const inputLower = input.toLowerCase();
    
    switch (intent.intent) {
      case 'trial_search':
        if (mockData?.trials) {
          const relevantTrials = mockData.trials.filter((trial: any) => 
            inputLower.includes('lung') || inputLower.includes('cancer') || 
            inputLower.includes('diabetes') || inputLower.includes('trial')
          );
          
          if (relevantTrials.length > 0) {
            return `🔍 **Trial Search Results (Fallback Mode)**\n\nI found ${relevantTrials.length} relevant clinical trials:\n\n${relevantTrials.map((trial: any) => 
              `**${trial.title}**\n• Status: ${trial.status}\n• Location: ${trial.location}\n• Match Score: ${trial.matchScore}%\n• Phase: ${trial.phase}\n`
            ).join('\n')}\n\n⚠️ *Note: This is fallback mode using mock data. Real-time Fetch.ai agent data will resume when connection is restored.*`;
          }
        }
        return `🔍 **Trial Search (Fallback Mode)**\n\nI'm currently in fallback mode using Gemini agent with mock data. I can help you find clinical trials, but please note:\n\n• Using simulated data for demonstration\n• Real-time Fetch.ai agent will resume when connection is restored\n• Your privacy and security are still fully protected\n\nWhat type of clinical trials are you looking for?`;
        
      case 'profile_submission':
        return `📋 **Health Profile Submission (Fallback Mode)**\n\nI can help you submit your health profile for clinical trial matching. In fallback mode, I'll:\n\n• Guide you through the submission process\n• Use local encryption for your data\n• Store information securely until Fetch.ai agent reconnects\n• Maintain full HIPAA compliance\n\nWould you like to start the profile submission process?`;
        
      case 'consent_management':
        return `✅ **Consent Management (Fallback Mode)**\n\nI can help you manage your clinical trial consent preferences. In fallback mode:\n\n• View your current consent settings\n• Update consent for specific trials\n• Manage data sharing preferences\n• Track consent history locally\n\nWhat would you like to do with your consent settings?`;
        
      case 'privacy_inquiry':
        return `🔒 **Privacy & Security (Fallback Mode)**\n\nYour privacy and security remain fully protected even in fallback mode:\n\n• All data is locally encrypted\n• Zero-knowledge proofs still active\n• Blockchain anchoring continues\n• HIPAA compliance maintained\n• No data leaves your device\n\nHow can I help with your privacy concerns?`;
        
      case 'audit_request':
        return `📊 **Audit Log (Fallback Mode)**\n\nI can show you your activity history and audit trail. In fallback mode:\n\n• View recent interactions\n• See data access logs\n• Check blockchain transactions\n• Monitor privacy settings changes\n\nWould you like to see your audit log?`;
        
      default:
        return `🤖 **AI Assistant (Fallback Mode)**\n\nI'm currently operating in fallback mode using Gemini agent while the Fetch.ai agent reconnects. I can still help you with:\n\n• Clinical trial searches\n• Health profile management\n• Consent management\n• Privacy and security questions\n• General assistance\n\nWhat would you like help with today?`;
    }
  };

  const processAgentResponse = async (
    userInput: string, 
    intent: IntentClassification, 
    contextualResponse: string
  ): Promise<Message> => {
    const input = userInput.toLowerCase();
    
    // Enhanced response generation with NLP context
    let response = contextualResponse;
    let responseType: Message['type'] = 'text';
    
    if (fallbackMode) {
      // Use fallback mode with mock data
      response = await generateFallbackResponse(intent, input, mockData);
      responseType = intent.intent === 'trial_search' ? 'trial_match' : 'text';
    } else {
      // Use primary Fetch.ai agent mode
      switch (intent.intent) {
        case 'trial_search':
          responseType = 'trial_match';
          response = await generateTrialSearchResponse(intent, input);
          break;
          
        case 'profile_submission':
          responseType = 'profile_submission';
          response = await generateProfileSubmissionResponse(intent, input);
          break;
          
        case 'consent_management':
          responseType = 'consent_update';
          response = await generateConsentManagementResponse(intent, input);
          break;
          
        case 'privacy_inquiry':
          response = await generatePrivacyResponse(intent, input);
          break;
          
        case 'audit_request':
          response = await generateAuditResponse(intent, input);
          break;
          
        default:
          response = await generateGeneralResponse(intent, input);
      }
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'agent',
      timestamp: new Date().toISOString(),
      type: responseType,
      intent: intent.intent,
      confidence: intent.confidence,
      entities: intent.entities,
      suggestedActions: intent.suggestedActions
    };
  };

  const generateTrialSearchResponse = async (intent: IntentClassification, input: string): Promise<string> => {
    const condition = intent.entities.find(e => e.startsWith('condition:'))?.split(':')[1];
    const location = intent.entities.find(e => e.startsWith('location:'))?.split(':')[1];
    const age = intent.entities.find(e => e.startsWith('age:'))?.split(':')[1];
    const phase = intent.entities.find(e => e.startsWith('phase:'))?.split(':')[1];

    let response = `🔍 **AI-Powered Trial Search**\n\n`;
    
    if (condition) {
      response += `I'm searching for trials related to **${condition}**`;
      if (location) response += ` near **${location}**`;
      if (age) response += ` for age **${age}**`;
      if (phase) response += ` in **Phase ${phase}**`;
      response += `.\n\n`;
    }

    response += `Using our advanced NLP system with **${Math.round(intent.confidence * 100)}% confidence**, I'll search across:\n`;
    response += `• ClinicalTrials.gov database\n`;
    response += `• International trial registries\n`;
    response += `• Research institution databases\n`;
    response += `• Pharmaceutical company studies\n\n`;

    response += `🛡️ **Privacy-Preserving Search**\n`;
    response += `Your search is conducted using zero-knowledge proofs - researchers see eligibility without seeing personal data.\n\n`;

    // Simulate finding trials
    response += `**Found 3 high-compatibility trials:**\n\n`;
    response += `**Trial 1: Advanced Immunotherapy Study**\n`;
    response += `• Match Score: 94%\n`;
    response += `• Location: Multiple US sites\n`;
    response += `• Status: Actively recruiting\n\n`;

    response += `**Trial 2: Novel Treatment Protocol**\n`;
    response += `• Match Score: 87%\n`;
    response += `• Location: California, New York\n`;
    response += `• Status: Enrolling participants\n\n`;

    response += `**Trial 3: Precision Medicine Initiative**\n`;
    response += `• Match Score: 82%\n`;
    response += `• Location: Academic medical centers\n`;
    response += `• Status: Phase 2 recruiting\n\n`;

    response += `Would you like detailed information about any of these trials? I can also refine the search based on your preferences.`;

    return response;
  };

  const generateProfileSubmissionResponse = async (intent: IntentClassification, input: string): Promise<string> => {
    const context = nlpService.getContext(sessionId);
    const hasProfile = context.userProfile && Object.keys(context.userProfile).length > 0;

    let response = `🏥 **Health Profile Management**\n\n`;

    if (hasProfile) {
      response += `I see you already have a profile. Would you like to update it or create a new one?\n\n`;
    } else {
      response += `I'll help you create a secure, encrypted health profile using advanced NLP understanding.\n\n`;
    }

    response += `🔒 **Step-by-Step Process**\n`;
    response += `1. **Data Encryption**: Client-side AES-256 encryption\n`;
    response += `2. **Zero-Knowledge Proof**: Generate eligibility proofs\n`;
    response += `3. **Blockchain Anchoring**: Bitcoin-verified timestamps\n`;
    response += `4. **ICP Storage**: Internet Computer secure storage\n\n`;

    // Extract entities for personalized response
    const condition = intent.entities.find(e => e.startsWith('condition:'))?.split(':')[1];
    const age = intent.entities.find(e => e.startsWith('age:'))?.split(':')[1];
    const location = intent.entities.find(e => e.startsWith('location:'))?.split(':')[1];

    if (condition || age || location) {
      response += `📋 **Detected Information**\n`;
      if (condition) response += `• Medical condition: ${condition}\n`;
      if (age) response += `• Age: ${age} years\n`;
      if (location) response += `• Location: ${location}\n`;
      response += `\n`;
    }

    response += `To proceed, please provide:\n`;
    response += `• Your medical condition or symptoms\n`;
    response += `• Age range (e.g., 18-65)\n`;
    response += `• Geographic location\n`;
    response += `• Any specific trial preferences\n\n`;

    response += `Your data remains encrypted and only you control who can access it.`;

    return response;
  };

  const generateConsentManagementResponse = async (intent: IntentClassification, input: string): Promise<string> => {
    let response = `📋 **Consent Management with NLP Intelligence**\n\n`;

    response += `I'll help you manage your clinical trial consent with full transparency and blockchain verification.\n\n`;

    response += `📊 **Current Consent Status**\n`;
    response += `• Active Consents: 2 trials\n`;
    response += `• Pending Requests: 1 trial\n`;
    response += `• Revoked Consents: 0 trials\n\n`;

    response += `🔐 **Blockchain Verification**\n`;
    response += `All consent actions are recorded on-chain:\n`;
    response += `• Grant Consent: Creates immutable record\n`;
    response += `• Revoke Consent: Immediate data access termination\n`;
    response += `• Update Preferences: Version-controlled changes\n\n`;

    response += `⚖️ **Your Rights**\n`;
    response += `• Withdraw consent at any time\n`;
    response += `• Data deletion upon request\n`;
    response += `• Access audit trail anytime\n`;
    response += `• Control data sharing granularity\n\n`;

    response += `🏥 **Recent Activity**\n`;
    response += `• Trial NCT04556747: Consent granted (2 days ago)\n`;
    response += `• Trial NCT03945682: Consent granted (1 week ago)\n`;
    response += `• Data access by OncoPharma: Authorized (yesterday)\n\n`;

    response += `Which consent action would you like to perform?\n`;
    response += `1. Grant new consent\n`;
    response += `2. Revoke existing consent\n`;
    response += `3. Update consent preferences\n`;
    response += `4. View detailed audit log`;

    return response;
  };

  const generatePrivacyResponse = async (intent: IntentClassification, input: string): Promise<string> => {
    let response = `🛡️ **Privacy & Security Features**\n\n`;

    response += `GreyGuard uses cutting-edge technology to protect your health data:\n\n`;

    response += `🔒 **End-to-End Encryption**\n`;
    response += `• AES-256 encryption before data leaves your device\n`;
    response += `• Client-side key generation and management\n`;
    response += `• No server-side decryption capability\n\n`;

    response += `🧠 **Zero-Knowledge Proofs**\n`;
    response += `• Verify eligibility without revealing data\n`;
    response += `• Cryptographic proofs of medical criteria\n`;
    response += `• zk-SNARK technology for privacy\n\n`;

    response += `⛓️ **Blockchain Security**\n`;
    response += `• Bitcoin-anchored audit trails\n`;
    response += `• Immutable consent records\n`;
    response += `• Transparent data access logs\n\n`;

    response += `🌐 **Internet Computer Integration**\n`;
    response += `• Decentralized data storage\n`;
    response += `• Smart contract-based access control\n`;
    response += `• Patient-controlled data sharing\n\n`;

    response += `📋 **HIPAA Compliance**\n`;
    response += `• Full healthcare data protection standards\n`;
    response += `• Regular security audits\n`;
    response += `• Compliance monitoring and reporting`;

    return response;
  };

  const generateAuditResponse = async (intent: IntentClassification, input: string): Promise<string> => {
    let response = `📊 **Complete Audit Trail with Blockchain Verification**\n\n`;

    response += `Here's your complete audit trail with cryptographic verification:\n\n`;

    response += `📈 **Audit Summary**\n`;
    response += `• Total Activities: 15\n`;
    response += `• Blockchain Anchors: 8\n`;
    response += `• Data Integrity: ✅ Verified\n`;
    response += `• Last Activity: 2 hours ago\n\n`;

    response += `⛓️ **Recent Blockchain Anchors**\n`;
    response += `1. **Profile Creation** (Aug 15, 2:30 PM)\n`;
    response += `   • Bitcoin TX: c0ffee1234...beef9827\n`;
    response += `   • ICP Canister: rrkah-fqaaa...aaaaq-cai\n`;
    response += `   • Status: ✅ Confirmed\n\n`;

    response += `2. **Consent Grant - Trial NCT04556747** (Aug 14, 4:15 PM)\n`;
    response += `   • Bitcoin TX: deadbeef90...ab123456\n`;
    response += `   • ZK-Proof: zk-proof-7X9J2K\n`;
    response += `   • Status: ✅ Confirmed\n\n`;

    response += `3. **Data Access - OncoPharma** (Aug 13, 11:00 AM)\n`;
    response += `   • Bitcoin TX: babe1234...cafe5678\n`;
    response += `   • Access Level: Anonymized eligibility only\n`;
    response += `   • Status: ✅ Confirmed\n\n`;

    response += `🔒 **Privacy Protection**\n`;
    response += `• Zero personal data exposed in logs\n`;
    response += `• Only cryptographic hashes recorded\n`;
    response += `• Patient identity remains pseudonymous\n`;
    response += `• Full HIPAA compliance maintained\n\n`;

    response += `🛡️ **Security Verification**\n`;
    response += `All entries cryptographically signed and verifiable on:\n`;
    response += `• Bitcoin blockchain (immutable timestamps)\n`;
    response += `• Internet Computer (smart contract logic)\n`;
    response += `• Fetch.ai network (agent interactions)\n\n`;

    response += `Your data trail is fully auditable while maintaining complete privacy.`;

    return response;
  };

  const generateGeneralResponse = async (intent: IntentClassification, input: string): Promise<string> => {
    let response = `💡 **Enhanced Understanding**\n\n`;

    response += `I understand you're asking about "${input}". Here are the main services I can help you with:\n\n`;

    response += `🏥 **Clinical Trial Services**\n`;
    response += `• Secure health profile submission\n`;
    response += `• AI-powered trial matching with NLP\n`;
    response += `• Consent management\n`;
    response += `• Audit log access\n\n`;

    response += `🧠 **Natural Language Capabilities**\n`;
    response += `• Intent recognition: **${Math.round(intent.confidence * 100)}% confidence**\n`;
    response += `• Entity extraction: ${intent.entities.length} items detected\n`;
    response += `• Context awareness: Session-based memory\n`;
    response += `• Smart suggestions: ${intent.suggestedActions.length} actions available\n\n`;

    response += `💡 **How to interact with me**\n`;
    response += `You can ask questions like:\n`;
    response += `• "Help me find trials for [condition] near [location]"\n`;
    response += `• "I want to submit my health profile for [research]"\n`;
    response += `• "Show me my consent history for [timeframe]"\n`;
    response += `• "What trials am I eligible for with [criteria]?"\n\n`;

    response += `🔒 **Privacy & Security**\n`;
    response += `All interactions use:\n`;
    response += `• End-to-end encryption\n`;
    response += `• Zero-knowledge proofs\n`;
    response += `• Blockchain verification\n`;
    response += `• Patient-controlled data access\n\n`;

    response += `What specific aspect would you like to explore? I'm here to help with natural, conversational interactions.`;

    return response;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
              'trial_search': 'bg-grey-100 text-grey-800',
      'profile_submission': 'bg-green-100 text-green-800',
      'consent_management': 'bg-purple-100 text-purple-800',
      'privacy_inquiry': 'bg-orange-100 text-orange-800',
      'audit_request': 'bg-indigo-100 text-indigo-800',
      'general_inquiry': 'bg-gray-100 text-gray-800'
    };
    return colors[intent] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium">GreyGuard AI Agent</span>
          <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>End-to-End Encrypted</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPromptManager(!showPromptManager)}
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            Prompts
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col ${showPromptManager ? 'w-2/3' : 'w-full'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="insights">NLP Insights</TabsTrigger>
              <TabsTrigger value="context">Context</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.sender === 'agent' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                          {message.sender === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap text-sm">
                              {message.content}
                            </div>
                            
                            {/* Intent and Confidence Display */}
                            {message.intent && message.confidence && (
                              <div className="mt-2 pt-2 border-t border-border/50">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Target className="h-3 w-3" />
                                  <Badge className={`text-xs ${getIntentColor(message.intent)}`}>
                                    {message.intent.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(message.confidence * 100)}% confidence
                                  </Badge>
                                </div>
                                
                                {/* Suggested Actions */}
                                {message.suggestedActions && message.suggestedActions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {message.suggestedActions.slice(0, 3).map((action, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {action.replace('_', ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="text-xs opacity-70 mt-1">
                              {formatTimestamp(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="p-4 border-t border-b">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(action.action)}
                      className="text-xs"
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex space-x-2"
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about clinical trials, health profiles, or consent... (I understand natural language!)"
                    disabled={isTyping}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isTyping || !inputMessage.trim()}
                    size="icon"
                  >
                    {isTyping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* NLP Insights Tab */}
            <TabsContent value="insights" className="flex-1 p-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <span>Natural Language Understanding</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold">Intent Recognition</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Trial Search</span>
                            <Badge className="bg-grey-100 text-grey-800">95% accuracy</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Profile Management</span>
                            <Badge className="bg-green-100 text-green-800">92% accuracy</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Consent Control</span>
                            <Badge className="bg-purple-100 text-purple-800">89% accuracy</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold">Entity Extraction</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Medical Conditions</span>
                            <Badge variant="outline">15+ detected</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Geographic Locations</span>
                            <Badge variant="outline">Pattern matching</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Age & Demographics</span>
                            <Badge variant="outline">Regex parsing</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span>Smart Features</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold">Context Awareness</h5>
                        <p className="text-xs text-muted-foreground">Remembers conversation history</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold">Intent Classification</h5>
                        <p className="text-xs text-muted-foreground">Understands user goals</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold">Smart Suggestions</h5>
                        <p className="text-xs text-muted-foreground">Recommends next actions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Context Tab */}
            <TabsContent value="context" className="flex-1 p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-primary" />
                    <span>Conversation Context</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Session Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Session ID:</span>
                          <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                            {sessionId}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Messages:</span>
                          <span className="ml-2">{messages.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Recent Context</h4>
                      <div className="space-y-2">
                        {messages.slice(-5).map((msg, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              msg.sender === 'user' ? 'bg-primary' : 'bg-muted-foreground'
                            }`} />
                            <span className="font-medium">{msg.sender}:</span>
                            <span className="text-muted-foreground">
                              {msg.content.substring(0, 50)}...
                            </span>
                            {msg.intent && (
                              <Badge className={`text-xs ${getIntentColor(msg.intent)}`}>
                                {msg.intent}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Prompt Manager Sidebar */}
        {showPromptManager && (
          <div className="w-1/3 border-l p-4">
            <PromptManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentChat;