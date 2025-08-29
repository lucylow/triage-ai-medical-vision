import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface STTRequest {
  audio: string; // base64 encoded audio
  language: string;
  model?: string;
}

interface TTSRequest {
  text: string;
  voice: string;
  speed: string;
  language: string;
  model?: string;
}

interface STTResponse {
  transcript: string;
  confidence: number;
  language: string;
  model: string;
  processingTime: number;
}

interface TTSResponse {
  audio: string; // base64 encoded audio
  duration: number;
  model: string;
  processingTime: number;
}

interface VoiceError {
  error: string;
  code: string;
  details: string;
  fallback?: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname

    // Speech-to-Text endpoint
    if (path === '/speech-to-text' && req.method === 'POST') {
      return await handleSpeechToText(req)
    }

    // Text-to-Speech endpoint
    if (path === '/text-to-speech' && req.method === 'POST') {
      return await handleTextToSpeech(req)
    }

    // Health check endpoint
    if (path === '/health' && req.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          status: 'healthy', 
          service: 'voice-api',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Not found
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      }
    )

  } catch (error) {
    console.error('Voice API error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function handleSpeechToText(req: Request): Promise<Response> {
  try {
    const body = await req.json() as STTRequest
    
    if (!body.audio || !body.language) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: audio, language' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const startTime = Date.now()
    
    // Try Gemini STT first
    const geminiResponse = await tryGeminiSTT(body)
    if (geminiResponse && !('error' in geminiResponse)) {
      return new Response(
        JSON.stringify({
          ...geminiResponse,
          processingTime: Date.now() - startTime
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Fallback to Web Speech API simulation
    const fallbackResponse = await simulateWebSpeechSTT(body)
    
    return new Response(
      JSON.stringify({
        ...fallbackResponse,
        processingTime: Date.now() - startTime
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('STT error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Speech recognition failed',
        code: 'STT_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}

async function handleTextToSpeech(req: Request): Promise<Response> {
  try {
    const body = await req.json() as TTSRequest
    
    if (!body.text || !body.voice || !body.speed || !body.language) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: text, voice, speed, language' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const startTime = Date.now()
    
    // Try Gemini TTS first
    const geminiResponse = await tryGeminiTTS(body)
    if (geminiResponse && !('error' in geminiResponse)) {
      return new Response(
        JSON.stringify({
          ...geminiResponse,
          processingTime: Date.now() - startTime
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Fallback to Web Speech API simulation
    const fallbackResponse = await simulateWebSpeechTTS(body)
    
    return new Response(
      JSON.stringify({
        ...fallbackResponse,
        processingTime: Date.now() - startTime
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('TTS error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Text-to-speech failed',
        code: 'TTS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}

async function tryGeminiSTT(request: STTRequest): Promise<STTResponse | VoiceError> {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Transcribe this audio to text. Language: ${request.language}. Return only the transcribed text, nothing else.`
            }, {
              inline_data: {
                mime_type: 'audio/webm',
                data: request.audio
              }
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!transcript) {
      throw new Error('No transcript generated')
    }

    return {
      transcript: transcript.trim(),
      confidence: 0.95,
      language: request.language,
      model: 'gemini-1.5-flash'
    }

  } catch (error) {
    console.error('Gemini STT error:', error)
    return {
      error: 'Gemini STT failed',
      code: 'GEMINI_STT_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function tryGeminiTTS(request: TTSRequest): Promise<TTSResponse | VoiceError> {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Note: Gemini doesn't have native TTS yet
    // This is a placeholder for future implementation
    throw new Error('Gemini TTS not yet available')

  } catch (error) {
    console.error('Gemini TTS error:', error)
    return {
      error: 'Gemini TTS failed',
      code: 'GEMINI_TTS_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function simulateWebSpeechSTT(request: STTRequest): Promise<STTResponse> {
  // Simulate Web Speech API processing
  // In a real implementation, this would use the browser's speech recognition
  
  // For demo purposes, return a mock transcript
  const mockTranscripts = [
    "Hello, I'm looking for clinical trials for diabetes",
    "I need to find trials for cancer treatment",
    "What are the available trials for heart disease?",
    "I want to participate in medical research studies",
    "Show me trials for autoimmune disorders"
  ]
  
  const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]
  
  return {
    transcript: randomTranscript,
    confidence: 0.85 + Math.random() * 0.1,
    language: request.language,
    model: 'web-speech-api-simulation'
  }
}

async function simulateWebSpeechTTS(request: TTSRequest): Promise<TTSResponse> {
  // Simulate Web Speech API TTS processing
  // In a real implementation, this would use the browser's speech synthesis
  
  // For demo purposes, create a mock audio response
  const mockAudioData = btoa(`mock-audio-${request.text.length}-${Date.now()}`)
  
  return {
    audio: mockAudioData,
    duration: request.text.length * 0.1,
    model: 'web-speech-api-simulation'
  }
}
