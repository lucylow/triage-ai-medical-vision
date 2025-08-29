import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Paperclip,
  Globe,
  Search,
  Filter,
  Mic,
  X,
  Send
} from 'lucide-react';

interface ChatInputProps {
  placeholder?: string;
  onSubmit?: (message: string) => void;
  onFileAttach?: () => void;
  onWebSearch?: () => void;
  onAgentSearch?: () => void;
  onFilter?: () => void;
  onVoiceToggle?: () => void;
  isListening?: boolean;
  modelName?: string;
  showSendButton?: boolean;
  className?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  placeholder = "Ask anything to ASI:One or use @handle to reach an agent directly",
  onSubmit,
  onFileAttach,
  onWebSearch,
  onAgentSearch,
  onFilter,
  onVoiceToggle,
  isListening = false,
  modelName = "ASI1-mini",
  showSendButton = false,
  className = "",
  disabled = false
}) => {
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<'web' | 'agent' | 'filter'>('web');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onSubmit) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && onSubmit) {
        onSubmit(input.trim());
        setInput('');
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Input Field */}
      <form onSubmit={handleSubmit} className="relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-20 h-12 text-base"
        />
        
        {/* Character count */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
          {input.length}/1000
        </div>
        
        {/* Send Button (if enabled) */}
        {showSendButton && (
          <Button
            type="submit"
            disabled={!input.trim() || disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </form>
      
      {/* Icon Row - Matching the Design */}
      <div className="flex items-center justify-between">
        {/* Left side - Action Icons */}
        <div className="flex items-center space-x-3">
          {/* File Attachment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onFileAttach}
            className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          {/* Web Search */}
          <Button
            variant={activeMode === 'web' ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveMode('web');
              onWebSearch?.();
            }}
            className={`h-8 w-8 p-0 ${
              activeMode === 'web' 
                ? 'bg-grey-600 text-white hover:bg-grey-700' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
            title="Web search mode"
          >
            <Globe className="h-4 w-4" />
          </Button>
          
          {/* Agent Search */}
          <Button
            variant={activeMode === 'agent' ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveMode('agent');
              onAgentSearch?.();
            }}
            className={`h-8 w-8 p-0 ${
              activeMode === 'agent' 
                ? 'bg-grey-600 text-white hover:bg-grey-700' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
            title="Agent search mode"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Filter/Settings */}
          <Button
            variant={activeMode === 'filter' ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveMode('filter');
              onFilter?.();
            }}
            className={`h-8 w-8 p-0 ${
              activeMode === 'filter' 
                ? 'bg-grey-600 text-white hover:bg-grey-700' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
            title="Filter and settings"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Right side - Model Selection and Voice Button */}
        <div className="flex items-center space-x-3">
          {/* Model Selection */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{modelName}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:bg-muted"
              title="Change model"
            >
              <X className="h-4 w-4 rotate-90" />
            </Button>
          </div>
          
          {/* Voice Chat Button */}
          <Button
            onClick={onVoiceToggle}
            className={`h-10 w-10 rounded-full p-0 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-400 hover:bg-green-500'
            }`}
            title={isListening ? "Stop voice input" : "Start voice input"}
          >
            <Mic className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center">
        ASI:One may make mistakes — please verify important details.
      </div>
    </div>
  );
};
