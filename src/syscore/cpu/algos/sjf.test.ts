import { describe, it, expect } from 'vitest';
import { sjf } from './sjf';
import { Process } from '../../../core/types';

const createProcess = (id: number, arrivalTime: number, burstTime: number, remainingTime?: number): Process => ({
    id,
    name: `P${id}`,
    color: '#000',
    arrivalTime,
    burstTime,
    remainingTime: remainingTime ?? burstTime,
    startTime: null,
    completionTime: null,
    turnaroundTime: 0,
    waitingTime: 0,
    state: 'READY',
    priority: 0,
});

describe('SJF Algorithm', () => {

    describe('schedule()', () => {

        it('should select the process with shortest remaining time', () => {
            const processes = [
                createProcess(1, 0, 10, 5),
                createProcess(2, 1, 3, 2),  // Shortest remaining
                createProcess(3, 2, 8, 4),
            ];
            const queue = [1, 2, 3];

            const result = sjf.schedule(queue, processes);

            expect(result).toBe(2);
        });

        it('should tie-break by arrival time when remaining time is equal', () => {
            const processes = [
                createProcess(1, 2, 5, 3),  // Later arrival
                createProcess(2, 0, 5, 3),  // Earlier arrival - should win
                createProcess(3, 1, 5, 3),
            ];
            const queue = [1, 2, 3];

            const result = sjf.schedule(queue, processes);

            expect(result).toBe(2);
        });

        it('should return null for an empty queue', () => {
            const processes = [createProcess(1, 0, 5)];
            const queue: number[] = [];

            const result = sjf.schedule(queue, processes);

            expect(result).toBeNull();
        });

        it('should handle queue with IDs not in processes array', () => {
            const processes = [createProcess(1, 0, 5)];
            const queue = [1, 99, 100]; // 99 and 100 don't exist

            const result = sjf.schedule(queue, processes);

            expect(result).toBe(1);
        });

        it('should return null if all queue IDs are missing from processes', () => {
            const processes = [createProcess(1, 0, 5)];
            const queue = [99, 100]; // Neither exists

            const result = sjf.schedule(queue, processes);

            expect(result).toBeNull();
        });

        it('should work with a single process', () => {
            const processes = [createProcess(1, 0, 5)];
            const queue = [1];

            const result = sjf.schedule(queue, processes);

            expect(result).toBe(1);
        });

    });

    describe('shouldPreempt()', () => {

        it('should never preempt (non-preemptive SJF)', () => {
            const currentProcess = createProcess(1, 0, 10, 8);
            const processes = [
                currentProcess,
                createProcess(2, 1, 2, 2), // Much shorter job
            ];
            const queue = [2];

            const result = sjf.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(false);
        });

    });

    describe('metadata', () => {

        it('should have correct name and code', () => {
            expect(sjf.name).toBe('Shortest Job First');
            expect(sjf.code).toBe('SJF');
        });

    });

});
