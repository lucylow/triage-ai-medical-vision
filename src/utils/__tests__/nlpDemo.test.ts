import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NLPDemo } from '../nlpDemo';

describe('NLPDemo', () => {
  let nlpDemo: NLPDemo;

  beforeEach(() => {
    nlpDemo = new NLPDemo();
  });

  describe('processQuery', () => {
    it('identifies diabetes-related queries correctly', () => {
      const result = nlpDemo.processQuery('Find clinical trials for diabetes');
      
      expect(result.condition).toBe('diabetes');
      expect(result.queryType).toBe('trial_search');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('identifies cancer-related queries correctly', () => {
      const result = nlpDemo.processQuery('I have lung cancer, what trials are available?');
      
      expect(result.condition).toBe('lung cancer');
      expect(result.queryType).toBe('trial_search');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('identifies location-based queries', () => {
      const result = nlpDemo.processQuery('Find trials near Boston');
      
      expect(result.location).toBe('Boston');
      expect(result.queryType).toBe('location_search');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('identifies phase-specific queries', () => {
      const result = nlpDemo.processQuery('Show me Phase 3 trials for multiple sclerosis');
      
      expect(result.phase).toBe('Phase 3');
      expect(result.condition).toBe('multiple sclerosis');
      expect(result.queryType).toBe('phase_specific_search');
    });

    it('handles general health queries', () => {
      const result = nlpDemo.processQuery('What is a clinical trial?');
      
      expect(result.queryType).toBe('information_request');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('handles queries with multiple conditions', () => {
      const result = nlpDemo.processQuery('I have both diabetes and heart disease');
      
      expect(result.conditions).toContain('diabetes');
      expect(result.conditions).toContain('heart disease');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('extracts age information from queries', () => {
      const result = nlpDemo.processQuery('I am 65 years old with arthritis');
      
      expect(result.age).toBe(65);
      expect(result.condition).toBe('arthritis');
    });

    it('identifies medication-related queries', () => {
      const result = nlpDemo.processQuery('I am taking metformin for diabetes');
      
      expect(result.medications).toContain('metformin');
      expect(result.condition).toBe('diabetes');
    });
  });

  describe('generateResponse', () => {
    it('generates appropriate response for trial search', () => {
      const queryResult = {
        condition: 'diabetes',
        queryType: 'trial_search',
        confidence: 0.9
      };
      
      const response = nlpDemo.generateResponse(queryResult);
      
      expect(response).toContain('diabetes');
      expect(response).toContain('clinical trial');
      expect(response.length).toBeGreaterThan(50);
    });

    it('generates location-specific responses', () => {
      const queryResult = {
        location: 'Boston',
        queryType: 'location_search',
        confidence: 0.8
      };
      
      const response = nlpDemo.generateResponse(queryResult);
      
      expect(response).toContain('Boston');
      expect(response).toContain('location');
    });

    it('handles low confidence queries gracefully', () => {
      const queryResult = {
        queryType: 'unknown',
        confidence: 0.3
      };
      
      const response = nlpDemo.generateResponse(queryResult);
      
      expect(response).toContain('clarify');
      expect(response).toContain('help');
    });

    it('includes trial count in responses', () => {
      const queryResult = {
        condition: 'cancer',
        queryType: 'trial_search',
        confidence: 0.9
      };
      
      const response = nlpDemo.generateResponse(queryResult);
      
      expect(response).toMatch(/\d+.*trial/);
    });
  });

  describe('extractMedicalTerms', () => {
    it('extracts common medical conditions', () => {
      const text = 'I have diabetes, hypertension, and asthma';
      const terms = nlpDemo.extractMedicalTerms(text);
      
      expect(terms).toContain('diabetes');
      expect(terms).toContain('hypertension');
      expect(terms).toContain('asthma');
    });

    it('handles medical abbreviations', () => {
      const text = 'I was diagnosed with COPD and CHF';
      const terms = nlpDemo.extractMedicalTerms(text);
      
      expect(terms).toContain('COPD');
      expect(terms).toContain('CHF');
    });

    it('ignores non-medical terms', () => {
      const text = 'I went to the store and bought some groceries';
      const terms = nlpDemo.extractMedicalTerms(text);
      
      expect(terms).toHaveLength(0);
    });

    it('handles misspelled medical terms', () => {
      const text = 'I have diabtes and hypertention';
      const terms = nlpDemo.extractMedicalTerms(text);
      
      // Should still extract the intended terms
      expect(terms.length).toBeGreaterThan(0);
    });
  });

  describe('calculateMatchScore', () => {
    it('calculates high score for exact matches', () => {
      const patientProfile = {
        conditions: ['diabetes', 'hypertension'],
        age: 45,
        location: 'Boston'
      };
      
      const trial = {
        conditions: ['diabetes', 'hypertension'],
        ageRange: { min: 40, max: 50 },
        location: 'Boston'
      };
      
      const score = nlpDemo.calculateMatchScore(patientProfile, trial);
      
      expect(score).toBeGreaterThan(90);
    });

    it('calculates lower score for partial matches', () => {
      const patientProfile = {
        conditions: ['diabetes'],
        age: 45,
        location: 'Boston'
      };
      
      const trial = {
        conditions: ['diabetes', 'hypertension'],
        ageRange: { min: 40, max: 50 },
        location: 'Boston'
      };
      
      const score = nlpDemo.calculateMatchScore(patientProfile, trial);
      
      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThan(90);
    });

    it('penalizes age mismatches', () => {
      const patientProfile = {
        conditions: ['diabetes'],
        age: 25,
        location: 'Boston'
      };
      
      const trial = {
        conditions: ['diabetes'],
        ageRange: { min: 50, max: 70 },
        location: 'Boston'
      };
      
      const score = nlpDemo.calculateMatchScore(patientProfile, trial);
      
      expect(score).toBeLessThan(50);
    });

    it('penalizes location mismatches', () => {
      const patientProfile = {
        conditions: ['diabetes'],
        age: 45,
        location: 'Boston'
      };
      
      const trial = {
        conditions: ['diabetes'],
        ageRange: { min: 40, max: 50 },
        location: 'Los Angeles'
      };
      
      const score = nlpDemo.calculateMatchScore(patientProfile, trial);
      
      expect(score).toBeLessThan(80);
    });
  });

  describe('testCustomInput', () => {
    it('processes custom input correctly', () => {
      const result = nlpDemo.testCustomInput('Find trials for multiple sclerosis in Chicago');
      
      expect(result.success).toBe(true);
      expect(result.condition).toBe('multiple sclerosis');
      expect(result.location).toBe('Chicago');
    });

    it('handles invalid input gracefully', () => {
      const result = nlpDemo.testCustomInput('');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('provides detailed analysis for complex queries', () => {
      const result = nlpDemo.testCustomInput('I am a 55-year-old woman with breast cancer, taking tamoxifen, looking for Phase 2 trials in New York');
      
      expect(result.success).toBe(true);
      expect(result.age).toBe(55);
      expect(result.condition).toBe('breast cancer');
      expect(result.medications).toContain('tamoxifen');
      expect(result.phase).toBe('Phase 2');
      expect(result.location).toBe('New York');
    });
  });

  describe('getTrialRecommendations', () => {
    it('returns relevant trial recommendations', () => {
      const patientProfile = {
        conditions: ['diabetes'],
        age: 45,
        location: 'Boston'
      };
      
      const recommendations = nlpDemo.getTrialRecommendations(patientProfile);
      
      expect(recommendations).toHaveLength(5);
      recommendations.forEach(trial => {
        expect(trial.matchScore).toBeGreaterThan(60);
        expect(trial.conditions.some(c => 
          patientProfile.conditions.some(pc => 
            pc.toLowerCase().includes(c.toLowerCase()) || 
            c.toLowerCase().includes(pc.toLowerCase())
          )
        )).toBe(true);
      });
    });

    it('sorts recommendations by match score', () => {
      const patientProfile = {
        conditions: ['cancer'],
        age: 50,
        location: 'Los Angeles'
      };
      
      const recommendations = nlpDemo.getTrialRecommendations(patientProfile);
      
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i-1].matchScore).toBeGreaterThanOrEqual(recommendations[i].matchScore);
      }
    });

    it('filters out ineligible trials', () => {
      const patientProfile = {
        conditions: ['diabetes'],
        age: 20,
        location: 'Boston'
      };
      
      const recommendations = nlpDemo.getTrialRecommendations(patientProfile);
      
      recommendations.forEach(trial => {
        expect(trial.ageRange.min).toBeLessThanOrEqual(patientProfile.age);
        expect(trial.ageRange.max).toBeGreaterThanOrEqual(patientProfile.age);
      });
    });
  });
});
