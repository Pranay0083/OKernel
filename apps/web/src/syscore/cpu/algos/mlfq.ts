import { Process } from '../../../core/types';

/**
 * MLFQ Selection: Pick the first process from the highest-priority non-empty queue.
 * Returns the process ID and its queue level, or null if all queues are empty.
 */
export const mlfq_select = (
    mlfqQueues: number[][],
    _processes: Process[]
): { processId: number; queueLevel: number } | null => {
    for (let level = 0; level < mlfqQueues.length; level++) {
        if (mlfqQueues[level].length > 0) {
            return {
                processId: mlfqQueues[level][0],
                queueLevel: level,
            };
        }
    }
    return null;
};

/**
 * Check if a running process has exhausted its time quantum.
 */
export const mlfq_should_preempt = (quantumRemaining: number): boolean => {
    return quantumRemaining <= 0;
};

/**
 * Check if a higher-priority queue has a process that should preempt the current one.
 */
export const mlfq_higher_queue_preempt = (
    mlfqQueues: number[][],
    currentLevel: number
): boolean => {
    for (let level = 0; level < currentLevel; level++) {
        if (mlfqQueues[level].length > 0) {
            return true;
        }
    }
    return false;
};