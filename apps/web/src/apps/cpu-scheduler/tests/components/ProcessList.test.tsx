import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProcessList } from '../../components/ProcessList';
import { Process } from '../../../../core/types';

describe('ProcessList Component', () => {
  const mockAddProcess = vi.fn();
  const mockOnClear = vi.fn();

  it('renders correctly with no processes', () => {
    render(
      <ProcessList
        processes={[]}
        addProcess={mockAddProcess}
        onClear={mockOnClear}
        currentTime={0}
      />
    );

    // Check Header
    expect(screen.getByText('PROCESS_TABLE')).toBeInTheDocument();
    // Check Flush Button
    expect(screen.getByText('[ FLUSH ]')).toBeInTheDocument();
    // Check Empty State
    expect(screen.getByText('// table_empty')).toBeInTheDocument();
    // Check Inputs
    expect(screen.getByPlaceholderText('NAME')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('AT')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('BT')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('PRI')).toBeInTheDocument();
    // Check Add Button
    expect(screen.getByText('ADD +')).toBeInTheDocument();
  });

  it('renders list of processes correctly', () => {
    const mockProcesses: Process[] = [
      {
        id: 1,
        name: 'P1',
        arrivalTime: 0,
        burstTime: 5,
        priority: 1,
        color: '#ff0000',
        state: 'READY',
        remainingTime: 5,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        startTime: null,
        queueLevel: 0,
        coreId: null,
      },
      {
        id: 2,
        name: 'P2',
        arrivalTime: 2,
        burstTime: 3,
        priority: 2,
        color: '#00ff00',
        state: 'RUNNING',
        remainingTime: 2,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        startTime: null,
        queueLevel: 0,
        coreId: null,
      },
    ];

    render(
      <ProcessList
        processes={mockProcesses}
        addProcess={mockAddProcess}
        onClear={mockOnClear}
        currentTime={5}
      />
    );

    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
    // Status is truncated to 4 chars
    // READY -> READ
    expect(screen.getByText('READ')).toBeInTheDocument();
    // RUNNING -> RUNN
    expect(screen.getByText('RUNN')).toBeInTheDocument();
  });

  it('calls onClear when flush button is clicked', () => {
    render(
      <ProcessList
        processes={[]}
        addProcess={mockAddProcess}
        onClear={mockOnClear}
        currentTime={0}
      />
    );

    fireEvent.click(screen.getByText('[ FLUSH ]'));
    expect(mockOnClear).toHaveBeenCalled();
  });

  it('submits form to add a new process', () => {
    render(
      <ProcessList
        processes={[]}
        addProcess={mockAddProcess}
        onClear={mockOnClear}
        currentTime={0}
      />
    );

    const nameInput = screen.getByPlaceholderText('NAME');
    const atInput = screen.getByPlaceholderText('AT');
    const btInput = screen.getByPlaceholderText('BT');
    const priInput = screen.getByPlaceholderText('PRI');
    const addButton = screen.getByText('ADD +');

    fireEvent.change(nameInput, { target: { value: 'NewProc' } });
    fireEvent.change(atInput, { target: { value: '2' } });
    fireEvent.change(btInput, { target: { value: '8' } });
    fireEvent.change(priInput, { target: { value: '1' } });

    fireEvent.click(addButton);

    expect(mockAddProcess).toHaveBeenCalledWith({
      name: 'NewProc',
      arrivalTime: 2,
      burstTime: 8,
      priority: 1,
    });
  });

  it('uses defaults when submitting empty form', () => {
    render(
      <ProcessList
        processes={[]}
        addProcess={mockAddProcess}
        onClear={mockOnClear}
        currentTime={0}
      />
    );

    // Assuming we just click add with default (or empty) inputs
    // The component sets some defaults in useState
    // const [newProcess, setNewProcess] = useState({ name: '', arrivalTime: 0, burstTime: 1, priority: 1 });
    fireEvent.click(screen.getByText('ADD +'));

    expect(mockAddProcess).toHaveBeenCalledWith({
      name: 'P1', // Default name is P{length+1}
      arrivalTime: 0,
      burstTime: 1,
      priority: 1,
    });
  });
});
