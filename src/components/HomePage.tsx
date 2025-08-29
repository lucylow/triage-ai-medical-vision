import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Eye,
  Zap,
  Award,
  DollarSign,
  Clock,
  BarChart3,
  Rocket,
  Star,
  ArrowUpRight,
  Play,
  MousePointer,
  Cpu,
  Database,
  Network,
  Key
} from 'lucide-react';

interface HomePageProps {
  onNavigateToTab: (tab: string) => void;
}

export default function HomePage({ onNavigateToTab }: HomePageProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section - Problem Statement & Solution */}
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            First-of-its-Kind Web3 Healthcare Solution
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Revolutionizing Clinical Trial Matching
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Every year, <span className="font-semibold text-red-600">millions of patients struggle</span> to find life-saving clinical trials, 
            while researchers spend <span className="font-semibold text-red-600">billions on inefficient recruitment</span>. 
            GreyGuard Trials solves this <span className="font-semibold text-orange-600">$50 billion problem</span> with 
            <span className="font-semibold text-blue-600"> Fetch.ai autonomous agents</span> and 
            <span className="font-semibold text-purple-600"> Internet Computer Protocol blockchain</span>.
          </p>
        </div>

        {/* Competitive Advantage Matrix */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-slate-800 flex items-center justify-center">
                <Award className="h-6 w-6 mr-2 text-blue-600" />
                Competitive Advantage Matrix
              </CardTitle>
              <p className="text-slate-600">How GreyGuard Trials outperforms existing solutions</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-slate-800 mb-2">Traditional Solutions</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center text-red-600">
                      <X className="h-4 w-4 mr-1" /> Limited Privacy
                    </div>
                    <div className="flex items-center justify-center text-red-600">
                      <X className="h-4 w-4 mr-1" /> No AI Agents
                    </div>
                    <div className="flex items-center justify-center text-red-600">
                      <X className="h-4 w-4 mr-1" /> Centralized
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-semibold text-slate-800 mb-2">Blockchain Healthcare</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Basic Encryption
                    </div>
                    <div className="flex items-center justify-center text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Limited Agents
                    </div>
                    <div className="flex items-center justify-center text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Partial Decentralization
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-semibold text-slate-800 mb-2">GreyGuard Trials</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> ZK-Proofs + MPC
                    </div>
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Full Fetch.ai Stack
                    </div>
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Full ICP Deployment
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-semibold text-slate-800 mb-2">Market Impact</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> 46% Cost Reduction
                    </div>
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> 40% Faster Recruitment
                    </div>
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> 90%+ Satisfaction
                    </div>
                  </div>
                </div>
          </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quantified Impact Section */}
      <div className="max-w-6xl mx-auto">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              Quantified Business Impact
            </CardTitle>
            <p className="text-green-700">Real metrics that demonstrate transformative value</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">46%</div>
                <div className="text-sm text-green-700">Cost Reduction</div>
                <div className="text-xs text-green-600 mt-1">vs Traditional Methods</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
                <div className="text-sm text-green-700">Faster Recruitment</div>
                <div className="text-xs text-green-600 mt-1">Patient Matching Speed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">$50B+</div>
                <div className="text-sm text-green-700">Market Opportunity</div>
                <div className="text-xs text-green-600 mt-1">Global Clinical Trials</div>
          </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">90%+</div>
                <div className="text-sm text-green-700">User Satisfaction</div>
                <div className="text-xs text-green-600 mt-1">Beta User Score</div>
          </div>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Demo Section */}
      <div className="max-w-6xl mx-auto">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-800 flex items-center justify-center">
              <Play className="h-6 w-6 mr-2" />
              Interactive Demo Experience
            </CardTitle>
            <p className="text-purple-700">Click to explore our revolutionary features</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Clinical Trial Matching Demo */}
              <Card className="bg-white border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg cursor-pointer group" 
                    onClick={() => onNavigateToTab('trials')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Clinical Trial Matching</h3>
                  <p className="text-sm text-purple-600 mb-4">AI-powered matching with 12+ real trials</p>
                  <div className="flex items-center justify-center text-purple-600 group-hover:text-purple-800">
                    <span className="text-sm font-medium">Try Demo</span>
                    <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </div>
        </CardContent>
      </Card>

              {/* Fetch.ai Agents Demo */}
              <Card className="bg-white border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                    onClick={() => onNavigateToTab('fetch-agents')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Fetch.ai Agents</h3>
                  <p className="text-sm text-blue-600 mb-4">7 specialized medical MCP agents</p>
                  <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-800">
                    <span className="text-sm font-medium">Explore Agents</span>
                    <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
            </CardContent>
          </Card>

              {/* Zero-Knowledge Proofs Demo */}
              <Card className="bg-white border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                    onClick={() => onNavigateToTab('zk-proofs')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Zero-Knowledge Proofs</h3>
                  <p className="text-sm text-orange-600 mb-4">Privacy-preserving verification</p>
                  <div className="flex items-center justify-center text-orange-600 group-hover:text-orange-800">
                    <span className="text-sm font-medium">Generate Proofs</span>
                    <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
            </CardContent>
          </Card>

              {/* AI Chat Demo */}
              <Card className="bg-white border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                    onClick={() => onNavigateToTab('chat')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">AI Medical Chat</h3>
                  <p className="text-sm text-green-600 mb-4">Intelligent trial assistance</p>
                  <div className="flex items-center justify-center text-green-600 group-hover:text-green-800">
                    <span className="text-sm font-medium">Start Chat</span>
                    <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
            </CardContent>
          </Card>

              {/* Analytics Dashboard Demo */}
              <Card className="bg-white border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                    onClick={() => onNavigateToTab('analytics')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-800 mb-2">Analytics Dashboard</h3>
                  <p className="text-sm text-indigo-600 mb-4">Real-time performance metrics</p>
                  <div className="flex items-center justify-center text-indigo-600 group-hover:text-indigo-800">
                    <span className="text-sm font-medium">View Analytics</span>
                    <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
            </CardContent>
          </Card>

              {/* Innovation Lab Demo */}
              <Card className="bg-white border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                    onClick={() => onNavigateToTab('innovation-lab')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Innovation Lab</h3>
                  <p className="text-sm text-purple-600 mb-4">Advanced AI agent capabilities</p>
                  <div className="flex items-center justify-center text-purple-600 group-hover:text-purple-800">
                    <span className="text-sm font-medium">Explore Lab</span>
                    <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </div>
            </CardContent>
          </Card>
      </div>

      {/* Technical Innovation Section */}
      <div className="max-w-6xl mx-auto">
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-800 flex items-center justify-center">
              <Zap className="h-6 w-6 mr-2 text-orange-600" />
              Advanced Technical Features
              </CardTitle>
            <p className="text-slate-600">Cutting-edge technologies that set us apart</p>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Network className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">HTTP Outcalls</h4>
                  <p className="text-sm text-slate-600">Real-time communication between Fetch.ai agents and ICP canisters</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Chat Protocol</h4>
                  <p className="text-sm text-slate-600">Full Fetch.ai Chat Protocol implementation for agent communication</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Zero-Knowledge Proofs</h4>
                  <p className="text-sm text-slate-600">zk-SNARKs for patient privacy without compromising functionality</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Multi-Party Computation</h4>
                  <p className="text-sm text-slate-600">Secure collaboration across institutions while preserving privacy</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Database className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">ICP Canisters</h4>
                  <p className="text-sm text-slate-600">Decentralized smart contracts for secure data storage and processing</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Key className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Bitcoin Anchoring</h4>
                  <p className="text-sm text-slate-600">Immutable consent records stored on Bitcoin network</p>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
            Ready to Experience the Future of Clinical Trials?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join us in revolutionizing healthcare with decentralized AI agents and blockchain technology. 
            Start exploring our platform now and see how we're solving the $50 billion clinical trial matching problem.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigateToTab('trials')}
          >
            <Target className="mr-2 h-5 w-5" />
            Start Trial Matching
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg transition-all duration-300"
            onClick={() => onNavigateToTab('fetch-agents')}
          >
            <Brain className="mr-2 h-5 w-5" />
            Explore AI Agents
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-slate-500">
          <MousePointer className="h-4 w-4" />
          <span className="text-sm">Click any demo card above to explore specific features</span>
        </div>
      </div>
    </div>
  );
}

// Helper component for X icon
const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Helper component for AlertTriangle icon
const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);
