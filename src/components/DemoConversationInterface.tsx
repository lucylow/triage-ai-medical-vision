import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  MessageSquare, 
  Bot, 
  User, 
  Play, 
  Pause, 
  RotateCcw, 
  Copy, 
  Download,
  Brain,
  Shield,
  Lock,
  Globe,
  Activity,
  Sparkles,
  BookOpen,
  Users,
  Zap,
  Target,
  Cpu,
  Database
} from 'lucide-react';
import { demoConversations, DemoConversation, DemoMessage, getAllCategories } from '../data/demoConversations';

interface DemoConversationInterfaceProps {
  className?: string;
}

export default function DemoConversationInterface({ className }: DemoConversationInterfaceProps) {
  const [selectedConversation, setSelectedConversation] = useState<DemoConversation | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showMetadata, setShowMetadata] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = getAllCategories();

  useEffect(() => {
    if (selectedConversation) {
      setCurrentMessageIndex(0);
      setIsPlaying(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (isPlaying && selectedConversation) {
      const timer = setTimeout(() => {
        if (currentMessageIndex < selectedConversation.messages.length - 1) {
          setCurrentMessageIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 2000 / playbackSpeed);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentMessageIndex, selectedConversation, playbackSpeed]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessageIndex]);

  const handlePlayPause = () => {
    if (selectedConversation) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setCurrentMessageIndex(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(content);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trial_matching':
        return <Target className="h-4 w-4" />;
      case 'privacy_inquiry':
        return <Shield className="h-4 w-4" />;
      case 'consent_management':
        return <Lock className="h-4 w-4" />;
      case 'technical_demo':
        return <Cpu className="h-4 w-4" />;
      case 'multilingual':
        return <Globe className="h-4 w-4" />;
      case 'audit_trail':
        return <Database className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trial_matching':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'privacy_inquiry':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consent_management':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'technical_demo':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'multilingual':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'audit_trail':
        return 'bg-grey-100 text-grey-800 border-grey-200';
      default:
        return 'bg-grey-100 text-grey-800 border-grey-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderMessage = (message: DemoMessage, index: number) => {
    const isVisible = index <= currentMessageIndex;
    const isAgent = message.role === 'agent';

    return (
      <div
        key={index}
        className={`flex space-x-3 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isAgent ? 'bg-grey-100' : 'bg-grey-200'
        }`}>
          {isAgent ? (
            <Bot className="h-4 w-4 text-grey-600" />
          ) : (
            <User className="h-4 w-4 text-grey-600" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className={`p-3 rounded-lg max-w-[80%] ${
            isAgent 
              ? 'bg-grey-50 border border-grey-200' 
              : 'bg-grey-100 border border-grey-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-grey-600">
                {isAgent ? 'GreyGuard AI Agent' : 'You'}
              </span>
              {message.timestamp && (
                <span className="text-xs text-grey-500">
                  {formatTimestamp(message.timestamp)}
                </span>
              )}
            </div>
            
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>

            {/* Metadata Display */}
            {showMetadata && message.metadata && (
              <div className="mt-3 pt-3 border-t border-grey-200 space-y-2">
                {message.metadata.intent && (
                  <div className="flex items-center gap-2 text-xs">
                    <Brain className="h-3 w-3 text-grey-500" />
                    <span className="text-grey-600">Intent: {message.metadata.intent}</span>
                  </div>
                )}
                
                {message.metadata.confidence && (
                  <div className="flex items-center gap-2 text-xs">
                    <Activity className="h-3 w-3 text-grey-500" />
                    <span className="text-grey-600">
                      Confidence: {(message.metadata.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {message.metadata.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-grey-600 font-medium">Suggested Actions:</span>
                    <div className="flex flex-wrap gap-1">
                      {message.metadata.suggestedActions.map((action, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {action.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {message.metadata.thought && (
                  <div className="bg-grey-50 border border-grey-200 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-3 w-3 text-grey-500" />
                      <span className="text-xs font-medium text-grey-600">AI Thought Process:</span>
                    </div>
                    <p className="text-xs text-grey-700">{message.metadata.thought}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-grey-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => copyMessage(message.content)}
              >
                <Copy className="h-3 w-3 mr-1" />
                {copiedMessage === message.content ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-grey-900">Demo Conversation Interface</h2>
        <p className="text-grey-600 max-w-2xl mx-auto">
          Experience realistic conversations with the GreyGuard Trials AI agent. 
          Watch how the system handles trial matching, privacy inquiries, and technical demonstrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-grey-600" />
                Demo Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="category">By Category</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-2">
                  {demoConversations.map((conversation) => (
                    <Button
                      key={conversation.id}
                      variant={selectedConversation?.id === conversation.id ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start gap-3">
                        {getCategoryIcon(conversation.category)}
                        <div className="text-left">
                          <div className="font-medium text-sm">{conversation.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {conversation.description}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {conversation.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </TabsContent>

                <TabsContent value="category" className="space-y-3">
                  {categories.map((category) => {
                    const conversations = demoConversations.filter(conv => conv.category === category);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span className="font-medium text-sm capitalize">
                            {category.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {conversations.length}
                          </Badge>
                        </div>
                        {conversations.map((conversation) => (
                          <Button
                            key={conversation.id}
                            variant={selectedConversation?.id === conversation.id ? "default" : "outline"}
                            className="w-full justify-start text-left h-auto p-2 text-xs"
                            onClick={() => setSelectedConversation(conversation)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{conversation.title}</div>
                              <div className="text-muted-foreground line-clamp-1">
                                {conversation.description}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Playback Controls */}
          {selectedConversation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-grey-600" />
                  Playback Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayPause}
                    disabled={!selectedConversation}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={!selectedConversation}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-grey-700">Playback Speed</label>
                  <div className="flex gap-1">
                    {[0.5, 1, 1.5, 2].map((speed) => (
                      <Button
                        key={speed}
                        variant={playbackSpeed === speed ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-grey-700">Display Options</label>
                  <Button
                    variant={showMetadata ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => setShowMetadata(!showMetadata)}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {showMetadata ? 'Hide' : 'Show'} AI Metadata
                  </Button>
                </div>

                <div className="pt-2 border-t border-grey-200">
                  <div className="text-sm text-grey-600">
                    Progress: {currentMessageIndex + 1} / {selectedConversation.messages.length}
                  </div>
                  <div className="w-full bg-grey-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-grey-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentMessageIndex + 1) / selectedConversation.messages.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Conversation Display */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-grey-600" />
                  {selectedConversation ? selectedConversation.title : 'Select a Demo Scenario'}
                </div>
                {selectedConversation && (
                  <Badge className={getCategoryColor(selectedConversation.category)}>
                    {getCategoryIcon(selectedConversation.category)}
                    <span className="ml-1 capitalize">
                      {selectedConversation.category.replace('_', ' ')}
                    </span>
                  </Badge>
                )}
              </CardTitle>
              {selectedConversation && (
                <p className="text-sm text-grey-600">
                  {selectedConversation.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="space-y-4">
                  <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message, index) =>
                        renderMessage(message, index)
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-sm text-grey-600">
                    <div className="flex items-center gap-4">
                      <span>Tags: {selectedConversation.tags.join(', ')}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const content = selectedConversation.messages
                          .map(msg => `${msg.role === 'user' ? 'You' : 'Agent'}: ${msg.content}`)
                          .join('\n\n');
                        copyMessage(content);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Conversation
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-grey-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-grey-300" />
                  <p className="text-lg font-medium">Select a demo scenario to begin</p>
                  <p className="text-sm">Choose from the left panel to see realistic conversations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
