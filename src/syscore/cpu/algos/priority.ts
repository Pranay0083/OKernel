import { Process } from '../../../core/types';

export const priority = (readyQueue: number[], processes: Process[]): number | null => {
    if (readyQueue.length === 0) return null;

    let highestPriorityId = readyQueue[0];
    // Lower number means higher priority
    let bestPriority = processes.find(p => p.id === readyQueue[0])?.priority || Infinity;

    for (const pid of readyQueue) {
        const process = processes.find(p => p.id === pid);
        if (process && process.priority < bestPriority) {
            bestPriority = process.priority;
            highestPriorityId = pid;
        }
    }

    return highestPriorityId;
};
