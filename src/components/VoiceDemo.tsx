import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Brain,
  Activity,
  Settings,
  Languages,
  Zap,
  Sparkles,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { VoiceInterface } from './medical/VoiceInterface';
import VoiceService, { VoiceSettings } from '../services/voiceService';

interface VoiceDemoProps {
  className?: string;
}

interface ConversationTurn {
  id: string;
  timestamp: Date;
  type: 'user' | 'agent';
  content: string;
  audioUrl?: string;
  processingTime?: number;
  model?: string;
  confidence?: number;
}

export const VoiceDemo: React.FC<VoiceDemoProps> = ({ className }) => {
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAgentResponse, setCurrentAgentResponse] = useState<string>('');
  const [voiceService] = useState(() => VoiceService.getInstance());
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalTurns: 0,
    averageResponseTime: 0,
    successRate: 100,
    languagesUsed: new Set<string>(),
    modelsUsed: new Set<string>()
  });

  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Update performance metrics
  useEffect(() => {
    if (conversation.length > 0) {
      const totalTurns = conversation.length;
      const responseTimes = conversation
        .filter(turn => turn.processingTime)
        .map(turn => turn.processingTime!);
      
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;

      const successRate = conversation.filter(turn => turn.content).length / totalTurns * 100;
      
      const languagesUsed = new Set(conversation.map(turn => 'en-US')); // Default for demo
      const modelsUsed = new Set(conversation.map(turn => turn.model).filter(Boolean));

      setPerformanceMetrics({
        totalTurns,
        averageResponseTime,
        successRate,
        languagesUsed,
        modelsUsed
      });
    }
  }, [conversation]);

  const handleTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;

    const userTurn: ConversationTurn = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'user',
      content: transcript,
      processingTime: 0
    };

    setConversation(prev => [...prev, userTurn]);
    setIsProcessing(true);

    // Simulate agent processing
    setTimeout(() => {
      const agentResponse = generateAgentResponse(transcript);
      const agentTurn: ConversationTurn = {
        id: (Date.now() + 1).toString(),
        timestamp: new Date(),
        type: 'agent',
        content: agentResponse,
        processingTime: Math.random() * 2000 + 500, // 500-2500ms
        model: 'greyguard-agent-v1'
      };

      setConversation(prev => [...prev, agentTurn]);
      setCurrentAgentResponse(agentResponse);
      setIsProcessing(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAgentResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('diabetes') || input.includes('diabetic')) {
      return "I found 15 clinical trials for diabetes management. The closest match is a Phase 3 study at Johns Hopkins testing a new oral medication. Would you like me to provide more details about eligibility criteria and locations?";
    } else if (input.includes('cancer') || input.includes('oncology')) {
      return "I've identified 23 cancer treatment trials. There's a promising immunotherapy study at MD Anderson Cancer Center for advanced melanoma. The trial is currently recruiting and covers treatment costs. Should I schedule a consultation?";
    } else if (input.includes('heart') || input.includes('cardiac')) {
      return "I found 18 cardiovascular trials. There's an exciting stem cell therapy study for heart failure at Cleveland Clinic. It's a Phase 2 trial with promising early results. Would you like to learn about the inclusion criteria?";
    } else if (input.includes('autoimmune') || input.includes('rheumatoid')) {
      return "I've located 12 autoimmune disorder trials. There's a breakthrough biologic therapy study for rheumatoid arthritis at Mayo Clinic. The trial includes comprehensive care and monitoring. Should I connect you with the research team?";
    } else if (input.includes('hello') || input.includes('hi')) {
      return "Hello! I'm your GreyGuard AI assistant, specialized in clinical trial matching. I can help you find relevant medical research studies based on your condition, location, and preferences. What type of trials are you looking for?";
    } else {
      return "I understand you're interested in clinical trials. To provide the best matches, could you tell me more about your specific medical condition, any previous treatments, and your preferred location? I'm here to help find the right research opportunities for you.";
    }
  };

  const handleAudioResponse = (audioUrl: string) => {
    // Handle audio response from TTS
    console.log('Audio response received:', audioUrl);
  };

  const clearConversation = () => {
    setConversation([]);
    setCurrentAgentResponse('');
  };

  const exportConversation = () => {
    const conversationData = {
      timestamp: new Date().toISOString(),
      conversation: conversation.map(turn => ({
        ...turn,
        timestamp: turn.timestamp.toISOString()
      })),
      performanceMetrics
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-conversation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "✅ Conversation exported",
      description: "Your voice conversation has been saved"
    });
  };

  const toggleAdvancedFeatures = () => {
    setShowAdvancedFeatures(!showAdvancedFeatures);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Voice AI Demo</h1>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience cutting-edge multimodal AI interaction with seamless speech-to-text → agent processing → text-to-speech capabilities
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Gemini AI Integration
          </Badge>
                      <Badge variant="outline" className="bg-grey-50 text-grey-700 border-grey-200">
            <Target className="h-3 w-3 mr-1" />
            Real-time Processing
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Activity className="h-3 w-3 mr-1" />
            Multi-language Support
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Interface */}
        <div className="lg:col-span-1">
          <VoiceInterface
            onTranscript={handleTranscript}
            onAudioResponse={handleAudioResponse}
            agentResponse={currentAgentResponse}
            isProcessing={isProcessing}
          />
        </div>

        {/* Conversation Display */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Voice Conversation
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={clearConversation}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear
                  </Button>
                  <Button
                    onClick={exportConversation}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conversation.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start speaking to begin your conversation</p>
                  <p className="text-sm">Try saying: "Hello, I'm looking for diabetes trials"</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversation.map((turn) => (
                    <div
                      key={turn.id}
                      className={`flex gap-3 ${
                        turn.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {turn.type === 'agent' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          turn.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{turn.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                          <Clock className="h-3 w-3" />
                          {turn.timestamp.toLocaleTimeString()}
                          {turn.processingTime && (
                            <>
                              <span>•</span>
                              <span>{turn.processingTime}ms</span>
                            </>
                          )}
                          {turn.model && (
                            <>
                              <span>•</span>
                              <span>{turn.model}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {turn.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mic className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          <span className="text-sm text-muted-foreground">
                            Agent is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={conversationEndRef} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {performanceMetrics.totalTurns}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Turns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.averageResponseTime.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-grey-600">
                    {performanceMetrics.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {performanceMetrics.languagesUsed.size}
                  </div>
                  <div className="text-sm text-muted-foreground">Languages</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Advanced Features
            </div>
            <Button
              onClick={toggleAdvancedFeatures}
              size="sm"
              variant="outline"
            >
              {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced
            </Button>
          </CardTitle>
        </CardHeader>
        {showAdvancedFeatures && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language Support */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Multi-language Support
                </h4>
                <div className="space-y-2">
                  {voiceService.getAvailableLanguages().slice(0, 5).map((lang) => (
                    <div key={lang.code} className="flex items-center justify-between text-sm">
                      <span>{lang.name}</span>
                      <Badge variant="outline" size="sm">
                        {lang.code}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Types */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Voice Customization
                </h4>
                <div className="space-y-2">
                  {voiceService.getAvailableVoiceTypes().map((voice) => (
                    <div key={voice.id} className="text-sm">
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {voice.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Technical Details */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Technical Implementation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">Speech Recognition</div>
                  <div className="text-muted-foreground">
                    • Gemini AI API (primary)<br/>
                    • Web Speech API (fallback)<br/>
                    • Real-time transcription
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Natural Language Processing</div>
                  <div className="text-muted-foreground">
                    • Intent classification<br/>
                    • Entity extraction<br/>
                    • Context management
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Text-to-Speech</div>
                  <div className="text-muted-foreground">
                    • Gemini AI integration<br/>
                    • Voice customization<br/>
                    • Multi-language support
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Demo Instructions */}
      <Card className="bg-gradient-to-r from-grey-50 to-grey-100 border-grey-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-grey-800">
            <Zap className="h-5 w-5" />
            Demo Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold mb-2 text-grey-700">Try These Phrases:</h5>
              <ul className="space-y-1 text-grey-600">
                <li>• "Hello, I'm looking for diabetes trials"</li>
                <li>• "I need cancer treatment studies"</li>
                <li>• "What heart disease trials are available?"</li>
                <li>• "Show me autoimmune disorder research"</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2 text-grey-700">Features to Demo:</h5>
              <ul className="space-y-1 text-grey-600">
                <li>• Real-time speech recognition</li>
                <li>• AI agent processing</li>
                <li>• Multi-language support</li>
                <li>• Voice customization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Missing Download icon component
const Download = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
