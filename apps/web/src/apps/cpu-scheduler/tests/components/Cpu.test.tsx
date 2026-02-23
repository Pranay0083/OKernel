import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Cpu } from '../../components/Cpu';
import { Process } from '../../../../core/types';
import { ReactNode, CSSProperties } from 'react';

interface MotionDivProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, className, style, layoutId, initial, animate, exit, transition, ...props }: MotionDivProps) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('Cpu Component', () => {
  it('renders IDLE state when no process is running', () => {
    render(<Cpu runningProcesses={[undefined]} />);
    expect(screen.getByText('IDLE')).toBeInTheDocument();
    expect(screen.getByText('WAITING FOR INTERRUPT')).toBeInTheDocument();
  });

  it('renders process details when a process is running', () => {
    const mockProcess: Process = {
      id: 1, name: 'TestProcess', arrivalTime: 0, burstTime: 10, priority: 2, effectivePriority: 2,
      color: '#ff0000', state: 'RUNNING', remainingTime: 4, completionTime: 0,
      turnaroundTime: 0, waitingTime: 0, startTime: 0, queueLevel: 0, coreId: 0,
    };

    render(<Cpu runningProcesses={[mockProcess]} />);
    expect(screen.getByText('1001')).toBeInTheDocument();
    expect(screen.getByText('TestProcess')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders high priority visual indicator correctly', () => {
    const highPriProcess: Process = {
      id: 2, name: 'HighPri', arrivalTime: 0, burstTime: 5, priority: 1, effectivePriority: 1,
      color: '#00ff00', state: 'RUNNING', remainingTime: 2, completionTime: 0,
      turnaroundTime: 0, waitingTime: 0, startTime: 0, queueLevel: 0, coreId: 0,
    };

    render(<Cpu runningProcesses={[highPriProcess]} />);
    const priorityText = screen.getByText('P1');
    expect(priorityText).toHaveClass('text-red-500');
  });

  it('renders normal priority visual indicator correctly', () => {
    const normalPriProcess: Process = {
      id: 3, name: 'NormalPri', arrivalTime: 0, burstTime: 5, priority: 5, effectivePriority: 5,
      color: '#00ff00', state: 'RUNNING', remainingTime: 2, completionTime: 0,
      turnaroundTime: 0, waitingTime: 0, startTime: 0, queueLevel: 0, coreId: 0,
    };

    render(<Cpu runningProcesses={[normalPriProcess]} />);
    const priorityText = screen.getByText('P5');
    expect(priorityText).toHaveClass('text-blue-500');
  });
});
