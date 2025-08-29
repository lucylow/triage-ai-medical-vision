import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { enhancedAgentService } from "@/services/enhancedAgentService";
import { asiOneService, ASIStreamChunk } from "@/services/asiOneService";
import { ChatInput } from "./ChatInput";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Brain,
  Zap,
  Shield,
  MessageSquare,
  Clock,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Download,
  Share2,
  BookOpen,
  Target,
  Stethoscope,
  Heart,
  Pill,
  Paperclip,
  Globe,
  Search,
  Filter
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    thought?: string;
    intent?: string;
    confidence?: number;
    suggestedActions?: string[];
  };
}

interface EnhancedAgentChatProps {
  onProfileSubmit?: (data: any) => void;
  onTrialMatch?: (data: any) => void;
  onConsentUpdate?: (data: any) => void;
  fallbackMode?: boolean;
  mockData?: any;
}

export const EnhancedAgentChat: React.FC<EnhancedAgentChatProps> = ({
  onProfileSubmit,
  onTrialMatch,
  onConsentUpdate,
  fallbackMode = false,
  mockData
}) => {
  // State Management
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your GreyGuard Trials AI assistant powered by ASI:One. I can help you find clinical trials, explain medical terms, and guide you through the matching process. How can I assist you today?",
      timestamp: new Date(),
      metadata: {
        intent: 'greeting',
        confidence: 1.0,
        suggestedActions: ['search_trials', 'explain_terms', 'check_eligibility']
      }
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [agentStatus, setAgentStatus] = useState({
    connected: false,
    fallbackMode: false,
    activeSessions: 0
  });

  // UI State
  const [showThoughts, setShowThoughts] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chatMode, setChatMode] = useState<'general' | 'trial_search' | 'medical_help' | 'eligibility'>('general');
  const [activeMode, setActiveMode] = useState<'web' | 'agent' | 'filter'>('web');

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamAbortController = useRef<AbortController | null>(null);

  // Initialize agent service
  useEffect(() => {
    initializeAgent();
    checkAgentHealth();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize agent and session
  const initializeAgent = async () => {
    try {
      const response = await enhancedAgentService.initializeSession(
        "Hello, I'm looking for clinical trial assistance",
        "clinical_trial_matching"
      );
      
      if (response.success && response.session_id) {
        setCurrentSessionId(response.session_id);
        setAgentStatus(enhancedAgentService.getAgentStatus());
      }
    } catch (error) {
      console.error('Failed to initialize agent:', error);
    }
  };

  // Check agent health
  const checkAgentHealth = async () => {
    try {
      const asiConnected = await asiOneService.checkHealth();
      const agentConnected = await enhancedAgentService.testConnection();
      
      setAgentStatus({
        connected: agentConnected || asiConnected,
        fallbackMode: !(agentConnected || asiConnected),
        activeSessions: enhancedAgentService.getAgentStatus().activeSessions
      });
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  // Send message with ASI:One integration
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      // Analyze message intent
      const analysis = await enhancedAgentService.analyzeMessage(input.trim());
      
      // Create system message based on intent
      const systemMessage = createSystemMessage(analysis.intent);
      
      // Prepare messages for ASI:One
      const apiMessages = asiOneService.formatMessagesForAPI([
        systemMessage,
        ...messages.slice(-5), // Last 5 messages for context
        userMessage
      ]);

      // Get streaming response from ASI:One
      const chunks = await asiOneService.createChatCompletion(apiMessages, {
        temperature: 0.7,
        stream: true
      });

      // Process streaming chunks
      let fullContent = '';
      let thoughts: string[] = [];

      for (const chunk of chunks) {
        if (chunk.type === 'content' && chunk.content) {
          fullContent += chunk.content;
          setStreamingContent(fullContent);
        } else if (chunk.type === 'thought' && chunk.thought) {
          thoughts.push(chunk.thought);
        }
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
        metadata: {
          thought: thoughts.join(' '),
          intent: analysis.intent,
          confidence: analysis.confidence,
          suggestedActions: analysis.suggestedActions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Handle specific intents
      if (analysis.intent === 'trial_search') {
        onTrialMatch?.({
          query: input.trim(),
          response: fullContent,
          analysis
        });
      }

    } catch (error) {
      console.error('Message sending failed:', error);
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
        metadata: {
          intent: 'error',
          confidence: 0,
          suggestedActions: ['retry', 'contact_support']
        }
      };

      setMessages(prev => [...prev, fallbackMessage]);
      await asiOneService.handleAPIError(error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  // Create system message based on intent
  const createSystemMessage = (intent: string) => {
    const basePrompt = "You are a GreyGuard Trials AI assistant, an expert in clinical trial matching and medical information. You help patients find relevant clinical trials, explain medical terms, and guide them through the process.";
    
    const intentPrompts = {
      trial_search: "Focus on helping the user find relevant clinical trials. Ask clarifying questions about symptoms, location, and preferences. Provide specific guidance on what to look for.",
      medical_help: "Provide clear, accurate medical information in simple terms. Always recommend consulting healthcare providers for medical decisions.",
      eligibility: "Help assess trial eligibility based on the information provided. Be honest about uncertainties and suggest what additional information might be needed.",
      general: "Provide helpful, informative responses about clinical trials and healthcare. Be encouraging and supportive."
    };

    return {
      role: 'system' as const,
      content: `${basePrompt} ${intentPrompts[intent as keyof typeof intentPrompts] || intentPrompts.general}`
    };
  };

  // Quick action buttons
  const quickActions = [
    {
      label: 'Find Clinical Trials',
      icon: Target,
      action: () => {
        setInput('I need help finding clinical trials for my condition');
        setChatMode('trial_search');
      }
    },
    {
      label: 'Explain Medical Terms',
      icon: BookOpen,
      action: () => {
        setInput('Can you explain some medical terminology?');
        setChatMode('medical_help');
      }
    },
    {
      label: 'Check Eligibility',
      icon: Stethoscope,
      action: () => {
        setInput('I want to check if I qualify for a specific trial');
        setChatMode('eligibility');
      }
    },
    {
      label: 'Medical History Help',
      icon: Heart,
      action: () => {
        setInput('How should I prepare my medical history for trial applications?');
        setChatMode('general');
      }
    }
  ];

  // Voice input simulation (placeholder for actual implementation)
  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    toast({
      title: isListening ? "Voice Input Stopped" : "Voice Input Started",
      description: isListening ? "Voice input has been disabled" : "Voice input is now active. Speak clearly.",
    });
  };

  // Export chat history
  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `greenguard-chat-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Chat Exported",
      description: "Your chat history has been exported successfully.",
    });
  };

  // Clear chat
  const clearChat = () => {
    setMessages([messages[0]]); // Keep welcome message
    toast({
      title: "Chat Cleared",
      description: "Chat history has been cleared. Welcome message preserved.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="h-6 w-6 text-primary" />
              {agentStatus.connected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">AI Agent Chat</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant={agentStatus.fallbackMode ? "secondary" : "default"}>
                  {agentStatus.fallbackMode ? "Fallback Mode" : "ASI:One Active"}
                </Badge>
                <span>•</span>
                <span>{agentStatus.activeSessions} active sessions</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThoughts(!showThoughts)}
              className="h-8 w-8 p-0"
            >
              <Brain className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkAgentHealth}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportChat}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Quick Actions */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={action.action}
              className="h-8 text-xs"
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Message Metadata */}
                {message.metadata && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      
                      {message.metadata.intent && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {message.metadata.intent}
                          </Badge>
                        </>
                      )}
                      
                      {message.metadata.confidence && (
                        <>
                          <span>•</span>
                          <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                        </>
                      )}
                    </div>
                    
                    {/* Thoughts (when enabled) */}
                    {showThoughts && message.metadata.thought && (
                      <div className="bg-grey-50 border border-grey-200 rounded p-2">
                        <div className="flex items-center space-x-1 mb-1">
                          <Brain className="h-3 w-3 text-grey-600" />
                          <span className="text-grey-800 font-medium">AI Thought Process:</span>
                        </div>
                        <p className="text-grey-700 text-xs">{message.metadata.thought}</p>
                      </div>
                    )}
                    
                    {/* Suggested Actions */}
                    {message.metadata.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {message.metadata.suggestedActions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="sm"
                            className="h-5 text-xs p-1"
                            onClick={() => setInput(`I'd like to ${action.replace('_', ' ')}`)}
                          >
                            {action.replace('_', ' ')}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Streaming Message */}
          {isStreaming && streamingContent && (
            <div className="flex space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="p-3 rounded-lg bg-muted max-w-[80%]">
                  <p className="text-sm whitespace-pre-wrap">
                    {streamingContent}
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading Indicator */}
          {isLoading && !isStreaming && (
            <div className="flex space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="p-3 rounded-lg bg-muted max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Enhanced Input Area - Using Reusable Component */}
      <div className="p-4">
        <ChatInput
          placeholder="Ask anything to ASI:One or use @handle to reach an agent directly"
          onSubmit={sendMessage}
          onFileAttach={() => toast({ title: "File attachment", description: "File attachment feature coming soon!" })}
          onWebSearch={() => toast({ title: "Web search", description: "Web search mode activated" })}
          onAgentSearch={() => toast({ title: "Agent search", description: "Agent search mode activated" })}
          onFilter={() => toast({ title: "Filter", description: "Filter and settings opened" })}
          onVoiceToggle={toggleVoiceInput}
          isListening={isListening}
          modelName="ASI1-mini"
          disabled={isLoading}
        />
        
        {/* Status Bar */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              <span>Audio {isMuted ? 'Off' : 'On'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span>{messages.length} messages</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>ASI:One {agentStatus.connected ? 'Connected' : 'Fallback'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
