import { toast } from '../hooks/use-toast';

export interface FetchAgent {
  id: string;
  name: string;
  address: string;
  capabilities: string[];
  status: string;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  type: 'text' | 'analysis' | 'match' | 'recommendation';
}

export interface PatientAnalysis {
  patientId: string;
  conditions: string[];
  riskFactors: string[];
  recommendations: string[];
  matchingTrials: string[];
  confidence: number;
}

export interface TrialAnalysis {
  trialId: string;
  suitability: number;
  requirements: string[];
  exclusions: string[];
  recommendations: string[];
}

export class FetchAgentService {
  private static instance: FetchAgentService;
  private agents: Map<string, FetchAgent> = new Map();
  private messageHistory: Map<string, AgentMessage[]> = new Map();

  public static getInstance(): FetchAgentService {
    if (!FetchAgentService.instance) {
      FetchAgentService.instance = new FetchAgentService();
    }
    return FetchAgentService.instance;
  }

  constructor() {
    this.initializeDefaultAgents();
  }

  private initializeDefaultAgents() {
    const defaultAgents: FetchAgent[] = [
      {
        id: 'patient_analysis_agent',
        name: 'Patient Analysis Agent',
        address: 'fetch1h6u0j6u0j6u0j6u0j6u0j6u0j6u0j6u0',
        capabilities: ['patient_analysis', 'condition_matching', 'risk_assessment'],
        status: 'active'
      },
      {
        id: 'trial_matching_agent',
        name: 'Trial Matching Agent',
        address: 'fetch1h6u0j6u0j6u0j6u0j6u0j6u0j6u0j6u1',
        capabilities: ['trial_analysis', 'matching_algorithm', 'eligibility_check'],
        status: 'active'
      },
      {
        id: 'recommendation_agent',
        name: 'Recommendation Agent',
        address: 'fetch1h6u0j6u0j6u0j6u0j6u0j6u0j6u0j6u2',
        capabilities: ['personalized_recommendations', 'treatment_planning'],
        status: 'active'
      }
    ];

    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  // Get all available agents
  public getAgents(): FetchAgent[] {
    return Array.from(this.agents.values());
  }

  // Get agent by ID
  public getAgent(agentId: string): FetchAgent | undefined {
    return this.agents.get(agentId);
  }

  // Send message to agent (Chat Protocol implementation)
  public async sendMessage(agentId: string, content: string, messageType: AgentMessage['type'] = 'text'): Promise<AgentMessage> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const message: AgentMessage = {
      id: this.generateMessageId(),
      from: 'user',
      to: agentId,
      content,
      timestamp: Date.now(),
      type: messageType
    };

    // Store message in history
    if (!this.messageHistory.has(agentId)) {
      this.messageHistory.set(agentId, []);
    }
    this.messageHistory.get(agentId)!.push(message);

    // Simulate agent response (in real implementation, this would call Fetch.ai network)
    const response = await this.simulateAgentResponse(agentId, content, messageType);
    
    // Store agent response
    this.messageHistory.get(agentId)!.push(response);

    return response;
  }

  // Get message history for an agent
  public getMessageHistory(agentId: string): AgentMessage[] {
    return this.messageHistory.get(agentId) || [];
  }

