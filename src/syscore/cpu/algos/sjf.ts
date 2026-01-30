import { Process } from '../../../core/types';

export const sjf = {
    name: "Shortest Job First",
    code: "SJF",
    info: {
        description: "Shortest Job First (SJF) selects the waiting process with the smallest execution time. It requires knowing the burst time in advance.",
        mathematics: "Min(Waiting Time) is provably optimal for non-preemptive scheduling.",
        implementation: "1. Sort Ready Queue by Burst Time.\n2. Select process with min(Burst Time).\n3. Execute to completion (Non-Preemptive).",
        code: `
function selectProcess(queue, processes) {
  // Sort by Burst Time
  return queue.sort((a,b) => 
    processes[a].burst - processes[b].burst
  )[0];
}
        `
    },
    schedule: (queue: number[], processes: Process[]): number | null => {
        if (queue.length === 0) return null;

        // Map IDs to processes and filter out undefined
        const candidates = queue
            .map(id => processes.find(p => p.id === id))
            .filter((p): p is Process => p !== undefined);

        if (candidates.length === 0) return null;

        // Sort by Remaining Time (Approximation for SJF/SRTF in this engine)
        // Usually SJF uses initial Burst Time, but standard practice in sim is often Remaining.
        // Let's stick to Remaining Time to support SRTF behavior naturally if preempted,
        // or just Burst Time if strictly non-preemptive. 
        // For this visualizer, 'SJF' in the UI usually implies 'SRTF' if preemption is enabled, 
        // but let's strictly sort by Remaining Time as per original code.
        candidates.sort((a, b) => {
            if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
            return a.arrivalTime - b.arrivalTime;
        });

        return candidates[0].id;
    },
    shouldPreempt: (current: Process, queue: number[], processes: Process[], quantum: number): boolean => false // SJF is typically non-preemptive unless it's SRTF
};
