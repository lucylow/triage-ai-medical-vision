export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  highlight?: boolean;
}

export interface MonetizationPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  currency: string;
  features: PlanFeature[];
  popular?: boolean;
  maxTrials?: number;
  maxUsers?: number;
  apiCalls?: number;
  supportLevel: 'basic' | 'priority' | 'dedicated';
  trialDays: number;
  cta: string;
  color: string;
}

export const monetizationPlans: MonetizationPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for small research organizations and individual investigators',
    price: 99,
    billingCycle: 'monthly',
    currency: 'USD',
    color: 'bg-green-50 border-green-200',
    features: [
      { id: 'trial_listings', name: 'Trial Listings', description: 'Up to 10 active trial listings', included: true },
      { id: 'patient_matching', name: 'Patient Matching', description: 'Basic AI-powered matching algorithm', included: true },
      { id: 'consent_management', name: 'Consent Management', description: 'Digital consent forms and tracking', included: true },
      { id: 'basic_analytics', name: 'Basic Analytics', description: 'Simple recruitment metrics and reports', included: true },
      { id: 'email_support', name: 'Email Support', description: 'Standard email support (48h response)', included: true },
      { id: 'api_access', name: 'API Access', description: 'Limited API calls (1,000/month)', included: true },
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed insights and predictive modeling', included: false },
      { id: 'priority_support', name: 'Priority Support', description: '24/7 phone and chat support', included: false },
      { id: 'custom_integration', name: 'Custom Integration', description: 'White-label and custom branding', included: false },
      { id: 'blockchain_audit', name: 'Blockchain Audit', description: 'Full audit trail and compliance reporting', included: false }
    ],
    maxTrials: 10,
    maxUsers: 5,
    apiCalls: 1000,
    supportLevel: 'basic',
    trialDays: 14,
    cta: 'Start Free Trial'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for mid-sized CROs and research institutions',
    price: 299,
    billingCycle: 'monthly',
    currency: 'USD',
    color: 'bg-blue-50 border-blue-200',
    popular: true,
    features: [
      { id: 'trial_listings', name: 'Trial Listings', description: 'Up to 50 active trial listings', included: true },
      { id: 'patient_matching', name: 'Patient Matching', description: 'Advanced AI matching with ZK-proofs', included: true },
      { id: 'consent_management', name: 'Consent Management', description: 'Advanced consent workflows and compliance', included: true },
      { id: 'basic_analytics', name: 'Basic Analytics', description: 'Simple recruitment metrics and reports', included: true },
      { id: 'email_support', name: 'Email Support', description: 'Standard email support (48h response)', included: true },
      { id: 'api_access', name: 'API Access', description: 'Limited API calls (1,000/month)', included: true },
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed insights and predictive modeling', included: true },
      { id: 'priority_support', name: 'Priority Support', description: '24/7 phone and chat support', included: true },
      { id: 'custom_integration', name: 'Custom Integration', description: 'White-label and custom branding', included: false },
      { id: 'blockchain_audit', name: 'Blockchain Audit', description: 'Full audit trail and compliance reporting', included: false }
    ],
    maxTrials: 50,
    maxUsers: 25,
    apiCalls: 10000,
    supportLevel: 'priority',
    trialDays: 14,
    cta: 'Start Free Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large pharmaceutical companies and major research networks',
    price: 999,
    billingCycle: 'monthly',
    currency: 'USD',
    color: 'bg-purple-50 border-purple-200',
    features: [
      { id: 'trial_listings', name: 'Trial Listings', description: 'Unlimited trial listings', included: true, highlight: true },
      { id: 'patient_matching', name: 'Patient Matching', description: 'Enterprise AI with custom algorithms', included: true, highlight: true },
      { id: 'consent_management', name: 'Consent Management', description: 'Enterprise consent and compliance suite', included: true },
      { id: 'basic_analytics', name: 'Basic Analytics', description: 'Simple recruitment metrics and reports', included: true },
      { id: 'email_support', name: 'Email Support', description: 'Standard email support (48h response)', included: true },
      { id: 'api_access', name: 'API Access', description: 'Limited API calls (1,000/month)', included: true },
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed insights and predictive modeling', included: true },
      { id: 'priority_support', name: 'Priority Support', description: '24/7 phone and chat support', included: true },
      { id: 'custom_integration', name: 'Custom Integration', description: 'White-label and custom branding', included: true, highlight: true },
      { id: 'blockchain_audit', name: 'Blockchain Audit', description: 'Full audit trail and compliance reporting', included: true, highlight: true }
    ],
    maxTrials: -1, // Unlimited
    maxUsers: -1, // Unlimited
    apiCalls: 100000,
    supportLevel: 'dedicated',
    trialDays: 30,
    cta: 'Contact Sales'
  }
];

export const payPerUseFeatures = [
  {
    id: 'successful_match',
    name: 'Pay-Per-Successful Match',
    description: 'Only pay when a patient successfully matches and consents to a trial',
    price: 25,
    currency: 'USD',
    details: 'Includes full patient onboarding, consent verification, and trial coordination'
  },
  {
    id: 'api_call',
    name: 'API Call Pricing',
    description: 'Pay-as-you-go API access for integration with existing systems',
    price: 0.01,
    currency: 'USD',
    details: 'Per API call, with volume discounts available'
  },
  {
    id: 'data_export',
    name: 'Data Export & Analytics',
    description: 'Comprehensive data export and advanced analytics reports',
    price: 50,
    currency: 'USD',
    details: 'One-time fee for detailed recruitment analytics and compliance reports'
  },
  {
    id: 'custom_development',
    name: 'Custom Development',
    description: 'Bespoke features and integrations for your specific needs',
    price: 150,
    currency: 'USD',
    details: 'Per hour of custom development and integration work'
  }
];

export const cryptoPaymentOptions = [
  {
    id: 'bitcoin',
    name: 'Bitcoin (BTC)',
    symbol: 'BTC',
    icon: '₿',
    description: 'Pay with Bitcoin for 5% discount'
  },
  {
    id: 'ethereum',
    name: 'Ethereum (ETH)',
    symbol: 'ETH',
    icon: 'Ξ',
    description: 'Pay with Ethereum for 3% discount'
  },
  {
    id: 'internet_computer',
    name: 'Internet Computer (ICP)',
    symbol: 'ICP',
    icon: '⚡',
    description: 'Pay with ICP for 10% discount (native platform)'
  },
  {
    id: 'usdc',
    name: 'USD Coin (USDC)',
    symbol: 'USDC',
    icon: '💵',
    description: 'Stable coin payment with 1% discount'
  }
];

export const getPlanById = (id: string): MonetizationPlan | undefined => {
  return monetizationPlans.find(plan => plan.id === id);
};

export const getPopularPlan = (): MonetizationPlan | undefined => {
  return monetizationPlans.find(plan => plan.popular);
};

export const calculateYearlyDiscount = (monthlyPrice: number): number => {
  return Math.round(monthlyPrice * 12 * 0.2); // 20% discount for yearly
};

export const getYearlyPrice = (monthlyPrice: number): number => {
  return monthlyPrice * 12 - calculateYearlyDiscount(monthlyPrice);
};
