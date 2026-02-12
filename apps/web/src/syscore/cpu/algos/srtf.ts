import { Process } from '../../../core/types';

export const srtf = (readyQueue: number[], processes: Process[]): number | null => {
    if (readyQueue.length === 0) return null;

    let shortestProcessId = readyQueue[0];
    let minRemainingTime = processes.find(p => p.id === readyQueue[0])?.remainingTime || Infinity;

    for (const pid of readyQueue) {
        const process = processes.find(p => p.id === pid);
        if (process && process.remainingTime < minRemainingTime) {
            minRemainingTime = process.remainingTime;
            shortestProcessId = pid;
        }
    }

    return shortestProcessId;
};
