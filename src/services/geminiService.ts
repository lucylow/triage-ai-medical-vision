const GEMINI_API_KEY = 'AIzaSyBJjAgF21V44hb-lTNiWKoWWfo9U4cyjkE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export class GeminiService {
  static async generateContent(prompt: string): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return {
          success: true,
          content: data.candidates[0].content.parts[0].text
        };
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async generateClinicalTrialInsights(condition: string, symptoms: string[]): Promise<GeminiResponse> {
    const prompt = `As a medical AI assistant, provide insights about clinical trials for ${condition}. 
    Patient symptoms: ${symptoms.join(', ')}. 
    Please provide:
    1. General information about ${condition} clinical trials
    2. Common eligibility criteria
    3. Potential benefits and risks
    4. Questions to ask doctors about trials
    Keep the response concise and helpful for patients.`;
    
    return this.generateContent(prompt);
  }

  static async generateTrialMatchingAdvice(patientProfile: any): Promise<GeminiResponse> {
    const prompt = `Analyze this patient profile for clinical trial matching:
    Age: ${patientProfile.age}
    Condition: ${patientProfile.condition}
    Location: ${patientProfile.location}
    Medical History: ${patientProfile.medicalHistory}
    
    Provide personalized advice on:
    1. Trial types to consider
    2. Eligibility factors to focus on
    3. Questions to ask trial coordinators
    4. Preparation tips for screening`;
    
    return this.generateContent(prompt);
  }
}
