import { describe, it, expect } from 'vitest';
import { roundRobin } from './round_robin';
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

describe('Round Robin Algorithm', () => {

    describe('schedule()', () => {

        it('should select the first process from the queue (FIFO)', () => {
            const processes = [
                createProcess(1, 0, 5),
                createProcess(2, 1, 3),
                createProcess(3, 2, 4),
            ];
            const queue = [3, 1, 2]; // 3 is first in queue

            const result = roundRobin.schedule(queue, processes);

            expect(result).toBe(3);
        });

        it('should return null for empty queue', () => {
            const processes = [createProcess(1, 0, 5)];

            const result = roundRobin.schedule([], processes);

            expect(result).toBeNull();
        });

        it('should work with single process', () => {
            const processes = [createProcess(1, 0, 5)];
            const queue = [1];

            const result = roundRobin.schedule(queue, processes);

            expect(result).toBe(1);
        });

    });

    describe('shouldPreempt()', () => {

        it('should preempt when quantum < 0', () => {
            const currentProcess = createProcess(1, 0, 5, 3);
            const queue = [2];
            const processes = [currentProcess, createProcess(2, 1, 3)];

            const result = roundRobin.shouldPreempt(currentProcess, queue, processes, -1);

            expect(result).toBe(true);
        });

        it('should NOT preempt when quantum = 0 (last tick allowed)', () => {
            const currentProcess = createProcess(1, 0, 5, 3);
            const queue = [2];
            const processes = [currentProcess, createProcess(2, 1, 3)];

            const result = roundRobin.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(false);
        });

        it('should NOT preempt when quantum > 0', () => {
            const currentProcess = createProcess(1, 0, 5, 3);
            const queue = [2];
            const processes = [currentProcess, createProcess(2, 1, 3)];

            const result = roundRobin.shouldPreempt(currentProcess, queue, processes, 2);

            expect(result).toBe(false);
        });

        it('should preempt even with empty queue when quantum < 0', () => {
            const currentProcess = createProcess(1, 0, 5, 3);

            const result = roundRobin.shouldPreempt(currentProcess, [], [], -1);

            expect(result).toBe(true);
        });

    });

    describe('metadata', () => {

        it('should have correct name and code', () => {
            expect(roundRobin.name).toBe('Round Robin');
            expect(roundRobin.code).toBe('RR');
        });

        it('should describe time-sharing in info', () => {
            expect(roundRobin.info.description).toContain('time-sharing');
        });

        it('should have quantum-related implementation info', () => {
            expect(roundRobin.info.implementation).toContain('Time Quantum');
        });

    });

});
