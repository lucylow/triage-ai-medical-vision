import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Shield, 
  Globe, 
  Database, 
  Brain,
  Lock,
  Cpu,
  Target,
  MessageSquare,
  Users,
  Activity,
  CreditCard,
  Bitcoin,
  Ethereum,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';
import { 
  monetizationPlans, 
  payPerUseFeatures, 
  cryptoPaymentOptions,
  MonetizationPlan,
  calculateYearlyDiscount,
  getYearlyPrice
} from '../data/monetizationPlans';

interface PricingPageProps {
  className?: string;
}

export default function PricingPage({ className }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = (planId: string) => {
    // In a real app, this would redirect to payment processing
    console.log(`Subscribing to plan: ${planId}`);
    alert(`Redirecting to payment for ${planId} plan...`);
  };

  const getSupportIcon = (level: string) => {
    switch (level) {
      case 'basic':
        return <Mail className="h-4 w-4" />;
      case 'priority':
        return <Phone className="h-4 w-4" />;
      case 'dedicated':
        return <Users className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getSupportText = (level: string) => {
    switch (level) {
      case 'basic':
        return 'Email Support (48h)';
      case 'priority':
        return '24/7 Phone & Chat';
      case 'dedicated':
        return 'Dedicated Account Manager';
      default:
        return 'Standard Support';
    }
  };

  const renderPlanCard = (plan: MonetizationPlan) => {
    const isPopular = plan.popular;
    const yearlyPrice = getYearlyPrice(plan.price);
    const yearlyDiscount = calculateYearlyDiscount(plan.price);
    const displayPrice = billingCycle === 'yearly' ? yearlyPrice : plan.price;
    const displayPeriod = billingCycle === 'yearly' ? 'year' : 'month';

    return (
      <Card 
        key={plan.id} 
        className={`relative ${plan.color} border-2 ${
          isPopular ? 'ring-2 ring-grey-400 shadow-lg' : ''
        } hover:shadow-lg transition-all duration-300`}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-grey-800 text-white px-3 py-1">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-grey-900">{plan.name}</CardTitle>
          <p className="text-grey-600 text-sm">{plan.description}</p>
          
          <div className="mt-4">
            <div className="flex items-baseline justify-center">
              <span className="text-4xl font-bold text-grey-900">${displayPrice}</span>
              <span className="text-grey-600 ml-1">/{displayPeriod}</span>
            </div>
            
            {billingCycle === 'yearly' && (
              <div className="mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Save ${yearlyDiscount}/year
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2 text-sm text-grey-600">
            {plan.maxTrials && plan.maxTrials > 0 ? (
              <div className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                <span>Up to {plan.maxTrials} trial listings</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                <span>Unlimited trial listings</span>
              </div>
            )}
            
            {plan.maxUsers && plan.maxUsers > 0 ? (
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>Up to {plan.maxUsers} users</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>Unlimited users</span>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-4 w-4" />
              <span>{plan.apiCalls?.toLocaleString()} API calls/month</span>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              {getSupportIcon(plan.supportLevel)}
              <span>{getSupportText(plan.supportLevel)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            {plan.features.map((feature) => (
              <div key={feature.id} className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  feature.included 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-grey-100 text-grey-400'
                }`}>
                  {feature.included ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm ${
                    feature.included ? 'text-grey-900' : 'text-grey-500'
                  }`}>
                    <span className={`font-medium ${
                      feature.highlight ? 'text-grey-900 bg-yellow-100 px-1 rounded' : ''
                    }`}>
                      {feature.name}
                    </span>
                    <span className="text-grey-600 ml-2">{feature.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="text-center">
            <Button
              className={`w-full ${
                isPopular 
                  ? 'bg-grey-800 hover:bg-grey-900 text-white' 
                  : 'bg-grey-100 hover:bg-grey-200 text-grey-900'
              }`}
              onClick={() => handleSubscribe(plan.id)}
            >
              {plan.cta}
            </Button>
            
            <p className="text-xs text-grey-500 mt-2">
              {plan.trialDays}-day free trial • No credit card required
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-grey-900">Pricing & Plans</h1>
        <p className="text-xl text-grey-600 max-w-3xl mx-auto">
          Choose the perfect plan for your clinical research needs. 
          From individual investigators to enterprise pharmaceutical companies.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-grey-900' : 'text-grey-500'}`}>
            Monthly
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative"
          >
            <div className={`w-5 h-5 rounded-full bg-grey-800 transition-transform duration-200 ${
              billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </Button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-grey-900' : 'text-grey-500'}`}>
            Yearly
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              Save 20%
            </Badge>
          </span>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-grey-900 mb-2">Subscription Plans</h2>
          <p className="text-grey-600">All plans include our core privacy-preserving technology</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {monetizationPlans.map(renderPlanCard)}
        </div>
      </div>

      {/* Pay-Per-Use Options */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-grey-900 mb-2">Pay-Per-Use Options</h2>
          <p className="text-grey-600">Flexible pricing for specific needs and integrations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payPerUseFeatures.map((feature) => (
            <Card key={feature.id} className="border-grey-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-grey-600" />
                  {feature.name}
                </CardTitle>
                <p className="text-grey-600 text-sm">{feature.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-grey-900">
                    ${feature.price}
                    {feature.id === 'api_call' && <span className="text-lg">/call</span>}
                    {feature.id === 'custom_development' && <span className="text-lg">/hour</span>}
                  </div>
                  <p className="text-sm text-grey-500">{feature.details}</p>
                </div>
                
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Crypto Payment Options */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-grey-900 mb-2">Crypto Payment Options</h2>
          <p className="text-grey-600">Pay with cryptocurrency and receive additional discounts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cryptoPaymentOptions.map((crypto) => (
            <Card key={crypto.id} className="text-center border-grey-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">{crypto.icon}</div>
                <h3 className="font-semibold text-grey-900 mb-1">{crypto.name}</h3>
                <p className="text-sm text-grey-600 mb-3">{crypto.description}</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {crypto.id === 'internet_computer' ? '10%' : 
                   crypto.id === 'bitcoin' ? '5%' : 
                   crypto.id === 'ethereum' ? '3%' : '1%'} discount
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-grey-900 mb-2">Feature Comparison</h2>
          <p className="text-grey-600">Detailed breakdown of what's included in each plan</p>
        </div>

        <Card className="border-grey-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey-200">
                    <th className="text-left p-4 font-semibold text-grey-900">Feature</th>
                    {monetizationPlans.map((plan) => (
                      <th key={plan.id} className="text-center p-4 font-semibold text-grey-900">
                        {plan.name}
                        {plan.popular && (
                          <Badge className="ml-2 bg-grey-800 text-white">Popular</Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monetizationPlans[0].features.map((feature) => (
                    <tr key={feature.id} className="border-b border-grey-100">
                      <td className="p-4 text-sm text-grey-700">
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-xs text-grey-500 mt-1">{feature.description}</div>
                      </td>
                      {monetizationPlans.map((plan) => {
                        const planFeature = plan.features.find(f => f.id === feature.id);
                        return (
                          <td key={plan.id} className="text-center p-4">
                            {planFeature?.included ? (
                              <Check className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-grey-400 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-grey-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-grey-600">Common questions about our pricing and plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-grey-200">
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-grey-600">
                Yes! You can upgrade, downgrade, or cancel your plan at any time. 
                Changes take effect at the start of your next billing cycle.
              </p>
            </CardContent>
          </Card>

          <Card className="border-grey-200">
            <CardHeader>
              <CardTitle className="text-lg">What's included in the free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-grey-600">
                Your free trial includes full access to all plan features, 
                with no credit card required. Start exploring immediately!
              </p>
            </CardContent>
          </Card>

          <Card className="border-grey-200">
            <CardHeader>
              <CardTitle className="text-lg">Do you offer custom pricing?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-grey-600">
                Absolutely! For enterprise customers with specific needs, 
                we offer custom pricing and dedicated solutions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-grey-200">
            <CardHeader>
              <CardTitle className="text-lg">How do crypto payments work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-grey-600">
                We accept major cryptocurrencies and provide instant discounts. 
                Payments are processed securely through our blockchain infrastructure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4">
        <Card className="bg-gradient-to-r from-grey-50 to-grey-100 border-grey-200">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-grey-900 mb-2">Ready to Get Started?</h2>
            <p className="text-grey-600 mb-6">
              Join thousands of researchers already using GreyGuard Trials to accelerate their clinical research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-grey-800 hover:bg-grey-900 text-white">
                <Sparkles className="h-5 w-5 mr-2" />
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg">
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
