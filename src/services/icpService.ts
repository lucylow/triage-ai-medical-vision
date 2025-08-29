// Mock implementation for demo - replace with actual @dfinity/agent in production
import { idlFactory } from '../declarations/clinical_trial_matcher';
import { 
  ICPCanisterActor, 
  PatientProfile, 
  ClinicalTrial, 
  MatchResult,
  AgeGroup,
  Gender 
} from '../types/icp';

// ICP Configuration
const CANISTER_ID = import.meta.env.VITE_CANISTER_ID || 'rdmx6-jaaaa-aaaah-qdrva-cai';
const HOST = import.meta.env.MODE === 'production' ? 'https://ic0.app' : 'http://localhost:8000';

class ICPService {
  private actor: ICPCanisterActor | null = null;

  async initialize(): Promise<void> {
    console.log('🔄 Initializing ICP Service...');
    // Initialize in mock mode for demo
    this.initializeMockMode();
  }

  private initializeMockMode(): void {
    console.log('🔄 Initializing ICP Service in mock mode');
    this.actor = this.createMockActor();
  }

  private createMockActor(): ICPCanisterActor {
    const mockTrials: ClinicalTrial[] = [
      {
        id: 'trial_001',
        title: 'Phase 3 NSCLC Immunotherapy Study',
        description: 'Testing novel PD-L1 inhibitor for non-small cell lung cancer',
        requiredSymptoms: ['cough', 'shortness of breath', 'chest pain'],
        locations: ['New York', 'Boston', 'Chicago'],
        ageRange: { min: 18, max: 80 },
        genderEligibility: ['male', 'female'],
        recruitmentStatus: 'active',
        sponsor: 'research-org-001',
        zkCircuit: 'zk-circuit-nsclc'
      },
      {
        id: 'trial_002',
        title: 'Diabetes Management Digital Therapeutics',
        description: 'AI-powered glucose monitoring and lifestyle intervention',
        requiredSymptoms: ['diabetes', 'high blood sugar', 'fatigue'],
        locations: ['San Francisco', 'Seattle', 'Portland'],
        ageRange: { min: 21, max: 75 },
        genderEligibility: ['male', 'female', 'nonbinary'],
        recruitmentStatus: 'active',
        sponsor: 'diabetes-research-foundation',
        zkCircuit: 'zk-circuit-diabetes'
      }
    ];

    let patientCounter = 0;
    const mockPatients: Map<string, PatientProfile> = new Map();

    return {
      async addPatient(symptoms, location, ageGroup, gender, sensitiveData) {
        const id = `patient_${++patientCounter}_${Date.now()}`;
        const profile: PatientProfile = {
          id,
          symptoms,
          location,
          ageGroup,
          gender,
          encryptedData: `encrypted_${sensitiveData}`,
          dataHash: `hash_${sensitiveData.length}`,
          consent: 'pending',
          timestamp: Date.now(),
          btcAnchor: `btc_${Date.now()}`
        };
        mockPatients.set(id, profile);
        return id;
      },

      async addTrial(trial) {
        const id = trial.id || `trial_${Date.now()}`;
        mockTrials.push({ ...trial, id });
        return id;
      },

      async matchTrials(patientId) {
        const patient = mockPatients.get(patientId);
        if (!patient) return [];

        const matches: MatchResult[] = [];
        for (const trial of mockTrials) {
          const score = this.calculateMockMatchScore(patient, trial);
          if (score > 0.3) {
            matches.push({
              trialId: trial.id,
              matchScore: score,
              eligibilityProof: `ZKProof:${patientId}|${trial.id}|${Date.now()}`,
              consentRequired: true
            });
          }
        }
        return matches.sort((a, b) => b.matchScore - a.matchScore);
      },

      async getAllTrials() {
        return mockTrials;
      },

      async getPatient(patientId) {
        return mockPatients.get(patientId) || null;
      },

      async agentCallback(patientId, trialId, action) {
        console.log(`ICP Agent Callback - Patient: ${patientId}, Trial: ${trialId}`, action);
      },

      async deletePatientData(patientId) {
        mockPatients.delete(patientId);
      },

      async getAuditLog() {
        return [
          'ICP Canister initialized in mock mode',
          'Patient data encrypted with AES-256',
          'ZK proofs generated for privacy protection',
          'Bitcoin anchoring simulated'
        ];
      }
    };
  }

  private calculateMockMatchScore(patient: PatientProfile, trial: ClinicalTrial): number {
    let score = 0;

    // Symptom matching (40%)
    const matchingSymptoms = patient.symptoms.filter(s => 
      trial.requiredSymptoms.some(rs => s.toLowerCase().includes(rs.toLowerCase()))
    );
    score += (matchingSymptoms.length / trial.requiredSymptoms.length) * 0.4;

    // Location matching (30%)
    if (trial.locations.includes(patient.location)) {
      score += 0.3;
    } else {
      score += 0.1; // Partial score for different location
    }

    // Gender eligibility (30%)
    if (trial.genderEligibility.includes(patient.gender)) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  async addPatient(
    symptoms: string[],
    location: string,
    ageGroup: AgeGroup,
    gender: Gender,
    sensitiveData: string
  ): Promise<string> {
    if (!this.actor) await this.initialize();
    return this.actor!.addPatient(symptoms, location, ageGroup, gender, sensitiveData);
  }

  async matchTrials(patientId: string): Promise<MatchResult[]> {
    if (!this.actor) await this.initialize();
    return this.actor!.matchTrials(patientId);
  }

  async getAllTrials(): Promise<ClinicalTrial[]> {
    if (!this.actor) await this.initialize();
    return this.actor!.getAllTrials();
  }

  async getAuditLog(): Promise<string[]> {
    if (!this.actor) await this.initialize();
    return this.actor!.getAuditLog();
  }

  async agentCallback(patientId: string, trialId: string, action: 'consent' | 'notification'): Promise<void> {
    if (!this.actor) await this.initialize();
    const actionObj = action === 'consent' 
      ? { consentRequested: null } 
      : { matchNotification: null };
    return this.actor!.agentCallback(patientId, trialId, actionObj);
  }
}

export const icpService = new ICPService();