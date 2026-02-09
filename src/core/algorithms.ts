export interface AlgorithmInfo {
    description: string;
    mathematics: string;
    implementation: string;
    code: string;
}

export interface AlgorithmMetadata {
    name: string;
    code: string;
    info: AlgorithmInfo;
}

export const ALGO_METADATA: Record<string, AlgorithmMetadata> = {
    FCFS: {
        name: "First Come First Serve",
        code: "FCFS",
        info: {
            description: "First Come First Serve (FCFS) executes processes in the exact order they arrive. It is the simplest scheduling algorithm but suffers from the Convoy Effect.",
            mathematics: "Average Waiting Time can be high if large processes arrive first.",
            implementation: "1. Maintain a FIFO Queue.\n2. Execute head of queue until completion.",
            code: `function selectProcess(queue) {\n  return queue[0];\n}`
        }
    },
    SJF: {
        name: "Shortest Job First",
        code: "SJF",
        info: {
            description: "Shortest Job First (SJF) selects the waiting process with the smallest execution time. It requires knowing the burst time in advance.",
            mathematics: "Min(Waiting Time) is provably optimal for non-preemptive scheduling.",
            implementation: "1. Sort Ready Queue by Burst Time.\n2. Select process with min(Burst Time).\n3. Execute to completion (Non-Preemptive).",
            code: `function selectProcess(queue, processes) {\n  return queue.sort((a,b) => processes[a].burst - processes[b].burst)[0];\n}`
        }
    },
    SRTF: {
        name: "Shortest Remaining Time First",
        code: "SRTF",
        info: {
            description: "Preemptive version of SJF. If a new process arrives with a shorter remaining time than the current running process, it preempts it.",
            mathematics: "Optimal for minimizing average Waiting Time in dynamic systems.",
            implementation: "1. Always select process with min(Remaining Time).\n2. Update choice on every Arrival.",
            code: `function shouldPreempt(current, candidates) {\n  return candidates.some(c => c.remaining < current.remaining);\n}`
        }
    },
    RR: {
        name: "Round Robin",
        code: "RR",
        info: {
            description: "Round Robin (RR) is a preemptive scheduling algorithm where each process is assigned a fixed time slice (quantum) in cyclic order. It is designed for time-sharing systems.",
            mathematics: "Turnaround Time = Completion Time - Arrival Time\nWaiting Time = Turnaround Time - Burst Time",
            implementation: "1. Maintain a FIFO Ready Queue.\n2. Execute process for Time Quantum.\n3. If unfinished, move to back of queue.\n4. If finished, remove from system.",
            code: `function selectProcess(queue) {\n  return queue[0];\n}\n\nfunction shouldPreempt(quantumRemaining) {\n  return quantumRemaining <= 0;\n}`
        }
    },
    PRIORITY: {
        name: "Priority Scheduling",
        code: "PRIORITY",
        info: {
            description: "Priority scheduling assigns a priority rank to each process. The CPU is allocated to the process with the highest priority (customarily lower number = higher priority).",
            mathematics: "Can lead to Starvation if low priority processes never get CPU time.",
            implementation: "1. Sort Ready Queue by Priority.\n2. Execute process with best priority.\n3. Preemptive or Non-Preemptive variants exist.",
            code: `function selectProcess(queue, processes) {\n  return queue.sort((a,b) => processes[a].priority - processes[b].priority)[0];\n}`
        }
    }
};
