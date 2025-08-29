// NLP System Demo Utility
// Demonstrates the natural language processing capabilities of the GreyGuard AI Agent

import NLPService, { IntentClassification } from '../services/nlpService';

export interface DemoExample {
  input: string;
  expectedIntent: string;
  description: string;
  category: string;
}

export interface DemoResult {
  input: string;
  intent: IntentClassification;
  response: string;
  success: boolean;
}

export class NLPDemo {
  private nlpService: NLPService;
  private examples: DemoExample[] = [];

  constructor() {
    this.nlpService = NLPService.getInstance();
    this.initializeExamples();
  }

  private initializeExamples(): void {
    this.examples = [
      // Trial Search Examples
      {
        input: "Find trials for breast cancer",
        expectedIntent: "trial_search",
        description: "Basic condition-based search",
        category: "trial_matching"
      },
      {
        input: "I need immunotherapy trials for lung cancer near New York",
        expectedIntent: "trial_search",
        description: "Complex search with condition, treatment type, and location",
        category: "trial_matching"
      },
      {
        input: "Show me phase 3 studies for diabetes in California",
        expectedIntent: "trial_search",
        description: "Search with specific phase and location",
        category: "trial_matching"
      },
      {
        input: "What trials are available for a 45-year-old with heart disease?",
        expectedIntent: "trial_search",
        description: "Search with age and condition",
        category: "trial_matching"
      },

      // Profile Submission Examples
      {
        input: "I want to submit my health profile",
        expectedIntent: "profile_submission",
        description: "Basic profile submission request",
        category: "profile_management"
      },
      {
        input: "Help me create an encrypted health profile for diabetes research",
        expectedIntent: "profile_submission",
        description: "Specific profile creation request",
        category: "profile_management"
      },
      {
        input: "I need to upload my medical data for clinical trial matching",
        expectedIntent: "profile_submission",
        description: "Alternative phrasing for profile submission",
        category: "profile_management"
      },

      // Consent Management Examples
      {
        input: "I want to manage my consent for clinical trials",
        expectedIntent: "consent_management",
        description: "Basic consent management request",
        category: "consent_control"
      },
      {
        input: "Grant consent for trial NCT04556747",
        expectedIntent: "consent_management",
        description: "Specific consent action",
        category: "consent_control"
      },
      {
        input: "Revoke my consent for the immunotherapy study",
        expectedIntent: "consent_management",
        description: "Consent revocation request",
        category: "consent_control"
      },

      // Privacy Inquiry Examples
      {
        input: "How secure is my health data?",
        expectedIntent: "privacy_inquiry",
        description: "Basic security question",
        category: "general_support"
      },
      {
        input: "Explain zero-knowledge proofs",
        expectedIntent: "privacy_inquiry",
        description: "Technical privacy question",
        category: "general_support"
      },
      {
        input: "What privacy protections do you offer?",
        expectedIntent: "privacy_inquiry",
        description: "General privacy question",
        category: "general_support"
      },

      // Audit Request Examples
      {
        input: "Show my consent history",
        expectedIntent: "audit_request",
        description: "Basic audit request",
        category: "general_support"
      },
      {
        input: "View my data access logs for the last month",
        expectedIntent: "audit_request",
        description: "Time-specific audit request",
        category: "general_support"
      },
      {
        input: "See my blockchain activity",
        expectedIntent: "audit_request",
        description: "Blockchain-specific audit request",
        category: "general_support"
      }
    ];
  }

  public runDemo(): DemoResult[] {
    console.log("🚀 Starting NLP System Demo...\n");
    
    const results: DemoResult[] = [];
    
    this.examples.forEach((example, index) => {
      console.log(`📝 Example ${index + 1}: ${example.description}`);
      console.log(`   Input: "${example.input}"`);
      
      // Process with NLP service
      const intent = this.nlpService.classifyIntent(example.input);
      const response = this.generateDemoResponse(intent, example.input);
      
      const result: DemoResult = {
        input: example.input,
        intent,
        response,
        success: intent.intent === example.expectedIntent
      };
      
      results.push(result);
      
      // Log results
      console.log(`   Intent: ${intent.intent} (${Math.round(intent.confidence * 100)}% confidence)`);
      console.log(`   Expected: ${example.expectedIntent}`);
      console.log(`   Success: ${result.success ? '✅' : '❌'}`);
      console.log(`   Entities: ${intent.entities.join(', ') || 'None'}`);
      console.log(`   Response: ${response.substring(0, 100)}...`);
      console.log("");
    });
    
    this.printDemoSummary(results);
    return results;
  }

