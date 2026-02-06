import { describe, it, expect } from 'vitest';
import { priority } from './priority';
import { Process } from '../../../core/types';

const createProcess = (
    id: number,
    arrivalTime: number,
    burstTime: number,
    priorityVal: number,
    remainingTime?: number
): Process => ({
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
    priority: priorityVal,
});

describe('Priority Algorithm', () => {

    describe('schedule()', () => {

        it('should select the process with highest priority (lowest number)', () => {
            const processes = [
                createProcess(1, 0, 5, 3),
                createProcess(2, 1, 3, 1),  // Highest priority
                createProcess(3, 2, 4, 2),
            ];
            const queue = [1, 2, 3];

            const result = priority.schedule(queue, processes);

            expect(result).toBe(2);
        });

        it('should tie-break by arrival time when priorities are equal', () => {
            const processes = [
                createProcess(1, 3, 5, 2),  // Same priority, later arrival
                createProcess(2, 0, 3, 2),  // Same priority, earliest arrival - wins
                createProcess(3, 1, 4, 2),  // Same priority
            ];
            const queue = [1, 2, 3];

            const result = priority.schedule(queue, processes);

            expect(result).toBe(2);
        });

        it('should return null for empty queue', () => {
            const processes = [createProcess(1, 0, 5, 1)];

            const result = priority.schedule([], processes);

            expect(result).toBeNull();
        });

        it('should handle processes without priority (defaults to 0)', () => {
            const p1 = createProcess(1, 0, 5, 5);
            const p2: Process = {
                id: 2,
                name: 'P2',
                color: '#000',
                arrivalTime: 1,
                burstTime: 3,
                remainingTime: 3,
                startTime: null,
                completionTime: null,
                turnaroundTime: 0,
                waitingTime: 0,
                state: 'READY',
                priority: undefined as unknown as number, // Simulate missing priority
            };
            const processes = [p1, p2];
            const queue = [1, 2];

            const result = priority.schedule(queue, processes);

            // p2 with undefined priority defaults to 0, which is higher than 5
            expect(result).toBe(2);
        });

        it('should handle queue with missing process IDs', () => {
            const processes = [createProcess(1, 0, 5, 1)];
            const queue = [1, 99]; // 99 doesn't exist

            const result = priority.schedule(queue, processes);

            expect(result).toBe(1);
        });

    });

    describe('shouldPreempt()', () => {

        it('should preempt when higher priority process arrives', () => {
            const currentProcess = createProcess(1, 0, 10, 5);
            const processes = [
                currentProcess,
                createProcess(2, 2, 3, 2), // Higher priority (lower number)
            ];
            const queue = [2];

            const result = priority.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(true);
        });

        it('should NOT preempt when current has highest priority', () => {
            const currentProcess = createProcess(1, 0, 10, 1); // Highest
            const processes = [
                currentProcess,
                createProcess(2, 1, 3, 5),
                createProcess(3, 2, 4, 3),
            ];
            const queue = [2, 3];

            const result = priority.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(false);
        });

        it('should NOT preempt when priorities are equal', () => {
            const currentProcess = createProcess(1, 0, 10, 3);
            const processes = [
                currentProcess,
                createProcess(2, 1, 3, 3), // Equal priority
            ];
            const queue = [2];

            const result = priority.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(false);
        });

        it('should NOT preempt with empty queue', () => {
            const currentProcess = createProcess(1, 0, 5, 3);

            const result = priority.shouldPreempt(currentProcess, [], [], 0);

            expect(result).toBe(false);
        });

        it('should handle undefined priority in current process', () => {
            const currentProcess: Process = {
                id: 1,
                name: 'P1',
                color: '#000',
                arrivalTime: 0,
                burstTime: 10,
                remainingTime: 10,
                startTime: null,
                completionTime: null,
                turnaroundTime: 0,
                waitingTime: 0,
                state: 'RUNNING',
                priority: undefined as unknown as number,
            };
            const processes = [
                currentProcess,
                createProcess(2, 1, 3, 1), // Higher priority
            ];
            const queue = [2];

            // Current defaults to 0, queue has 1, so no preempt
            const result = priority.shouldPreempt(currentProcess, queue, processes, 0);

            expect(result).toBe(false);
        });

    });

    describe('metadata', () => {

        it('should have correct name and code', () => {
            expect(priority.name).toBe('Priority Scheduling');
            expect(priority.code).toBe('PRIORITY');
        });

        it('should mention starvation in description', () => {
            expect(priority.info.mathematics).toContain('Starvation');
        });

    });

});
