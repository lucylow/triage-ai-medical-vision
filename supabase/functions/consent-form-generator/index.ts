import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConsentFormRequest {
  trialId: string
  trialTitle: string
  trialDescription?: string
  patientAge?: number
  riskLevel?: 'low' | 'moderate' | 'high'
  procedures?: string[]
  formType: 'standard' | 'pediatric' | 'high_risk' | 'international'
  language?: string
}

interface ConsentFormResponse {
  success: boolean
  consentForm: {
    title: string
    sections: ConsentSection[]
    signatures: SignatureSection[]
    generatedAt: string
    formId: string
  }
}

interface ConsentSection {
  title: string
  content: string
  required: boolean
  type: 'information' | 'risks' | 'benefits' | 'procedures' | 'rights' | 'contact'
}

interface SignatureSection {
  label: string
  required: boolean
  type: 'patient' | 'guardian' | 'witness' | 'investigator'
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
    const { 
      trialId, 
      trialTitle, 
      trialDescription, 
      patientAge, 
      riskLevel, 
      procedures, 
      formType,
      language 
    }: ConsentFormRequest = await req.json()

    if (!trialId || !trialTitle) {
      return new Response(
        JSON.stringify({ error: 'Trial ID and title are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generating consent form:', { trialId, trialTitle, formType, language })

    // Generate intelligent consent form using Gemini
    const consentForm = await generateConsentForm({
      trialId,
      trialTitle,
      trialDescription,
      patientAge,
      riskLevel,
      procedures,
      formType,
      language: language || 'English'
    }, geminiApiKey)

    return new Response(
      JSON.stringify({
        success: true,
        consentForm,
        metadata: {
          generatedAt: new Date().toISOString(),
          trialId,
          formType,
          language: language || 'English'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in consent form generation:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate consent form',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateConsentForm(request: ConsentFormRequest, geminiApiKey: string): Promise<ConsentFormResponse['consentForm']> {
  const prompt = buildConsentPrompt(request)
  
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
          temperature: 0.3,
          maxOutputTokens: 4000
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const formText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Parse the structured response from Gemini
    return parseConsentForm(formText, request)
    
  } catch (error) {
    console.error('Gemini consent generation error:', error)
    // Return fallback consent form
    return getFallbackConsentForm(request)
  }
}

function buildConsentPrompt(request: ConsentFormRequest): string {
  let prompt = `Generate a comprehensive, legally compliant informed consent form for a clinical trial. This form must be clear, accessible, and appropriate for the specified audience.

TRIAL INFORMATION:
- Trial ID: ${request.trialId}
- Title: ${request.trialTitle}
- Description: ${request.trialDescription || 'Not provided'}
- Risk Level: ${request.riskLevel || 'moderate'}
- Form Type: ${request.formType}
- Language: ${request.language}
`

  if (request.patientAge) {
    prompt += `- Patient Age: ${request.patientAge}\n`
  }
  if (request.procedures && request.procedures.length > 0) {
    prompt += `- Procedures: ${request.procedures.join(', ')}\n`
  }

  prompt += `
REQUIREMENTS:
1. Must comply with ICH-GCP guidelines and FDA regulations
2. Use clear, non-technical language appropriate for general public
3. Include all required elements for informed consent
4. Address specific considerations for ${request.formType} forms
5. Ensure cultural sensitivity for ${request.language} speakers

Please structure the response as JSON in this exact format:

{
  "title": "Informed Consent Form - [Trial Title]",
  "sections": [
    {
      "title": "Study Purpose and Background",
      "content": "Clear explanation of why the study is being conducted...",
      "required": true,
      "type": "information"
    },
    {
      "title": "Study Procedures",
      "content": "Detailed description of what will happen during the study...",
      "required": true,
      "type": "procedures"
    },
    {
      "title": "Risks and Discomforts",
      "content": "Comprehensive list of potential risks...",
      "required": true,
      "type": "risks"
    },
    {
      "title": "Benefits",
      "content": "Potential benefits to participant and society...",
      "required": true,
      "type": "benefits"
    },
    {
      "title": "Your Rights as a Participant",
      "content": "Explanation of participant rights including withdrawal...",
      "required": true,
      "type": "rights"
    },
    {
      "title": "Privacy and Confidentiality",
      "content": "How data will be protected and used...",
      "required": true,
      "type": "information"
    },
    {
      "title": "Contact Information",
      "content": "Who to contact for questions or concerns...",
      "required": true,
      "type": "contact"
    }
  ],
  "signatures": [
    {
      "label": "Participant Signature",
      "required": true,
      "type": "patient"
    },
    {
      "label": "Principal Investigator Signature",
      "required": true,
      "type": "investigator"
    }
  ]
}

Ensure the content is appropriate for ${request.riskLevel} risk level and ${request.formType} form type. Make the language accessible while maintaining legal precision.`

  return prompt
}

function parseConsentForm(formText: string, request: ConsentFormRequest): ConsentFormResponse['consentForm'] {
  try {
    // Extract JSON from the response
    const jsonMatch = formText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const parsedForm = JSON.parse(jsonMatch[0])
    
    return {
      title: parsedForm.title || `Informed Consent Form - ${request.trialTitle}`,
      sections: parsedForm.sections || getFallbackSections(request),
      signatures: parsedForm.signatures || getFallbackSignatures(request),
      generatedAt: new Date().toISOString(),
      formId: `consent_${request.trialId}_${Date.now()}`
    }
    
  } catch (error) {
    console.error('Error parsing consent form:', error)
    return getFallbackConsentForm(request)
  }
}

function getFallbackConsentForm(request: ConsentFormRequest): ConsentFormResponse['consentForm'] {
  return {
    title: `Informed Consent Form - ${request.trialTitle}`,
    sections: getFallbackSections(request),
    signatures: getFallbackSignatures(request),
    generatedAt: new Date().toISOString(),
    formId: `consent_${request.trialId}_${Date.now()}`
  }
}

function getFallbackSections(request: ConsentFormRequest): ConsentSection[] {
  return [
    {
      title: "Study Purpose and Background",
      content: `You are being invited to participate in a research study titled "${request.trialTitle}" (Study ID: ${request.trialId}). This study aims to evaluate new treatments and advance medical knowledge. Your participation is voluntary.`,
      required: true,
      type: "information"
    },
    {
      title: "Study Procedures",
      content: "If you agree to participate, you will be asked to follow the study protocol which may include medical examinations, laboratory tests, and questionnaires. The study team will explain all procedures in detail.",
      required: true,
      type: "procedures"
    },
    {
      title: "Risks and Discomforts",
      content: `All medical procedures carry some risk. The specific risks associated with this study will be explained to you. The risk level for this study is considered ${request.riskLevel || 'moderate'}.`,
      required: true,
      type: "risks"
    },
    {
      title: "Benefits",
      content: "While there is no guarantee of benefit to you personally, your participation may help advance medical science and potentially benefit future patients with similar conditions.",
      required: true,
      type: "benefits"
    },
    {
      title: "Your Rights as a Participant",
      content: "Your participation is completely voluntary. You may withdraw from the study at any time without penalty or loss of benefits. Your decision will not affect your regular medical care.",
      required: true,
      type: "rights"
    },
    {
      title: "Privacy and Confidentiality",
      content: "Your privacy will be protected using blockchain technology and zero-knowledge proofs. Your personal information will be kept confidential and used only for research purposes.",
      required: true,
      type: "information"
    },
    {
      title: "Contact Information",
      content: "If you have questions about the study, your rights as a participant, or need to report a research-related injury, please contact the study team. Emergency contact information will be provided separately.",
      required: true,
      type: "contact"
    }
  ]
}

function getFallbackSignatures(request: ConsentFormRequest): SignatureSection[] {
  const signatures: SignatureSection[] = [
    {
      label: "Participant Signature",
      required: true,
      type: "patient"
    },
    {
      label: "Principal Investigator Signature", 
      required: true,
      type: "investigator"
    }
  ]

  // Add guardian signature for pediatric forms
  if (request.formType === 'pediatric' || (request.patientAge && request.patientAge < 18)) {
    signatures.splice(1, 0, {
      label: "Parent/Guardian Signature",
      required: true,
      type: "guardian"
    })
  }

  // Add witness for high-risk studies
  if (request.riskLevel === 'high' || request.formType === 'high_risk') {
    signatures.push({
      label: "Witness Signature",
      required: true,
      type: "witness"
    })
  }

  return signatures
}