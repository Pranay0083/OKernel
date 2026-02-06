import { useState, useEffect } from 'react';
import { SimulationState, Process } from '../core/types';
import { nextTick } from '../core/scheduler';

const initialState: SimulationState = {
    currentTime: 0,
    processes: [],
    readyQueue: [],
    runningProcessId: null,
    completedProcessIds: [],
    ganttChart: [],
    algorithm: 'FCFS',
    timeQuantum: 2,
    quantumRemaining: 0,
    isPlaying: false,
    speed: 1000,
};

export const useScheduler = () => {
    const [state, setState] = useState<SimulationState>(initialState);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (state.isPlaying) {
            interval = setInterval(() => {
                setState(prev => {
                    // Check execution limit to prevent infinite loops if logic fails
                    if (prev.currentTime > 1000) return { ...prev, isPlaying: false };

                    const allDone = prev.processes.length > 0 && prev.processes.every(p => p.state === 'COMPLETED');
                    if (allDone) {
                        return { ...prev, isPlaying: false };
                    }
                    return nextTick(prev);
                });
            }, state.speed);
        }
        return () => clearInterval(interval);
    }, [state.isPlaying, state.speed]);

    const addProcess = (processData: Omit<Process, 'id' | 'state' | 'color' | 'remainingTime' | 'startTime' | 'completionTime' | 'waitingTime' | 'turnaroundTime'>) => {
        setState(prev => {
            const newId = prev.processes.length > 0 ? Math.max(...prev.processes.map(p => p.id)) + 1 : 1;
            const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];
            const color = colors[(newId - 1) % colors.length];

            const newProcess: Process = {
                id: newId,
                ...processData,
                state: 'WAITING', // Correct initial state. Scheduler promotes to READY at AT.
                remainingTime: processData.burstTime,
                color,
                startTime: null,
                completionTime: null,
                waitingTime: 0,
                turnaroundTime: 0
            };

            return {
                ...prev,
                processes: [...prev.processes, newProcess],
                readyQueue: prev.readyQueue // DO NOT add to queue here. Scheduler loop handles it.
            };
        });
    };

    const reset = () => {
        setState(prev => ({
            ...initialState,
            algorithm: prev.algorithm,
            timeQuantum: prev.timeQuantum,
            speed: prev.speed,
            processes: prev.processes.map(p => ({
                ...p,
                state: 'WAITING',
                remainingTime: p.burstTime,
                startTime: null,
                completionTime: null,
                waitingTime: 0,
                turnaroundTime: 0
            })),
            currentTime: 0,
            readyQueue: [],
            runningProcessId: null,
            completedProcessIds: [],
            ganttChart: [],
            quantumRemaining: 0,
            isPlaying: false
        }));
    };

    const clear = () => {
        setState(prev => ({ ...initialState, algorithm: prev.algorithm, speed: prev.speed, timeQuantum: prev.timeQuantum }));
    }

    return { state, setState, addProcess, reset, clear };
};
