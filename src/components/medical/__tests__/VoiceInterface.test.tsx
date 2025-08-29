import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VoiceInterface from '../VoiceInterface';

// Mock the Web Speech API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onstart: null,
  onend: null,
  onresult: null,
  onerror: null,
};

const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => [
    { name: 'Google US English', lang: 'en-US', default: true },
    { name: 'Google UK English', lang: 'en-GB', default: false }
  ]),
  onvoiceschanged: null,
};

// Mock the browser APIs
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

describe('VoiceInterface Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders voice interface controls', () => {
    render(<VoiceInterface onTranscriptUpdate={() => {}} />);
    
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    expect(screen.getByText(/voice interface/i)).toBeInTheDocument();
  });

  it('starts recording when start button is clicked', () => {
    render(<VoiceInterface onTranscriptUpdate={() => {}} />);
    
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);
    
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
  });

  it('stops recording when stop button is clicked', () => {
    render(<VoiceInterface onTranscriptUpdate={() => {}} />);
    
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    fireEvent.click(stopButton);
    
    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
  });

  it('handles speech recognition results correctly', async () => {
    const mockOnTranscriptUpdate = vi.fn();
    render(<VoiceInterface onTranscriptUpdate={mockOnTranscriptUpdate} />);
    
    // Simulate speech recognition result
    const mockResult = {
      results: [
        {
          item: 0,
          transcript: 'Find clinical trials for diabetes'
        }
      ]
    };
    
    // Trigger the onresult event
    mockSpeechRecognition.onresult(mockResult);
    
    await waitFor(() => {
      expect(mockOnTranscriptUpdate).toHaveBeenCalledWith('Find clinical trials for diabetes');
    });
  });

  it('handles speech recognition errors gracefully', async () => {
    const mockOnTranscriptUpdate = vi.fn();
    render(<VoiceInterface onTranscriptUpdate={mockOnTranscriptUpdate} />);
    
    // Simulate speech recognition error
    const mockError = {
      error: 'no-speech',
      message: 'No speech detected'
    };
    
    // Trigger the onerror event
    mockSpeechRecognition.onerror(mockError);
    
    await waitFor(() => {
      expect(screen.getByText(/error: no-speech/i)).toBeInTheDocument();
    });
  });

  it('shows recording status when active', () => {
    render(<VoiceInterface onTranscriptUpdate={() => {}} />);
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);
    
    // Should show recording indicator
    expect(screen.getByText(/recording/i)).toBeInTheDocument();
    expect(startButton).toBeDisabled();
  });

  it('enables stop button only when recording', () => {
    render(<VoiceInterface onTranscriptUpdate={() => {}} />);
    
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    
    // Initially stop button should be disabled
    expect(stopButton).toBeDisabled();
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);
    
    // Now stop button should be enabled
    expect(stopButton).not.toBeDisabled();
  });

  it('handles multiple speech recognition results', async () => {
    const mockOnTranscriptUpdate = vi.fn();
    render(<VoiceInterface onTranscriptUpdate={mockOnTranscriptUpdate} />);
    
    // Simulate multiple results
    const mockResult = {
      results: [
        {
          item: 0,
          transcript: 'Find clinical trials'
        },
        {
          item: 1,
          transcript: 'Find clinical trials for diabetes'
        }
      ]
    };
    
    // Trigger the onresult event
    mockSpeechRecognition.onresult(mockResult);
    
    await waitFor(() => {
      // Should use the most recent result
      expect(mockOnTranscriptUpdate).toHaveBeenCalledWith('Find clinical trials for diabetes');
    });
  });

  it('resets interface state after recording stops', async () => {
    const mockOnTranscriptUpdate = vi.fn();
    render(<VoiceInterface onTranscriptUpdate={mockOnTranscriptUpdate} />);
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    fireEvent.click(stopButton);
    
    await waitFor(() => {
      expect(startButton).not.toBeDisabled();
      expect(stopButton).toBeDisabled();
      expect(screen.queryByText(/recording/i)).not.toBeInTheDocument();
    });
  });

  it('handles browser compatibility gracefully', () => {
    // Remove SpeechRecognition from window
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    
    render(<VoiceInterface onTranscriptUpdate={() => {}} />);
    
    // Should show compatibility message
    expect(screen.getByText(/voice recognition not supported/i)).toBeInTheDocument();
    
    // Buttons should be disabled
    expect(screen.getByRole('button', { name: /start recording/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /stop recording/i })).toBeDisabled();
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<VoiceInterface onTranscriptUpdate={() => {}} />);
    
    unmount();
    
    expect(mockSpeechRecognition.removeEventListener).toHaveBeenCalled();
  });

  it('handles interim results when enabled', async () => {
    const mockOnTranscriptUpdate = vi.fn();
    render(<VoiceInterface onTranscriptUpdate={mockOnTranscriptUpdate} />);
    
    // Enable interim results
    mockSpeechRecognition.interimResults = true;
    
    const mockInterimResult = {
      results: [
        {
          item: 0,
          transcript: 'Find clinical trials for',
          isFinal: false
        }
      ]
    };
    
    // Trigger interim result
    mockSpeechRecognition.onresult(mockInterimResult);
    
    await waitFor(() => {
      // Should not call onTranscriptUpdate for interim results
      expect(mockOnTranscriptUpdate).not.toHaveBeenCalled();
    });
  });

  it('displays voice interface instructions', () => {
    render(<VoiceInterface onTranscriptUpdate={() => {}} />);
    
    expect(screen.getByText(/click start to begin recording/i)).toBeInTheDocument();
    expect(screen.getByText(/speak clearly into your microphone/i)).toBeInTheDocument();
  });
});
