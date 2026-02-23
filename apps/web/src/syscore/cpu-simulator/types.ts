export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'BLOCKED' | 'TERMINATED';

export interface ProcessAction {
    type: 'REQUEST_MUTEX' | 'RELEASE_MUTEX';
    mutexId: string;
    triggerRemainingTime: number; // when remainingTime <= this, trigger action
}

export interface SimProcess {
    id: string;
    name: string;
    color: string;
    arrivalTime: number;
    burstTime: number;
    remainingTime: number;
    state: ProcessState;

    // Wait/Block statistics
    waitingTime: number;
    turnaroundTime: number;
    blockedTime: number;

    // Mutex interactions
    waitingForMutex?: string; // ID of the mutex it's blocked on
    holdingMutexes: string[]; // IDs of mutexes it currently holds

    // Scripted behaviors for educational scenarios
    script: ProcessAction[];

    // Timestamps
    startTime?: number;
    completionTime?: number;
}

export type MutexState = 'AVAILABLE' | 'LOCKED';

export interface SimMutex {
    id: string;
    name: string;
    state: MutexState;
    ownerId: string | null; // ID of the process holding the mutex
    waitQueue: string[]; // Queue of process IDs waiting for this mutex
}

export interface CpuCore {
    id: number;
    activeProcessId: string | null;
}

export interface SimState {
    time: number;
    isRunning: boolean;
    speed: number;

    processes: Map<string, SimProcess>;
    mutexes: Map<string, SimMutex>;

    // Schedulers structure
    readyQueue: string[]; // Process IDs
    blockedQueue: string[]; // Process IDs blocked generally (or by specific mutex)
    cores: CpuCore[];

    // Analytics
    cpuUtilization: number;
    throughput: number;
}

export interface Scenario {
    id: string;
    title: string;
    description: string;
    numCores: number;
    mutexes: { id: string, name: string }[];
    processes: {
        id: string;
        arrivalTime: number;
        burstTime: number;
        script: ProcessAction[];
    }[];
}

export type CpuEvent =
    | { type: 'PROCESS_ARRIVED'; processId: string; time: number }
    | { type: 'PROCESS_STARTED'; processId: string; coreId: number; time: number }
    | { type: 'PROCESS_FINISHED'; processId: string; coreId: number; time: number }
    | { type: 'MUTEX_ACQUIRED'; processId: string; mutexId: string; coreId: number; time: number }
    | { type: 'MUTEX_BLOCKED'; processId: string; mutexId: string; coreId: number; time: number }
    | { type: 'MUTEX_RELEASED'; processId: string; mutexId: string; coreId: number; time: number }
    | { type: 'CONTEXT_SWITCH'; coreId: number; fromProcessId: string | null; toProcessId: string; time: number };
