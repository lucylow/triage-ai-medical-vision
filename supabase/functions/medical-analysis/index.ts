import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MedicalAnalysisRequest {
  symptoms: string
  medicalHistory?: string
  age?: number
  gender?: string
  medications?: string[]
  analysisType: 'risk_assessment' | 'condition_analysis' | 'trial_eligibility' | 'comprehensive'
}

interface MedicalAnalysisResponse {
  analysis: {
    primaryDiagnosis: string[]
    riskFactors: string[]
    recommendedTests: string[]
    trialEligibility: {
      score: number
      factors: string[]
      exclusions: string[]
    }
    lifestyle: {
      recommendations: string[]
      precautions: string[]
    }
  }
  confidence: number
  disclaimer: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the Gemini API key from Supabase secrets
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Parse the request
    const { symptoms, medicalHistory, age, gender, medications, analysisType }: MedicalAnalysisRequest = await req.json()

    if (!symptoms || symptoms.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Symptoms are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing medical analysis request:', { symptoms, analysisType, age, gender })

    // Perform comprehensive medical analysis using Gemini
    const analysis = await performMedicalAnalysis({
      symptoms,
      medicalHistory,
      age,
      gender,
      medications,
      analysisType
    }, geminiApiKey)

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        processedAt: new Date().toISOString(),
        analysisType,
        disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in medical analysis:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process medical analysis request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function performMedicalAnalysis(request: MedicalAnalysisRequest, geminiApiKey: string): Promise<MedicalAnalysisResponse> {
  const prompt = buildAnalysisPrompt(request)
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2000
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Parse the structured response from Gemini
    return parseGeminiAnalysis(analysisText, request.analysisType)
    
  } catch (error) {
    console.error('Gemini analysis error:', error)
    // Return fallback analysis
    return getFallbackAnalysis(request)
  }
}

function buildAnalysisPrompt(request: MedicalAnalysisRequest): string {
  let prompt = `As a medical AI assistant specializing in clinical trial matching and patient analysis, provide a comprehensive medical analysis based on the following patient information:

Symptoms: "${request.symptoms}"
`

  if (request.medicalHistory) {
    prompt += `Medical History: "${request.medicalHistory}"\n`
  }
  if (request.age) {
    prompt += `Age: ${request.age}\n`
  }
  if (request.gender) {
    prompt += `Gender: ${request.gender}\n`
  }
  if (request.medications && request.medications.length > 0) {
    prompt += `Current Medications: ${request.medications.join(', ')}\n`
  }

  prompt += `
Analysis Type: ${request.analysisType}

Please provide a structured analysis in the following JSON format:

{
  "primaryDiagnosis": ["most likely condition 1", "possible condition 2"],
  "riskFactors": ["risk factor 1", "risk factor 2"],
  "recommendedTests": ["test 1", "test 2"],
  "trialEligibility": {
    "score": 85,
    "factors": ["positive factor 1", "positive factor 2"],
    "exclusions": ["potential exclusion 1", "potential exclusion 2"]
  },
  "lifestyle": {
    "recommendations": ["recommendation 1", "recommendation 2"],
    "precautions": ["precaution 1", "precaution 2"]
  },
  "confidence": 75,
  "urgency": "low|moderate|high"
}

Focus on clinical trial eligibility assessment and provide evidence-based recommendations. Consider the patient's age, symptoms, and medical history for comprehensive analysis.`

  return prompt
}

function parseGeminiAnalysis(analysisText: string, analysisType: string): MedicalAnalysisResponse {
  try {
    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const analysis = JSON.parse(jsonMatch[0])
    
    return {
      analysis: {
        primaryDiagnosis: analysis.primaryDiagnosis || ["Unknown condition"],
        riskFactors: analysis.riskFactors || ["Assessment needed"],
        recommendedTests: analysis.recommendedTests || ["Consult physician"],
        trialEligibility: {
          score: analysis.trialEligibility?.score || 50,
          factors: analysis.trialEligibility?.factors || ["Requires evaluation"],
          exclusions: analysis.trialEligibility?.exclusions || ["None identified"]
        },
        lifestyle: {
          recommendations: analysis.lifestyle?.recommendations || ["Follow medical advice"],
          precautions: analysis.lifestyle?.precautions || ["Monitor symptoms"]
        }
      },
      confidence: analysis.confidence || 60,
      disclaimer: "This AI-generated analysis is for informational purposes only. Always consult with qualified healthcare professionals for medical decisions."
    }
  } catch (error) {
    console.error('Error parsing Gemini analysis:', error)
    return getFallbackAnalysis({ analysisType } as MedicalAnalysisRequest)
  }
}

function getFallbackAnalysis(request: MedicalAnalysisRequest): MedicalAnalysisResponse {
  return {
    analysis: {
      primaryDiagnosis: ["Requires medical evaluation"],
      riskFactors: ["Age-related factors", "Symptom severity"],
      recommendedTests: ["Complete medical examination", "Laboratory tests"],
      trialEligibility: {
        score: 50,
        factors: ["Symptoms present", "Age appropriate"],
        exclusions: ["Requires detailed assessment"]
      },
      lifestyle: {
        recommendations: ["Maintain healthy diet", "Regular exercise as tolerated"],
        precautions: ["Monitor symptoms", "Seek medical attention if worsening"]
      }
    },
    confidence: 40,
    disclaimer: "This fallback analysis is limited. Please consult with healthcare professionals for proper medical assessment."
  }
}