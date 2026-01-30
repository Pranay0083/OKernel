import { Process } from '../../../core/types';

export const fcfs = {
    name: "First Come First Serve",
    code: "FCFS",
    info: {
        description: "First Come First Serve (FCFS) executes processes in the exact order they arrive. It is the simplest scheduling algorithm but suffers from the Convoy Effect.",
        mathematics: "Average Waiting Time can be high if large processes arrive first.",
        implementation: "1. Maintain a FIFO Queue.\n2. Execute head of queue until completion.",
        code: `
function selectProcess(queue) {
  return queue[0];
}
        `
    },
    schedule: (queue: number[], processes: Process[]): number | null => {
        if (queue.length === 0) return null;
        return queue[0];
    },
    shouldPreempt: (current: Process, queue: number[], processes: Process[], quantum: number): boolean => false
};
