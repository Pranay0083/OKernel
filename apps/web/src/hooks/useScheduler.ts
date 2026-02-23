import { useState, useEffect } from 'react';
import { SimulationState, Process } from '../core/types';
import { tick } from '../syscore/cpu';

const DEFAULT_MLFQ_QUANTUMS = [2, 4, 8];
const DEFAULT_MLFQ_NUM_QUEUES = 3;

const createInitialState = (numCores: number = 1): SimulationState => ({
    currentTime: 0,
    processes: [],
    readyQueue: [],
    runningProcessIds: Array(numCores).fill(null),
    completedProcessIds: [],
    ganttChart: [],
    algorithm: 'FCFS',
    timeQuantum: 2,
    quantumRemaining: Array(numCores).fill(0),
    isPlaying: false,
    speed: 1000,
    contextSwitchCost: 1,
    contextSwitchCount: 0,
    contextSwitchTimeWasted: 0,
    contextSwitchCooldown: Array(numCores).fill(0),
    priorityAgingEnabled: false,
    priorityAgingInterval: 5,
    numCores,
    // MLFQ
    mlfqQueues: Array.from({ length: DEFAULT_MLFQ_NUM_QUEUES }, () => []),
    mlfqQuantums: [...DEFAULT_MLFQ_QUANTUMS],
    mlfqNumQueues: DEFAULT_MLFQ_NUM_QUEUES,
    mlfqCurrentLevel: Array(numCores).fill(0),
});

const initialState = createInitialState(1);

export const useScheduler = () => {
    const [state, setState] = useState<SimulationState>(initialState);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | undefined;

        const performTick = () => {
            const allDone = state.processes.length > 0 && state.processes.every(p => p.state === 'COMPLETED');
            if (allDone || state.currentTime > 1000) {
                setState(prev => ({ ...prev, isPlaying: false }));
                return;
            }

            try {
                const nextState = tick(state);
                setState(nextState);
            } catch (error) {
                console.error('Simulation tick failed:', error);
                setState(prev => ({ ...prev, isPlaying: false }));
            }
        };

        if (state.isPlaying) {
            timeout = setTimeout(performTick, state.speed);
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [state]);

    const addProcess = (processData: Omit<Process, 'id' | 'state' | 'color' | 'remainingTime' | 'effectivePriority' | 'startTime' | 'completionTime' | 'waitingTime' | 'turnaroundTime' | 'queueLevel' | 'coreId'>) => {
        setState(prev => {
            const newId = prev.processes.length > 0 ? Math.max(...prev.processes.map(p => p.id)) + 1 : 1;
            const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];
            const color = colors[(newId - 1) % colors.length];

            const newProcess: Process = {
                id: newId,
                ...processData,
                state: 'WAITING',
                remainingTime: processData.burstTime,
                effectivePriority: processData.priority,
                color,
                startTime: null,
                completionTime: null,
                waitingTime: 0,
                turnaroundTime: 0,
                queueLevel: 0,
                coreId: null,
            };

            return {
                ...prev,
                processes: [...prev.processes, newProcess],
                readyQueue: prev.readyQueue
            };
        });
    };

    const reset = () => {
        setState(prev => ({
            ...createInitialState(prev.numCores),
            algorithm: prev.algorithm,
            timeQuantum: prev.timeQuantum,
            speed: prev.speed,
            contextSwitchCost: prev.contextSwitchCost,
            priorityAgingEnabled: prev.priorityAgingEnabled,
            priorityAgingInterval: prev.priorityAgingInterval,
            mlfqNumQueues: prev.mlfqNumQueues,
            mlfqQuantums: [...prev.mlfqQuantums],
            processes: prev.processes.map(p => ({
                ...p,
                state: 'WAITING',
                remainingTime: p.burstTime,
                effectivePriority: p.priority,
                startTime: null,
                completionTime: null,
                waitingTime: 0,
                turnaroundTime: 0,
                queueLevel: 0,
                coreId: null,
            })),
        }));
    };

    const clear = () => {
        setState(prev => ({
            ...createInitialState(prev.numCores),
            algorithm: prev.algorithm,
            speed: prev.speed,
            timeQuantum: prev.timeQuantum,
            contextSwitchCost: prev.contextSwitchCost,
            priorityAgingEnabled: prev.priorityAgingEnabled,
            priorityAgingInterval: prev.priorityAgingInterval,
            mlfqNumQueues: prev.mlfqNumQueues,
            mlfqQuantums: [...prev.mlfqQuantums],
        }));
    }

    return { state, setState, addProcess, reset, clear };
};
