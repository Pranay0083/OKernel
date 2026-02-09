import { Process } from '../../../core/types';

export const round_robin = (readyQueue: number[], _processes: Process[]): number | null => {
    if (readyQueue.length === 0) return null;
    return readyQueue[0];
};

export const rr_should_preempt = (quantumRemaining: number): boolean => {
    return quantumRemaining <= 0;
};
