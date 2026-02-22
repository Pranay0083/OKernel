export type ProcessState = 'READY' | 'RUNNING' | 'COMPLETED' | 'WAITING';

export interface Process {
    id: number;
    name: string;
    burstTime: number;
    arrivalTime: number;
    priority: number;
    remainingTime: number;
    color: string;
    state: ProcessState;
    queueLevel: number; // MLFQ: current queue level (0 = highest priority)
    coreId: number | null; // Multi-core: which core is running this process

    // Stats
    startTime: number | null;
    completionTime: number | null;
    waitingTime: number;
    turnaroundTime: number;
}

export type AlgorithmType = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'PRIORITY' | 'MLFQ';

export interface GanttBlock {
    processId: number | null;
    startTime: number;
    endTime: number;
    coreId: number; // Which core produced this block
}

export interface SimulationState {
    currentTime: number;
    processes: Process[];
    readyQueue: number[]; // Process IDs
    runningProcessIds: (number | null)[]; // Per-core running process (index = core)
    completedProcessIds: number[];
    ganttChart: GanttBlock[];

    // Control State
    algorithm: AlgorithmType;
    timeQuantum: number;
    quantumRemaining: number[]; // Per-core quantum tracking
    isPlaying: boolean;
    speed: number;
    numCores: number;

    // MLFQ State
    mlfqQueues: number[][]; // Array of queues per level
    mlfqQuantums: number[]; // Time quantum per queue level
    mlfqNumQueues: number; // Number of queue levels
    mlfqCurrentLevel: number[]; // Per-core: queue level of running process
}