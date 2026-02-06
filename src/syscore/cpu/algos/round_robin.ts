import { Process } from '../../../core/types';

export const roundRobin = {
  name: "Round Robin",
  code: "RR",
  info: {
    description: "Round Robin (RR) is a preemptive scheduling algorithm where each process is assigned a fixed time slice (quantum) in cyclic order. It is designed for time-sharing systems.",
    mathematics: "Turnaround Time = Completion Time - Arrival Time\nWaiting Time = Turnaround Time - Burst Time",
    implementation: "1. Maintain a FIFO Ready Queue.\n2. Execute process for Time Quantum.\n3. If unfinished, move to back of queue.\n4. If finished, remove from system.",
    code: `
function selectProcess(queue) {
  // Simple FIFO Selection
  return queue[0];
}

function shouldPreempt(quantumRemaining) {
  return quantumRemaining <= 0;
}
        `
  },
  // Standard Selection Logic
  schedule: (queue: number[], _processes: Process[]): number | null => {
    if (queue.length === 0) return null;
    return queue[0];
  },
  // Preemption Logic specific to RR
  shouldPreempt: (_current: Process, _queue: number[], _processes: Process[], quantumRemaining: number): boolean => {
    // Changed to < 0 to allow the 0-th tick (last tick) to execute
    return quantumRemaining < 0;
  }
};
