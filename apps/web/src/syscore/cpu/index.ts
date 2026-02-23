import { SimulationState, Process, AlgorithmType } from '../../core/types';
import { fcfs } from './algos/fcfs';
import { sjf } from './algos/sjf';
import { srtf } from './algos/srtf';
import { round_robin, rr_should_preempt } from './algos/round_robin';
import { priority } from './algos/priority';
import { priority_preemptive, priority_p_should_preempt } from './algos/priority_preemptive';

import { mlfq_select, mlfq_should_preempt, mlfq_higher_queue_preempt } from './algos/mlfq';

// ── Algorithm Selection ─────────────────────────────────────────────
const selectProcess = (algo: AlgorithmType, queue: number[], procs: Process[]): number | null => {
    switch (algo) {
        case 'FCFS': return fcfs(queue, procs);
        case 'SJF': return sjf(queue, procs);
        case 'SRTF': return srtf(queue, procs);
        case 'RR': return round_robin(queue, procs);
        case 'PRIORITY': return priority(queue, procs);
        case 'PRIORITY_P': return priority_preemptive(queue, procs);
        default: return fcfs(queue, procs);
    }
};

// ── Main Tick 
export const tick = (state: SimulationState): SimulationState => {
    // 1. Clone Shallow State
    const newState: SimulationState = {
        ...state,
        processes: [...state.processes],
        readyQueue: [...state.readyQueue],
        ganttChart: [...state.ganttChart],
        completedProcessIds: [...state.completedProcessIds],
        runningProcessIds: [...state.runningProcessIds],
        quantumRemaining: [...state.quantumRemaining],
        contextSwitchCooldown: [...state.contextSwitchCooldown],
        mlfqQueues: state.mlfqQueues.map(q => [...q]),
        mlfqCurrentLevel: [...state.mlfqCurrentLevel],
    };

    // Build id -> index map (O(N) once per tick)
    const indexMap = new Map<number, number>();
    newState.processes.forEach((p, i) => indexMap.set(p.id, i));

    // 2. Priority Aging — age waiting processes before arrivals
    if (newState.priorityAgingEnabled && (newState.algorithm === 'PRIORITY' || newState.algorithm === 'PRIORITY_P')) {
        for (const pid of newState.readyQueue) {
            const idx = indexMap.get(pid);
            if (idx !== undefined) {
                const proc = newState.processes[idx];
                if (proc.state === 'READY') {
                    const ticksWaiting = newState.currentTime - (proc.arrivalTime);
                    if (ticksWaiting > 0 && ticksWaiting % newState.priorityAgingInterval === 0) {
                        const newEffPri = Math.max(0, proc.effectivePriority - 1);
                        if (newEffPri !== proc.effectivePriority) {
                            newState.processes[idx] = {
                                ...proc,
                                effectivePriority: newEffPri,
                            };
                        }
                    }
                }
            }
        }
    }

    // 3. Handle Arrivals
    newState.processes.forEach((p, index) => {
        if (p.state === 'WAITING' && p.arrivalTime <= newState.currentTime) {
            newState.processes[index] = {
                ...p,
                state: 'READY',
                queueLevel: 0,
            };
            newState.readyQueue.push(p.id);
            // MLFQ: also push into Q0
            if (newState.algorithm === 'MLFQ') {
                newState.mlfqQueues[0].push(p.id);
            }
        }
    });

    // ── Branch: MLFQ or Standard ────────────────────────────────────
    if (newState.algorithm === 'MLFQ') {
        scheduleMLFQ(newState, indexMap);
    } else {
        scheduleStandard(newState, indexMap);
    }

    // 5. Execution Step — execute on ALL cores simultaneously
    for (let core = 0; core < newState.numCores; core++) {
        // Context Switch Cooldown: core is busy switching, skip execution
        if (newState.contextSwitchCooldown[core] > 0) {
            newState.contextSwitchCooldown[core]--;
            newState.contextSwitchTimeWasted++;

            // Record switch block in Gantt chart (processId = -1 for context switch)
            const lastBlock = newState.ganttChart[newState.ganttChart.length - 1];
            if (
                lastBlock &&
                lastBlock.processId === -1 &&
                lastBlock.coreId === core &&
                lastBlock.endTime === newState.currentTime
            ) {
                newState.ganttChart[newState.ganttChart.length - 1] = {
                    ...lastBlock,
                    endTime: lastBlock.endTime + 1,
                };
            } else {
                newState.ganttChart.push({
                    processId: -1,
                    startTime: newState.currentTime,
                    endTime: newState.currentTime + 1,
                    coreId: core,
                });
            }
            continue;
        }

        const runningId = newState.runningProcessIds[core];
        if (runningId !== null) {
            const idx = indexMap.get(runningId);
            if (idx !== undefined) {
                const proc = newState.processes[idx];
                const updatedProc = {
                    ...proc,
                    remainingTime: proc.remainingTime - 1,
                };
                newState.processes[idx] = updatedProc;

                // Decrement per-core quantum
                if (newState.algorithm === 'RR' || newState.algorithm === 'MLFQ') {
                    newState.quantumRemaining[core]--;
                }

                // Update Gantt Chart (per-core)
                const lastBlock = newState.ganttChart[newState.ganttChart.length - 1];
                if (
                    lastBlock &&
                    lastBlock.processId === updatedProc.id &&
                    lastBlock.coreId === core &&
                    lastBlock.endTime === newState.currentTime
                ) {
                    newState.ganttChart[newState.ganttChart.length - 1] = {
                        ...lastBlock,
                        endTime: lastBlock.endTime + 1,
                    };
                } else {
                    newState.ganttChart.push({
                        processId: updatedProc.id,
                        startTime: newState.currentTime,
                        endTime: newState.currentTime + 1,
                        coreId: core,
                    });
                }

                // Completion
                if (updatedProc.remainingTime <= 0) {
                    const completionTime = newState.currentTime + 1;
                    const turnaroundTime = completionTime - updatedProc.arrivalTime;

                    newState.processes[idx] = {
                        ...updatedProc,
                        state: 'COMPLETED',
                        completionTime,
                        turnaroundTime,
                        waitingTime: turnaroundTime - updatedProc.burstTime,
                        coreId: null,
                    };

                    newState.completedProcessIds.push(updatedProc.id);
                    newState.runningProcessIds[core] = null;
                }
            }
        } else {
            // Idle Time for this core
            const lastBlock = newState.ganttChart[newState.ganttChart.length - 1];
            if (
                lastBlock &&
                lastBlock.processId === null &&
                lastBlock.coreId === core &&
                lastBlock.endTime === newState.currentTime
            ) {
                newState.ganttChart[newState.ganttChart.length - 1] = {
                    ...lastBlock,
                    endTime: lastBlock.endTime + 1,
                };
            } else {
                newState.ganttChart.push({
                    processId: null,
                    startTime: newState.currentTime,
                    endTime: newState.currentTime + 1,
                    coreId: core,
                });
            }
        }
    }

    // 6. Advance Time
    newState.currentTime++;

    return newState;
};


