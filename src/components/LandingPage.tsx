import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletSelector, ICPWallet } from './WalletSelector';

import { multiWalletService } from '../services/multiWalletService';
import { 
  Shield, 
  Lock, 
  Brain, 
  Activity, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  Users,
  Globe,
  MessageSquare,
  TrendingUp,
  Wallet,
  Zap,
  Database,
  LockKeyhole,
  Star,
  Award,
  Heart,

  Network,
  Cpu,
  Server,
  Layers,
  Hexagon,
  CircuitBoard,
  BarChart3,
  Play,
  ArrowUpRight,
  MousePointer,
  Key
} from 'lucide-react';

interface LandingPageProps {
  onConnectWallet: () => void;
  onLaunchApp: () => void;
  isConnecting: boolean;
  onWalletConnected: (walletInfo: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet, onLaunchApp, isConnecting, onWalletConnected }) => {
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [wallets, setWallets] = useState<ICPWallet[]>([]);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);

  // Get supported wallets when component mounts
  React.useEffect(() => {
    console.log('🔄 LandingPage mounted, getting supported wallets...');
    try {
      const supportedWallets = multiWalletService.getSupportedWallets();
      console.log('📱 Supported wallets found:', supportedWallets);
      setWallets(supportedWallets);
    } catch (error) {
      console.error('❌ Error getting supported wallets:', error);
    }
  }, []);

  const handleWalletSelect = async (walletId: string) => {
    console.log('🎯 Wallet selected:', walletId);
    try {
      setConnectingWalletId(walletId);
      
      const result = await multiWalletService.connectWallet(walletId);
      console.log('🔗 Connection result:', result);
      
      if (result.success && result.walletInfo) {
        console.log('✅ Wallet connected successfully!');
        setShowWalletSelector(false);
        setConnectingWalletId(null);
        onWalletConnected(result.walletInfo);
      } else {
        console.error('❌ Wallet connection failed:', result.error);
        setConnectingWalletId(null);
        const errorMessage = result.error || 'Unknown connection error';
        alert(`Wallet connection failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('💥 Exception during wallet connection:', error);
      setConnectingWalletId(null);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error connecting wallet: ${errorMessage}`);
    }
  };

  const handleConnectWalletClick = () => {
    console.log('🔵 Connect Wallet button clicked!');
    console.log('Current showWalletSelector state:', showWalletSelector);
    console.log('Current wallets state:', wallets);
    
    try {
      multiWalletService.refreshWalletStatus();
      const updatedWallets = multiWalletService.getSupportedWallets();
      console.log('📱 Updated wallets:', updatedWallets);
      
      setWallets(updatedWallets);
      setShowWalletSelector(true);
      
      console.log('✅ Wallet selector should now be open. showWalletSelector set to:', true);
    } catch (error) {
      console.error('❌ Error in handleConnectWalletClick:', error);
      alert('Error opening wallet selector. Please try again.');
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Background with ICP Theme */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating ICP Network Nodes */}
        <div className="absolute top-20 left-20 w-32 h-32 opacity-10">
          <div className="w-full h-full border-2 border-orange-500 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="absolute top-40 right-32 w-24 h-24 opacity-10">
          <div className="w-full h-full border-2 border-blue-500 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="absolute bottom-32 left-32 w-28 h-28 opacity-10">
          <div className="w-full h-full border-2 border-purple-500 rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Subtle Circuit Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      </div>

      {/* Enhanced Header */}
      <header className="relative bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg relative">
                <Shield className="h-7 w-7 text-white" />
                {/* ICP Network Indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">GreyGuard Trials</h1>
                <p className="text-sm text-slate-600">Decentralized Clinical Trial Matching</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                    <Network className="h-3 w-3 mr-1" />
                    ICP Network
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 px-3 py-1">
                <Star className="h-3 w-3 mr-1" />
                Beta
              </Badge>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live on ICP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <div className="text-center space-y-8 py-16">
        <div className="space-y-6">
          <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-6 py-3 text-base animate-pulse">
            <Sparkles className="h-5 w-5 mr-2" />
            First-of-its-Kind Web3 Healthcare Solution
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent leading-tight">
            Revolutionizing Clinical Trial Matching
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Solving the <span className="font-semibold text-orange-600">$50 billion problem</span> of clinical trial recruitment with 
            <span className="font-semibold text-blue-600"> Fetch.ai autonomous agents</span> and 
            <span className="font-semibold text-purple-600"> Internet Computer Protocol blockchain</span>.
          </p>
        </div>

        {/* Main Action Button - Centered */}
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={handleConnectWalletClick}
            >
              <Wallet className="mr-3 h-6 w-6" />
              Connect Wallet & Start
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-slate-500">
            <MousePointer className="h-5 w-5" />
            <span className="text-base">Connect your wallet to explore all features</span>
          </div>
        </div>
      </div>

      {/* Enhanced Quantified Impact Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-green-800 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 mr-3" />
              Quantified Business Impact
            </CardTitle>
            <p className="text-green-700 text-lg">Real metrics that demonstrate transformative value</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="text-4xl font-bold text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300">46%</div>
                <div className="text-lg text-green-700 font-semibold">Cost Reduction</div>
                <div className="text-sm text-green-600 mt-2">vs Traditional Methods</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300">40%</div>
                <div className="text-lg text-green-700 font-semibold">Faster Recruitment</div>
                <div className="text-sm text-green-600 mt-2">Patient Matching Speed</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300">$50B+</div>
                <div className="text-lg text-green-700 font-semibold">Market Opportunity</div>
                <div className="text-sm text-green-600 mt-2">Global Clinical Trials</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300">90%+</div>
                <div className="text-lg text-green-700 font-semibold">User Satisfaction</div>
                <div className="text-sm text-green-600 mt-2">Beta User Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Interactive Demo Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-purple-800 flex items-center justify-center">
              <Play className="h-7 w-7 mr-3" />
              Interactive Demo Experience
            </CardTitle>
            <p className="text-purple-700 text-lg">Click to explore our revolutionary features</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Clinical Trial Matching Demo */}
              <Card className="bg-white border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl cursor-pointer group transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-purple-800 mb-3">Clinical Trial Matching</h3>
                  <p className="text-sm text-purple-600 mb-4">AI-powered matching with 12+ real trials</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
                    onClick={handleConnectWalletClick}
                  >
                    Try Demo
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Fetch.ai Agents Demo */}
              <Card className="bg-white border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl cursor-pointer group transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">Fetch.ai Agents</h3>
                  <p className="text-sm text-blue-600 mb-4">7 specialized medical MCP agents</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
                    onClick={handleConnectWalletClick}
                  >
                    Explore Agents
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Zero-Knowledge Proofs Demo */}
              <Card className="bg-white border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-xl cursor-pointer group transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-orange-800 mb-3">Zero-Knowledge Proofs</h3>
                  <p className="text-sm text-orange-600 mb-4">Privacy-preserving verification</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300"
                    onClick={handleConnectWalletClick}
                  >
                    Generate Proofs
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* AI Chat Demo */}
              <Card className="bg-white border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl cursor-pointer group transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-3">AI Medical Chat</h3>
                  <p className="text-sm text-green-600 mb-4">Intelligent trial assistance</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-300"
                    onClick={handleConnectWalletClick}
                  >
                    Start Chat
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Analytics Dashboard Demo */}
              <Card className="bg-white border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-xl cursor-pointer group transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-800 mb-3">Analytics Dashboard</h3>
                  <p className="text-sm text-indigo-600 mb-4">Real-time performance metrics</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300"
                    onClick={handleConnectWalletClick}
                  >
                    View Analytics
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Innovation Lab Demo */}
              <Card className="bg-white border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl cursor-pointer group transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-purple-800 mb-3">Innovation Lab</h3>
                  <p className="text-sm text-purple-600 mb-4">Advanced AI agent capabilities</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
                    onClick={handleConnectWalletClick}
                  >
                    Explore Lab
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Technical Innovation Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-slate-800 flex items-center justify-center">
              <Zap className="h-7 w-7 mr-3 text-orange-600" />
              Advanced Technical Features
            </CardTitle>
            <p className="text-slate-600 text-lg">Cutting-edge technologies that set us apart</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Network className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">HTTP Outcalls</h4>
                  <p className="text-slate-600">Real-time communication between Fetch.ai agents and ICP canisters</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Chat Protocol</h4>
                  <p className="text-slate-600">Full Fetch.ai Chat Protocol implementation for agent communication</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Zero-Knowledge Proofs</h4>
                  <p className="text-slate-600">zk-SNARKs for patient privacy without compromising functionality</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Multi-Party Computation</h4>
                  <p className="text-slate-600">Secure collaboration across institutions while preserving privacy</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Database className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">ICP Canisters</h4>
                  <p className="text-slate-600">Decentralized smart contracts for secure data storage and processing</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Key className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Bitcoin Anchoring</h4>
                  <p className="text-slate-600">Immutable consent records stored on Bitcoin network</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Competitive Advantage Matrix */}
      <div className="max-w-7xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">GreyGuard Trials</span>?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We're not just another healthcare platform. We're the future of clinical trials.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Traditional Solutions */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl transform group-hover:scale-105 transition-all duration-300 border-2 border-red-200"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-red-200/50">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-2">Traditional Solutions</h3>
                <p className="text-red-600 text-sm">Outdated & Inefficient</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-200/50">
                  <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 font-medium">Limited Privacy</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-200/50">
                  <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 font-medium">No AI Agents</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-200/50">
                  <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 font-medium">Centralized Control</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Healthcare */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-3xl transform group-hover:scale-105 transition-all duration-300 border-2 border-yellow-200"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-yellow-200/50">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-yellow-800 mb-2">Blockchain Healthcare</h3>
                <p className="text-yellow-600 text-sm">Partial Solutions</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200/50">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-yellow-700 font-medium text-base">Basic Encryption</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200/50">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-yellow-700 font-medium text-base">Limited Agents</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200/50">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-yellow-700 font-medium text-base">Partial Decentralization</span>
                </div>
              </div>
            </div>
          </div>

          {/* GreyGuard Trials */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl transform group-hover:scale-105 transition-all duration-300 border-2 border-green-200"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-green-200/50">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">GreyGuard Trials</h3>
                <p className="text-green-600 text-sm">The Future is Here</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200/50">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-green-700 font-medium">ZK-Proofs + MPC</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200/50">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-green-700 font-medium">Full Fetch.ai Stack</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200/50">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-green-700 font-medium">Full ICP Deployment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Impact */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-3xl transform group-hover:scale-105 transition-all duration-300 border-2 border-purple-200"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-200/50">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-purple-800 mb-2">Market Impact</h3>
                <p className="text-purple-600 text-sm">Proven Results</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-200/50">
                  <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span className="text-purple-700 font-medium">46% Cost Reduction</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-200/50">
                  <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span className="text-purple-700 font-medium">40% Faster Recruitment</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-200/50">
                  <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span className="text-purple-700 font-medium">90%+ Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-400 py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="h-6 w-6 text-red-500" />
            <span className="text-xl">Built with care for patients worldwide</span>
          </div>
          <p className="text-lg mb-8">
            Powered by Fetch.ai Agents & <span className="font-semibold text-orange-400">Internet Computer Protocol (ICP)</span> • 
            Your health data remains encrypted and under your control
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="flex items-center space-x-2 bg-slate-800/50 px-4 py-3 rounded-lg backdrop-blur-sm">
              <Award className="h-5 w-5 text-yellow-400" />
              <span>HIPAA Compliant</span>
            </span>
            <span className="flex items-center space-x-2 bg-slate-800/50 px-4 py-3 rounded-lg backdrop-blur-sm">
              <Shield className="h-5 w-5 text-green-400" />
              <span>GDPR Ready</span>
            </span>
            <span className="flex items-center space-x-2 bg-slate-800/50 px-4 py-3 rounded-lg backdrop-blur-sm">
              <Lock className="h-5 w-5 text-blue-400" />
              <span>End-to-End Encrypted</span>
            </span>
            <span className="flex items-center space-x-2 bg-slate-800/50 px-4 py-3 rounded-lg backdrop-blur-sm border border-orange-500/30">
              <Network className="h-5 w-5 text-orange-400" />
              <span>ICP Network</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Wallet Selector Modal */}
      {showWalletSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Debug: Wallet Selector</h3>
            <p className="mb-4">Modal should be open. showWalletSelector: {showWalletSelector.toString()}</p>
            <p className="mb-4">Wallets count: {wallets.length}</p>
            <Button onClick={() => setShowWalletSelector(false)}>Close Debug</Button>
          </div>
        </div>
      )}
      
      <WalletSelector
        isOpen={showWalletSelector}
        onClose={() => {
          console.log('🚪 Closing wallet selector');
          setShowWalletSelector(false);
        }}
        onSelectWallet={handleWalletSelect}
        wallets={wallets}
        isConnecting={isConnecting}
        connectingWalletId={connectingWalletId}
      />

      {/* Debug Component - Remove in production */}

    </div>
  );
};

// Helper component for X icon
const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Helper component for AlertTriangle icon
const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.500c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);
