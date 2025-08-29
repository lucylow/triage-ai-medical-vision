import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Shield, Database, Globe, Wallet, LogOut, Target, Brain, MessageSquare, TrendingUp, CheckCircle, Network, Bot, Sparkles } from 'lucide-react';
import { ClinicalTrialsPage } from './ClinicalTrialsPage';
import { FetchAgentShowcase } from './FetchAgentShowcase';
import ChatPage from './ChatPage';
import AnalyticsPage from './AnalyticsPage';
import SettingsPage from './SettingsPage';
import ZKProofsPage from './ZKProofsPage';
import InnovationLabDashboard from './InnovationLabDashboard';
import LanguageSelector from './LanguageSelector';
import { ICPWalletInfo } from '../services/icpWalletService';

interface MainAppProps {
  walletInfo: ICPWalletInfo;
  onDisconnect: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ walletInfo, onDisconnect }) => {
  const [activeTab, setActiveTab] = useState('trials');
  const [error, setError] = useState<string | null>(null);



  const formatPrincipal = (principal: string) => {
    if (principal.length <= 10) return principal;
    return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
  };

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-800">Something went wrong</h1>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => setError(null)}>Try Again</Button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-800/50"></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg relative">
                  <Shield className="h-7 w-7 text-white" />
                  {/* ICP Network Status Indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">GreyGuard Trials</h1>
                  <p className="text-xs sm:text-sm text-white opacity-90">Decentralized Clinical Trial Matching</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-400/30 text-xs">
                      <Network className="h-3 w-3 mr-1" />
                      ICP Network
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <LanguageSelector variant="compact" />
                
                {/* Connected Wallet Display */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-lg shadow-lg border border-green-500/30">
                    <Wallet className="h-4 w-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      {formatPrincipal(walletInfo.principal)}
                    </span>
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-slate-700/50 text-white border-slate-500/50 hover:bg-slate-600/50 hover:border-slate-400/50 transition-all duration-200 backdrop-blur-sm"
                    onClick={onDisconnect}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
            
            {/* ICP Blockchain Indicators */}
            <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex items-center space-x-2 text-white group cursor-pointer transition-all duration-200 hover:scale-105">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <Lock className="h-4 w-4 text-slate-300 group-hover:text-green-400 transition-colors" />
                <span className="text-sm group-hover:text-green-400 transition-colors">Privacy Active</span>
              </div>
              <div className="flex items-center space-x-2 text-white group cursor-pointer transition-all duration-200 hover:scale-105">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <Shield className="h-4 w-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                <span className="text-sm group-hover:text-orange-400 transition-colors">ZK Proofs Ready</span>
              </div>
              <div className="flex items-center space-x-2 text-white group cursor-pointer transition-all duration-200 hover:scale-105">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <Database className="h-4 w-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                <span className="text-sm group-hover:text-red-400 transition-colors">ICP Connected</span>
              </div>
              <div className="flex items-center space-x-2 text-white group cursor-pointer transition-all duration-200 hover:scale-105">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <Globe className="h-4 w-4 text-slate-300 group-hover:text-purple-400 transition-colors" />
                <span className="text-sm group-hover:text-purple-400 transition-colors">Decentralized</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-5xl grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-2 bg-slate-100/50 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-slate-200/50">
                <TabsTrigger value="trials" className="text-xs sm:text-sm px-2 sm:px-3 py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-200 rounded-lg hover:bg-white/50 data-[state=active]:border-l-4 data-[state=active]:border-l-orange-500">
                  <Target className="h-3 w-3 mr-1 sm:mr-2 hidden sm:inline" /> Trials
                </TabsTrigger>
                <TabsTrigger value="fetch-agents" className="text-xs sm:text-sm px-2 sm:px-3 py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-200 rounded-lg hover:bg-white/50 data-[state=active]:border-l-4 data-[state=active]:border-l-orange-500">
                  <Bot className="h-3 w-3 mr-1 sm:mr-2 hidden sm:inline" /> Fetch.ai
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs sm:text-sm px-2 sm:px-3 py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-200 rounded-lg hover:bg-white/50 data-[state=active]:border-l-4 data-[state=active]:border-l-orange-500">
                  <MessageSquare className="h-3 w-3 mr-1 sm:mr-2 hidden sm:inline" /> Chat
                </TabsTrigger>
                <TabsTrigger value="innovation-lab" className="text-xs sm:text-sm px-2 sm:px-3 py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-200 rounded-lg hover:bg-white/50 data-[state=active]:border-l-4 data-[state=active]:border-l-purple-500">
                  <Sparkles className="h-3 w-3 mr-1 sm:mr-2 hidden sm:inline" /> Innovation Lab
                </TabsTrigger>
                <TabsTrigger value="zk-proofs" className="text-xs sm:text-sm px-2 sm:px-3 py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-200 rounded-lg hover:bg-white/50 data-[state=active]:border-l-4 data-[state=active]:border-l-purple-500">
                  <Shield className="h-3 w-3 mr-1 sm:mr-2 hidden sm:inline" /> ZK Proofs
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-3 py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-200 rounded-lg hover:bg-white/50 data-[state=active]:border-l-4 data-[state=active]:border-l-green-500">
                  <TrendingUp className="h-3 w-3 mr-1 sm:mr-2 hidden sm:inline" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 sm:px-3 py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-200 rounded-lg hover:bg-white/50 data-[state=active]:border-l-4 data-[state=active]:border-l-gray-500">
                  <Lock className="h-3 w-3 mr-1 sm:mr-2 hidden sm:inline" /> Settings
                </TabsTrigger>
              </TabsList>
            </div>



            {/* Clinical Trials Tab */}
            <TabsContent value="trials" className="space-y-6">
              <ClinicalTrialsPage />
            </TabsContent>

            {/* Fetch.ai Agent Showcase Tab */}
            <TabsContent value="fetch-agents" className="space-y-6">
              <FetchAgentShowcase />
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-6">
              <ChatPage />
            </TabsContent>

            {/* Innovation Lab Tab */}
            <TabsContent value="innovation-lab" className="space-y-6">
              <InnovationLabDashboard />
            </TabsContent>

            {/* ZK Proofs Tab */}
            <TabsContent value="zk-proofs" className="space-y-6">
              <ZKProofsPage />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsPage />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <SettingsPage />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-400 py-12 mt-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">GreyGuard Trials</span>
            </div>
            <p className="text-base mb-6 max-w-2xl mx-auto">
              Powered by Fetch.ai Agents & <span className="font-semibold text-orange-400">Internet Computer Protocol (ICP)</span> • 
              Your health data remains encrypted and under your control
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <span className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>HIPAA Compliant</span>
              </span>
              <span className="flex items-center space-x-2 bg-slate-800/50 px-3 sm:px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-200 rounded-lg hover:bg-white/50 data-[state=active]:border-l-4 data-[state=active]:border-l-orange-500">
                <Shield className="h-4 w-4 text-blue-400" />
                <span>GDPR Ready</span>
              </span>
              <span className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                <Lock className="h-4 w-4 text-purple-400" />
                <span>End-to-End Encrypted</span>
              </span>
              <span className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-orange-500/30">
                <Network className="h-4 w-4 text-orange-400" />
                <span>ICP Network</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (err) {
    console.error('Error in MainApp:', err);
    setError(err instanceof Error ? err.message : 'An unknown error occurred');
    return null;
  }
};

export default MainApp;
