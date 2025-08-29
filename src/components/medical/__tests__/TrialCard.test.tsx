import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TrialCard from '../TrialCard';

// Mock data for testing
const mockTrial = {
  id: 'trial-001',
  title: 'Novel PD-L1 Inhibitor for Non-Small Cell Lung Cancer',
  description: 'Testing a new immunotherapy treatment for advanced lung cancer patients',
  phase: 'Phase 2',
  status: 'Recruiting',
  location: 'Boston, MA',
  startDate: '2024-01-15',
  endDate: '2024-12-31',
  eligibility: ['Age 18+', 'Advanced NSCLC diagnosis', 'No prior immunotherapy'],
  conditions: ['lung cancer', 'NSCLC', 'metastatic'],
  requirements: ['Age 18+', 'Advanced cancer diagnosis', 'Genetic testing available'],
  matchScore: 85,
  sponsor: 'Massachusetts General Hospital',
  compensation: '$500 per visit',
  visits: 12,
  duration: '6 months'
};

describe('TrialCard Component', () => {
  it('renders trial information correctly', () => {
    render(<TrialCard trial={mockTrial} onSelect={() => {}} />);
    
    expect(screen.getByText(mockTrial.title)).toBeInTheDocument();
    expect(screen.getByText(mockTrial.description)).toBeInTheDocument();
    expect(screen.getByText(mockTrial.phase)).toBeInTheDocument();
    expect(screen.getByText(mockTrial.status)).toBeInTheDocument();
    expect(screen.getByText(mockTrial.location)).toBeInTheDocument();
    expect(screen.getByText(mockTrial.sponsor)).toBeInTheDocument();
  });

  it('displays match score with appropriate styling', () => {
    render(<TrialCard trial={mockTrial} onSelect={() => {}} />);
    
    const scoreElement = screen.getByText('85%');
    expect(scoreElement).toBeInTheDocument();
    
    // Check if score has appropriate styling based on value
    if (mockTrial.matchScore >= 80) {
      expect(scoreElement).toHaveClass('text-green-600');
    }
  });

  it('shows eligibility criteria when expanded', () => {
    render(<TrialCard trial={mockTrial} onSelect={() => {}} />);
    
    // Initially eligibility should not be visible
    mockTrial.eligibility.forEach(criteria => {
      expect(screen.queryByText(criteria)).not.toBeInTheDocument();
    });
    
    // Click to expand
    const expandButton = screen.getByRole('button', { name: /expand/i });
    fireEvent.click(expandButton);
    
    // Now eligibility should be visible
    mockTrial.eligibility.forEach(criteria => {
      expect(screen.getByText(criteria)).toBeInTheDocument();
    });
  });

  it('calls onSelect when trial is selected', () => {
    const mockOnSelect = vi.fn();
    render(<TrialCard trial={mockTrial} onSelect={mockOnSelect} />);
    
    const selectButton = screen.getByRole('button', { name: /select trial/i });
    fireEvent.click(selectButton);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockTrial.id);
  });

  it('displays compensation information correctly', () => {
    render(<TrialCard trial={mockTrial} onSelect={() => {}} />);
    
    expect(screen.getByText(mockTrial.compensation)).toBeInTheDocument();
    expect(screen.getByText(`${mockTrial.visits} visits`)).toBeInTheDocument();
    expect(screen.getByText(mockTrial.duration)).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<TrialCard trial={mockTrial} onSelect={() => {}} />);
    
    // Check if dates are formatted as expected
    const startDate = new Date(mockTrial.startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const endDate = new Date(mockTrial.endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    expect(screen.getByText(startDate)).toBeInTheDocument();
    expect(screen.getByText(endDate)).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const trialWithMissingFields = {
      ...mockTrial,
      compensation: undefined,
      visits: undefined,
      duration: undefined
    };
    
    render(<TrialCard trial={trialWithMissingFields} onSelect={() => {}} />);
    
    // Component should still render without crashing
    expect(screen.getByText(mockTrial.title)).toBeInTheDocument();
    expect(screen.getByText('Compensation: Not specified')).toBeInTheDocument();
  });

  it('applies correct status styling', () => {
    render(<TrialCard trial={mockTrial} onSelect={() => {}} />);
    
    const statusElement = screen.getByText(mockTrial.status);
    expect(statusElement).toBeInTheDocument();
    
    // Status should have appropriate styling
    if (mockTrial.status === 'Recruiting') {
      expect(statusElement).toHaveClass('bg-green-100', 'text-green-800');
    }
  });

  it('displays trial phase with correct badge styling', () => {
    render(<TrialCard trial={mockTrial} onSelect={() => {}} />);
    
    const phaseElement = screen.getByText(mockTrial.phase);
    expect(phaseElement).toBeInTheDocument();
    expect(phaseElement).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('shows location information prominently', () => {
    render(<TrialCard trial={mockTrial} onSelect={() => {}} />);
    
    const locationElement = screen.getByText(mockTrial.location);
    expect(locationElement).toBeInTheDocument();
    expect(locationElement).toHaveClass('text-gray-600');
  });

  it('handles long trial titles gracefully', () => {
    const trialWithLongTitle = {
      ...mockTrial,
      title: 'This is a very long trial title that should be handled properly by the component without breaking the layout or causing overflow issues'
    };
    
    render(<TrialCard trial={trialWithLongTitle} onSelect={() => {}} />);
    
    expect(screen.getByText(trialWithLongTitle.title)).toBeInTheDocument();
    // Component should handle long titles without layout issues
  });
});
