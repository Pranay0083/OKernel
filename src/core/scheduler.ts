import { SimulationState, Process, AlgorithmType } from './types';

// Core Engine
export const nextTick = (state: SimulationState): SimulationState => {
    let {
        processes,
        readyQueue,
        currentTime,
        runningProcessId,
        completedProcessIds,
        ganttChart,
        algorithm,
        timeQuantum,
        quantumRemaining
    } = state;

    // 1. ARRIVAL CHECK
    // Move processes from 'WAITING' to 'READY' if currentTime >= arrivalTime
    const newlyReadyProcesses: number[] = [];

    const updatedProcesses = processes.map(p => {
        if (p.state === 'WAITING' && p.arrivalTime <= currentTime) {
            newlyReadyProcesses.push(p.id);
            return { ...p, state: 'READY' as const };
        }
        return p;
    });

    // Add newly ready processes to the queue
    let nextQueue = [...readyQueue];
    newlyReadyProcesses.forEach(id => {
        if (!nextQueue.includes(id)) {
            nextQueue.push(id);
        }
    });

    // 2. CPU SCHEDULING (Context Switch / Preemption)
    let activeProcessId = runningProcessId;
    let nextQuantum = quantumRemaining;
    const nextCompletedIds = [...completedProcessIds];
    const nextGantt = [...ganttChart];

    // Preemption Logic
    if (activeProcessId) {

        // RR Specific Logic (Time Slice Management) - Kept in Kernel for now as it modifies state directly
        if (algorithm === 'RR') {
            nextQuantum -= 1;
            // SysCore Check
            const currentProc = updatedProcesses.find(p => p.id === activeProcessId);
            if (currentProc && algos.RR.shouldPreempt(currentProc, nextQueue, updatedProcesses, nextQuantum)) {
                if (currentProc.state !== 'COMPLETED') {
                    nextQueue.push(activeProcessId);
                    activeProcessId = null;
                }
            }
        }
        else {
            // General Preemption (SRTF)
            const currentProc = updatedProcesses.find(p => p.id === activeProcessId);
            if (currentProc && shouldPreempt(currentProc, nextQueue, updatedProcesses, algorithm, nextQuantum)) {
                // Preempt
                if (!nextQueue.includes(activeProcessId)) {
                    nextQueue.push(activeProcessId);
                }
                activeProcessId = null;
            }
        }
    }

    // Selection Logic (If CPU Free)
    if (!activeProcessId && nextQueue.length > 0) {
        const nextId = selectProcess(nextQueue, updatedProcesses, algorithm);
        if (nextId !== -1) {
            // Remove from queue
            const idx = nextQueue.indexOf(nextId);
            if (idx > -1) nextQueue.splice(idx, 1);

            activeProcessId = nextId;

            // Init Quantum
            // Fix: Decrement immediately because this process will execute in this tick
            if (algorithm === 'RR') nextQuantum = timeQuantum - 1;
        }
    }

    // 3. EXECUTION
    const finalProcesses = updatedProcesses.map(p => {
        if (p.id === activeProcessId) {
            // This is the running process
            const nextRemaining = p.remainingTime - 1;
            const startTime = p.startTime === null ? currentTime : p.startTime;

            if (nextRemaining <= 0) {
                // Completed
                // Completion time is END of this tick, so currentTime + 1
                const finishTime = currentTime + 1;
                const tat = finishTime - p.arrivalTime;
                const wt = tat - p.burstTime;

                // Mark completed locally so we can push to list
                if (!nextCompletedIds.includes(p.id)) {
                    nextCompletedIds.push(p.id);
                    activeProcessId = null; // Free up CPU for next tick relative to logic? 
                    // Actually, if it finishes NOW, it occupies the CPU for this entire tick.
                    // But next tick it will be null.
                }

                return {
                    ...p,
                    state: 'COMPLETED' as const,
                    remainingTime: 0,
                    completionTime: finishTime,
                    turnaroundTime: tat,
                    waitingTime: wt,
                    startTime
                };
            }

            return {
                ...p,
                state: 'RUNNING' as const,
                remainingTime: nextRemaining,
                startTime
            };
        }
        else if (nextQueue.includes(p.id)) {
            return { ...p, state: 'READY' as const };
        }
        else if (nextCompletedIds.includes(p.id)) {
            return p; // Keep as completed
        }
        else {
            // Waiting
            return p;
        }
    });

    // Safety Correction: if activeProcessId was set to null inside execution loop due to completion, ensure we update the state variable
    // The `map` above updates the individual process object. We need to sync `activeProcessId` state.
    // If the process that WAS active is now COMPLETED, `activeProcessId` should effectively be null for the *next* state, 
    // but for the *current* viewing state, it was running during this tick.

    // However, `activeProcessId` in state usually represents "What is running right now". 
    // If it finished this tick, next state it should be null.
    // My logic above sets `activeProcessId = null` inside the completion block, but that only affects the local variable.
    // We should re-check if the activeProcess is now completed in `finalProcesses`.
    if (activeProcessId) {
        const p = finalProcesses.find(x => x.id === activeProcessId);
        if (p && p.state === 'COMPLETED') {
            activeProcessId = null;
        }
    }


    // 4. GANTT CHART UPDATE
    // Add block for what happened THIS tick.
    // We recorded `activeProcessId` (the one that ran, even if it finished).
    // Wait, we lost the reference if we nulled it out.
    // Let's recover what ran.
    let ranId: number | null = null;

    // Check if we had a running process coming IN to execution
    // Actually, simply check `runningProcessId` from input vs what we decided to run.
    // The process that "Ran" is the one we decremented.

    // Let's look at `finalProcesses`. Any process that has `remainingTime` < `updatedProcesses.remainingTime` ran.
    // Or if it completed.

    const runner = finalProcesses.find(p => {
        const old = updatedProcesses.find(op => op.id === p.id);
        if (!old) return false;
        return p.remainingTime < old.remainingTime || (p.state === 'COMPLETED' && old.state !== 'COMPLETED');
    });

    if (runner) {
        ranId = runner.id;
    }

    if (ranId !== null) {
        // Append to Gantt
        const last = nextGantt[nextGantt.length - 1];
        if (last && last.processId === ranId && last.endTime === currentTime) {
            last.endTime = currentTime + 1;
        } else {
            nextGantt.push({
                processId: ranId,
                startTime: currentTime,
                endTime: currentTime + 1
            });
        }
    } else {
        // IDLE
        const hasPending = finalProcesses.some(p => p.state !== 'COMPLETED');
        if (hasPending) {
            const last = nextGantt[nextGantt.length - 1];
            if (last && last.processId === null && last.endTime === currentTime) {
                last.endTime = currentTime + 1;
            } else {
                nextGantt.push({
                    processId: null,
                    startTime: currentTime,
                    endTime: currentTime + 1
                });
            }
        }
    }

    return {
        processes: finalProcesses,
        readyQueue: nextQueue,
        currentTime: currentTime + 1,
        runningProcessId: activeProcessId,
        completedProcessIds: nextCompletedIds,
        ganttChart: nextGantt,
        algorithm,
        timeQuantum,
        quantumRemaining: nextQuantum,
        isPlaying: state.isPlaying,
        speed: state.speed
    };
};


// Helpers
import { algos } from '../syscore/cpu';

// @ts-ignore
const selectProcess = (queue: number[], processes: Process[], algoCode: AlgorithmType): number => {
    // SysCore Engine Delegate
    const algorithm = algos[algoCode];
    if (!algorithm) return -1;

    const result = algorithm.schedule(queue, processes);
    return result !== null ? result : -1;
};

// Also exported for external use if needed, but primarily used by nextTick
export const shouldPreempt = (
    currentProcess: Process,
    queue: number[],
    processes: Process[],
    algorithmCode: AlgorithmType,
    quantumRemaining: number
): boolean => {
    const algorithm = algos[algorithmCode];
    if (!algorithm || !algorithm.shouldPreempt) return false;

    // RR check is slightly different locally as it depends on Quantum, 
    // but we can normalize the interface if we want.
    // For now we kept RR logic in the main loop for quantum decrement, 
    // but the actual "Should I Switch?" check can be here.

    // Note: Our previous logic handled RR quantum decrement manually in nextTick.
    // We will keep that for safety, but use this for SRTF/SJF preemption.
    return algorithm.shouldPreempt(currentProcess, queue, processes, quantumRemaining);
};
