import { useState, useEffect } from 'react';
import { MutexSimState, MutexThread, MutexAlgorithm } from '../../syscore/mutex/types';
import { mutexTick, mutexTickThread } from '../../syscore/mutex/engine';

const THREAD_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#06b6d4'];

export const createDefaultShared = (numThreads: number) => ({
    lock: false,
    flags: Array(numThreads).fill(false),
    turn: 0,
    tickets: Array(numThreads).fill(0),
    choosing: Array(numThreads).fill(false),
    semaphore: 1,
    semaphoreMax: 1,
});

const createThreads = (count: number): MutexThread[] =>
    Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `T${i}`,
        color: THREAD_COLORS[i % THREAD_COLORS.length],
        state: 'IDLE' as const,
        csExecutionTime: 2 + Math.floor(Math.random() * 2),
        csRemaining: 0,
        csCount: 0,
        waitTicks: 0,
        totalWaitTicks: 0,
    }));

const createInitialState = (numThreads: number = 3, algorithm: MutexAlgorithm = 'PETERSON'): MutexSimState => ({
    algorithm,
    threads: createThreads(numThreads),
    shared: createDefaultShared(numThreads),
    numThreads,
    currentStep: 0,
    events: [],
    isPlaying: false,
    speed: 1500,
    activeThreadIds: [],
});

export const useMutex = () => {
    const [state, setState] = useState<MutexSimState>(createInitialState(3, 'PETERSON'));

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | undefined;

        if (state.isPlaying) {
            timeout = setTimeout(() => {
                if (state.currentStep > 500) {
                    setState(prev => ({ ...prev, isPlaying: false }));
                    return;
                }
                const nextState = mutexTick(state);
                setState(nextState);
            }, state.speed);
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [state]);

    const reset = () => {
        setState(prev => ({
            ...createInitialState(prev.numThreads, prev.algorithm),
            speed: prev.speed,
            threads: createThreads(prev.numThreads),
            shared: {
                ...createDefaultShared(prev.numThreads),
                semaphore: prev.shared.semaphoreMax,
                semaphoreMax: prev.shared.semaphoreMax,
            },
        }));
    };

    const setAlgorithm = (algo: MutexAlgorithm) => {
        // Max 2 threads for Peterson/Dekker
        const maxThreads = (algo === 'PETERSON' || algo === 'DEKKER') ? 2 : state.numThreads;
        const numThreads = Math.min(state.numThreads, maxThreads);
        setState({
            ...createInitialState(numThreads, algo),
            speed: state.speed,
            shared: {
                ...createDefaultShared(numThreads),
                semaphore: state.shared.semaphoreMax,
                semaphoreMax: state.shared.semaphoreMax,
            },
        });
    };

    const setNumThreads = (n: number) => {
        const algo = state.algorithm;
        const max = (algo === 'PETERSON' || algo === 'DEKKER') ? 2 : 8;
        const num = Math.max(2, Math.min(max, n));
        setState({
            ...createInitialState(num, algo),
            speed: state.speed,
            shared: {
                ...createDefaultShared(num),
                semaphore: state.shared.semaphoreMax,
                semaphoreMax: state.shared.semaphoreMax,
            },
        });
    };

    const setSemaphoreValue = (val: number) => {
        setState(prev => ({
            ...prev,
            shared: {
                ...prev.shared,
                semaphore: Math.max(1, Math.min(prev.numThreads, val)),
                semaphoreMax: Math.max(1, Math.min(prev.numThreads, val)),
            },
        }));
    };

    const initFromPreset = (config: import('../../pages/library/presetsData').MutexPresetConfig) => {
        setState(prev => ({
            ...createInitialState(config.numThreads, config.algorithm),
            speed: prev.speed,
            shared: {
                ...createDefaultShared(config.numThreads),
                semaphore: config.semaphoreMax ?? 1,
                semaphoreMax: config.semaphoreMax ?? 1,
            },
        }));
    };

    const stepGlobal = () => {
        setState(prev => mutexTick(prev));
    };

    const stepThread = (threadId: number) => {
        setState(prev => mutexTickThread(prev, threadId));
    };

    return { state, setState, reset, setAlgorithm, setNumThreads, setSemaphoreValue, initFromPreset, stepGlobal, stepThread };
};
