import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Brain,
  Activity,
  Settings,
  Languages,
  Zap
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface VoiceInterfaceProps {
  onTranscript: (text: string) => void;
  onAudioResponse?: (audioUrl: string) => void;
  className?: string;
  agentResponse?: string;
  isProcessing?: boolean;
}

interface VoiceSettings {
  language: string;
  voiceType: 'natural' | 'professional' | 'friendly';
  speed: 'slow' | 'normal' | 'fast';
  enableRealTime: boolean;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onTranscript,
  onAudioResponse,
  className,
  agentResponse,
  isProcessing = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [isProcessingTTS, setIsProcessingTTS] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: 'en-US',
    voiceType: 'natural',
    speed: 'normal',
    enableRealTime: true
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize speech recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceSettings.language;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          onTranscript(finalTranscript);
          
          // Auto-stop recording after final transcript
          if (isRecording) {
            stopRecording();
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "❌ Speech recognition error",
          description: event.error,
          variant: "destructive"
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [voiceSettings.language, onTranscript, isRecording]);

  const startRecording = useCallback(async () => {
    try {
      // Use Web Speech API if available and enabled
      if (voiceSettings.enableRealTime && recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        
        toast({
          title: "🎤 Real-time transcription active",
          description: "Speak naturally - transcription happens in real-time"
        });
        return;
      }

      // Fallback to MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToSTT(audioBlob);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      // Audio level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "🎤 Recording started",
        description: "Speak clearly into your microphone"
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "❌ Recording failed",
        description: "Please check your microphone permissions",
        variant: "destructive"
      });
    }
  }, [voiceSettings.enableRealTime, isRecording]);

  const stopRecording = useCallback(() => {
    if (voiceSettings.enableRealTime && recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      toast({
        title: "🔄 Processing complete",
        description: "Voice input processed successfully"
      });
      return;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      toast({
        title: "🔄 Processing audio",
        description: "Converting speech to text..."
      });
    }
  }, [voiceSettings.enableRealTime, isRecording]);

  const sendAudioToSTT = async (audioBlob: Blob) => {
    try {
      setIsProcessingSTT(true);
      
      // For demo purposes, simulate STT processing
      // In production, this would call the Supabase function
      setTimeout(() => {
        const mockTranscripts = [
          "Hello, I'm looking for clinical trials for diabetes",
          "I need to find trials for cancer treatment",
          "What are the available trials for heart disease?",
          "I want to participate in medical research studies",
          "Show me trials for autoimmune disorders",
          "Can you help me find suitable clinical trials?",
          "I'm interested in participating in medical research"
        ];
        
        const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
        
        setTranscript(randomTranscript);
        onTranscript(randomTranscript);
        
        toast({
          title: "✅ Speech recognized",
          description: `"${randomTranscript.substring(0, 50)}${randomTranscript.length > 50 ? '...' : ''}"`
        });
        
        setIsProcessingSTT(false);
      }, 1000 + Math.random() * 1500); // 1-2.5 second delay
      
    } catch (error) {
      console.error('STT error:', error);
      toast({
        title: "❌ Speech recognition failed",
        description: "Please try speaking again",
        variant: "destructive"
      });
      setIsProcessingSTT(false);
    }
  };

  const generateTTS = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      setIsProcessingTTS(true);
      
      // Use Web Speech API as fallback for demo
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceSettings.language;
        utterance.rate = getSpeechRate(voiceSettings.speed);
        utterance.pitch = getVoicePitch(voiceSettings.voiceType);
        
        utterance.onstart = () => {
          setIsPlaying(true);
          toast({
            title: "🔊 Speaking response",
            description: "Playing agent response"
          });
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          toast({
            title: "❌ Speech synthesis failed",
            description: "Could not speak response",
            variant: "destructive"
          });
        };
        
        // Stop any current speech
        speechSynthesis.cancel();
        
        // Speak the text
        speechSynthesis.speak(utterance);
        
        if (onAudioResponse) {
          // Create a mock audio URL for consistency
          const mockAudioUrl = `data:audio/wav;base64,${btoa('mock-audio-data')}`;
          onAudioResponse(mockAudioUrl);
        }
        
      } else {
        throw new Error('Speech synthesis not supported');
      }
      
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: "❌ Audio generation failed",
        description: "Speech synthesis not supported in this browser",
        variant: "destructive"
      });
    } finally {
      setIsProcessingTTS(false);
    }
  };

  const getSpeechRate = (speed: string): number => {
    switch (speed) {
      case 'slow': return 0.7;
      case 'fast': return 1.3;
      default: return 1.0;
    }
  };

  const getVoicePitch = (voice: string): number => {
    switch (voice) {
      case 'professional': return 0.8;
      case 'friendly': return 1.2;
      default: return 1.0;
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const stopAudio = () => {
    // Stop HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const updateVoiceSettings = (key: keyof VoiceSettings, value: any) => {
    setVoiceSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Voice Interface</span>
            <Badge variant="outline" className="ml-auto">
              {voiceSettings.enableRealTime ? 'Real-time' : 'Recording'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={cn(
                "relative transition-all duration-200 min-w-[120px]",
                isRecording && "animate-pulse"
              )}
              disabled={isProcessingSTT || isProcessingTTS}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Speak
                </>
              )}
              
              {isRecording && (
                <div 
                  className="absolute inset-0 bg-red-500 opacity-20 rounded"
                  style={{ 
                    transform: `scale(${1 + audioLevel * 0.3})`,
                    transition: 'transform 0.1s ease'
                  }}
                />
              )}
            </Button>

            {transcript && (
              <Button
                onClick={resetTranscript}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            )}

            <Button
              onClick={toggleSettings}
              size="sm"
              variant="ghost"
              className="ml-auto"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-100"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Transcript:</span>
              </div>
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          {/* Audio Response Controls */}
          {agentResponse && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Agent Response:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => generateTTS(agentResponse)}
                  size="sm"
                  variant="outline"
                  disabled={isProcessingTTS}
                  className="flex items-center gap-2"
                >
                  {isProcessingTTS ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Speak Response
                    </>
                  )}
                </Button>

                {onAudioResponse && (
                  <Button
                    onClick={isPlaying ? stopAudio : undefined}
                    size="sm"
                    variant="ghost"
                    disabled={!onAudioResponse}
                    className={cn(
                      "flex items-center gap-2",
                      isPlaying && "animate-pulse"
                    )}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Play
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Processing Indicators */}
          {(isProcessingSTT || isProcessingTTS || isProcessing) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
              {isProcessingSTT && "Processing speech..."}
              {isProcessingTTS && "Generating audio..."}
              {isProcessing && "Agent processing..."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voice Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Voice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Language</label>
                <select
                  value={voiceSettings.language}
                  onChange={(e) => updateVoiceSettings('language', e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="it-IT">Italian</option>
                  <option value="pt-BR">Portuguese (BR)</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="ko-KR">Korean</option>
                  <option value="zh-CN">Chinese (Simplified)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Voice Type</label>
                <select
                  value={voiceSettings.voiceType}
                  onChange={(e) => updateVoiceSettings('voiceType', e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                >
                  <option value="natural">Natural</option>
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Speed</label>
                <select
                  value={voiceSettings.speed}
                  onChange={(e) => updateVoiceSettings('speed', e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="realTime"
                  checked={voiceSettings.enableRealTime}
                  onChange={(e) => updateVoiceSettings('enableRealTime', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="realTime" className="text-sm font-medium">
                  Real-time transcription
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  );
};