import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2 } from 'lucide-react';

interface ZKPDemoProps {
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

const ZKPDemo: React.FC<ZKPDemoProps> = ({
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
  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Proof Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>ZK-Proof Generator</span>
            <Badge variant="outline" className="demo-badge">DEMO</Badge>
          </CardTitle>
          <CardDescription>
            Generate fake ZK-proofs for patient eligibility verification
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Input
              placeholder="Patient ID (e.g., P123)"
              value={zkpForm.patientId}
              onChange={(e) => setZkpForm(prev => ({ ...prev, patientId: e.target.value }))}
            />
            <Textarea
              placeholder="Encrypted Health Data (simulated)"
              value={zkpForm.encryptedProfile}
              onChange={(e) => setZkpForm(prev => ({ ...prev, encryptedProfile: e.target.value }))}
              rows={3}
            />
            <Input
              placeholder="Condition (e.g., breast cancer)"
              value={zkpForm.condition}
              onChange={(e) => setZkpForm(prev => ({ ...prev, condition: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Age"
                type="number"
                value={zkpForm.age}
                onChange={(e) => setZkpForm(prev => ({ ...prev, age: e.target.value }))}
              />
              <Input
                placeholder="Location"
                value={zkpForm.location}
                onChange={(e) => setZkpForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
          
          <Button 
            onClick={generateZKProof}
            disabled={zkpLoading}
            className="w-full"
          >
            {zkpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
            Generate ZK-Proof
          </Button>
          
          {generatedProof && (
            <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg zkp-verified">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-success">ZK-Proof Generated</h4>
                <Badge className="demo-badge bg-success text-success-foreground">
                  VERIFICATION READY
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Proof ID:</span> <code className="bg-muted px-1 rounded">{generatedProof.proofId}</code></p>
                <p><span className="font-medium">Patient:</span> {generatedProof.patientId}</p>
                <p><span className="font-medium">Timestamp:</span> {formatDateTime(generatedProof.timestamp)}</p>
                <p><span className="font-medium">BTC Anchor:</span> <code className="bg-muted px-1 rounded">{generatedProof.btcAnchor}</code></p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proof Verifier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>ZK-Proof Verifier</span>
            <Badge variant="outline" className="demo-badge">DEMO</Badge>
          </CardTitle>
          <CardDescription>
            Verify ZK-proofs without revealing patient data
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter Patient ID to verify"
            value={verifyPatientId}
            onChange={(e) => setVerifyPatientId(e.target.value)}
          />
          
          <Button 
            onClick={verifyZKProof}
            disabled={verifyLoading || !verifyPatientId.trim()}
            className="w-full"
          >
            {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
            Verify ZK-Proof
          </Button>
          
          {verificationResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              verificationResult.verified 
                ? 'bg-success/10 border border-success/20' 
                : 'bg-destructive/10 border border-destructive/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-semibold ${
                  verificationResult.verified ? 'text-success' : 'text-destructive'
                }`}>
                  {verificationResult.verified ? 'Verification Successful' : 'Verification Failed'}
                </h4>
                <Badge className={`demo-badge ${
                  verificationResult.verified 
                    ? 'bg-success text-success-foreground' 
                    : 'bg-destructive text-destructive-foreground'
                }`}>
                  {verificationResult.verified ? 'VERIFIED' : 'FAILED'}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Patient ID:</span> {verificationResult.patientId}</p>
                <p><span className="font-medium">Timestamp:</span> {formatDateTime(verificationResult.timestamp)}</p>
                <p><span className="font-medium">Message:</span> {verificationResult.message}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ZKPDemo;
