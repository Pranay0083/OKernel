import { Process } from '../../../core/types';

export const priority_preemptive = (readyQueue: number[], processes: Process[]): number | null => {
    if (readyQueue.length === 0) return null;

    const processMap = new Map<number, Process>();
    for (const p of processes) {
        if (!processMap.has(p.id)) {
            processMap.set(p.id, p);
        }
    }

    const validQueue = readyQueue.filter(pid => processMap.has(pid));
    if (validQueue.length === 0) return null;

    let highestPriorityId = validQueue[0];
    // Use effectivePriority (lower number = higher priority)
    let bestPriority = processMap.get(highestPriorityId)!.effectivePriority;

    for (const pid of validQueue) {
        const process = processMap.get(pid)!;
        if (process.effectivePriority < bestPriority) {
            bestPriority = process.effectivePriority;
            highestPriorityId = pid;
        }
    }

    return highestPriorityId;
};

export const priority_p_should_preempt = (
    runningProc: Process,
    readyQueue: number[],
    processes: Process[],
    indexMap: Map<number, number>
): boolean => {
    for (const id of readyQueue) {
        const idx = indexMap.get(id);
        if (idx !== undefined) {
            const candidate = processes[idx];
            if (candidate.effectivePriority < runningProc.effectivePriority) {
                return true;
            }
        }
    }
    return false;
};
