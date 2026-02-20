import { Process } from '../../../core/types';

export const priority = (readyQueue: number[], processes: Process[]): number | null => {
    if (readyQueue.length === 0) return null;

    // Optimize: Create a map for O(1) lookup
    // We only set the value if the key doesn't exist to match Array.find behavior (returns first match)
    const processMap = new Map<number, Process>();
    for (const p of processes) {
        if (!processMap.has(p.id)) {
            processMap.set(p.id, p);
        }
    }

    const validQueue = readyQueue.filter(pid => processMap.has(pid));
    if(validQueue.length === 0) return null;

    let highestPriorityId = validQueue[0];
    // Lower number means higher priority
    let bestPriority = processMap.get(highestPriorityId)!.priority;

    for (const pid of validQueue) {
        const process = processMap.get(pid)!;
        if (process.priority < bestPriority) {
            bestPriority = process.priority;
            highestPriorityId = pid;
        }
    }

    return highestPriorityId;
};
