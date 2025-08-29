export interface DemoMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp?: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: string[];
    thought?: string;
  };
}

export interface DemoConversation {
  id: string;
  title: string;
  description: string;
  category: 'trial_matching' | 'privacy_inquiry' | 'consent_management' | 'technical_demo' | 'multilingual' | 'audit_trail';
  messages: DemoMessage[];
  tags: string[];
}

export const demoConversations: DemoConversation[] = [
  {
    id: 'diabetes-trial-matching',
    title: 'Type 2 Diabetes Trial Search',
    description: 'Complete trial matching flow for diabetes in New York',
    category: 'trial_matching',
    tags: ['diabetes', 'new-york', 'eligibility', 'matching'],
    messages: [
      {
        role: 'user',
        content: "Hi, I'm looking for clinical trials for type 2 diabetes near New York.",
        timestamp: '2025-08-19T18:15:00Z'
      },
      {
        role: 'agent',
        content: "Hello! Looking for type 2 diabetes trials in New York. Are you over 18 and have you had any previous clinical trial experience?",
        timestamp: '2025-08-19T18:15:30Z',
        metadata: {
          intent: 'eligibility_check',
          confidence: 0.95,
          suggestedActions: ['confirm_age', 'confirm_experience']
        }
      },
      {
        role: 'user',
        content: "Yes, I'm 52 and this would be my first trial.",
        timestamp: '2025-08-19T18:16:00Z'
      },
      {
        role: 'agent',
        content: "Thank you! I found three open trials for type 2 diabetes in the New York area:\n\n1. **NovoHeal Glycemic Study** – Mount Sinai\n2. **Metabolic Improvement Trial** – NYU Langone\n3. **Digital Coaching for Diabetes** – Columbia\n\nWould you like to see more details or start eligibility screening?",
        timestamp: '2025-08-19T18:16:30Z',
        metadata: {
          intent: 'trial_results',
          confidence: 0.98,
          suggestedActions: ['view_details', 'start_screening', 'see_more_trials']
        }
      },
      {
        role: 'user',
        content: "Show me details for the first trial.",
        timestamp: '2025-08-19T18:17:00Z'
      },
      {
        role: 'agent',
        content: "**NovoHeal Glycemic Study at Mount Sinai:**\n\n• **Age:** 18-65\n• **BMI:** 27-40\n• **Not currently on insulin**\n• **Study includes:** Free health coaching and tracking app\n• **Duration:** 6 months\n• **Compensation:** $500 upon completion\n\nInterested in matching and securing a spot?",
        timestamp: '2025-08-19T18:17:30Z',
        metadata: {
          intent: 'trial_details',
          confidence: 0.97,
          suggestedActions: ['start_matching', 'ask_questions', 'view_other_trials']
        }
      },
      {
        role: 'user',
        content: "Yes, please begin matching.",
        timestamp: '2025-08-19T18:18:00Z'
      },
      {
        role: 'agent',
        content: "Great! I'll securely and privately match your profile using ZK-Proof eligibility screening. You'll receive a confirmation and a consent request in just a moment.\n\n🔒 **Privacy Notice:** Your health data remains encrypted and under your control throughout this process.",
        timestamp: '2025-08-19T18:18:30Z',
        metadata: {
          intent: 'initiate_matching',
          confidence: 0.99,
          suggestedActions: ['view_consent', 'review_privacy', 'proceed']
        }
      }
    ]
  },
  {
    id: 'privacy-data-control',
    title: 'Health Data Privacy & Control',
    description: 'User inquiries about data handling and privacy protection',
    category: 'privacy_inquiry',
    tags: ['privacy', 'data_control', 'encryption', 'consent'],
    messages: [
      {
        role: 'user',
        content: "What happens to my health data?",
        timestamp: '2025-08-19T18:20:00Z'
      },
      {
        role: 'agent',
        content: "Your health data remains **encrypted and under your control** at all times. Here's how we protect you:\n\n🔐 **Zero-Knowledge Proofs:** We use advanced cryptography for matching – your data is never visible to trial sponsors or brokers\n\n🛡️ **Selective Disclosure:** Only eligibility results are shared, never raw health information\n\n🔒 **End-to-End Encryption:** All data is encrypted in transit and at rest\n\n⚡ **Your Control:** You can revoke access or delete your data at any time",
        timestamp: '2025-08-19T18:20:30Z',
        metadata: {
          intent: 'privacy_explanation',
          confidence: 0.96,
          suggestedActions: ['learn_more', 'view_encryption', 'set_preferences']
        }
      },
      {
        role: 'user',
        content: "How do I provide consent?",
        timestamp: '2025-08-19T18:21:00Z'
      },
      {
        role: 'agent',
        content: "You'll review a **digital consent form** that clearly explains:\n\n📋 **What data is collected** (only what's necessary for matching)\n\n🎯 **How it's used** (exclusively for trial eligibility)\n\n⏰ **How long it's stored** (until you request deletion)\n\n🔗 **Your rights** (access, modify, delete, withdraw)\n\n📝 **Digital Signature:** Sign securely with your verified identity\n\n⛓️ **Blockchain Anchored:** Consent records are immutably stored on ICP blockchain for audit transparency",
        timestamp: '2025-08-19T18:21:30Z',
        metadata: {
          intent: 'consent_explanation',
          confidence: 0.94,
          suggestedActions: ['view_consent_form', 'learn_rights', 'proceed_to_consent']
        }
      }
    ]
  },
  {
    id: 'zk-proof-demo',
    title: 'Zero-Knowledge Proof Demo',
    description: 'Technical demonstration of ZK-proof eligibility screening',
    category: 'technical_demo',
    tags: ['zk_proofs', 'eligibility', 'cryptography', 'demo'],
    messages: [
      {
        role: 'user',
        content: "How do you match patients?",
        timestamp: '2025-08-19T18:25:00Z'
      },
      {
        role: 'agent',
        content: "We use **AI-powered agents** and **zero-knowledge proofs** for privacy-preserving matching:\n\n🤖 **AI Agents:** Analyze your encrypted health summary for trial compatibility\n\n🔐 **ZK-Proofs:** Verify eligibility without revealing your actual data\n\n🎯 **Result:** Only match status and basic eligibility are shared with trials\n\n🔍 **Your Data:** Remains completely private and encrypted\n\nWant to see a **ZK-proof demo** in action?",
        timestamp: '2025-08-19T18:25:30Z',
        metadata: {
          intent: 'matching_explanation',
          confidence: 0.93,
          suggestedActions: ['start_zk_demo', 'learn_about_agents', 'view_technical_details']
        }
      },
      {
        role: 'user',
        content: "Try the ZK-proof demo.",
        timestamp: '2025-08-19T18:26:00Z'
      },
      {
        role: 'agent',
        content: "🚀 **Initiating ZK-Proof Demo:**\n\n**Input Data (Encrypted):**\n• BMI: 31\n• A1c: 7.9\n• Location: NYC\n• Age: 52\n\n**ZK-Proof Process:**\n1. ✅ Encrypts your data\n2. ✅ Validates against trial criteria\n3. ✅ Generates proof of eligibility\n4. ✅ Shares only result\n\n**Result:** 🎯 **PASS** (matched for NovoHeal Glycemic Study)\n\n🔒 **Privacy Achieved:** Your private data was never disclosed. Only the match status and timestamp are visible to others.\n\n📊 **Proof Hash:** 0x7F2A...B45C",
        timestamp: '2025-08-19T18:26:30Z',
        metadata: {
          intent: 'zk_demo_execution',
          confidence: 0.99,
          suggestedActions: ['view_proof_details', 'learn_about_zk', 'proceed_to_trial']
        }
      }
    ]
  },
  {
    id: 'multilingual-support',
    title: 'Multilingual Trial Search',
    description: 'Spanish language support demonstration',
    category: 'multilingual',
    tags: ['spanish', 'multilingual', 'accessibility', 'diversity'],
    messages: [
      {
        role: 'user',
        content: "¿Puedes ayudarme en español?",
        timestamp: '2025-08-19T18:30:00Z'
      },
      {
        role: 'agent',
        content: "¡Por supuesto! GreyGuard Trials puede ayudarte a encontrar estudios clínicos en español.\n\n🌍 **Idiomas Soportados:**\n• English (Inglés)\n• Español\n• 中文 (Mandarín)\n\nPor favor, dime tu condición médica o ubicación para comenzar la búsqueda de estudios clínicos.",
        timestamp: '2025-08-19T18:30:30Z',
        metadata: {
          intent: 'language_switch',
          confidence: 0.98,
          suggestedActions: ['continue_in_spanish', 'switch_to_english', 'view_language_options']
        }
      },
      {
        role: 'user',
        content: "Busco estudios para diabetes tipo 2 en Nueva York.",
        timestamp: '2025-08-19T18:31:00Z'
      },
      {
        role: 'agent',
        content: "Perfecto! Buscando estudios clínicos para diabetes tipo 2 en Nueva York...\n\n🔍 **Encontré 3 estudios abiertos:**\n\n1. **Estudio NovoHeal** – Mount Sinai\n2. **Ensayo de Mejora Metabólica** – NYU Langone\n3. **Coaching Digital para Diabetes** – Columbia\n\n¿Te gustaría ver más detalles o comenzar la evaluación de elegibilidad?",
        timestamp: '2025-08-19T18:31:30Z',
        metadata: {
          intent: 'trial_search_results',
          confidence: 0.97,
          suggestedActions: ['ver_detalles', 'iniciar_evaluacion', 'mas_estudios']
        }
      }
    ]
  },
  {
    id: 'audit-blockchain-proof',
    title: 'Blockchain Audit Trail',
    description: 'Demonstration of immutable consent and audit records',
    category: 'audit_trail',
    tags: ['blockchain', 'audit', 'transparency', 'proof'],
    messages: [
      {
        role: 'user',
        content: "Show proof of my eligibility match on-chain.",
        timestamp: '2025-08-19T18:35:00Z'
      },
      {
        role: 'agent',
        content: "🔗 **Here is your zero-knowledge eligibility receipt:**\n\n**Match ID:** 0x2F4B...91E9\n**Timestamp:** 2025-08-19T19:03Z\n**Anchored:** ICP Block #403294, BTC Merkle reference\n**ZK-Proof Hash:** 0x7F2A...B45C\n\n📊 **Audit Trail:**\n• Consent recorded: ICP Block #403290\n• Eligibility verified: ICP Block #403291\n• Match confirmed: ICP Block #403294\n• BTC anchoring: Block #812,456\n\n🌐 **Verify:** You can verify this on any ICP explorer for full audit transparency.\n\n🔍 **View Full Audit:** Would you like to see the complete blockchain trail?",
        timestamp: '2025-08-19T18:35:30Z',
        metadata: {
          intent: 'audit_proof_display',
          confidence: 0.99,
          suggestedActions: ['view_full_audit', 'export_proof', 'learn_about_blockchain']
        }
      },
      {
        role: 'user',
        content: "What regulations are you compliant with?",
        timestamp: '2025-08-19T18:36:00Z'
      },
      {
        role: 'agent',
        content: "🏛️ **GreyGuard Trials is compliant with:**\n\n🇺🇸 **US Regulations:**\n• HIPAA (Health Insurance Portability and Accountability Act)\n• 21 CFR Part 50 (Informed Consent)\n• 45 CFR Part 46 (Human Subjects Research)\n\n🇪🇺 **EU Regulations:**\n• GDPR (General Data Protection Regulation)\n• Clinical Trials Regulation (EU) 536/2014\n\n🌍 **International Standards:**\n• ICH-GCP (Good Clinical Practice)\n• ISO 27001 (Information Security)\n• SOC 2 Type II (Security & Privacy)\n\n📋 **All cross-border data flows are logged and privacy preserving.**\n\n🔍 **View Compliance:** Would you like to see our detailed compliance documentation?",
        timestamp: '2025-08-19T18:36:30Z',
        metadata: {
          intent: 'compliance_information',
          confidence: 0.96,
          suggestedActions: ['view_compliance_docs', 'learn_about_regulations', 'contact_compliance_team']
        }
      }
    ]
  },
  {
    id: 'eligibility-medication',
    title: 'Medication Eligibility Check',
    description: 'Checking trial eligibility with medication considerations',
    category: 'trial_matching',
    tags: ['medication', 'eligibility', 'blood_pressure', 'filtering'],
    messages: [
      {
        role: 'user',
        content: "Can I join a trial if I'm taking medication for blood pressure?",
        timestamp: '2025-08-19T18:40:00Z'
      },
      {
        role: 'agent',
        content: "Great question! Many trials allow participants taking certain medications. I'll check if there are open studies that allow your blood pressure medication.\n\n💊 **Please tell me:**\n• The name of your blood pressure medicine\n• Your current dosage\n• How long you've been taking it\n\nThis helps me filter trials that are compatible with your medication regimen.",
        timestamp: '2025-08-19T18:40:30Z',
        metadata: {
          intent: 'medication_inquiry',
          confidence: 0.94,
          suggestedActions: ['provide_medication_info', 'learn_about_medication_rules', 'view_general_eligibility']
        }
      },
      {
        role: 'user',
        content: "It's lisinopril.",
        timestamp: '2025-08-19T18:41:00Z'
      },
      {
        role: 'agent',
        content: "Thanks! Filtering trials for type 2 diabetes in New York that allow lisinopril...\n\n✅ **You are eligible for:**\n\n1. **NovoHeal Glycemic Study** – Mount Sinai\n   • Allows: Lisinopril, ACE inhibitors\n   • Excludes: Insulin, certain diuretics\n\n2. **Digital Coaching for Diabetes** – Columbia\n   • Allows: Most blood pressure medications\n   • Focus: Lifestyle and digital health\n\n❌ **Not eligible for:**\n• Metabolic Improvement Trial (medication restrictions)\n\nWould you like a **health profile privacy summary** before proceeding?",
        timestamp: '2025-08-19T18:41:30Z',
        metadata: {
          intent: 'filtered_results',
          confidence: 0.97,
          suggestedActions: ['view_privacy_summary', 'proceed_with_trial', 'ask_about_other_medications']
        }
      }
    ]
  }
];

export const getConversationById = (id: string): DemoConversation | undefined => {
  return demoConversations.find(conv => conv.id === id);
};

export const getConversationsByCategory = (category: string): DemoConversation[] => {
  return demoConversations.filter(conv => conv.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(demoConversations.map(conv => conv.category))];
};
