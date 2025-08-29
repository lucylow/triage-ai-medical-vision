import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Zap,
  Brain,
  Database,
  Network,
  Key,
  Fingerprint,
  Cpu,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface ZKProof {
  id: string;
  type: string;
  status: 'pending' | 'generating' | 'verified' | 'failed';
  inputHash: string;
  proofHash: string;
  verificationTime: number;
  timestamp: Date;
}

export default function ZKProofsPage() {
  const [proofs, setProofs] = useState<ZKProof[]>([
    {
      id: '1',
      type: 'Age Verification',
      status: 'verified',
      inputHash: '0x7a8b9c...',
      proofHash: '0x1a2b3c...',
      verificationTime: 0.23,
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      type: 'Medical History',
      status: 'verified',
      inputHash: '0x9d8e7f...',
      proofHash: '0x4d5e6f...',
      verificationTime: 0.45,
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      type: 'Income Verification',
      status: 'generating',
      inputHash: '0x3c2b1a...',
      proofHash: '0x7c8d9e...',
      verificationTime: 0,
      timestamp: new Date()
    }
  ]);
  
  const [selectedProofType, setSelectedProofType] = useState('age');
  const [inputData, setInputData] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const proofTypes = [
    { id: 'age', name: 'Age Verification', description: 'Prove age without revealing exact date', icon: Shield },
    { id: 'medical', name: 'Medical History', description: 'Prove medical conditions without details', icon: Brain },
    { id: 'income', name: 'Income Verification', description: 'Prove income range without exact amount', icon: TrendingUp },
    { id: 'location', name: 'Location Proof', description: 'Prove location without exact coordinates', icon: Network }
  ];

  const generateProof = async () => {
    if (!inputData.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter data to generate a proof",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate proof generation
    setTimeout(() => {
      const newProof: ZKProof = {
        id: Date.now().toString(),
        type: proofTypes.find(p => p.id === selectedProofType)?.name || 'Custom Proof',
        status: 'verified',
        inputHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        proofHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        verificationTime: Math.random() * 0.5 + 0.1,
        timestamp: new Date()
      };

      setProofs(prev => [newProof, ...prev]);
      setIsGenerating(false);
      
      toast({
        title: "Proof Generated!",
        description: `Successfully generated ${newProof.type} proof`,
        variant: "default"
      });
    }, 2000);
  };

  const getStatusIcon = (status: ZKProof['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: ZKProof['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'generating':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Zero Knowledge Proofs</h1>
            <p className="text-gray-600">Generate cryptographic proofs without revealing sensitive data</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
            <Lock className="h-3 w-3 mr-1" />
            Privacy-Preserving
          </Badge>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
            <Zap className="h-3 w-3 mr-1" />
            Instant Verification
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            ICP Network
          </Badge>
        </div>
      </div>

      {/* Proof Generation */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <span>Generate New Proof</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proof-type">Proof Type</Label>
              <select
                id="proof-type"
                value={selectedProofType}
                onChange={(e) => setSelectedProofType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {proofTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-data">Input Data</Label>
              <Input
                id="input-data"
                placeholder="Enter data to prove..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="border-gray-300 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-purple-800">
              <EyeOff className="h-4 w-4" />
              <span>Your data will be hashed and never stored in plain text</span>
            </div>
          </div>
          
          <Button
            onClick={generateProof}
            disabled={isGenerating || !inputData.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            {isGenerating ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Generating Proof...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Proof
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Proof History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-600" />
            <span>Proof History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proofs.map(proof => (
              <div key={proof.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(proof.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{proof.type}</h3>
                    <p className="text-sm text-gray-500">
                      Generated {proof.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Input Hash</p>
                    <p className="text-sm font-mono text-gray-700">{proof.inputHash}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Proof Hash</p>
                    <p className="text-sm font-mono text-gray-700">{proof.proofHash}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Verification</p>
                    <p className="text-sm font-mono text-gray-700">{proof.verificationTime.toFixed(3)}s</p>
                  </div>
                  <Badge className={`${getStatusColor(proof.status)}`}>
                    {proof.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ICP Network Status */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-indigo-600" />
            <span>ICP Network Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Network</h3>
              <p className="text-sm text-gray-600">Online</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Canisters</h3>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">ZK Circuits</h3>
              <p className="text-sm text-gray-600">Ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
