import { describe, it, expect } from 'vitest';
import { fcfs } from './fcfs';
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

describe('FCFS Algorithm', () => {

    describe('schedule()', () => {

        it('should select the first process from the queue', () => {
            const processes = [
                createProcess(1, 0, 5),
                createProcess(2, 1, 3),
                createProcess(3, 2, 4),
            ];
            const queue = [1, 2, 3];

            const result = fcfs.schedule(queue, processes);

            expect(result).toBe(1);
        });

        it('should return the first ID regardless of process order in array', () => {
            const processes = [
                createProcess(3, 2, 4),
                createProcess(1, 0, 5),
                createProcess(2, 1, 3),
            ];
            const queue = [2, 3, 1];

            const result = fcfs.schedule(queue, processes);

            expect(result).toBe(2);
        });

        it('should return null for an empty queue', () => {
            const processes = [createProcess(1, 0, 5)];
            const queue: number[] = [];

            const result = fcfs.schedule(queue, processes);

            expect(result).toBeNull();
        });

        it('should work with a single process in queue', () => {
            const processes = [createProcess(5, 0, 10)];
            const queue = [5];

            const result = fcfs.schedule(queue, processes);

            expect(result).toBe(5);
        });

    });

    describe('shouldPreempt()', () => {

        it('should never preempt (always returns false)', () => {
            const currentProcess = createProcess(1, 0, 5);
            const processes = [
                currentProcess,
                createProcess(2, 1, 2), // Shorter job in queue
            ];
            const queue = [2];

            const result = fcfs.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(false);
        });

        it('should return false even with empty queue', () => {
            const currentProcess = createProcess(1, 0, 5);

            const result = fcfs.shouldPreempt(currentProcess, [], [], 0);

            expect(result).toBe(false);
        });

    });

    describe('metadata', () => {

        it('should have correct name and code', () => {
            expect(fcfs.name).toBe('First Come First Serve');
            expect(fcfs.code).toBe('FCFS');
        });

        it('should have info object with required fields', () => {
            expect(fcfs.info).toBeDefined();
            expect(fcfs.info.description).toContain('FCFS');
            expect(fcfs.info.mathematics).toBeDefined();
            expect(fcfs.info.implementation).toBeDefined();
            expect(fcfs.info.code).toBeDefined();
        });

    });

});
