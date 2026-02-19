import { Process } from '../../../core/types';

export const srtf = (readyQueue: number[], processes: Process[]): number | null => {
    if (readyQueue.length === 0) return null;

    // Build id -> process map (O(N))
    const processMap = new Map<number, Process>();
    for (const p of processes) {
        processMap.set(p.id, p);
    }

    let shortestProcessId = readyQueue[0];
    let minRemainingTime = processMap.get(shortestProcessId)?.remainingTime ?? Infinity;

    for (const pid of readyQueue) {
        const process = processMap.get(pid);
        if (process && process.remainingTime < minRemainingTime) {
            minRemainingTime = process.remainingTime;
            shortestProcessId = pid;
        }
    }

    return shortestProcessId;
};