// ── Standard Scheduling (per-core) ──────────────────────────────────
const scheduleStandard = (newState: SimulationState, indexMap: Map<number, number>): void => {
    for (let core = 0; core < newState.numCores; core++) {
        // Skip scheduling if core is in context-switch cooldown
        if (newState.contextSwitchCooldown[core] > 0) continue;

        let processToRunId = newState.runningProcessIds[core];
        let shouldPreempt = false;

        // Check preemption for RR
        if (newState.algorithm === 'RR' && processToRunId !== null) {
            if (rr_should_preempt(newState.quantumRemaining[core])) {
                shouldPreempt = true;
            }
        }

        // Check preemption for SRTF
        if (newState.algorithm === 'SRTF' && processToRunId !== null) {
            const runningIdx = indexMap.get(processToRunId);
            if (runningIdx !== undefined) {
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

        // Check preemption for Preemptive Priority
        if (newState.algorithm === 'PRIORITY_P' && processToRunId !== null) {
            const runningIdx = indexMap.get(processToRunId);
            if (runningIdx !== undefined) {
                const runningProc = newState.processes[runningIdx];
                if (priority_p_should_preempt(runningProc, newState.readyQueue, newState.processes, indexMap)) {
                    shouldPreempt = true;
                }
            }
        }

        // If no running process or preempted, select next
        if (processToRunId === null || shouldPreempt) {
            const previousRunningId = processToRunId;

            if (processToRunId !== null) {
                const idx = indexMap.get(processToRunId);
                if (idx !== undefined && newState.processes[idx].state === 'RUNNING') {
                    // Reset effectivePriority when preempted back to ready
                    newState.processes[idx] = {
                        ...newState.processes[idx],
                        state: 'READY',
                        coreId: null,
                    };
                    newState.readyQueue.push(processToRunId);
                }
                newState.runningProcessIds[core] = null;
            }

            // Pick next
            const nextId = selectProcess(newState.algorithm, newState.readyQueue, newState.processes);

            if (nextId !== null) {
                const idx = indexMap.get(nextId);
                if (idx !== undefined) {
                    // Track context switch: switching from one process to a different process
                    const isContextSwitch = previousRunningId !== null && previousRunningId !== nextId;
                    if (isContextSwitch && newState.contextSwitchCost > 0) {
                        newState.contextSwitchCount++;
                        newState.contextSwitchCooldown[core] = newState.contextSwitchCost;
                    }

                    // Reset effectivePriority to original priority when process starts running
                    newState.processes[idx] = {
                        ...newState.processes[idx],
                        state: 'RUNNING',
                        startTime: newState.processes[idx].startTime ?? newState.currentTime,
                        coreId: core,
                        effectivePriority: newState.processes[idx].priority,
                    };

                    if (newState.algorithm === 'RR') {
                        newState.quantumRemaining[core] = newState.timeQuantum;
                    }

                    newState.runningProcessIds[core] = nextId;
                    const queueIdx = newState.readyQueue.indexOf(nextId);
                    if (queueIdx !== -1) {
                        newState.readyQueue.splice(queueIdx, 1);
                    }
                }
            }
        }
    }
};


// ── MLFQ Scheduling (per-core) ──────────────────────────────────────
const scheduleMLFQ = (newState: SimulationState, indexMap: Map<number, number>): void => {
    for (let core = 0; core < newState.numCores; core++) {
        let processToRunId = newState.runningProcessIds[core];
        let shouldPreempt = false;

        if (processToRunId !== null) {
            // Check quantum exhaustion
            if (mlfq_should_preempt(newState.quantumRemaining[core])) {
                shouldPreempt = true;
            }
            // Check if a higher-priority queue has arrivals
            if (!shouldPreempt && mlfq_higher_queue_preempt(newState.mlfqQueues, newState.mlfqCurrentLevel[core])) {
                shouldPreempt = true;
            }
        }

        if (processToRunId === null || shouldPreempt) {
            if (processToRunId !== null) {
                const idx = indexMap.get(processToRunId);
                if (idx !== undefined && newState.processes[idx].state === 'RUNNING') {
                    const proc = newState.processes[idx];
                    let demotedLevel = proc.queueLevel;

                    // Demote if quantum was exhausted
                    if (mlfq_should_preempt(newState.quantumRemaining[core])) {
                        demotedLevel = Math.min(proc.queueLevel + 1, newState.mlfqNumQueues - 1);
                    }

                    newState.processes[idx] = {
                        ...proc,
                        state: 'READY',
                        queueLevel: demotedLevel,
                        coreId: null,
                    };

                    newState.mlfqQueues[demotedLevel].push(processToRunId);
                    newState.readyQueue.push(processToRunId);
                }
                newState.runningProcessIds[core] = null;
            }

            // Pick next from highest-priority non-empty queue
            const selection = mlfq_select(newState.mlfqQueues, newState.processes);

            if (selection) {
                const { processId: nextId, queueLevel } = selection;
                const idx = indexMap.get(nextId);
                if (idx !== undefined) {
                    newState.processes[idx] = {
                        ...newState.processes[idx],
                        state: 'RUNNING',
                        queueLevel: queueLevel,
                        startTime: newState.processes[idx].startTime ?? newState.currentTime,
                        coreId: core,
                    };

                    newState.quantumRemaining[core] = newState.mlfqQuantums[queueLevel] ?? newState.mlfqQuantums[newState.mlfqQuantums.length - 1];
                    newState.mlfqCurrentLevel[core] = queueLevel;
                    newState.runningProcessIds[core] = nextId;

                    // Remove from MLFQ queue
                    const queueIdx = newState.mlfqQueues[queueLevel].indexOf(nextId);
                    if (queueIdx !== -1) {
                        newState.mlfqQueues[queueLevel].splice(queueIdx, 1);
                    }
                    // Remove from flat readyQueue
                    const flatIdx = newState.readyQueue.indexOf(nextId);
                    if (flatIdx !== -1) {
                        newState.readyQueue.splice(flatIdx, 1);
                    }
                }
            }
        }
    }
};