  // Analyze patient using Fetch.ai agents
  public async analyzePatient(patientData: any): Promise<PatientAnalysis> {
    console.log('🔍 Starting patient analysis with Fetch.ai agents...');

    try {
      // Send patient data to Patient Analysis Agent
      const analysisMessage = await this.sendMessage(
        'patient_analysis_agent',
        JSON.stringify(patientData),
        'analysis'
      );

      // Send to Trial Matching Agent for trial recommendations
      const matchingMessage = await this.sendMessage(
        'trial_matching_agent',
        analysisMessage.content,
        'match'
      );

      // Get recommendations from Recommendation Agent
      const recommendationMessage = await this.sendMessage(
        'recommendation_agent',
        matchingMessage.content,
        'recommendation'
      );

      // Parse and return analysis results
      const analysis: PatientAnalysis = {
        patientId: patientData.id || 'unknown',
        conditions: this.extractConditions(analysisMessage.content),
        riskFactors: this.extractRiskFactors(analysisMessage.content),
        recommendations: this.extractRecommendations(recommendationMessage.content),
        matchingTrials: this.extractMatchingTrials(matchingMessage.content),
        confidence: this.calculateConfidence(analysisMessage.content)
      };

      console.log('✅ Patient analysis completed:', analysis);
      return analysis;

    } catch (error) {
      console.error('❌ Error in patient analysis:', error);
      throw new Error(`Patient analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Analyze clinical trial using Fetch.ai agents
  public async analyzeTrial(trialData: any): Promise<TrialAnalysis> {
    console.log('🔍 Starting trial analysis with Fetch.ai agents...');

    try {
      // Send trial data to Trial Matching Agent
      const analysisMessage = await this.sendMessage(
        'trial_matching_agent',
        JSON.stringify(trialData),
        'analysis'
      );

      // Parse and return analysis results
      const analysis: TrialAnalysis = {
        trialId: trialData.id || 'unknown',
        suitability: this.extractSuitability(analysisMessage.content),
        requirements: this.extractRequirements(analysisMessage.content),
        exclusions: this.extractExclusions(analysisMessage.content),
        recommendations: this.extractRecommendations(analysisMessage.content)
      };

      console.log('✅ Trial analysis completed:', analysis);
      return analysis;

    } catch (error) {
      console.error('❌ Error in trial analysis:', error);
      throw new Error(`Trial analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Simulate agent response (mock implementation)
  private async simulateAgentResponse(agentId: string, content: string, messageType: AgentMessage['type']): Promise<AgentMessage> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    let responseContent = '';

    switch (agentId) {
      case 'patient_analysis_agent':
        responseContent = this.generatePatientAnalysisResponse(content, messageType);
        break;
      case 'trial_matching_agent':
        responseContent = this.generateTrialMatchingResponse(content, messageType);
        break;
      case 'recommendation_agent':
        responseContent = this.generateRecommendationResponse(content, messageType);
        break;
      default:
        responseContent = 'I am not sure how to help with that request.';
    }

    return {
      id: this.generateMessageId(),
      from: agentId,
      to: 'user',
      content: responseContent,
      timestamp: Date.now(),
      type: messageType
    };
  }

  // Generate intelligent, contextual responses for different agent types
  private generatePatientAnalysisResponse(content: string, messageType: AgentMessage['type']): string {
    if (messageType === 'analysis') {
      return JSON.stringify({
        analysis: 'patient_analysis',
        conditions: ['diabetes', 'hypertension'],
        riskFactors: ['age_over_65', 'family_history'],
        severity: 'moderate',
        recommendations: ['regular_monitoring', 'lifestyle_changes']
      });
    }
    
    // Generate contextual responses based on user input
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('stroke') || lowerContent.includes('risk assessment')) {
      return `🚨 **Stroke Risk Assessment Completed**\n\n**Risk Factors Identified:**\n• Age-related vascular changes\n• Potential hypertension indicators\n• Family history patterns\n\n**Immediate Actions Recommended:**\n• Schedule neurological consultation within 48 hours\n• Monitor blood pressure daily\n• Review current medications\n\n**Prevention Strategies:**\n• Maintain blood pressure <130/80 mmHg\n• Regular exercise (30 min/day)\n• Mediterranean diet\n• Smoking cessation if applicable\n\n**Clinical Trials Available:** 3 high-priority trials for stroke prevention\n\n*Confidence Level: 94%*`;
    }
    
    if (lowerContent.includes('diabetes') || lowerContent.includes('blood sugar')) {
      return `🩸 **Diabetes Analysis Results**\n\n**Current Status:** Type 2 Diabetes (moderate control)\n**HbA1c Trend:** Improving (7.2% → 6.8%)\n**Risk Factors:** Obesity, sedentary lifestyle\n\n**Treatment Recommendations:**\n• Metformin optimization\n• GLP-1 receptor agonist consideration\n• Weight management program\n\n**Lifestyle Modifications:**\n• 150 min/week moderate exercise\n• Carbohydrate counting education\n• Regular foot care\n\n**Available Trials:** 5 diabetes management trials\n\n*Confidence Level: 89%*`;
    }
    
    if (lowerContent.includes('cancer') || lowerContent.includes('oncology')) {
      return `🦠 **Oncology Assessment Summary**\n\n**Primary Concern:** Early-stage detection focus\n**Risk Profile:** Moderate (age + family history)\n**Screening Status:** Up to date\n\n**Recommended Screenings:**\n• Annual mammography (if applicable)\n• Colonoscopy every 5 years\n• Skin examination quarterly\n\n**Prevention Focus:**\n• Antioxidant-rich diet\n• Regular exercise\n• Sun protection\n• Tobacco avoidance\n\n**Clinical Trials:** 2 prevention-focused trials available\n\n*Confidence Level: 91%*`;
    }
    
    if (lowerContent.includes('heart') || lowerContent.includes('cardiac') || lowerContent.includes('cardiovascular')) {
      return `❤️ **Cardiovascular Health Analysis**\n\n**Current Status:** Stable with risk factors\n**Blood Pressure:** 135/85 mmHg (pre-hypertensive)\n**Cholesterol:** Total 220 mg/dL (borderline high)\n\n**Risk Assessment:**\n• 10-year CVD risk: 12% (moderate)\n• Primary risk: Hypertension\n• Secondary risk: Dyslipidemia\n\n**Immediate Actions:**\n• BP monitoring 2x daily\n• Lipid panel in 3 months\n• Stress test consideration\n\n**Lifestyle Recommendations:**\n• DASH diet implementation\n• 40 min cardio 4x/week\n• Stress management techniques\n\n**Available Trials:** 4 cardiovascular trials\n\n*Confidence Level: 87%*`;
    }
    
    // Default intelligent response
    return `🧠 **Patient Analysis Completed**\n\n**Health Summary:**\n• Overall health status: Good\n• Risk level: Low to moderate\n• Priority areas: Preventive care\n\n**Key Findings:**\n• No immediate health concerns\n• Regular checkups recommended\n• Lifestyle optimization opportunities\n\n**Next Steps:**\n• Annual physical examination\n• Update vaccinations\n• Consider preventive screenings\n\n**Available Resources:**\n• 8 clinical trials in your area\n• 3 wellness programs\n• 2 support groups\n\n*Analysis completed with 92% confidence*`;
  }

  private generateTrialMatchingResponse(content: string, messageType: AgentMessage['type']): string {
    if (messageType === 'match') {
      return JSON.stringify({
        analysis: 'trial_matching',
        matchingTrials: ['trial_001', 'trial_003', 'trial_007'],
        scores: [0.95, 0.87, 0.82],
        eligibility: 'high',
        nextSteps: ['contact_researchers', 'schedule_screening']
      });
    }
    
    // Generate contextual trial matching responses
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('stroke') || lowerContent.includes('neurological')) {
      return `🧠 **Trial Matching Results - Neurological Focus**\n\n**Top Matches Found:**\n\n**1. Stroke Prevention Study (Priority: HIGH)**\n• Match Score: 96%\n• Location: 3 sites within 25 miles\n• Compensation: $2,500\n• Duration: 18 months\n• Requirements: Age 45+, stroke risk factors\n\n**2. Cognitive Function Trial (Priority: MEDIUM)**\n• Match Score: 87%\n• Location: 2 sites within 35 miles\n• Compensation: $1,800\n• Duration: 12 months\n• Requirements: Memory concerns, age 40+\n\n**3. Vascular Health Study (Priority: MEDIUM)**\n• Match Score: 82%\n• Location: 1 site within 40 miles\n• Compensation: $1,200\n• Duration: 6 months\n• Requirements: Hypertension, age 50+\n\n**Next Steps:**\n• Contact study coordinator within 48 hours\n• Prepare medical records\n• Schedule screening appointment\n\n*Matching completed with 94% accuracy*`;
    }
    
    if (lowerContent.includes('diabetes') || lowerContent.includes('metabolic')) {
      return `🩸 **Trial Matching Results - Metabolic Health**\n\n**Top Matches Found:**\n\n**1. Diabetes Management Study (Priority: HIGH)**\n• Match Score: 94%\n• Location: 4 sites within 20 miles\n• Compensation: $3,000\n• Duration: 24 months\n• Requirements: Type 2 diabetes, HbA1c 7-9%\n\n**2. Weight Loss Intervention (Priority: HIGH)**\n• Match Score: 91%\n• Location: 2 sites within 30 miles\n• Compensation: $2,200\n• Duration: 18 months\n• Requirements: BMI >30, diabetes risk\n\n**3. Nutrition & Exercise Study (Priority: MEDIUM)**\n• Match Score: 85%\n• Location: 3 sites within 25 miles\n• Compensation: $1,500\n• Duration: 12 months\n• Requirements: Pre-diabetes, age 35+\n\n**Next Steps:**\n• Complete eligibility questionnaire\n• Schedule initial consultation\n• Prepare 3-month medical history\n\n*Matching completed with 91% accuracy*`;
    }
    
    if (lowerContent.includes('cancer') || lowerContent.includes('oncology')) {
      return `🦠 **Trial Matching Results - Oncology Focus**\n\n**Top Matches Found:**\n\n**1. Early Detection Study (Priority: HIGH)**\n• Match Score: 93%\n• Location: 2 sites within 30 miles\n• Compensation: $4,000\n• Duration: 36 months\n• Requirements: High-risk family history, age 40+\n\n**2. Prevention Trial (Priority: HIGH)**\n• Match Score: 89%\n• Location: 3 sites within 40 miles\n• Compensation: $2,800\n• Duration: 24 months\n• Requirements: Genetic risk factors, age 35+\n\n**3. Screening Optimization (Priority: MEDIUM)**\n• Match Score: 84%\n• Location: 1 site within 25 miles\n• Compensation: $1,500\n• Duration: 18 months\n• Requirements: Average risk, age 45+\n\n**Next Steps:**\n• Genetic counseling consultation\n• Family history documentation\n• Screening schedule optimization\n\n*Matching completed with 89% accuracy*`;
    }
    
    // Default trial matching response
    return `🎯 **Clinical Trial Matching Results**\n\n**Matching Summary:**\n• Total trials analyzed: 156\n• High-priority matches: 3\n• Medium-priority matches: 5\n• Low-priority matches: 8\n\n**Top Recommendations:**\n• **Trial A:** 94% match - Preventive care study\n• **Trial B:** 87% match - Wellness program\n• **Trial C:** 82% match - Health monitoring\n\n**Eligibility Status:** HIGH\n**Compensation Range:** $1,200 - $3,500\n**Duration Range:** 6 - 24 months\n\n**Next Steps:**\n• Review trial details\n• Contact study coordinators\n• Schedule consultations\n\n*Matching completed with 90% accuracy*`;
  }

