import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  Network, 
  Cpu, 
  Eye,
  Sparkles,
  Users,
  Globe,
  Key,
  Database
} from 'lucide-react';
import MCPSystem from './MCPSystem';
import ZKPDemo from './ZKPDemo';

interface DecentralizedFeaturesPageProps {
  zkpForm: any;
  setZkpForm: (form: any) => void;
  generatedProof: any;
  verifyPatientId: string;
  setVerifyPatientId: (id: string) => void;
  verificationResult: any;
  zkpLoading: boolean;
  verifyLoading: boolean;
  generateZKProof: () => void;
  verifyZKProof: () => void;
}

export const DecentralizedFeaturesPage: React.FC<DecentralizedFeaturesPageProps> = ({
  zkpForm,
  setZkpForm,
  generatedProof,
  verifyPatientId,
  setVerifyPatientId,
  verificationResult,
  zkpLoading,
  verifyLoading,
  generateZKProof,
  verifyZKProof
}) => {
  const [activeTab, setActiveTab] = useState('mcp-system');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Decentralized Features</h1>
        <p className="text-muted-foreground">
          Privacy-preserving technologies and decentralized systems for secure clinical trial matching
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mcp-system">MCP System</TabsTrigger>
          <TabsTrigger value="zkp-demo">ZKP Demo</TabsTrigger>
        </TabsList>

        {/* MCP System Tab */}
        <TabsContent value="mcp-system" className="space-y-6">
          {/* Multi-Party Computation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Multi-Party Computation
              </CardTitle>
              <CardDescription>
                Secure data analysis without exposing individual information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Privacy-Preserving</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-grey-600" />
                  <span className="text-sm font-medium">Distributed Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Multi-Party Collaboration</span>
                </div>
              </div>
              
                          <div className="p-4 bg-grey-50 border border-grey-200 rounded-lg">
              <h4 className="font-semibold text-grey-800 mb-2">🔐 How MCP Works:</h4>
              <ul className="text-sm space-y-1 text-grey-700">
                  <li>• Data is encrypted and split across multiple parties</li>
                  <li>• Computations performed on encrypted data</li>
                  <li>• Results obtained without revealing raw data</li>
                  <li>• Perfect for sensitive medical information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* MCP System Component */}
          <MCPSystem />
        </TabsContent>

        {/* ZKP Demo Tab */}
        <TabsContent value="zkp-demo" className="space-y-6">
          {/* Zero-Knowledge Proofs Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Zero-Knowledge Proofs
              </CardTitle>
              <CardDescription>
                Prove eligibility without revealing personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Privacy-First Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-grey-600" />
                  <span className="text-sm font-medium">Cryptographic Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Data Minimization</span>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">🔒 ZKP Benefits:</h4>
                <ul className="text-sm space-y-1 text-purple-700">
                  <li>• Verify medical conditions without sharing details</li>
                  <li>• Prove age eligibility without revealing birth date</li>
                  <li>• Confirm location without exposing address</li>
                  <li>• Maintain complete privacy during verification</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* ZKP Demo Component */}
          <ZKPDemo 
            zkpForm={zkpForm}
            setZkpForm={setZkpForm}
            generatedProof={generatedProof}
            verifyPatientId={verifyPatientId}
            setVerifyPatientId={setVerifyPatientId}
            verificationResult={verificationResult}
            zkpLoading={zkpLoading}
            verifyLoading={verifyLoading}
            generateZKProof={generateZKProof}
            verifyZKProof={verifyZKProof}
          />
        </TabsContent>


      </Tabs>

      {/* Technology Overview */}
              <Card className="bg-gradient-to-r from-purple-50 to-grey-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Sparkles className="h-5 w-5" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Network className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-purple-800 mb-2">MCP</h4>
              <p className="text-sm text-purple-700">
                Multi-party computation for secure data processing
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-800 mb-2">ZKP</h4>
              <p className="text-sm text-blue-700">
                Zero-knowledge proofs for privacy-preserving verification
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-800 mb-2">Encryption</h4>
              <p className="text-sm text-green-700">
                Advanced encryption for data protection
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Globe className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-yellow-800 mb-2">Blockchain</h4>
              <p className="text-sm text-yellow-700">
                Decentralized infrastructure for transparency
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