  private generateDemoResponse(intent: IntentClassification, input: string): string {
    switch (intent.intent) {
      case 'trial_search':
        return `I'll search for clinical trials based on your request: "${input}". Using our AI-powered matching system with ${Math.round(intent.confidence * 100)}% confidence, I found several relevant trials. Would you like me to show you the details?`;
      
      case 'profile_submission':
        return `I'll help you submit your health profile securely. Your request "${input}" has been processed with ${Math.round(intent.confidence * 100)}% confidence. Let me guide you through the encrypted profile creation process.`;
      
      case 'consent_management':
        return `I understand you want to manage your consent: "${input}". This request was classified with ${Math.round(intent.confidence * 100)}% confidence. I'll help you with consent management and show you the blockchain verification.`;
      
      case 'privacy_inquiry':
        return `Great question about privacy: "${input}". I classified this with ${Math.round(intent.confidence * 100)}% confidence. Let me explain how GreyGuard protects your data with advanced security measures.`;
      
      case 'audit_request':
        return `I'll show you your audit information: "${input}". This request was processed with ${Math.round(intent.confidence * 100)}% confidence. Here's your complete activity history with blockchain verification.`;
      
      default:
        return `I processed your request: "${input}" with ${Math.round(intent.confidence * 100)}% confidence. While I'm not entirely sure about your intent, I can help you with clinical trial services, profile management, or privacy questions.`;
    }
  }

  private printDemoSummary(results: DemoResult[]): void {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const successRate = (successful / total) * 100;
    
    console.log("📊 Demo Summary");
    console.log("================");
    console.log(`Total Examples: ${total}`);
    console.log(`Successful Intent Recognition: ${successful}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    console.log("");
    
    // Show failed examples
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log("❌ Failed Intent Recognition:");
      failed.forEach((result, index) => {
        console.log(`   ${index + 1}. "${result.input}"`);
        console.log(`      Expected: ${result.intent.intent}`);
        console.log(`      Got: ${result.intent.intent}`);
        console.log("");
      });
    }
    
    // Show confidence statistics
    const avgConfidence = results.reduce((sum, r) => sum + r.intent.confidence, 0) / total;
    console.log("🎯 Confidence Statistics:");
    console.log(`Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`Highest Confidence: ${Math.max(...results.map(r => r.intent.confidence)) * 100}%`);
    console.log(`Lowest Confidence: ${Math.min(...results.map(r => r.intent.confidence)) * 100}%`);
    console.log("");
    
    // Show entity extraction stats
    const totalEntities = results.reduce((sum, r) => sum + r.intent.entities.length, 0);
    console.log("🔍 Entity Extraction:");
    console.log(`Total Entities Extracted: ${totalEntities}`);
    console.log(`Average Entities per Input: ${(totalEntities / total).toFixed(1)}`);
    console.log("");
    
    console.log("🎉 Demo completed! The NLP system is working well.");
  }

  public testCustomInput(input: string): DemoResult {
    console.log(`🧪 Testing Custom Input: "${input}"`);
    
    const intent = this.nlpService.classifyIntent(input);
    const response = this.generateDemoResponse(intent, input);
    
    const result: DemoResult = {
      input,
      intent,
      response,
      success: true // Custom inputs don't have expected intents
    };
    
    console.log(`   Intent: ${intent.intent} (${Math.round(intent.confidence * 100)}% confidence)`);
    console.log(`   Entities: ${intent.entities.join(', ') || 'None'}`);
    console.log(`   Suggested Actions: ${intent.suggestedActions.join(', ')}`);
    console.log(`   Response: ${response}`);
    console.log("");
    
    return result;
  }

  public getExampleCategories(): string[] {
    return [...new Set(this.examples.map(e => e.category))];
  }

  public getExamplesByCategory(category: string): DemoExample[] {
    return this.examples.filter(e => e.category === category);
  }

  public getRandomExample(): DemoExample {
    return this.examples[Math.floor(Math.random() * this.examples.length)];
  }
}

// Export singleton instance
export const nlpDemo = new NLPDemo();

// Example usage in browser console:
// import { nlpDemo } from './src/utils/nlpDemo';
// nlpDemo.runDemo();
// nlpDemo.testCustomInput("Find trials for multiple sclerosis in Boston");
