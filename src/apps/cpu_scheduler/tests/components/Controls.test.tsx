import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Controls } from '../../components/Controls';
import { SimulationState } from '../../../../core/types';

describe('Controls Component', () => {
  const mockState: SimulationState = {
    currentTime: 0,
    processes: [],
    readyQueue: [],
    runningProcessId: null,
    completedProcessIds: [],
    ganttChart: [],
    algorithm: 'FCFS',
    timeQuantum: 2,
    quantumRemaining: 0,
    isPlaying: false,
    speed: 1000,
  };

  const mockSetState = vi.fn();
  const mockOnReset = vi.fn();

  it('renders correctly in initial state', () => {
    render(<Controls state={mockState} setState={mockSetState} onReset={mockOnReset} />);

    // Check Play button (EXEC)
    expect(screen.getByText('[ EXEC ]')).toBeInTheDocument();
    
    // Check Reset button (title attribute)
    expect(screen.getByTitle('Reset Simulation')).toBeInTheDocument();
    
    // Check Algorithm Selector
    expect(screen.getByText('ALGO:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('First Come First Serve')).toBeInTheDocument();
    
    // Check Time Display
    expect(screen.getByText('T=')).toBeInTheDocument();
    expect(screen.getByText('0ms')).toBeInTheDocument();
  });

  it('toggles playback state when play button is clicked', () => {
    render(<Controls state={mockState} setState={mockSetState} onReset={mockOnReset} />);

    const playButton = screen.getByText('[ EXEC ]').closest('button');
    if (!playButton) throw new Error("Play button not found");
    
    fireEvent.click(playButton);

    expect(mockSetState).toHaveBeenCalledTimes(1);
    // We can't easily test the functional update s => ... without more complex mocking,
    // but knowing setState is called is a good start. 
    // Usually we would test the callback logic if we extracted it, or use a real useState wrapper.
  });

  it('renders PAUSE when playing', () => {
      const playingState = { ...mockState, isPlaying: true };
      render(<Controls state={playingState} setState={mockSetState} onReset={mockOnReset} />);
      
      expect(screen.getByText('[ PAUSE ]')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    render(<Controls state={mockState} setState={mockSetState} onReset={mockOnReset} />);

    const resetButton = screen.getByTitle('Reset Simulation');
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('changes algorithm when selected', () => {
    render(<Controls state={mockState} setState={mockSetState} onReset={mockOnReset} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'SJF' } });

    expect(mockSetState).toHaveBeenCalled();
  });

  it('shows time quantum input only when RR is selected', () => {
    const rrState = { ...mockState, algorithm: 'RR' as const };
    render(<Controls state={rrState} setState={mockSetState} onReset={mockOnReset} />);

    expect(screen.getByText('Q_TIME:')).toBeInTheDocument();
    
    // Check input value
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });
  
  it('does not show time quantum input when non-RR algorithm is selected', () => {
      render(<Controls state={mockState} setState={mockSetState} onReset={mockOnReset} />);
      expect(screen.queryByText('Q_TIME:')).not.toBeInTheDocument();
  });

  it('updates speed when slider is moved', () => {
      render(<Controls state={mockState} setState={mockSetState} onReset={mockOnReset} />);
      
      const slider = screen.getByRole('slider'); // type="range" maps to slider role
      fireEvent.change(slider, { target: { value: '1500' } });
      
      expect(mockSetState).toHaveBeenCalled();
  });
});
