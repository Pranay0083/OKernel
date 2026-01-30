import { Process } from '../../../core/types';

export const srtf = {
    name: "Shortest Remaining Time First",
    code: "SRTF",
    info: {
        description: "Preemptive version of SJF. If a new process arrives with a shorter remaining time than the current running process, it preempts it.",
        mathematics: "Optimal for minimizing average Waiting Time in dynamic systems.",
        implementation: "1. Always select process with min(Remaining Time).\n2. Update choice on every Arrival.",
        code: `
function shouldPreempt(current, candidates) {
  return candidates.some(c => 
    c.remaining < current.remaining
  );
}
        `
    },
    schedule: (queue: number[], processes: Process[]): number | null => {
        if (queue.length === 0) return null;

        const candidates = queue
            .map(id => processes.find(p => p.id === id))
            .filter((p): p is Process => p !== undefined);

        if (candidates.length === 0) return null;

        candidates.sort((a, b) => {
            if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
            return a.arrivalTime - b.arrivalTime;
        });

        return candidates[0].id;
    },
    shouldPreempt: (currentProcess: Process, queue: number[], processes: Process[], quantum: number): boolean => {
        // SRTF Preemption: Check if anyone in queue is strictly faster than current
        const candidates = queue
            .map(id => processes.find(p => p.id === id))
            .filter((p): p is Process => p !== undefined);

        return candidates.some(c => c.remainingTime < currentProcess.remainingTime);
    }
};
