import { Process } from '../../../core/types';

export const sjf = (readyQueue: number[], processes: Process[]): number | null => {
    if (readyQueue.length === 0) return null;

    // Find process with minimum burst time
    let shortestProcessId = readyQueue[0];
    let minBurstTime = processes.find(p => p.id === readyQueue[0])?.burstTime || Infinity;

    for (const pid of readyQueue) {
        const process = processes.find(p => p.id === pid);
        if (process && process.burstTime < minBurstTime) {
            minBurstTime = process.burstTime;
            shortestProcessId = pid;
        }
    }

    return shortestProcessId;
};
