import { SimulationState, Process, AlgorithmType } from '../../core/types';
import { fcfs } from './algos/fcfs';
import { sjf } from './algos/sjf';
import { srtf } from './algos/srtf';
import { round_robin, rr_should_preempt } from './algos/round_robin';
import { priority } from './algos/priority';

export const tick = (state: SimulationState): SimulationState => {
    // 1. Clone State
    const newState: SimulationState = {
        ...state,
        processes: state.processes.map(p => ({ ...p })),
        readyQueue: [...state.readyQueue],
        ganttChart: [...state.ganttChart],
        completedProcessIds: [...state.completedProcessIds]
    };

    // 2. Handle Arrivals: Move WAITING -> READY
    newState.processes.forEach(p => {
        if (p.state === 'WAITING' && p.arrivalTime <= newState.currentTime) {
            p.state = 'READY';
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
    let processToRunId: number | null = newState.runningProcessId;
    let shouldPreempt = false;

    // Check preemption for RR
    if (newState.algorithm === 'RR' && processToRunId !== null) {
        if (rr_should_preempt(newState.quantumRemaining)) {
            shouldPreempt = true;
        }
    }

    // Check preemption for SRTF (Simulated by checking if selection changes)
    if (newState.algorithm === 'SRTF' && processToRunId !== null) {
        const bestCandidate = selectProcess('SRTF', [...newState.readyQueue, processToRunId], newState.processes);
        if (bestCandidate !== null && bestCandidate !== processToRunId) {
            shouldPreempt = true;
        }
    }

    // If no running process or preempted, select next
    if (processToRunId === null || shouldPreempt) {
        if (processToRunId !== null) {
            // Context Switch Out
            const oldProc = newState.processes.find(p => p.id === processToRunId);
            if (oldProc && oldProc.state === 'RUNNING') {
                oldProc.state = 'READY';
                newState.readyQueue.push(processToRunId); // Back to queue
            }
            newState.runningProcessId = null;
        }

        // Pick next
        const nextId = selectProcess(newState.algorithm, newState.readyQueue, newState.processes);
        
        if (nextId !== null) {
            // Context Switch In
            processToRunId = nextId;
            newState.runningProcessId = nextId;
            // Remove from Ready Queue
            newState.readyQueue = newState.readyQueue.filter(id => id !== nextId);
            
            const newProc = newState.processes.find(p => p.id === nextId);
            if (newProc) {
                newProc.state = 'RUNNING';
                // Reset Quantum if RR
                if (newState.algorithm === 'RR') {
                    newState.quantumRemaining = newState.timeQuantum;
                }
                
                // Set Start Time if first run
                if (newProc.startTime === null) {
                    newProc.startTime = newState.currentTime;
                }
            }
        }
    }

    // 5. Execution Step
    if (newState.runningProcessId !== null) {
        const runningProc = newState.processes.find(p => p.id === newState.runningProcessId);
        if (runningProc) {
            // Decrement remaining time
            runningProc.remainingTime--;
            
            if (newState.algorithm === 'RR') {
                newState.quantumRemaining--;
            }

            // Update Gantt Chart
            const lastBlock = newState.ganttChart[newState.ganttChart.length - 1];
            if (lastBlock && lastBlock.processId === runningProc.id && lastBlock.endTime === newState.currentTime) {
                // Extend existing block
                lastBlock.endTime++;
            } else {
                // New block
                newState.ganttChart.push({
                    processId: runningProc.id,
                    startTime: newState.currentTime,
                    endTime: newState.currentTime + 1
                });
            }

            // Check Completion
            if (runningProc.remainingTime <= 0) {
                runningProc.state = 'COMPLETED';
                runningProc.completionTime = newState.currentTime + 1;
                runningProc.turnaroundTime = runningProc.completionTime - runningProc.arrivalTime;
                runningProc.waitingTime = runningProc.turnaroundTime - runningProc.burstTime;
                
                newState.completedProcessIds.push(runningProc.id);
                newState.runningProcessId = null;
            }
        }
    } else {
        // Idle Time
        const lastBlock = newState.ganttChart[newState.ganttChart.length - 1];
        if (lastBlock && lastBlock.processId === null && lastBlock.endTime === newState.currentTime) {
            lastBlock.endTime++;
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
