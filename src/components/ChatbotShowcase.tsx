import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatInput } from "./ChatInput";
import { Bot, MessageSquare, Brain, Zap } from 'lucide-react';

export const ChatbotShowcase: React.FC = () => {
  const handleMessage = (message: string) => {
    console.log('Message received:', message);
  };

  const handleFileAttach = () => {
    console.log('File attachment requested');
  };

  const handleWebSearch = () => {
    console.log('Web search mode activated');
  };

  const handleAgentSearch = () => {
    console.log('Agent search mode activated');
  };

  const handleFilter = () => {
    console.log('Filter mode activated');
  };

  const handleVoiceToggle = () => {
    console.log('Voice toggle requested');
  };

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Chatbot Design Showcase</h1>
        <p className="text-muted-foreground">
          Consistent ASI:One chatbot interface across all components
        </p>
      </div>

      {/* Main AI Agent Chat */}
      <Card className="border-2 border-grey-200">
        <CardHeader className="bg-grey-50">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-grey-600" />
            <span>Main AI Agent Chat</span>
            <Badge variant="default">ASI:One Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChatInput
            placeholder="Ask anything to ASI:One or use @handle to reach an agent directly"
            onSubmit={handleMessage}
            onFileAttach={handleFileAttach}
            onWebSearch={handleWebSearch}
            onAgentSearch={handleAgentSearch}
            onFilter={handleFilter}
            onVoiceToggle={handleVoiceToggle}
            modelName="ASI1-mini"
          />
        </CardContent>
      </Card>

      {/* Clinical Trials Chat */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <span>Clinical Trials Assistant</span>
            <Badge variant="secondary">Trial Matching</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChatInput
            placeholder="Describe your symptoms and I'll help find relevant clinical trials"
            onSubmit={handleMessage}
            onFileAttach={handleFileAttach}
            onWebSearch={handleWebSearch}
            onAgentSearch={handleAgentSearch}
            onFilter={handleFilter}
            onVoiceToggle={handleVoiceToggle}
            modelName="ASI1-mini"
          />
        </CardContent>
      </Card>

      {/* Medical Knowledge Chat */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Medical Knowledge Base</span>
            <Badge variant="outline">Terminology</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChatInput
            placeholder="Ask me to explain medical terms or procedures"
            onSubmit={handleMessage}
            onFileAttach={handleFileAttach}
            onWebSearch={handleWebSearch}
            onAgentSearch={handleAgentSearch}
            onFilter={handleFilter}
            onVoiceToggle={handleVoiceToggle}
            modelName="ASI1-mini"
          />
        </CardContent>
      </Card>

      {/* Eligibility Checker */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <span>Trial Eligibility Checker</span>
            <Badge variant="destructive">Pre-Screening</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChatInput
            placeholder="Check if you qualify for specific clinical trials"
            onSubmit={handleMessage}
            onFileAttach={handleFileAttach}
            onWebSearch={handleWebSearch}
            onAgentSearch={handleAgentSearch}
            onFilter={handleFilter}
            onVoiceToggle={handleVoiceToggle}
            modelName="ASI1-mini"
          />
        </CardContent>
      </Card>

      {/* Compact Chat Input */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <span>Compact Chat Input</span>
            <Badge variant="secondary">Inline</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChatInput
            placeholder="Quick question? Ask here..."
            onSubmit={handleMessage}
            onFileAttach={handleFileAttach}
            onWebSearch={handleWebSearch}
            onAgentSearch={handleAgentSearch}
            onFilter={handleFilter}
            onVoiceToggle={handleVoiceToggle}
            modelName="ASI1-mini"
            className="max-w-md mx-auto"
          />
        </CardContent>
      </Card>

      {/* Feature Explanation */}
      <Card className="bg-gradient-to-r from-grey-50 to-grey-100">
        <CardHeader>
          <CardTitle className="text-center text-grey-800">Chatbot Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-grey-800">Input Icons</h4>
              <ul className="space-y-2 text-sm text-grey-700">
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 bg-grey-200 rounded flex items-center justify-center">📎</span>
                  <span>File Attachment - Upload documents and images</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 bg-grey-200 rounded flex items-center justify-center">🌐</span>
                  <span>Web Search - Search the internet for information</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 bg-grey-200 rounded flex items-center justify-center">🔍</span>
                  <span>Agent Search - Find specific AI agents</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 bg-grey-200 rounded flex items-center justify-center">⚙️</span>
                  <span>Filter - Adjust settings and preferences</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-800">Right Side Controls</h4>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 bg-purple-200 rounded flex items-center justify-center">🤖</span>
                  <span>Model Selection - Choose AI model (ASI1-mini)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 bg-purple-200 rounded flex items-center justify-center">🎤</span>
                  <span>Voice Chat - Start/stop voice input</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 bg-purple-200 rounded flex items-center justify-center">📊</span>
                  <span>Character Count - Track input length</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 bg-purple-200 rounded flex items-center justify-center">⚠️</span>
                  <span>Disclaimer - AI accuracy notice</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
