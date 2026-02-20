import { SimulationState, Process, AlgorithmType } from '../../core/types';
import { fcfs } from './algos/fcfs';
import { sjf } from './algos/sjf';
import { srtf } from './algos/srtf';
import { round_robin, rr_should_preempt } from './algos/round_robin';
import { priority } from './algos/priority';

export const tick = (state: SimulationState): SimulationState => {
    // 1. Clone Shallow State
    const newState: SimulationState = {
        ...state,
        processes: [...state.processes],
        readyQueue: [...state.readyQueue],
        ganttChart: [...state.ganttChart],
        completedProcessIds: [...state.completedProcessIds]
    };

    // Build id -> index map (O(N) once per tick)
    const indexMap = new Map<number, number>();
    newState.processes.forEach((p, i) => indexMap.set(p.id, i));

    // 2. Handle Arrivals
    newState.processes.forEach((p, index) => {
        if (p.state === 'WAITING' && p.arrivalTime <= newState.currentTime) {
            newState.processes[index] = {
                ...p,
                state: 'READY'
            };
            newState.readyQueue.push(p.id);
        }
    });

    // 3. Algorithm Selection Logic
    const selectProcess = (algo: AlgorithmType, queue: number[], procs: Process[]): number | null => {
        switch (algo) {
            case 'FCFS': return fcfs(queue, procs);
            case 'SJF': return sjf(queue, procs);
            case 'SRTF': return srtf(queue, procs);
            case 'RR': return round_robin(queue, procs);
            case 'PRIORITY': return priority(queue, procs);
            default: return fcfs(queue, procs);
        }
    };

    // 4. Scheduling Decision
    let processToRunId = newState.runningProcessId;
    let shouldPreempt = false;

    // Check preemption for RR
    if (newState.algorithm === 'RR' && processToRunId !== null) {
        if (rr_should_preempt(newState.quantumRemaining)) {
            shouldPreempt = true;
        }
    }

    // Check preemption for SRTF (Simulated by checking if selection changes)
    if (newState.algorithm === 'SRTF' && processToRunId !== null) {
        const runningIdx = indexMap.get(processToRunId);
        if(runningIdx !== undefined) {
            const runningProc = newState.processes[runningIdx];

            for (const id of newState.readyQueue) {
                const idx = indexMap.get(id);
                if (idx !== undefined) {
                    const candidate = newState.processes[idx];
                    if (candidate.remainingTime < runningProc.remainingTime) {
                        shouldPreempt = true;
                        break;
                    }
                }
            }
        }
    }

    // If no running process or preempted, select next
    if (processToRunId === null || shouldPreempt) {
        if (processToRunId !== null) {
            const idx = indexMap.get(processToRunId);
            if (idx !== undefined && newState.processes[idx].state === 'RUNNING') {
                newState.processes[idx] = {
                    ...newState.processes[idx],
                    state: 'READY'
                };
                newState.readyQueue.push(processToRunId);
            }
            newState.runningProcessId = null;
        }

        // Pick next
        const nextId = selectProcess(newState.algorithm, newState.readyQueue, newState.processes);
        
        if (nextId !== null) {
            const idx = indexMap.get(nextId);
            if (idx !== undefined) {
                newState.processes[idx] = {
                    ...newState.processes[idx],
                    state: 'RUNNING',
                    startTime:
                        newState.processes[idx].startTime ?? newState.currentTime
                };

                if (newState.algorithm === 'RR') {
                    newState.quantumRemaining = newState.timeQuantum;
                }

                newState.runningProcessId = nextId;
                newState.readyQueue = newState.readyQueue.filter(id => id !== nextId);
                processToRunId = nextId;
            }
        }
    }

    // 5. Execution Step
    if (newState.runningProcessId !== null) {
        const idx = indexMap.get(newState.runningProcessId);
        if (idx !== undefined) {
            const proc = newState.processes[idx];

            const updatedProc = {
                ...proc,
                remainingTime: proc.remainingTime - 1
            };

            newState.processes[idx] = updatedProc;

            if (newState.algorithm === 'RR') {
                newState.quantumRemaining--;
            }

            // Update Gantt Chart
            const lastBlock = newState.ganttChart[newState.ganttChart.length - 1];
            if (lastBlock && lastBlock.processId === updatedProc.id && lastBlock.endTime === newState.currentTime) {
                newState.ganttChart[newState.ganttChart.length - 1] = {
                    ...lastBlock,
                    endTime: lastBlock.endTime + 1
                }
            } else {
                // New block
                newState.ganttChart.push({
                    processId: updatedProc.id,
                    startTime: newState.currentTime,
                    endTime: newState.currentTime + 1
                });
            }

            // Completion
            if (updatedProc.remainingTime - 1 < 0 || updatedProc.remainingTime === 0) {
                const completionTime = newState.currentTime + 1;
                const turnaroundTime = completionTime - updatedProc.arrivalTime;

                newState.processes[idx] = {
                    ...updatedProc,
                    state: 'COMPLETED',
                    completionTime,
                    turnaroundTime,
                    waitingTime: turnaroundTime - updatedProc.burstTime
                };

                newState.completedProcessIds.push(updatedProc.id);
                newState.runningProcessId = null;
            }
        }
    } else {
        // Idle Time
        const lastBlock = newState.ganttChart[newState.ganttChart.length - 1];
        if (lastBlock && lastBlock.processId === null && lastBlock.endTime === newState.currentTime) {
            newState.ganttChart[newState.ganttChart.length - 1] = {
                ...lastBlock,
                endTime: lastBlock.endTime + 1
            }
        } else {
            newState.ganttChart.push({
                processId: null,
                startTime: newState.currentTime,
                endTime: newState.currentTime + 1
            });
        }
    }

    // 6. Advance Time
    newState.currentTime++;

    return newState;
};
