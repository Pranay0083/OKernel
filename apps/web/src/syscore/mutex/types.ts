// ── Mutex Visualizer Types ──────────────────────────────────────────

export type MutexAlgorithm = 'PETERSON' | 'DEKKER' | 'BAKERY' | 'TAS' | 'CAS' | 'SEMAPHORE';

export type ThreadState = 'IDLE' | 'WANTING' | 'ENTERING' | 'IN_CS' | 'EXITING';

export interface MutexThread {
    id: number;
    name: string;
    color: string;
    state: ThreadState;
    csExecutionTime: number;   // How many ticks to spend in CS
    csRemaining: number;       // Remaining ticks in CS
    csCount: number;           // Times entered CS
    waitTicks: number;         // Ticks spent waiting (contention)
    totalWaitTicks: number;    // Total wait ticks across all CS entries
}

export interface MutexSharedState {
    // TAS / CAS
    lock: boolean;

    // Peterson / Dekker
    flags: boolean[];
    turn: number;

    // Bakery (Lamport)
    tickets: number[];
    choosing: boolean[];

    // Semaphore
    semaphore: number;
    semaphoreMax: number;
}

export interface EventEntry {
    step: number;
    threadId: number;
    threadName: string;
    action: string;
    detail: string;
    color: string;
}

export interface MutexSimState {
    algorithm: MutexAlgorithm;
    threads: MutexThread[];
    shared: MutexSharedState;
    numThreads: number;
    currentStep: number;
    events: EventEntry[];
    isPlaying: boolean;
    speed: number;
    activeThreadIds: number[];  // Threads currently in CS (semaphore allows >1)
}
