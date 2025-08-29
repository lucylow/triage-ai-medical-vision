import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  Zap, 
  Shield, 
  Activity,
  Sparkles,
  Cpu,
  Network,
  Code,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

// Lazy load components to prevent crashes
const AgentIntegration = React.lazy(() => import('./AgentIntegration'));
const PromptManager = React.lazy(() => import('./PromptManager'));
const ASIProtocol = React.lazy(() => import('./ASIProtocol'));
const ImageAgents = React.lazy(() => import('./ImageAgents'));

// Error Boundary Component
const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Component error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Loading Fallback
const LoadingFallback = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="text-muted-foreground">Loading component...</span>
      </div>
    </CardContent>
  </Card>
);

// Error Fallback
const ErrorFallback = ({ title, description }: { title: string; description: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{description}</p>
        <p className="text-sm text-red-700 mt-2">
          The enhanced chatbot in the Clinical Trials tab provides the core functionality.
        </p>
      </div>
    </CardContent>
  </Card>
);

export const AgentPlatformPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ai-agent');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Agent Platform</h1>
        <p className="text-muted-foreground">
          AI-powered assistance and protocol integration for clinical trial matching
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-agent">AI Agent</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="asi-protocol">ASI Protocol</TabsTrigger>
          <TabsTrigger value="ai-images">AI Images</TabsTrigger>
        </TabsList>

        {/* AI Agent Tab */}
        <TabsContent value="ai-agent" className="space-y-6">
          {/* AI Agent Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Agent Overview
              </CardTitle>
              <CardDescription>
                Interact with our intelligent assistant for personalized trial guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Powered by Fetch.ai</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Privacy-First Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-grey-600" />
                  <span className="text-sm font-medium">Real-Time Processing</span>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">What the AI Agent can do:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Analyze symptoms and medical history</li>
                  <li>• Find relevant clinical trials</li>
                  <li>• Explain trial requirements and eligibility</li>
                  <li>• Provide personalized recommendations</li>
                  <li>• Answer questions about the matching process</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* AI Agent Integration Component */}
          <ErrorBoundary fallback={
            <ErrorFallback 
              title="AI Agent Integration" 
              description="AI Agent integration is currently being optimized for better performance."
            />
          }>
            <Suspense fallback={<LoadingFallback />}>
              <AgentIntegration />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          {/* Prompt Engineering Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Prompt Engineering
              </CardTitle>
              <CardDescription>
                Use effective prompts to guide the AI agent's responses and get better results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                          <div className="p-4 bg-grey-50 border border-grey-200 rounded-lg">
              <h4 className="font-semibold text-grey-800 mb-2">💡 Pro Tips:</h4>
              <ul className="text-sm space-y-1 text-grey-700">
                  <li>• Be specific about your condition and symptoms</li>
                  <li>• Include relevant medical history and treatments</li>
                  <li>• Mention your location and travel preferences</li>
                  <li>• Ask follow-up questions for clarification</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ Example Prompts:</h4>
                <ul className="text-sm space-y-1 text-green-700">
                  <li>• "I have Stage 2 breast cancer, what trials are available?"</li>
                  <li>• "Show me diabetes trials within 50 miles of Boston"</li>
                  <li>• "What are the eligibility criteria for immunotherapy trials?"</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Manager Component */}
          <ErrorBoundary fallback={
            <ErrorFallback 
              title="Prompt Manager" 
              description="Prompt management features are coming soon."
            />
          }>
            <Suspense fallback={<LoadingFallback />}>
              <PromptManager />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        {/* ASI Protocol Tab */}
        <TabsContent value="asi-protocol" className="space-y-6">
          {/* ASI:One Integration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                ASI:One Integration
              </CardTitle>
              <CardDescription>
                Learn about our integration with ASI:One for enhanced AI capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Enhanced AI Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Standardized Protocols</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Secure Communication</span>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">🔗 ASI Protocol Benefits:</h4>
                <ul className="text-sm space-y-1 text-purple-700">
                  <li>• Interoperable AI agent communication</li>
                  <li>• Enhanced privacy and security standards</li>
                  <li>• Scalable architecture for future growth</li>
                  <li>• Industry-standard compliance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* ASI Protocol Component */}
          <ErrorBoundary fallback={
            <ErrorFallback 
              title="ASI Protocol Details" 
              description="ASI Protocol implementation is in progress."
            />
          }>
            <Suspense fallback={<LoadingFallback />}>
              <ASIProtocol />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        {/* AI Images Tab */}
        <TabsContent value="ai-images" className="space-y-6">
          {/* AI Images Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Image Generation & Analysis
              </CardTitle>
              <CardDescription>
                Create and analyze medical images using cutting-edge AI technology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">DALL-E 3 Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Claude 3.5 Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Medical Image Support</span>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🎨 AI Image Features:</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• Generate medical illustrations and diagrams</li>
                  <li>• Analyze uploaded medical images</li>
                  <li>• Create visual aids for clinical trials</li>
                  <li>• Support for various image formats</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* ImageAgents Component */}
          <ErrorBoundary fallback={
            <ErrorFallback 
              title="AI Image Tools" 
              description="AI image generation and analysis tools are being optimized."
            />
          }>
            <Suspense fallback={<LoadingFallback />}>
              <ImageAgents />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>

      {/* Platform Features Overview */}
      <Card className="bg-gradient-to-r from-grey-50 to-grey-100 border-grey-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-grey-800">
            <Sparkles className="h-5 w-5" />
            Platform Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-grey-100 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-grey-600" />
              </div>
              <h4 className="font-semibold text-grey-800 mb-2">Intelligent Matching</h4>
              <p className="text-sm text-grey-700">
                AI-powered analysis for precise clinical trial matching
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-purple-800 mb-2">Natural Conversation</h4>
              <p className="text-sm text-purple-700">
                Chat naturally with AI agents for personalized assistance
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-800 mb-2">Privacy Protected</h4>
              <p className="text-sm text-green-700">
                Your data remains secure with advanced encryption
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
