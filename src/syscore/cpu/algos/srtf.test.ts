import { describe, it, expect } from 'vitest';
import { srtf } from './srtf';
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

describe('SRTF Algorithm', () => {

    describe('schedule()', () => {

        it('should select the process with shortest remaining time', () => {
            const processes = [
                createProcess(1, 0, 10, 7),
                createProcess(2, 1, 5, 3),   // Shortest remaining
                createProcess(3, 2, 8, 5),
            ];
            const queue = [1, 2, 3];

            const result = srtf.schedule(queue, processes);

            expect(result).toBe(2);
        });

        it('should tie-break by arrival time', () => {
            const processes = [
                createProcess(1, 5, 4, 2),   // Later arrival
                createProcess(2, 1, 4, 2),   // Earlier arrival - wins
                createProcess(3, 3, 4, 2),
            ];
            const queue = [1, 2, 3];

            const result = srtf.schedule(queue, processes);

            expect(result).toBe(2);
        });

        it('should return null for empty queue', () => {
            const processes = [createProcess(1, 0, 5)];

            const result = srtf.schedule([], processes);

            expect(result).toBeNull();
        });

    });

    describe('shouldPreempt()', () => {

        it('should preempt when a shorter job is in queue', () => {
            const currentProcess = createProcess(1, 0, 10, 5);
            const processes = [
                currentProcess,
                createProcess(2, 2, 3, 3), // Shorter remaining time
            ];
            const queue = [2];

            const result = srtf.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(true);
        });

        it('should NOT preempt when current has shortest remaining time', () => {
            const currentProcess = createProcess(1, 0, 5, 2);
            const processes = [
                currentProcess,
                createProcess(2, 1, 8, 6), // Longer remaining
                createProcess(3, 2, 10, 8),
            ];
            const queue = [2, 3];

            const result = srtf.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(false);
        });

        it('should NOT preempt when remaining times are equal', () => {
            const currentProcess = createProcess(1, 0, 5, 3);
            const processes = [
                currentProcess,
                createProcess(2, 1, 5, 3), // Equal remaining time
            ];
            const queue = [2];

            const result = srtf.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(false);
        });

        it('should NOT preempt with empty queue', () => {
            const currentProcess = createProcess(1, 0, 5, 3);

            const result = srtf.shouldPreempt(currentProcess, [], [], 0);

            expect(result).toBe(false);
        });

        it('should handle queue with missing process IDs', () => {
            const currentProcess = createProcess(1, 0, 5, 3);
            const processes = [currentProcess];
            const queue = [99]; // Doesn't exist

            const result = srtf.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(false);
        });

    });

    describe('metadata', () => {

        it('should have correct name and code', () => {
            expect(srtf.name).toBe('Shortest Remaining Time First');
            expect(srtf.code).toBe('SRTF');
        });

        it('should describe preemptive behavior in info', () => {
            expect(srtf.info.description).toContain('Preemptive');
        });

    });

});
