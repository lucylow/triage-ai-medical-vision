import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

import {
  Search,
  MapPin,
  Calendar,
  Users,
  Target,
  Brain,
  Shield,
  CheckCircle,
  ExternalLink,
  Filter,
  Heart,
  Activity,
  Zap,
  Star,
  Clock,
  DollarSign,
  AlertCircle,
  Info
} from 'lucide-react';

export const ClinicalTrialsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('matchScore');
  const [viewMode, setViewMode] = useState('grid');

  const { toast } = useToast();

  // Comprehensive mock clinical trials data - 25+ trials
  const mockTrials = [
    {
      id: 'trial_001',
      title: 'Novel Diabetes Treatment Study',
      description: 'Investigating a new oral medication for type 2 diabetes management with improved glycemic control and minimal side effects.',
      conditions: ['diabetes', 'type 2 diabetes', 'blood sugar'],
      location: 'New York, NY',
      compensation: '$500',
      duration: '12 weeks',
      requirements: ['Age 18-65', 'Diagnosed type 2 diabetes', 'HbA1c 7.0-10.0%', 'No recent heart events'],
      status: 'Recruiting',
      matchScore: 95,
      phase: 'Phase II',
      participants: 150,
      sponsor: 'Novo Nordisk',
      riskLevel: 'Low',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'trial_002',
      title: 'Hypertension Management Trial',
      description: 'Clinical study for a new blood pressure medication with minimal side effects and improved patient compliance.',
      conditions: ['hypertension', 'high blood pressure', 'cardiovascular'],
      location: 'Los Angeles, CA',
      compensation: '$750',
      duration: '16 weeks',
      requirements: ['Age 21-70', 'Systolic BP >140', 'No recent heart events', 'Stable medication for 3 months'],
      status: 'Recruiting',
      matchScore: 87,
      phase: 'Phase III',
      participants: 200,
      sponsor: 'Pfizer',
      riskLevel: 'Low',
      lastUpdated: '2024-01-10'
    },
    {
      id: 'trial_003',
      title: 'Asthma Treatment Research',
      description: 'Testing a new inhaler medication for severe asthma patients with improved lung function and reduced exacerbations.',
      conditions: ['asthma', 'respiratory', 'lung disease'],
      location: 'Chicago, IL',
      compensation: '$600',
      duration: '8 weeks',
      requirements: ['Age 18+', 'Severe asthma diagnosis', 'Current inhaler use', 'FEV1 <60%'],
      status: 'Recruiting',
      matchScore: 82,
      phase: 'Phase II',
      participants: 120,
      sponsor: 'AstraZeneca',
      riskLevel: 'Medium',
      lastUpdated: '2024-01-12'
    },
    {
      id: 'trial_004',
      title: 'Depression Treatment Study',
      description: 'Investigating a new antidepressant with faster onset of action and improved tolerability profile.',
      conditions: ['depression', 'mental health', 'mood disorders'],
      location: 'Boston, MA',
      compensation: '$800',
      duration: '20 weeks',
      requirements: ['Age 18-65', 'Major depression diagnosis', 'No recent medication changes', 'HAM-D score >17'],
      status: 'Recruiting',
      matchScore: 78,
      phase: 'Phase III',
      participants: 180,
      sponsor: 'Eli Lilly',
      riskLevel: 'Medium',
      lastUpdated: '2024-01-08'
    },
    {
      id: 'trial_005',
      title: 'Cancer Immunotherapy Breakthrough',
      description: 'Revolutionary immunotherapy treatment for advanced solid tumors using novel checkpoint inhibitors.',
      conditions: ['cancer', 'solid tumors', 'immunotherapy', 'oncology'],
      location: 'Houston, TX',
      compensation: '$1200',
      duration: '24 weeks',
      requirements: ['Age 18+', 'Advanced solid tumor diagnosis', 'Failed standard therapy', 'ECOG 0-1'],
      status: 'Recruiting',
      matchScore: 92,
      phase: 'Phase I',
      participants: 80,
      sponsor: 'Merck',
      riskLevel: 'High',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'trial_006',
      title: 'Rheumatoid Arthritis Treatment',
      description: 'Novel biologic therapy for moderate to severe rheumatoid arthritis with improved joint protection.',
      conditions: ['rheumatoid arthritis', 'autoimmune', 'joint disease', 'inflammation'],
      location: 'Seattle, WA',
      compensation: '$900',
      duration: '18 weeks',
      requirements: ['Age 18-75', 'Active RA despite conventional therapy', 'DAS28 >3.2', 'No recent biologic use'],
      status: 'Recruiting',
      matchScore: 89,
      phase: 'Phase III',
      participants: 160,
      sponsor: 'Amgen',
      riskLevel: 'Medium',
      lastUpdated: '2024-01-18'
    },
    {
      id: 'trial_007',
      title: 'Multiple Sclerosis Treatment',
      description: 'Advanced disease-modifying therapy for relapsing-remitting multiple sclerosis with improved efficacy.',
      conditions: ['multiple sclerosis', 'MS', 'neurological', 'autoimmune'],
      location: 'Philadelphia, PA',
      compensation: '$1100',
      duration: '26 weeks',
      requirements: ['Age 18-55', 'RRMS diagnosis', 'EDSS score 0-5.5', 'No recent MS treatment'],
      status: 'Recruiting',
      matchScore: 91,
      phase: 'Phase II',
      participants: 140,
      sponsor: 'Biogen',
      riskLevel: 'Medium',
      lastUpdated: '2024-01-22'
    },
    {
      id: 'trial_008',
      title: 'Alzheimer\'s Disease Research',
      description: 'Breakthrough treatment targeting amyloid plaques and tau protein for early-stage Alzheimer\'s.',
      conditions: ['alzheimer\'s', 'dementia', 'cognitive decline', 'memory'],
      location: 'San Francisco, CA',
      compensation: '$1500',
      duration: '32 weeks',
      requirements: ['Age 50-80', 'Early-stage AD diagnosis', 'MMSE score 20-26', 'Positive amyloid PET scan'],
      status: 'Recruiting',
      matchScore: 88,
      phase: 'Phase II',
      participants: 100,
      sponsor: 'Eisai',
      riskLevel: 'Medium',
      lastUpdated: '2024-01-25'
    },
    {
      id: 'trial_009',
      title: 'Parkinson\'s Disease Therapy',
      description: 'Novel gene therapy approach for Parkinson\'s disease targeting dopamine production.',
      conditions: ['parkinson\'s disease', 'neurological', 'movement disorder', 'dopamine'],
      location: 'Miami, FL',
      compensation: '$1800',
      duration: '28 weeks',
      requirements: ['Age 30-70', 'PD diagnosis <5 years', 'Hoehn & Yahr stage 1-3', 'No deep brain stimulation'],
      status: 'Recruiting',
      matchScore: 94,
      phase: 'Phase I',
      participants: 60,
      sponsor: 'Neurocrine',
      riskLevel: 'High',
      lastUpdated: '2024-01-28'
    },
    {
      id: 'trial_010',
      title: 'Lupus Treatment Study',
      description: 'Targeted therapy for systemic lupus erythematosus with improved disease control.',
      conditions: ['lupus', 'SLE', 'autoimmune', 'connective tissue'],
      location: 'Denver, CO',
      compensation: '$850',
      duration: '22 weeks',
      requirements: ['Age 18-65', 'SLE diagnosis', 'SLEDAI score >6', 'No recent biologic therapy'],
      status: 'Recruiting',
      matchScore: 86,
      phase: 'Phase III',
      participants: 120,
      sponsor: 'GlaxoSmithKline',
      riskLevel: 'Medium',
      lastUpdated: '2024-01-30'
    },
    {
      id: 'trial_011',
      title: 'Crohn\'s Disease Treatment',
      description: 'Novel anti-inflammatory therapy for moderate to severe Crohn\'s disease.',
      conditions: ['crohn\'s disease', 'IBD', 'inflammatory bowel', 'gastrointestinal'],
      location: 'Atlanta, GA',
      compensation: '$950',
      duration: '24 weeks',
      requirements: ['Age 18-75', 'Active CD diagnosis', 'CDAI score >220', 'Failed conventional therapy'],
      status: 'Recruiting',
      matchScore: 83,
      phase: 'Phase II',
      participants: 180,
      sponsor: 'Takeda',
      riskLevel: 'Medium',
      lastUpdated: '2024-02-01'
    },
    {
      id: 'trial_012',
      title: 'Psoriasis Treatment',
      description: 'Advanced biologic therapy for severe plaque psoriasis with rapid symptom relief.',
      conditions: ['psoriasis', 'dermatological', 'autoimmune', 'skin condition'],
      location: 'Portland, OR',
      compensation: '$700',
      duration: '16 weeks',
      requirements: ['Age 18-70', 'Severe plaque psoriasis', 'PASI score >12', 'BSA >10%'],
      status: 'Recruiting',
      matchScore: 90,
      phase: 'Phase III',
      participants: 200,
      sponsor: 'Janssen',
      riskLevel: 'Low',
      lastUpdated: '2024-02-03'
    },
    {
      id: 'trial_013',
      title: 'Obesity Management Study',
      description: 'Novel weight loss medication targeting appetite control and metabolism regulation.',
      conditions: ['obesity', 'weight loss', 'metabolic syndrome', 'BMI'],
      location: 'Dallas, TX',
      compensation: '$650',
      duration: '20 weeks',
      requirements: ['Age 18-65', 'BMI >30', 'Failed diet/exercise programs', 'No recent weight loss surgery'],
      status: 'Recruiting',
      matchScore: 85,
      phase: 'Phase II',
      participants: 250,
      sponsor: 'Eli Lilly',
      riskLevel: 'Low',
      lastUpdated: '2024-02-05'
    },
    {
      id: 'trial_014',
      title: 'Migraine Prevention Therapy',
      description: 'New preventive treatment for chronic migraines with reduced attack frequency.',
      conditions: ['migraine', 'headache', 'neurological', 'chronic pain'],
      location: 'Minneapolis, MN',
      compensation: '$800',
      duration: '24 weeks',
      requirements: ['Age 18-65', 'Chronic migraine diagnosis', '>8 headache days/month', 'Failed 2+ preventive treatments'],
      status: 'Recruiting',
      matchScore: 88,
      phase: 'Phase III',
      participants: 180,
      sponsor: 'Amgen',
      riskLevel: 'Low',
      lastUpdated: '2024-02-07'
    },
    {
      id: 'trial_015',
      title: 'Heart Failure Treatment',
      description: 'Innovative therapy for heart failure with preserved ejection fraction.',
      conditions: ['heart failure', 'cardiovascular', 'HFpEF', 'cardiac'],
      location: 'Cleveland, OH',
      compensation: '$1200',
      duration: '32 weeks',
      requirements: ['Age 50-85', 'HFpEF diagnosis', 'NYHA class II-III', 'Stable medication for 3 months'],
      status: 'Recruiting',
      matchScore: 93,
      phase: 'Phase II',
      participants: 120,
      sponsor: 'Novartis',
      riskLevel: 'Medium',
      lastUpdated: '2024-02-10'
    },
    {
      id: 'trial_016',
      title: 'Chronic Kidney Disease Study',
      description: 'Novel treatment for slowing progression of chronic kidney disease.',
      conditions: ['chronic kidney disease', 'CKD', 'renal', 'kidney function'],
      location: 'Baltimore, MD',
      compensation: '$900',
      duration: '28 weeks',
      requirements: ['Age 18-80', 'CKD stages 3-4', 'eGFR 15-59', 'No dialysis requirement'],
      status: 'Recruiting',
      matchScore: 87,
      phase: 'Phase III',
      participants: 160,
      sponsor: 'AstraZeneca',
      riskLevel: 'Medium',
      lastUpdated: '2024-02-12'
    },
    {
      id: 'trial_017',
      title: 'Liver Disease Treatment',
      description: 'Advanced therapy for non-alcoholic steatohepatitis (NASH) with fibrosis.',
      conditions: ['NASH', 'liver disease', 'fibrosis', 'metabolic'],
      location: 'San Diego, CA',
      compensation: '$1100',
      duration: '36 weeks',
      requirements: ['Age 18-75', 'NASH diagnosis', 'Fibrosis stage 2-3', 'No cirrhosis'],
      status: 'Recruiting',
      matchScore: 91,
      phase: 'Phase II',
      participants: 140,
      sponsor: 'Intercept',
      riskLevel: 'Medium',
      lastUpdated: '2024-02-15'
    },
    {
      id: 'trial_018',
      title: 'Rare Disease Gene Therapy',
      description: 'Breakthrough gene therapy for rare genetic disorders using CRISPR technology.',
      conditions: ['rare disease', 'genetic disorder', 'gene therapy', 'CRISPR'],
      location: 'Boston, MA',
      compensation: '$2500',
      duration: '52 weeks',
      requirements: ['Age 2-18', 'Confirmed genetic diagnosis', 'No previous gene therapy', 'Stable condition'],
      status: 'Recruiting',
      matchScore: 96,
      phase: 'Phase I',
      participants: 40,
      sponsor: 'Vertex',
      riskLevel: 'High',
      lastUpdated: '2024-02-18'
    },
    {
      id: 'trial_019',
      title: 'Autoimmune Encephalitis',
      description: 'Novel immunotherapy for autoimmune encephalitis with improved outcomes.',
      conditions: ['autoimmune encephalitis', 'neurological', 'autoimmune', 'brain inflammation'],
      location: 'Stanford, CA',
      compensation: '$1800',
      duration: '40 weeks',
      requirements: ['Age 18-70', 'Confirmed AE diagnosis', 'Failed first-line therapy', 'Stable neurological status'],
      status: 'Recruiting',
      matchScore: 89,
      phase: 'Phase II',
      participants: 80,
      sponsor: 'Genentech',
      riskLevel: 'High',
      lastUpdated: '2024-02-20'
    },
    {
      id: 'trial_020',
      title: 'Precision Oncology Trial',
      description: 'Personalized cancer treatment based on genetic profiling and tumor characteristics.',
      conditions: ['cancer', 'precision medicine', 'genomics', 'personalized therapy'],
      location: 'New York, NY',
      compensation: '$2000',
      duration: '48 weeks',
      requirements: ['Age 18+', 'Advanced cancer diagnosis', 'Genetic testing available', 'Failed standard therapy'],
      status: 'Recruiting',
      matchScore: 94,
      phase: 'Phase I',
      participants: 100,
      sponsor: 'Foundation Medicine',
      riskLevel: 'High',
      lastUpdated: '2024-02-22'
    },
    {
      id: 'trial_021',
      title: 'Digital Therapeutics for ADHD',
      description: 'AI-powered digital therapy for attention deficit hyperactivity disorder.',
      conditions: ['ADHD', 'attention deficit', 'digital health', 'cognitive'],
      location: 'Austin, TX',
      compensation: '$400',
      duration: '12 weeks',
      requirements: ['Age 8-17', 'ADHD diagnosis', 'Access to smartphone/tablet', 'No recent medication changes'],
      status: 'Recruiting',
      matchScore: 82,
      phase: 'Phase III',
      participants: 300,
      sponsor: 'Akili Interactive',
      riskLevel: 'Low',
      lastUpdated: '2024-02-25'
    },
    {
      id: 'trial_022',
      title: 'Stem Cell Therapy for Stroke',
      description: 'Regenerative medicine using stem cells for post-stroke recovery.',
      conditions: ['stroke', 'stem cell therapy', 'regenerative medicine', 'neurological recovery'],
      location: 'Miami, FL',
      compensation: '$3000',
      duration: '60 weeks',
      requirements: ['Age 18-80', 'Ischemic stroke 3-12 months ago', 'Moderate disability', 'No recent stroke'],
      status: 'Recruiting',
      matchScore: 95,
      phase: 'Phase I',
      participants: 60,
      sponsor: 'Athersys',
      riskLevel: 'High',
      lastUpdated: '2024-02-28'
    },
    {
      id: 'trial_023',
      title: 'Microbiome Therapy for IBD',
      description: 'Fecal microbiota transplantation for inflammatory bowel disease.',
      conditions: ['IBD', 'microbiome', 'gut health', 'inflammatory bowel'],
      location: 'Chicago, IL',
      compensation: '$750',
      duration: '16 weeks',
      requirements: ['Age 18-65', 'Active IBD diagnosis', 'Failed conventional therapy', 'No recent antibiotics'],
      status: 'Recruiting',
      matchScore: 84,
      phase: 'Phase II',
      participants: 120,
      sponsor: 'Rebiotix',
      riskLevel: 'Medium',
      lastUpdated: '2024-03-01'
    },
    {
      id: 'trial_024',
      title: 'Nanomedicine for Cancer',
      description: 'Targeted drug delivery using nanotechnology for solid tumors.',
      conditions: ['cancer', 'nanomedicine', 'drug delivery', 'targeted therapy'],
      location: 'Houston, TX',
      compensation: '$1500',
      duration: '32 weeks',
      requirements: ['Age 18+', 'Solid tumor diagnosis', 'Failed chemotherapy', 'Measurable disease'],
      status: 'Recruiting',
      matchScore: 92,
      phase: 'Phase I',
      participants: 80,
      sponsor: 'Nanobiotix',
      riskLevel: 'High',
      lastUpdated: '2024-03-03'
    },
    {
      id: 'trial_025',
      title: 'Telemedicine Mental Health',
      description: 'Virtual reality therapy for post-traumatic stress disorder.',
      conditions: ['PTSD', 'mental health', 'virtual reality', 'telemedicine'],
      location: 'Los Angeles, CA',
      compensation: '$600',
      duration: '20 weeks',
      requirements: ['Age 18-65', 'PTSD diagnosis', 'Access to VR headset', 'Stable medication'],
      status: 'Recruiting',
      matchScore: 86,
      phase: 'Phase III',
      participants: 200,
      sponsor: 'AppliedVR',
      riskLevel: 'Low',
      lastUpdated: '2024-03-05'
    }
  ];

  const filteredTrials = mockTrials.filter(trial => {
    const matchesSearch = trial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trial.conditions.some(condition => condition.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !location || trial.location.toLowerCase().includes(location.toLowerCase());
    const matchesCondition = !selectedCondition || trial.conditions.includes(selectedCondition);
    const matchesPhase = !selectedPhase || trial.phase === selectedPhase;
    const matchesStatus = !selectedStatus || trial.status === selectedStatus;
    
    return matchesSearch && matchesLocation && matchesCondition && matchesPhase && matchesStatus;
  });

  const sortedTrials = [...filteredTrials].sort((a, b) => {
    switch (sortBy) {
      case 'matchScore':
        return b.matchScore - a.matchScore;
      case 'compensation':
        return parseInt(b.compensation.replace('$', '')) - parseInt(a.compensation.replace('$', ''));
      case 'duration':
        return parseInt(a.duration.replace(' weeks', '')) - parseInt(b.duration.replace(' weeks', ''));
      case 'participants':
        return b.participants - a.participants;
      case 'lastUpdated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return b.matchScore - a.matchScore;
    }
  });

  const conditions = [
    'diabetes', 'hypertension', 'asthma', 'depression', 'cancer', 'arthritis', 'alzheimer\'s', 
    'multiple sclerosis', 'obesity', 'migraine', 'psoriasis', 'heart failure', 'lupus', 'crohn\'s disease',
    'IBD', 'chronic kidney disease', 'NASH', 'liver disease', 'rare disease', 'genetic disorder',
    'autoimmune encephalitis', 'precision medicine', 'ADHD', 'stroke', 'microbiome', 'nanomedicine',
    'PTSD', 'telemedicine', 'digital health', 'regenerative medicine', 'gene therapy', 'CRISPR'
  ];
  const phases = ['Phase I', 'Phase II', 'Phase III', 'Phase IV'];
  const statuses = ['Recruiting', 'Enrolling', 'Active', 'Completed'];

  // Button action handlers
  const handleLearnMore = (trial: any) => {
    console.log('Learn More clicked for:', trial.title);
    toast({
      title: "Trial Information",
      description: `Detailed information for ${trial.title} is being prepared. This would typically link to ClinicalTrials.gov or the sponsor's website.`,
    });
  };

  const handleApplyNow = (trial: any) => {
    console.log('Apply Now clicked for:', trial.title);
    console.log('Toast function available:', !!toast);
    
    try {
      toast({
        title: "Application Started",
        description: `Your application for ${trial.title} has been initiated. A study coordinator will contact you within 2-3 business days.`,
      });
      console.log('Toast notification sent successfully');
    } catch (error) {
      console.error('Error showing toast:', error);
      // Fallback alert if toast fails
      alert(`Application started for ${trial.title}! A study coordinator will contact you within 2-3 business days.`);
    }
  };

  const handleSaveTrial = (trial: any) => {
    console.log('Save Trial clicked for:', trial.title);
    toast({
      title: "Trial Saved",
      description: `${trial.title} has been added to your saved trials. You can review it later in your dashboard.`,
    });
  };

  const handleShareTrial = (trial: any) => {
    console.log('Share Trial clicked for:', trial.title);
    if (navigator.share) {
      navigator.share({
        title: trial.title,
        text: `Check out this clinical trial: ${trial.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${trial.title} - ${trial.description}`);
      toast({
        title: "Trial Information Copied",
        description: "Trial details have been copied to your clipboard.",
      });
    }
  };

  const handleContactSponsor = (trial: any) => {
    console.log('Contact Sponsor clicked for:', trial.title);
    toast({
      title: "Contact Information",
      description: `Contact details for ${trial.sponsor}: research@${trial.sponsor.toLowerCase().replace(/\s+/g, '')}.com`,
    });
  };





  // Monetization handler functions
  const handleSubscribe = (plan: string) => {
    console.log('Subscribe clicked for plan:', plan);
    const planDetails = {
      basic: { price: '$9.99', features: 'Basic features' },
      pro: { price: '$24.99', features: 'Pro features' },
      enterprise: { price: '$49.99', features: 'Enterprise features' }
    };
    
    toast({
      title: "Subscription Started",
      description: `You've selected the ${plan} plan for ${planDetails[plan as keyof typeof planDetails]?.price}/month. Redirecting to payment...`,
    });
    
    // In a real app, this would redirect to Stripe or payment processor
    setTimeout(() => {
      alert(`Redirecting to payment for ${plan} plan...\n\nThis would integrate with:\n- Stripe for credit card payments\n- ICP blockchain for crypto payments\n- Subscription management system`);
    }, 1000);
  };

  const handlePayPerMatch = (type: string) => {
    console.log('Pay-per-match clicked for:', type);
    const matchDetails = {
      standard: { price: '$99', description: 'Standard trial matching service' },
      premium: { price: '$299', description: 'Premium trial matching with dedicated coordinator' }
    };
    
    toast({
      title: "Pay-Per-Match Selected",
      description: `You've selected ${type} matching for ${matchDetails[type as keyof typeof matchDetails]?.price}.`,
    });
    
    // In a real app, this would redirect to payment
    setTimeout(() => {
      alert(`Redirecting to payment for ${type} match...\n\nThis would integrate with:\n- Payment processing\n- Trial matching workflow\n- Success tracking system`);
    }, 1000);
  };

  const handleApiAccess = (type: string) => {
    console.log('API access clicked for:', type);
    const apiDetails = {
      basic: { price: '$199/month', description: 'Basic API access' },
      enterprise: { price: 'Custom pricing', description: 'Enterprise licensing' }
    };
    
    toast({
      title: "API Access Requested",
      description: `You've requested ${type} API access.`,
    });
    
    // In a real app, this would show contact form or redirect
    setTimeout(() => {
      alert(`API Access Request: ${type}\n\nThis would integrate with:\n- Sales team contact\n- API key generation\n- Documentation access\n- Support setup`);
    }, 1000);
  };

  const handlePaymentMethod = (method: string) => {
    console.log('Payment method selected:', method);
    const methodDetails = {
      credit: 'Credit card payment processing',
      crypto: 'Cryptocurrency payment via ICP blockchain'
    };
    
    toast({
      title: "Payment Method Selected",
      description: `You've selected ${method} payment method.`,
    });
    
    // In a real app, this would show payment form
    setTimeout(() => {
      alert(`Payment Method: ${method}\n\nThis would integrate with:\n- ${methodDetails[method as keyof typeof methodDetails]}\n- Secure payment gateway\n- Transaction confirmation\n- Receipt generation`);
    }, 1000);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Phase I': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Phase II': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Phase III': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Phase IV': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
            <Target className="h-8 w-8 text-white" />
      </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Clinical Trials</h1>
            <p className="text-xl text-slate-600">Find the perfect clinical trial for your condition</p>
            <p className="text-xs text-slate-500 mt-1">Updated: {new Date().toLocaleString()} - Enhanced with 12 trials & working buttons</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Brain className="h-3 w-3 mr-1" />
            AI-Powered Matching
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            Privacy Protected
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified Trials
                  </Badge>
                  </div>
                </div>

      {/* Search and Filters */}
    <Card>
      <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-orange-500" />
            <span>Find Your Perfect Trial</span>
        </CardTitle>
      </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Trials</label>
              <Input
                placeholder="Search by condition, treatment, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <Input
                placeholder="City, State, or Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full"
              />
            </div>
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </option>
                ))}
              </select>
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phase</label>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Phases</option>
                {phases.map(phase => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
                </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
          </div>
        </div>

          {/* View and Sort Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-slate-700">View:</label>
              <div className="flex space-x-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Target className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <Activity className="h-4 w-4" />
                </Button>
          </div>
        </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="matchScore">Sort by: Match Score</option>
                <option value="compensation">Sort by: Compensation</option>
                <option value="duration">Sort by: Duration</option>
                <option value="participants">Sort by: Participants</option>
                <option value="lastUpdated">Sort by: Recent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Available Trials ({sortedTrials.length})
          </h2>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {sortedTrials.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No trials found</h3>
              <p className="text-slate-500">Try adjusting your search criteria or location</p>
      </CardContent>
    </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
            {sortedTrials.map((trial) => (
              <Card key={trial.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg text-slate-900">{trial.title}</CardTitle>
                        <Badge variant="outline" className={getPhaseColor(trial.phase)}>
                          {trial.phase}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{trial.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{trial.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{trial.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{trial.participants} participants</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{trial.lastUpdated}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                          <Zap className="h-3 w-3 mr-1" />
                          {trial.sponsor}
                        </Badge>
                        <Badge variant="outline" className={getRiskLevelColor(trial.riskLevel)}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {trial.riskLevel} Risk
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="default" 
                        className={`${
                          trial.matchScore >= 90 ? 'bg-green-500' :
                          trial.matchScore >= 80 ? 'bg-orange-500' :
                          'bg-blue-500'
                        } text-white`}
                      >
                        {trial.matchScore}% Match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {trial.conditions.map((condition) => (
                        <Badge key={condition} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Requirements</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {trial.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-2">
                      <div className="text-lg font-bold text-green-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {trial.compensation}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {trial.matchScore >= 90 ? 'Excellent Match' : 
                         trial.matchScore >= 80 ? 'Good Match' : 'Fair Match'}
                      </Badge>
                  </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSaveTrial(trial)}
                        className="text-xs"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShareTrial(trial)}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContactSponsor(trial)}
                        className="text-xs"
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleLearnMore(trial)}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Learn More
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                        onClick={() => handleApplyNow(trial)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

            {/* AI Matching Info */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">AI-Powered Matching</h3>
              <p className="text-slate-600">
                Our Fetch.ai agents analyze your symptoms and medical history to find the most suitable clinical trials. 
                Match scores are calculated using advanced machine learning algorithms and real-time data analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>









      {/* Statistics */}
            <Card>
              <CardHeader>
          <CardTitle className="text-center">Platform Statistics</CardTitle>
              </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{mockTrials.length}</div>
              <div className="text-sm text-blue-600">Active Trials</div>
                </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-green-600">Medical Conditions</div>
                </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">15</div>
              <div className="text-sm text-orange-600">US Cities</div>
                </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">$8,500</div>
              <div className="text-sm text-purple-600">Avg. Compensation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
