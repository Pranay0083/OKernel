import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReadyQueue } from '../../components/ReadyQueue';
import { Process } from '../../../../core/types';
import { ReactNode, CSSProperties } from 'react';

interface MotionDivProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

// Mock framer-motion
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

describe('ReadyQueue Component', () => {
  it('renders empty state when queue is empty', () => {
    render(<ReadyQueue queue={[]} processes={[]} />);

    expect(screen.getByText('NULL POINTER')).toBeInTheDocument();
    expect(screen.getByText('BUFFER IS EMPTY')).toBeInTheDocument();
  });

  it('renders processes in the queue correctly', () => {
    const mockProcesses: Process[] = [
      {
        id: 1,
        name: 'Proc1',
        arrivalTime: 0,
        burstTime: 10,
        priority: 1,
        color: '#ff0000',
        state: 'READY',
        remainingTime: 10,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        startTime: null,
      },
      {
        id: 2,
        name: 'Proc2',
        arrivalTime: 5,
        burstTime: 8,
        priority: 4,
        color: '#00ff00',
        state: 'READY',
        remainingTime: 8,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        startTime: null,
      },
    ];

    render(<ReadyQueue queue={[1, 2]} processes={mockProcesses} />);

    // Check if NULL POINTER is NOT present
    expect(screen.queryByText('NULL POINTER')).not.toBeInTheDocument();

    // Check process names
    expect(screen.getByText('Proc1')).toBeInTheDocument();
    expect(screen.getByText('Proc2')).toBeInTheDocument();

    // Check priorities
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('P4')).toBeInTheDocument();

    // Check Burst Times
    // Note: We use getAllByText because 'BT:' is static text, but the numbers might be what we want to verify.
    // The component renders: <div>BT: <span className="text-zinc-300">{process.burstTime}</span></div>
    // So "10" and "8" should be in the document.
    // "10" appears twice: once for burstTime, once for remainingTime.
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    // "8" also appears twice: once for burstTime, once for remainingTime.
    expect(screen.getAllByText('8').length).toBeGreaterThan(0);

    // Check Addresses (generated based on index)
    // Index 0: 1024 + 0*64 = 1024 (0x0400)
    expect(screen.getByText('0x0400')).toBeInTheDocument();
    // Index 1: 1024 + 1*64 = 1088 (0x0440)
    expect(screen.getByText('0x0440')).toBeInTheDocument();
  });

  it('renders nothing for invalid process IDs in queue', () => {
    const mockProcesses: Process[] = [
      {
        id: 1,
        name: 'Proc1',
        arrivalTime: 0,
        burstTime: 10,
        priority: 1,
        color: '#ff0000',
        state: 'READY',
        remainingTime: 10,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        startTime: null,
      }
    ];

    // Queue has ID 99 which doesn't exist in processes array
    render(<ReadyQueue queue={[99]} processes={mockProcesses} />);

    // Should assume it renders nothing (or handled gracefully as null)
    // In this case, if the map returns null, nothing is rendered for that item.
    // So we shouldn't see any process cards.
    expect(screen.queryByText('Proc1')).not.toBeInTheDocument();
    expect(screen.queryByText('P1')).not.toBeInTheDocument();
  });

  it('renders priority indicators correctly', () => {
    const mockProcesses: Process[] = [
      {
        id: 1,
        name: 'High',
        arrivalTime: 0,
        burstTime: 10,
        priority: 1, // Red
        color: '#ff0000',
        state: 'READY',
        remainingTime: 10,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        startTime: null,
      },
      {
        id: 2,
        name: 'Med',
        arrivalTime: 0,
        burstTime: 10,
        priority: 3, // Orange
        color: '#ff0000',
        state: 'READY',
        remainingTime: 10,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        startTime: null,
      },
      {
        id: 3,
        name: 'Low',
        arrivalTime: 0,
        burstTime: 10,
        priority: 5, // Blue
        color: '#ff0000',
        state: 'READY',
        remainingTime: 10,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        startTime: null,
      }
    ];

    const { container } = render(<ReadyQueue queue={[1, 2, 3]} processes={mockProcesses} />);

    // Finding indicators by class is brittle but sometimes necessary for visual checks
    // We can query selector for the specific colors
    const redIndicator = container.querySelector('.bg-red-500');
    const orangeIndicator = container.querySelector('.bg-orange-500');
    const blueIndicator = container.querySelector('.bg-blue-500');

    expect(redIndicator).toBeInTheDocument();
    expect(orangeIndicator).toBeInTheDocument();
    expect(blueIndicator).toBeInTheDocument();
  });
});
