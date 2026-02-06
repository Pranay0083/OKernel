import { describe, it, expect } from 'vitest';
import { algos, getAlgo } from './index';

describe('CPU Index', () => {

    describe('algos object', () => {

        it('should export RR algorithm', () => {
            expect(algos.RR).toBeDefined();
            expect(algos.RR.code).toBe('RR');
        });

        it('should export SJF algorithm', () => {
            expect(algos.SJF).toBeDefined();
            expect(algos.SJF.code).toBe('SJF');
        });

        it('should export FCFS algorithm', () => {
            expect(algos.FCFS).toBeDefined();
            expect(algos.FCFS.code).toBe('FCFS');
        });

        it('should export SRTF algorithm', () => {
            expect(algos.SRTF).toBeDefined();
            expect(algos.SRTF.code).toBe('SRTF');
        });

        it('should export PRIORITY algorithm', () => {
            expect(algos.PRIORITY).toBeDefined();
            expect(algos.PRIORITY.code).toBe('PRIORITY');
        });

        it('should have 5 algorithms total', () => {
            expect(Object.keys(algos)).toHaveLength(5);
        });

    });

    describe('getAlgo()', () => {

        it('should return FCFS algorithm for "FCFS"', () => {
            const algo = getAlgo('FCFS');
            expect(algo.code).toBe('FCFS');
        });

        it('should return RR algorithm for "RR"', () => {
            const algo = getAlgo('RR');
            expect(algo.code).toBe('RR');
        });

        it('should return SJF algorithm for "SJF"', () => {
            const algo = getAlgo('SJF');
            expect(algo.code).toBe('SJF');
        });

        it('should return SRTF algorithm for "SRTF"', () => {
            const algo = getAlgo('SRTF');
            expect(algo.code).toBe('SRTF');
        });

        it('should return PRIORITY algorithm for "PRIORITY"', () => {
            const algo = getAlgo('PRIORITY');
            expect(algo.code).toBe('PRIORITY');
        });

        it('should default to FCFS for unknown algorithm codes', () => {
            const algo = getAlgo('UNKNOWN');
            expect(algo.code).toBe('FCFS');
        });

        it('should default to FCFS for empty string', () => {
            const algo = getAlgo('');
            expect(algo.code).toBe('FCFS');
        });

    });

});