  private generateRecommendationResponse(content: string, messageType: AgentMessage['type']): string {
    if (messageType === 'recommendation') {
      return JSON.stringify({
        analysis: 'recommendations',
        personalizedPlan: 'custom_treatment_plan',
        priority: 'high',
        timeline: 'immediate',
        actions: ['schedule_appointment', 'prepare_documents', 'contact_support']
      });
    }
    
    // Generate contextual recommendation responses
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('stroke') || lowerContent.includes('neurological')) {
      return `🧠 **Personalized Recommendations - Neurological Health**\n\n**Immediate Actions (Next 24-48 hours):**\n• Schedule neurological consultation\n• Obtain recent brain imaging if available\n• Review current medications with pharmacist\n\n**Short-term Goals (1-4 weeks):**\n• Implement blood pressure monitoring\n• Begin stress reduction program\n• Schedule follow-up with primary care\n\n**Long-term Strategy (1-6 months):**\n• Regular neurological assessments\n• Lifestyle modification program\n• Support group participation\n\n**Prevention Focus:**\n• Blood pressure control <130/80\n• Regular exercise (30 min/day)\n• Mediterranean diet adoption\n• Smoking cessation support\n\n**Monitoring Schedule:**\n• BP: Daily for 2 weeks, then weekly\n• Neurological check: Monthly\n• Imaging: As recommended by specialist\n\n**Support Resources:**\n• 3 local support groups\n• 2 educational programs\n• 1-on-1 counseling available\n\n*Recommendations generated with 96% confidence*`;
    }
    
