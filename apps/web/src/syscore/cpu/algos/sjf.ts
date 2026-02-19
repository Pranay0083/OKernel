import { Process } from '../../../core/types';

export const sjf = (readyQueue: number[], processes: Process[]): number | null => {
    if (readyQueue.length === 0) return null;

    const processMap = new Map<number, Process>();
    for(const p of processes) {
        processMap.set(p.id, p);
    }

    // Find process with minimum burst time
    let shortestProcessId = readyQueue[0];
    let minBurstTime = processMap.get(shortestProcessId)?.burstTime ?? Infinity;

    for (const pid of readyQueue) {
        const process = processMap.get(pid);
        if (process && process.burstTime < minBurstTime) {
            minBurstTime = process.burstTime;
            shortestProcessId = pid;
        }
    }

    return shortestProcessId;
};
