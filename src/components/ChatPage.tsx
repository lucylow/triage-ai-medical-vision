import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Brain,
  Sparkles,
  Mic,
  MicOff,
  Loader2,
  Download,
  Upload,
  Search,
  Filter,
  Settings,
  Zap,
  Shield,
  Lock,
  Globe,
  Network,
  CheckCircle,
  FileText,
  Image,
  File,
  X,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FileVideo,
  FileAudio,
  Paperclip,
  XCircle,
  Lightbulb,
  Plus,
  MoreHorizontal
} from 'lucide-react';

interface ChatMessage {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAI: boolean;
  files?: File[];
}

export default function ChatPage() {
  // Custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your AI-powered clinical trial assistant. I can help you find relevant trials, answer questions about medical conditions, and guide you through the application process. How can I help you today?",
      timestamp: new Date(),
      isAI: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState<string[]>([]);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    voice: 'default',
    speed: 1.0,
    pitch: 1.0
  });
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Voice recognition and synthesis
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceSettings.language;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsRecording(true);
        startRecordingTimer();
        startAudioLevelSimulation();
      };

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

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        stopRecording();
      };
    }

    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current);
    };
  }, [voiceSettings.language]);

  // Start recording timer
  const startRecordingTimer = () => {
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  // Start audio level simulation
  const startAudioLevelSimulation = () => {
    audioLevelIntervalRef.current = setInterval(() => {
      setRecordingLevel(Math.random() * 100);
    }, 100);
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    setIsListening(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current);
    setRecordingLevel(0);
  };

  // Start voice recording
  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        toast({
          title: "Voice Recording Started",
          description: "Speak now to interact with the AI assistant.",
        });
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        toast({
          title: "Voice Recording Error",
          description: "Could not start voice recognition. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Voice Recognition Not Available",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive"
      });
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Send voice message
  const sendVoiceMessage = () => {
    if (transcript.trim()) {
      setInputMessage(transcript);
      setTranscript('');
      // Automatically send the message
      setTimeout(() => {
        handleSendMessage();
      }, 100);
    }
  };

  // Text-to-speech
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      if (synthesisRef.current) {
        window.speechSynthesis.cancel();
      }
      
      synthesisRef.current = new SpeechSynthesisUtterance(text);
      synthesisRef.current.rate = voiceSettings.speed;
      synthesisRef.current.pitch = voiceSettings.pitch;
      synthesisRef.current.lang = voiceSettings.language;
      
      synthesisRef.current.onstart = () => setIsSpeaking(true);
      synthesisRef.current.onend = () => setIsSpeaking(false);
      synthesisRef.current.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(synthesisRef.current);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Voice commands
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('stop') || lowerCommand.includes('end')) {
      stopVoiceRecording();
    } else if (lowerCommand.includes('send') || lowerCommand.includes('submit')) {
      sendVoiceMessage();
    } else if (lowerCommand.includes('clear') || lowerCommand.includes('reset')) {
      setTranscript('');
    } else if (lowerCommand.includes('help') || lowerCommand.includes('commands')) {
      setVoiceCommands([
        "Say 'Stop' to end recording",
        "Say 'Send' to submit message",
        "Say 'Clear' to reset transcript",
        "Say 'Help' for commands"
      ]);
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Demo suggestions for users to try
  const demoSuggestions = [
    {
      category: "Medical Conditions",
      suggestions: [
        "I have diabetes, what trials are available?",
        "What trials exist for heart disease?",
        "Are there trials for cancer treatment?",
        "I have multiple sclerosis, any new trials?",
        "I'm dealing with depression, are there new treatments?",
        "What about trials for Alzheimer's disease?",
        "Are there trials for autoimmune conditions?",
        "What trials exist for rare diseases?"
      ]
    },
    {
      category: "Trial Information",
      suggestions: [
        "How do I know if I'm eligible for a trial?",
        "What are the risks of participating?",
        "How long do trials typically last?",
        "What compensation can I expect?",
        "Will my insurance cover trial participation?",
        "What happens after the trial ends?",
        "Can I leave a trial early?",
        "How are trials monitored for safety?"
      ]
    },
    {
      category: "AI Analysis",
      suggestions: [
        "Analyze my symptoms for trial matching",
        "What's my risk profile for clinical trials?",
        "Match me with trials based on my medical history",
        "Generate a personalized trial recommendation report",
        "Analyze my lab results for trial eligibility",
        "What trials match my genetic profile?",
        "Create a trial participation timeline",
        "Assess my treatment response patterns"
      ]
    },
    {
      category: "Medical Guidance",
      suggestions: [
        "Explain my diagnosis in simple terms",
        "What questions should I ask my doctor?",
        "Help me understand my treatment options",
        "What lifestyle changes might help?",
        "How do I prepare for medical appointments?",
        "What should I know about my medications?",
        "Help me track my symptoms",
        "What warning signs should I watch for?"
      ]
    }
  ];

  // Enhanced AI responses for different scenarios
  const getAIResponse = async (message: string) => {
    setIsLoading(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const lowerMessage = message.toLowerCase();
    let response = '';
    
    if (lowerMessage.includes('diabetes') || lowerMessage.includes('diabetic')) {
      response = `🔍 **Diabetes Trial Analysis Complete!**

I found **8 relevant trials** for diabetes management:

🎯 **Top Matches:**
• **Novel Diabetes Treatment Study** (95% match)
  - Phase II, 12 weeks, $500 compensation
  - Location: New York, NY
  - Focus: Improved glycemic control with minimal side effects

• **Advanced Insulin Therapy** (95% match)
  - Phase III, 16 weeks, $800 compensation
  - Location: Los Angeles, CA
  - Focus: Long-acting insulin with reduced hypoglycemia

📊 **Eligibility Factors:**
✅ Age 18-65
✅ HbA1c 7.0-10.0%
✅ Type 2 diabetes diagnosis
✅ No recent cardiovascular events

❌ **Exclusion Factors:**
• Severe kidney disease
• Pregnancy or planning pregnancy
• Recent heart attack or stroke

💡 **Next Steps:**
1. Review trial details and requirements
2. Contact the research coordinator
3. Schedule a screening appointment
4. Prepare your medical records

Would you like me to provide more details about any specific trial or help you with the application process?`;
    } else if (lowerMessage.includes('cancer') || lowerMessage.includes('oncology')) {
      response = `🔍 **Cancer Trial Analysis Complete!**

I found **12 relevant trials** for cancer treatment:

🎯 **Top Matches:**
• **Immunotherapy for Solid Tumors** (97% match)
  - Phase II, 24 weeks, $1,200 compensation
  - Location: Multiple sites nationwide
  - Focus: Novel checkpoint inhibitor therapy

• **Targeted Therapy Study** (94% match)
  - Phase III, 36 weeks, $1,500 compensation
  - Location: Boston, MA
  - Focus: Precision medicine approach

📊 **Eligibility Factors:**
✅ Confirmed cancer diagnosis
✅ Age 18-75
✅ ECOG performance status 0-2
✅ Adequate organ function

❌ **Exclusion Factors:**
• Active brain metastases
• Previous immunotherapy treatment
• Autoimmune conditions

💡 **Next Steps:**
1. Review trial protocols
2. Discuss with your oncologist
3. Contact research team
4. Prepare for screening

Would you like me to explain any specific trial details or help you understand the treatment approach?`;
    } else if (lowerMessage.includes('heart') || lowerMessage.includes('cardiac') || lowerMessage.includes('cardiovascular')) {
      response = `🔍 **Cardiovascular Trial Analysis Complete!**

I found **9 relevant trials** for heart conditions:

🎯 **Top Matches:**
• **Heart Failure Treatment Study** (93% match)
  - Phase III, 48 weeks, $1,000 compensation
  - Location: Cleveland, OH
  - Focus: Novel medication for heart failure

• **Hypertension Management** (91% match)
  - Phase II, 16 weeks, $600 compensation
  - Location: Dallas, TX
  - Focus: Blood pressure control

📊 **Eligibility Factors:**
✅ Age 21-80
✅ Stable heart condition
✅ Blood pressure <180/110
✅ No recent heart surgery

❌ **Exclusion Factors:**
• Unstable angina
• Recent heart attack
• Severe heart failure
• Pregnancy

💡 **Next Steps:**
1. Review trial requirements
2. Consult your cardiologist
3. Schedule screening visit
4. Prepare medical history

Would you like me to provide more details about any specific trial or help you understand the risks and benefits?`;
    } else if (lowerMessage.includes('trial') || lowerMessage.includes('study') || lowerMessage.includes('research')) {
      response = `🔍 **Clinical Trial Information**

Clinical trials are research studies that test new treatments, drugs, or procedures. Here's what you need to know:

📋 **What Are Clinical Trials?**
• Research studies to test new medical treatments
• Carefully designed and monitored by experts
• Follow strict safety and ethical guidelines
• Help advance medical science

🎯 **Types of Trials:**
• **Phase I**: Safety testing (small groups)
• **Phase II**: Effectiveness testing (larger groups)
• **Phase III**: Comparison with standard treatments
• **Phase IV**: Post-approval monitoring

✅ **Benefits:**
• Access to cutting-edge treatments
• Expert medical care and monitoring
• Help advance medical science
• Potential compensation for participation

⚠️ **Risks:**
• New treatments may have unknown side effects
• Treatment may not work for you
• Time commitment required
• Potential costs not covered by insurance

💡 **How to Get Started:**
1. Tell me about your specific condition
2. I'll search for relevant trials
3. Review trial details and requirements
4. Contact the research team

What medical condition are you interested in learning more about?`;
    } else if (lowerMessage.includes('eligibility') || lowerMessage.includes('qualify') || lowerMessage.includes('eligible')) {
      response = `🔍 **Trial Eligibility Assessment**

Trial eligibility depends on many factors. Here's how to determine if you qualify:

📋 **Common Eligibility Factors:**
• **Age**: Most trials have age requirements (18-65, 21-75, etc.)
• **Medical History**: Specific conditions, previous treatments
• **Current Health**: Overall health status, organ function
• **Location**: Geographic proximity to trial sites
• **Time Commitment**: Ability to attend appointments

🎯 **How to Check Eligibility:**
1. **Review Trial Criteria**: Each trial has specific requirements
2. **Medical Records**: Gather your health information
3. **Doctor Consultation**: Discuss with your healthcare provider
4. **Screening Visit**: Most trials require an initial assessment

✅ **Common Requirements:**
• Stable medical condition
• No recent major surgeries
• Adequate organ function
• Willingness to follow protocol
• Reliable transportation

❌ **Common Exclusions:**
• Pregnancy or planning pregnancy
• Severe medical conditions
• Recent participation in other trials
• Geographic limitations
• Inability to follow protocol

💡 **Next Steps:**
1. Tell me your specific condition
2. I'll find trials that might be a good match
3. Review eligibility criteria together
4. Help you prepare for screening

What medical condition are you interested in? I'll help you find trials that match your profile.`;
    } else if (lowerMessage.includes('risk') || lowerMessage.includes('danger') || lowerMessage.includes('safe')) {
      response = `🔍 **Trial Safety & Risk Assessment**

Clinical trials are designed with safety as the top priority. Here's what you should know:

🛡️ **Safety Measures:**
• **IRB Approval**: All trials reviewed by ethics boards
• **Informed Consent**: Detailed explanation of risks and benefits
• **Medical Monitoring**: Regular health checks and monitoring
• **Emergency Procedures**: Protocols for adverse events
• **Data Safety Boards**: Independent oversight committees

⚠️ **Potential Risks:**
• **Side Effects**: New treatments may have unknown effects
• **Ineffectiveness**: Treatment may not work for you
• **Time Commitment**: Regular appointments and follow-ups
• **Costs**: Some expenses may not be covered
• **Emotional Impact**: Dealing with health challenges

✅ **Risk Reduction:**
• **Careful Screening**: Thorough eligibility assessment
• **Expert Care**: Experienced medical professionals
• **Monitoring**: Regular health assessments
• **Communication**: Open dialogue with research team
• **Emergency Plans**: Clear procedures for problems

💡 **How to Minimize Risks:**
1. **Ask Questions**: Understand all aspects of the trial
2. **Review Consent**: Read and understand all documents
3. **Stay Informed**: Keep track of your health and any changes
4. **Report Issues**: Immediately report any problems
5. **Maintain Communication**: Stay in touch with the research team

🔍 **Questions to Ask:**
• What are the known risks?
• How will I be monitored?
• What happens if something goes wrong?
• How can I contact the team?
• What emergency procedures are in place?

Would you like me to help you find trials for your specific condition so we can discuss the risks and benefits together?`;
    } else {
      response = `🤖 **AI Analysis Complete!**

Thank you for your question about "${message}". I've analyzed your query and here's what I found:

💡 **General Guidance:**
Clinical trials are research studies that test new treatments, drugs, or procedures. They're essential for advancing medical science and finding better treatments for various conditions.

🔍 **How I Can Help:**
• **Trial Matching**: Find trials that match your specific condition
• **Eligibility Assessment**: Check if you qualify for trials
• **Risk Analysis**: Understand the risks and benefits
• **Application Support**: Guide you through the process
• **Medical Information**: Explain conditions and treatments

📋 **Next Steps:**
1. Tell me about your specific medical condition
2. Share any symptoms you're experiencing
3. Let me know what type of treatment you're seeking
4. I'll match you with relevant trials

🎯 **Try These Examples:**
• "I have [condition], what trials are available?"
• "What trials exist for [symptoms]?"
• "Help me understand [treatment] options"
• "Analyze my eligibility for trials"

Would you like me to help you with any specific medical condition or trial search?`;
    }
    
    return response;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage || `📎 Uploaded ${uploadedFiles.length} file(s)`,
      timestamp: new Date(),
      isAI: false,
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(async () => {
      const aiResponse = await getAIResponse(userMessage.content);
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        isAI: true
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      setUploadedFiles([]); // Clear uploaded files after processing
    }, 1500);
  };

  // File upload functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      // Filter for medical document types
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'application/json'
      ];
      
      const validFiles = files.filter(file => {
        if (allowedTypes.includes(file.type)) {
          return true;
        }
        toast({
          title: "File Type Not Supported",
          description: `${file.name} is not a supported file type. Please upload images, PDFs, or documents.`,
          variant: "destructive",
        });
        return false;
      });

      if (validFiles.length === 0) return;

      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Files Uploaded Successfully",
        description: `${validFiles.length} file(s) uploaded and ready for analysis.`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "File Upload Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">GreyGuard AI Assistant</h1>
                <p className="text-slate-600">Your intelligent clinical trial companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                HIPAA Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Zap className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface - Main Content */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col bg-white shadow-xl border-0">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-900">Chat with AI Assistant</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <div 
                  className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px] custom-scrollbar"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 #f1f5f9'
                  }}
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'assistant' && (
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <Brain className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            {message.files && message.files.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {message.files.map((file, index) => (
                                  <div key={index} className="flex items-center space-x-2 bg-white/20 rounded-lg p-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm">{file.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className={`text-xs mt-2 ${
                              message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Brain className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                            <span className="text-slate-600">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                  {/* File Upload Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Uploaded Files:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFiles([])}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-slate-700">{file.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Field and Actions */}
                  <div className="flex items-end space-x-3">
                    <div className="flex-1 relative">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      
                      <div className="relative">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask anything about clinical trials, medical conditions, or upload files for analysis..."
                          className="pr-24 py-3 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        />
                        
                        {/* Action Icons */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1 h-8 w-8 text-slate-500 hover:text-blue-600"
                            title="Attach files"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={startVoiceRecording}
                            disabled={isRecording}
                            className={`p-1 h-8 w-8 ${
                              isRecording 
                                ? 'text-red-600' 
                                : 'text-slate-500 hover:text-blue-600'
                            }`}
                            title="Voice input"
                          >
                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || (!inputMessage.trim() && uploadedFiles.length === 0)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send
                    </Button>
                  </div>

                  {/* Voice Recording Status */}
                  {isRecording && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-red-700">Recording... {recordingTime}s</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={stopVoiceRecording}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            Stop
                          </Button>
                          {transcript && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={sendVoiceMessage}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Send
                            </Button>
                          )}
                        </div>
                      </div>
                      {transcript && (
                        <div className="mt-2 p-2 bg-white rounded border border-red-200">
                          <span className="text-sm text-slate-700">{transcript}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span>Quick Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {demoSuggestions.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.suggestions.slice(0, 3).map((suggestion, suggestionIndex) => (
                          <button
                            key={suggestionIndex}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left p-3 text-sm text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-slate-200 hover:border-blue-300 transition-all duration-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    {showSuggestions ? 'Hide' : 'Show'} Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
