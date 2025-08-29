// Natural Language Processing Service for AI Agent
// Handles prompt templates, context management, and intelligent response generation

export interface NLPContext {
  sessionId: string;
  userProfile?: {
    age?: number;
    gender?: string;
    location?: string;
    medicalHistory?: string[];
    preferences?: string[];
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    intent?: string;
    entities?: string[];
  }>;
  currentIntent?: string;
  confidence?: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'trial_matching' | 'profile_management' | 'consent_control' | 'general_support';
  examples: string[];
}

export interface IntentClassification {
  intent: string;
  confidence: number;
  entities: string[];
  suggestedActions: string[];
}

export class NLPService {
  private static instance: NLPService;
  private promptTemplates: Map<string, PromptTemplate> = new Map();
  private contexts: Map<string, NLPContext> = new Map();

  private constructor() {
    this.initializePromptTemplates();
  }

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  private initializePromptTemplates(): void {
    // Trial Matching Prompts
    this.promptTemplates.set('trial_search', {
      id: 'trial_search',
      name: 'Clinical Trial Search',
      description: 'Search for clinical trials based on medical condition and criteria',
      template: `I need to find clinical trials for {condition}. I'm {age} years old, located in {location}. I'm interested in {phase} trials and prefer {preferences}. Please search for matching trials with privacy protection.`,
      variables: ['condition', 'age', 'location', 'phase', 'preferences'],
      category: 'trial_matching',
      examples: [
        'Find trials for breast cancer',
        'I need immunotherapy trials near me',
        'Show me phase 3 studies for lung cancer'
      ]
    });

    this.promptTemplates.set('profile_submission', {
      id: 'profile_submission',
      name: 'Health Profile Submission',
      description: 'Submit encrypted health profile for trial matching',
      template: `I want to submit my health profile. My condition is {condition}, I'm {age} years old, {gender}, located in {location}. My medical history includes {medicalHistory}. Please help me create an encrypted profile.`,
      variables: ['condition', 'age', 'gender', 'location', 'medicalHistory'],
      category: 'profile_management',
      examples: [
        'Submit my health profile',
        'I want to upload my medical data',
        'Create an encrypted health profile'
      ]
    });

    this.promptTemplates.set('consent_management', {
      id: 'consent_management',
      name: 'Consent Management',
      description: 'Manage clinical trial participation consent',
      template: `I need to {action} my consent for trial {trialId}. {reason}. Please update my consent status and show me the blockchain verification.`,
      variables: ['action', 'trialId', 'reason'],
      category: 'consent_control',
      examples: [
        'Grant consent for trial NCT04556747',
        'Revoke my consent for the immunotherapy study',
        'Update my consent preferences'
      ]
    });

    this.promptTemplates.set('privacy_inquiry', {
      id: 'privacy_inquiry',
      name: 'Privacy & Security',
      description: 'Questions about data protection and privacy features',
      template: `I have questions about {privacyAspect}. How does GreyGuard protect my {dataType} and ensure {securityFeature}?`,
      variables: ['privacyAspect', 'dataType', 'securityFeature'],
      category: 'general_support',
      examples: [
        'How secure is my health data?',
        'Explain zero-knowledge proofs',
        'What privacy protections do you offer?'
      ]
    });

    this.promptTemplates.set('audit_request', {
      id: 'audit_request',
      name: 'Audit & History',
      description: 'Request audit logs and activity history',
      template: `I want to see my {auditType} for {timeframe}. Show me {details} with blockchain verification and ZK-proofs.`,
      variables: ['auditType', 'timeframe', 'details'],
      category: 'general_support',
      examples: [
        'Show my consent history',
        'View my data access logs',
        'See my blockchain activity'
      ]
    });
  }

  public classifyIntent(userInput: string): IntentClassification {
    const input = userInput.toLowerCase();
    
    // Intent classification logic
    if (this.matchesPattern(input, ['trial', 'study', 'research', 'match', 'find', 'search'])) {
      return {
        intent: 'trial_search',
        confidence: 0.95,
        entities: this.extractEntities(input, ['condition', 'location', 'age', 'phase']),
        suggestedActions: ['search_trials', 'show_criteria', 'explain_matching']
      };
    }

    if (this.matchesPattern(input, ['profile', 'submit', 'upload', 'create', 'health data'])) {
      return {
        intent: 'profile_submission',
        confidence: 0.92,
        entities: this.extractEntities(input, ['condition', 'age', 'gender', 'location']),
        suggestedActions: ['create_profile', 'encrypt_data', 'explain_process']
      };
    }

    if (this.matchesPattern(input, ['consent', 'permission', 'authorize', 'grant', 'revoke'])) {
      return {
        intent: 'consent_management',
        confidence: 0.89,
        entities: this.extractEntities(input, ['trial', 'action', 'reason']),
        suggestedActions: ['show_consents', 'update_consent', 'explain_rights']
      };
    }

    if (this.matchesPattern(input, ['privacy', 'security', 'protect', 'encrypt', 'safe'])) {
      return {
        intent: 'privacy_inquiry',
        confidence: 0.87,
        entities: this.extractEntities(input, ['data_type', 'security_feature']),
        suggestedActions: ['explain_privacy', 'show_security', 'demonstrate_protection']
      };
    }

    if (this.matchesPattern(input, ['audit', 'log', 'history', 'activity', 'track'])) {
      return {
        intent: 'audit_request',
        confidence: 0.85,
        entities: this.extractEntities(input, ['timeframe', 'activity_type']),
        suggestedActions: ['show_logs', 'export_data', 'explain_tracking']
      };
    }

    return {
      intent: 'general_inquiry',
      confidence: 0.70,
      entities: [],
      suggestedActions: ['clarify_request', 'show_help', 'suggest_actions']
    };
  }