    if (lowerContent.includes('diabetes') || lowerContent.includes('metabolic')) {
      return `🩸 **Personalized Recommendations - Diabetes Management**\n\n**Immediate Actions (Next 24-48 hours):**\n• Blood glucose monitoring 4x daily\n• Review current medications\n• Schedule endocrinology consultation\n\n**Short-term Goals (1-4 weeks):**\n• Implement carbohydrate counting\n• Begin exercise program\n• Join diabetes education class\n\n**Long-term Strategy (1-6 months):**\n• HbA1c target: <7.0%\n• Weight loss goal: 5-10% of body weight\n• Regular foot care routine\n\n**Treatment Optimization:**\n• Metformin dose adjustment\n• GLP-1 receptor agonist consideration\n• Insulin therapy evaluation if needed\n\n**Lifestyle Modifications:**\n• 150 min/week moderate exercise\n• Mediterranean diet implementation\n• Stress management techniques\n\n**Monitoring Schedule:**\n• Glucose: Daily fasting + post-meal\n• HbA1c: Every 3 months\n• Foot exam: Monthly\n• Eye exam: Annually\n\n**Support Resources:**\n• 2 diabetes management programs\n• 4 support groups\n• Nutritional counseling available\n\n*Recommendations generated with 93% confidence*`;
    }
    
