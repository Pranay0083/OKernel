import { Process } from '../../../core/types';

export const fcfs = (readyQueue: number[], _processes: Process[]): number | null => {
    if (readyQueue.length === 0) return null;
    return readyQueue[0];
};