  private matchesPattern(input: string, keywords: string[]): boolean {
    return keywords.some(keyword => input.includes(keyword));
  }

  private extractEntities(input: string, entityTypes: string[]): string[] {
    const entities: string[] = [];
    
    // Extract medical conditions
    const medicalConditions = [
      'cancer', 'diabetes', 'heart disease', 'alzheimer', 'parkinson', 'ms', 'arthritis',
      'asthma', 'depression', 'anxiety', 'hypertension', 'obesity', 'hiv', 'aids'
    ];
    
    medicalConditions.forEach(condition => {
      if (input.includes(condition)) {
        entities.push(`condition:${condition}`);
      }
    });

    // Extract locations
    const locationPattern = /\b(?:in|at|near|around)\s+([A-Za-z\s,]+?)(?:\s|$|\.)/;
    const locationMatch = input.match(locationPattern);
    if (locationMatch) {
      entities.push(`location:${locationMatch[1].trim()}`);
    }

    // Extract ages
    const agePattern = /(\d{1,2})\s*(?:years?\s*old|y\.?o\.?)/;
    const ageMatch = input.match(agePattern);
    if (ageMatch) {
      entities.push(`age:${ageMatch[1]}`);
    }

    // Extract trial phases
    const phasePattern = /phase\s*(\d{1,2})/i;
    const phaseMatch = input.match(phasePattern);
    if (phaseMatch) {
      entities.push(`phase:${phaseMatch[1]}`);
    }

    return entities;
  }

  public generatePrompt(templateId: string, variables: Record<string, string>): string {
    const template = this.promptTemplates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let prompt = template.template;
    template.variables.forEach(variable => {
      const value = variables[variable] || `[${variable}]`;
      prompt = prompt.replace(`{${variable}}`, value);
    });

    return prompt;
  }

  public getContext(sessionId: string): NLPContext {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        sessionId,
        conversationHistory: [],
        currentIntent: undefined,
        confidence: 0
      });
    }
    return this.contexts.get(sessionId)!;
  }

  public updateContext(sessionId: string, update: Partial<NLPContext>): void {
    const context = this.getContext(sessionId);
    Object.assign(context, update);
    this.contexts.set(sessionId, context);
  }

  public addToHistory(sessionId: string, role: 'user' | 'assistant', content: string, intent?: string, entities?: string[]): void {
    const context = this.getContext(sessionId);
    context.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString(),
      intent,
      entities
    });
    
    // Keep only last 20 messages for context
    if (context.conversationHistory.length > 20) {
      context.conversationHistory = context.conversationHistory.slice(-20);
    }
    
    this.contexts.set(sessionId, context);
  }

  public getSuggestedPrompts(intent: string): string[] {
    const template = Array.from(this.promptTemplates.values()).find(t => t.intent === intent);
    return template?.examples || [];
  }

  public getPromptTemplates(): PromptTemplate[] {
    return Array.from(this.promptTemplates.values());
  }

  public generateContextualResponse(sessionId: string, userInput: string): string {
    const context = this.getContext(sessionId);
    const intent = this.classifyIntent(userInput);
    
    // Update context
    this.updateContext(sessionId, {
      currentIntent: intent.intent,
      confidence: intent.confidence
    });

    // Generate contextual response based on conversation history
    const recentMessages = context.conversationHistory.slice(-3);
    const hasProfile = context.userProfile && Object.keys(context.userProfile).length > 0;
    
    let response = '';
    
    switch (intent.intent) {
      case 'trial_search':
        if (hasProfile) {
          response = `Based on your profile, I'll search for clinical trials matching your criteria. `;
        }
        response += `I'll use our AI-powered matching system to find trials for ${intent.entities.find(e => e.startsWith('condition:'))?.split(':')[1] || 'your condition'}.`;
        break;
        
      case 'profile_submission':
        if (hasProfile) {
          response = `I see you already have a profile. Would you like to update it or create a new one?`;
        } else {
          response = `I'll help you create a secure, encrypted health profile. Your data will be protected with zero-knowledge proofs.`;
        }
        break;
        
      case 'consent_management':
        response = `I'll help you manage your clinical trial consent. All consent actions are recorded on the blockchain for transparency.`;
        break;
        
      default:
        response = `I understand you're asking about ${intent.intent.replace('_', ' ')}. How can I help you with that?`;
    }

    return response;
  }

  public clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }
}

export default NLPService;
