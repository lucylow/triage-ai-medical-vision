import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { 
  MapPin, 
  Calendar, 
  Users, 
  ExternalLink, 
  Shield,
  FileText,
  Clock
} from 'lucide-react';

interface TrialCardProps {
  trial: {
    id: string;
    title: string;
    description: string;
    phase: string;
    status: string;
    sponsor: string;
    locations: string[];
    criteria: string;
    matchScore: number;
    url?: string;
    startDate: string;
    endDate: string;
    participants: number;
    contact: string;
    zkProof?: {
      proofId: string;
      timestamp: string;
      btcTx: string;
    };
  };
  onSelect?: (trial: any) => void;
  onViewConsent?: (trial: any) => void;
  selected?: boolean;
}

export const TrialCard: React.FC<TrialCardProps> = ({ 
  trial, 
  onSelect, 
  onViewConsent,
  selected = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'recruiting':
        return 'hsl(var(--confidence-high))';
      case 'active, not recruiting':
        return 'hsl(var(--confidence-medium))';
      case 'completed':
        return 'hsl(var(--muted-foreground))';
      default:
        return 'hsl(var(--confidence-low))';
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      selected ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight mb-2 text-foreground">
              {trial.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {trial.id}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs font-medium"
                style={{ 
                  borderColor: getStatusColor(trial.status),
                  color: getStatusColor(trial.status)
                }}
              >
                {trial.status}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {trial.phase}
              </Badge>
            </div>
          </div>
          <ConfidenceIndicator score={trial.matchScore} label="Match" size="sm" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {trial.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {trial.locations.slice(0, 2).join(', ')}
              {trial.locations.length > 2 && ` +${trial.locations.length - 2} more`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {trial.participants} participants
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {formatDate(trial.startDate)} - {formatDate(trial.endDate)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Sponsor: {trial.sponsor}
            </span>
          </div>
        </div>

        {trial.zkProof && (
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">ZK Privacy Proof</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Proof ID: {trial.zkProof.proofId}</div>
              <div>BTC TX: {trial.zkProof.btcTx.substring(0, 16)}...</div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onSelect && (
            <Button 
              onClick={() => onSelect(trial)}
              size="sm"
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
          
          {onViewConsent && (
            <Button 
              onClick={() => onViewConsent(trial)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              Consent Form
            </Button>
          )}

          {trial.url && (
            <Button 
              onClick={() => window.open(trial.url, '_blank')}
              variant="ghost"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};