    if (lowerContent.includes('cancer') || lowerContent.includes('oncology')) {
      return `🦠 **Personalized Recommendations - Cancer Prevention**\n\n**Immediate Actions (Next 24-48 hours):**\n• Schedule genetic counseling if high risk\n• Review family history documentation\n• Update screening schedule\n\n**Short-term Goals (1-4 weeks):**\n• Complete recommended screenings\n• Implement prevention strategies\n• Join prevention program\n\n**Long-term Strategy (1-6 months):**\n• Regular screening adherence\n• Lifestyle optimization\n• Risk factor management\n\n**Prevention Strategies:**\n• Antioxidant-rich diet\n• Regular exercise (45 min/day)\n• Sun protection (SPF 30+)\n• Tobacco avoidance\n• Alcohol moderation\n\n**Screening Schedule:**\n• Mammography: Annually (if applicable)\n• Colonoscopy: Every 5 years\n• Skin exam: Quarterly\n• PSA test: Annually (if applicable)\n\n**Support Resources:**\n• 3 prevention programs\n• 2 support groups\n• Genetic counseling services\n• Lifestyle coaching available\n\n*Recommendations generated with 91% confidence*`;
    }
    
    // Default recommendation response
    return `💡 **Personalized Health Recommendations**\n\n**Health Optimization Plan:**\n• Preventive care focus\n• Lifestyle enhancement\n• Risk factor management\n\n**Immediate Actions:**\n• Schedule annual physical\n• Update vaccinations\n• Review current medications\n\n**Short-term Goals:**\n• Implement exercise routine\n• Optimize nutrition\n• Stress management\n\n**Long-term Strategy:**\n• Regular health monitoring\n• Preventive screenings\n• Wellness program participation\n\n**Available Programs:**\n• 5 wellness initiatives\n• 3 support groups\n• 2 educational programs\n• 1-on-1 coaching\n\n**Next Steps:**\n• Complete health assessment\n• Schedule consultations\n• Join recommended programs\n\n*Recommendations generated with 89% confidence*`;
  }

  // Helper methods for parsing responses
  private extractConditions(content: string): string[] {
    try {
      const parsed = JSON.parse(content);
      return parsed.conditions || [];
    } catch {
      return [];
    }
  }

  private extractRiskFactors(content: string): string[] {
    try {
      const parsed = JSON.parse(content);
      return parsed.riskFactors || [];
    } catch {
      return [];
    }
  }

  private extractRecommendations(content: string): string[] {
    try {
      const parsed = JSON.parse(content);
      return parsed.recommendations || [];
    } catch {
      return [];
    }
  }

  private extractMatchingTrials(content: string): string[] {
    try {
      const parsed = JSON.parse(content);
      return parsed.matchingTrials || [];
    } catch {
      return [];
    }
  }

  private extractSuitability(content: string): number {
    try {
      const parsed = JSON.parse(content);
      return parsed.suitability || 0.5;
    } catch {
      return 0.5;
    }
  }

  private extractRequirements(content: string): string[] {
    try {
      const parsed = JSON.parse(content);
      return parsed.requirements || [];
    } catch {
      return [];
    }
  }

  private extractExclusions(content: string): string[] {
    try {
      const parsed = JSON.parse(content);
      return parsed.exclusions || [];
    } catch {
      return [];
    }
  }

  private calculateConfidence(content: string): number {
    try {
      const parsed = JSON.parse(content);
      return parsed.confidence || 0.8;
    } catch {
      return 0.8;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get agent status
  public getAgentStatus(agentId: string): string {
    const agent = this.agents.get(agentId);
    return agent?.status || 'unknown';
  }

  // Update agent status
  public updateAgentStatus(agentId: string, status: string): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      this.agents.set(agentId, agent);
      return true;
    }
    return false;
  }
}

export const fetchAgentService = FetchAgentService.getInstance();
