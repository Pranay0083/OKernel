import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CPUSchedulerPage as Visualizer } from '../Page';
import { useScheduler } from '../../../hooks/useScheduler';
import { SimulationState } from '../../../core/types';
import { ReactNode } from 'react';

interface MockRunningProcess {
  name: string;
}

interface MockQueue {
  length: number;
}

interface MockProcessList {
  processes: unknown[];
  addProcess: (proc: { name: string; arrivalTime: number; burstTime: number; priority: number }) => void;
  onClear: () => void;
}

interface MockControls {
  state: { currentTime: number; isPlaying: boolean };
  setState: (fn: (s: { isPlaying: boolean }) => { isPlaying: boolean }) => void;
  onReset: () => void;
}

interface MockLayoutProps {
  children: ReactNode;
}

// Mock child components to isolate integration test to Visualizer + useScheduler interaction
// This avoids testing implementation details of child components again
vi.mock('../components/Cpu', () => ({
  Cpu: ({ runningProcess }: { runningProcess: MockRunningProcess | null }) => <div data-testid="cpu-mock">CPU: {runningProcess ? runningProcess.name : 'IDLE'}</div>
}));

vi.mock('../components/ReadyQueue', () => ({
  ReadyQueue: ({ queue }: { queue: MockQueue }) => <div data-testid="ready-queue-mock">Queue Length: {queue.length}</div>
}));

vi.mock('../components/ProcessList', () => ({
  ProcessList: ({ processes, addProcess, onClear }: MockProcessList) => (
    <div data-testid="process-list-mock">
      Process Count: {processes.length}
      <button onClick={() => addProcess({ name: 'NewProc', arrivalTime: 0, burstTime: 5, priority: 1 })}>
        Add Process
      </button>
      <button onClick={onClear}>Clear</button>
    </div>
  )
}));

vi.mock('../components/Controls', () => ({
  Controls: ({ state, setState, onReset }: MockControls) => (
    <div data-testid="controls-mock">
      Time: {state.currentTime}
      <button onClick={() => setState((s) => ({ ...s, isPlaying: !s.isPlaying }))}>
        {state.isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={onReset}>Reset</button>
    </div>
  )
}));

// Mock framer-motion's LayoutGroup and Layout
vi.mock('framer-motion', () => ({
  LayoutGroup: ({ children }: MockLayoutProps) => <div>{children}</div>
}));

vi.mock('../../../components/layout/Layout', () => ({
  Layout: ({ children }: MockLayoutProps) => <div>{children}</div>
}));

// Mock Loader to skip boot delay
vi.mock('../../../components/ui/Loader', async () => {
  const React = await import('react');
  return {
    Loader: ({ onComplete }: { onComplete: () => void }) => {
      React.useEffect(() => {
        onComplete();
      }, [onComplete]);
      return null;
    }
  };
});

// Mock useScheduler hook
vi.mock('../../../hooks/useScheduler');
const mockUseScheduler = vi.mocked(useScheduler);

describe('Visualizer Integration', () => {
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

  const mockAddProcess = vi.fn();
  const mockReset = vi.fn();
  const mockClear = vi.fn();
  const mockSetState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseScheduler.mockReturnValue({
      state: mockState,
      setState: mockSetState,
      addProcess: mockAddProcess,
      reset: mockReset,
      clear: mockClear,
    });
  });

  it('renders all major sub-components', () => {
    render(<Visualizer />);

    expect(screen.getByTestId('cpu-mock')).toBeInTheDocument();
    expect(screen.getByTestId('ready-queue-mock')).toBeInTheDocument();
    expect(screen.getByTestId('process-list-mock')).toBeInTheDocument();
    expect(screen.getByTestId('controls-mock')).toBeInTheDocument();
    expect(screen.getByText('Kernel Log')).toBeInTheDocument();
  });

  it('displays calculated averages correctly', () => {
    // Mock state with completed processes
    const completedState: SimulationState = {
      ...mockState,
      processes: [
        {
          id: 1, name: 'P1', state: 'COMPLETED',
          turnaroundTime: 10, waitingTime: 5,
          arrivalTime: 0, burstTime: 5, priority: 1, color: '#fff', remainingTime: 0, completionTime: 10, startTime: 0
        },
        {
          id: 2, name: 'P2', state: 'COMPLETED',
          turnaroundTime: 20, waitingTime: 10,
          arrivalTime: 0, burstTime: 10, priority: 1, color: '#fff', remainingTime: 0, completionTime: 20, startTime: 10
        }
      ]
    };

    mockUseScheduler.mockReturnValue({
      state: completedState,
      setState: mockSetState,
      addProcess: mockAddProcess,
      reset: mockReset,
      clear: mockClear,
    });

    render(<Visualizer />);

    // Avg TAT = (10 + 20) / 2 = 15.00
    expect(screen.getByText('15.00')).toBeInTheDocument();
    // Avg WT = (5 + 10) / 2 = 7.50
    expect(screen.getByText('7.50')).toBeInTheDocument();
  });

  it('passes running process to Cpu component', () => {
    const runningState: SimulationState = {
      ...mockState,
      runningProcessId: 1,
      processes: [
        {
          id: 1, name: 'RunningProc', state: 'RUNNING',
          turnaroundTime: 0, waitingTime: 0,
          arrivalTime: 0, burstTime: 5, priority: 1, color: '#fff', remainingTime: 5, completionTime: 0, startTime: 0
        }
      ]
    };

    mockUseScheduler.mockReturnValue({
      state: runningState,
      setState: mockSetState,
      addProcess: mockAddProcess,
      reset: mockReset,
      clear: mockClear,
    });

    render(<Visualizer />);
    expect(screen.getByText('CPU: RunningProc')).toBeInTheDocument();
  });

  it('passes correct queue length to ReadyQueue component', () => {
    const queueState: SimulationState = {
      ...mockState,
      readyQueue: [1, 2, 3]
    };

    mockUseScheduler.mockReturnValue({
      state: queueState,
      setState: mockSetState,
      addProcess: mockAddProcess,
      reset: mockReset,
      clear: mockClear,
    });

    render(<Visualizer />);
    expect(screen.getByText('Queue Length: 3')).toBeInTheDocument();
  });

  it('wires up action buttons from sub-components', () => {
    render(<Visualizer />);

    // Test Add Process
    fireEvent.click(screen.getByText('Add Process'));
    expect(mockAddProcess).toHaveBeenCalled();

    // Test Clear
    fireEvent.click(screen.getByText('Clear'));
    expect(mockClear).toHaveBeenCalled();

    // Test Reset
    fireEvent.click(screen.getByText('Reset'));
    expect(mockReset).toHaveBeenCalled();
  });
});
