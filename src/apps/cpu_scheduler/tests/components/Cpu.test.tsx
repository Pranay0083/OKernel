import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Cpu } from '../../components/Cpu';
import { Process } from '../../../../core/types';

// Mock framer-motion to avoid animation issues in tests
// This is a common practice when testing components that use complex animations
// We just render the children directly
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Cpu Component', () => {
  it('renders IDLE state when no process is running', () => {
    render(<Cpu runningProcess={undefined} />);

    expect(screen.getByText('IDLE')).toBeInTheDocument();
    expect(screen.getByText('WAITING FOR INTERRUPT')).toBeInTheDocument();
  });

  it('renders process details when a process is running', () => {
    const mockProcess: Process = {
      id: 1,
      name: 'TestProcess',
      arrivalTime: 0,
      burstTime: 10,
      priority: 2,
      color: '#ff0000',
      state: 'RUNNING',
      remainingTime: 4,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
      startTime: 0,
    };

    render(<Cpu runningProcess={mockProcess} />);

    // Check for Process ID (rendered as 1000 + id)
    expect(screen.getByText('1001')).toBeInTheDocument();
    
    // Check for Process Name
    expect(screen.getByText('TestProcess')).toBeInTheDocument();
    
    // Check for Priority
    expect(screen.getByText('P2')).toBeInTheDocument();
    
    // Check for Stats
    // Burst Time
    expect(screen.getByText('10')).toBeInTheDocument();
    // Remaining Time
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Check for progress percentage text
    // (10 - 4) / 10 = 0.6 => 60%
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders high priority visual indicator correctly', () => {
     const highPriProcess: Process = {
      id: 2,
      name: 'HighPri',
      arrivalTime: 0,
      burstTime: 5,
      priority: 1, // Priority <= 2 triggers red/pulse
      color: '#00ff00',
      state: 'RUNNING',
      remainingTime: 2,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
      startTime: 0,
    };

    render(<Cpu runningProcess={highPriProcess} />);

    // Check for priority text class/style (red text for high priority)
    const priorityText = screen.getByText('P1');
    expect(priorityText).toHaveClass('text-red-500');
  });

   it('renders normal priority visual indicator correctly', () => {
     const normalPriProcess: Process = {
      id: 3,
      name: 'NormalPri',
      arrivalTime: 0,
      burstTime: 5,
      priority: 5, // Priority > 2 triggers blue
      color: '#00ff00',
      state: 'RUNNING',
      remainingTime: 2,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
      startTime: 0,
    };

    render(<Cpu runningProcess={normalPriProcess} />);

    // Check for priority text class/style (blue text for normal priority)
    const priorityText = screen.getByText('P5');
    expect(priorityText).toHaveClass('text-blue-500');
  });
});
