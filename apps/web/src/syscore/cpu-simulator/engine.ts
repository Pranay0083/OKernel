import { SimState, SimProcess, SimMutex, CpuEvent, Scenario } from './types';

// Educational predefined scenarios
export const PREDEFINED_SCENARIOS: Scenario[] = [
    {
        id: '1',
        title: '1. Basic Multi-Core',
        description: 'Two processes running smoothly on independent cores without needing to wait for any locked resources.',
        numCores: 2,
        mutexes: [],
        processes: [
            { id: 'P1', arrivalTime: 1, burstTime: 5, script: [] },
            { id: 'P2', arrivalTime: 2, burstTime: 4, script: [] }
        ]
    },
    {
        id: '2',
        title: '2. Resource Contention',
        description: 'P1 grabs the FileSystem lock. When P2 tries to grab it shortly after, it gets blocked! Notice how P2 wastes time waiting until P1 finishes and releases it.',
        numCores: 2,
        mutexes: [{ id: 'FS_LOCK', name: 'File System Access' }],
        processes: [
            { id: 'P1', arrivalTime: 1, burstTime: 8, script: [{ type: 'REQUEST_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 7 }, { type: 'RELEASE_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 1 }] },
            { id: 'P2', arrivalTime: 2, burstTime: 6, script: [{ type: 'REQUEST_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 5 }, { type: 'RELEASE_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 2 }] }
        ]
    },
    {
        id: '3',
        title: '3. Classic Deadlock',
        description: 'Core 0 grabs Lock A, Core 1 grabs Lock B. Then, Core 0 wants Lock B, and Core 1 wants Lock A. They stall forever! (Notice the core activity stops and they pile into the Blocked Queue)',
        numCores: 2,
        mutexes: [{ id: 'LOCK_A', name: 'Database' }, { id: 'LOCK_B', name: 'Network' }],
        processes: [
            { id: 'P1', arrivalTime: 1, burstTime: 10, script: [{ type: 'REQUEST_MUTEX', mutexId: 'LOCK_A', triggerRemainingTime: 9 }, { type: 'REQUEST_MUTEX', mutexId: 'LOCK_B', triggerRemainingTime: 7 }] },
            { id: 'P2', arrivalTime: 1, burstTime: 10, script: [{ type: 'REQUEST_MUTEX', mutexId: 'LOCK_B', triggerRemainingTime: 9 }, { type: 'REQUEST_MUTEX', mutexId: 'LOCK_A', triggerRemainingTime: 7 }] }
        ]
    },
    {
        id: '4',
        title: '4. High Contention (Chaos)',
        description: '4 Cores and 10 Processes fighting over 3 Mutexes! Watch the blocked queue completely saturate as threads desperately claw for database and network locks.',
        numCores: 4,
        mutexes: [{ id: 'DB_LOCK', name: 'Database' }, { id: 'NET_LOCK', name: 'Network' }, { id: 'FS_LOCK', name: 'File System' }],
        processes: [
            { id: 'P1', arrivalTime: 1, burstTime: 12, script: [{ type: 'REQUEST_MUTEX', mutexId: 'DB_LOCK', triggerRemainingTime: 10 }, { type: 'RELEASE_MUTEX', mutexId: 'DB_LOCK', triggerRemainingTime: 2 }] },
            { id: 'P2', arrivalTime: 2, burstTime: 8, script: [{ type: 'REQUEST_MUTEX', mutexId: 'NET_LOCK', triggerRemainingTime: 6 }, { type: 'RELEASE_MUTEX', mutexId: 'NET_LOCK', triggerRemainingTime: 1 }] },
            { id: 'P3', arrivalTime: 2, burstTime: 15, script: [{ type: 'REQUEST_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 12 }, { type: 'RELEASE_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 4 }] },
            { id: 'P4', arrivalTime: 3, burstTime: 9, script: [{ type: 'REQUEST_MUTEX', mutexId: 'DB_LOCK', triggerRemainingTime: 7 }, { type: 'RELEASE_MUTEX', mutexId: 'DB_LOCK', triggerRemainingTime: 3 }] },
            { id: 'P5', arrivalTime: 4, burstTime: 11, script: [{ type: 'REQUEST_MUTEX', mutexId: 'NET_LOCK', triggerRemainingTime: 9 }, { type: 'RELEASE_MUTEX', mutexId: 'NET_LOCK', triggerRemainingTime: 2 }] },
            { id: 'P6', arrivalTime: 4, burstTime: 7, script: [{ type: 'REQUEST_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 5 }, { type: 'RELEASE_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 1 }] },
            { id: 'P7', arrivalTime: 5, burstTime: 14, script: [{ type: 'REQUEST_MUTEX', mutexId: 'DB_LOCK', triggerRemainingTime: 11 }, { type: 'REQUEST_MUTEX', mutexId: 'NET_LOCK', triggerRemainingTime: 8 }, { type: 'RELEASE_MUTEX', mutexId: 'NET_LOCK', triggerRemainingTime: 5 }, { type: 'RELEASE_MUTEX', mutexId: 'DB_LOCK', triggerRemainingTime: 2 }] },
            { id: 'P8', arrivalTime: 5, burstTime: 10, script: [{ type: 'REQUEST_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 8 }, { type: 'RELEASE_MUTEX', mutexId: 'FS_LOCK', triggerRemainingTime: 3 }] },
            { id: 'P9', arrivalTime: 6, burstTime: 8, script: [{ type: 'REQUEST_MUTEX', mutexId: 'NET_LOCK', triggerRemainingTime: 6 }, { type: 'RELEASE_MUTEX', mutexId: 'NET_LOCK', triggerRemainingTime: 2 }] },
            { id: 'P10', arrivalTime: 6, burstTime: 12, script: [{ type: 'REQUEST_MUTEX', mutexId: 'DB_LOCK', triggerRemainingTime: 10 }, { type: 'RELEASE_MUTEX', mutexId: 'DB_LOCK', triggerRemainingTime: 4 }] }
        ]
    },
    {
        id: '5',
        title: '5. Custom Sandbox',
        description: '4 Cores and 4 Mutexes, but NO automated processes! Use the controls below to manually FORK processes and interrupt them with lock requests to design your own concurrency scenarios.',
        numCores: 4,
        mutexes: [{ id: 'DB_LOCK', name: 'Database' }, { id: 'NET_LOCK', name: 'Network' }, { id: 'FS_LOCK', name: 'File System' }, { id: 'MEM_LOCK', name: 'Memory' }],
        processes: []
    }
];

// Subscriber pattern to link vanilla JS core to React UI
export type StateSubscriber = (state: SimState, events: CpuEvent[]) => void;

export class SimulatorEngine {
    private state: SimState;
    private subscribers: Set<StateSubscriber> = new Set();
    private timer: number | null = null;
    private unreadEvents: CpuEvent[] = [];

    constructor() {
        this.state = this.getInitialState();
    }

    private getInitialState(numCores: number = 1): SimState {
        const cores = Array.from({ length: numCores }, (_, i) => ({ id: i, activeProcessId: null }));
        return {
            time: 0,
            isRunning: false,
            speed: 1000,
            processes: new Map(),
            mutexes: new Map(),
            readyQueue: [],
            blockedQueue: [],
            cores,
            cpuUtilization: 0,
            throughput: 0
        };
    }

    /**
     * Subscription for UI updates
     */
    public subscribe(callback: StateSubscriber): () => void {
        this.subscribers.add(callback);
        callback(this.state, this.unreadEvents); // Initial push
        return () => this.subscribers.delete(callback);
    }

    private notify() {
        this.subscribers.forEach(sub => sub(this.state, this.unreadEvents));
        this.unreadEvents = []; // clear after notify
    }

    private pushEvent(event: CpuEvent) {
        this.unreadEvents.push(event);
    }

    /**
     * Core Control
     */
    public start() {
        if (this.state.isRunning) return;
        this.state.isRunning = true;
        this.notify();
        this.tickLoop();
    }

    public pause() {
        if (!this.state.isRunning) return;
        this.state.isRunning = false;
        if (this.timer !== null) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
        this.notify();
    }

    public step() {
        this.pause();
        this.performTick();
    }

    public reset(numCores?: number) {
        this.pause();
        this.unreadEvents = [];
        this.state = this.getInitialState(numCores ?? this.state.cores.length);
        this.notify();
    }

    /**
     * System Config
     */
    public setCoreCount(num: number) {
        const isRunning = this.state.isRunning;
        if (isRunning) this.pause();

        // Preserve as many processes/state as possible but reset cores
        const currentProcesses = new Map(this.state.processes);
        const currentMutexes = new Map(this.state.mutexes);

        // Fully reset state with new core count
        this.state = this.getInitialState(num);
        this.state.processes = currentProcesses;
        this.state.mutexes = currentMutexes;

        // Put all terminated/ready/running processes back into a valid state
        this.state.processes.forEach(p => {
            if (p.state === 'RUNNING') p.state = 'READY';
            if (p.state === 'READY' && !this.state.readyQueue.includes(p.id)) {
                this.state.readyQueue.push(p.id);
            }
        });

        if (isRunning) this.start();
        this.notify();
    }

    public loadScenario(scenario: Scenario) {
        this.reset(scenario.numCores);

        // Setup Mutexes
        scenario.mutexes.forEach(m => this.addMutex(m.id, m.name));

        // Setup Processes
        scenario.processes.forEach((p, index) => {
            const colors = ['#4ade80', '#60a5fa', '#facc15', '#f87171', '#c084fc'];
            this.addProcess({
                id: p.id,
                name: `Process ${p.id}`,
                color: colors[index % colors.length],
                arrivalTime: p.arrivalTime,
                burstTime: p.burstTime,
                script: p.script
            });
        });

        this.notify();
    }

    public setSpeed(ms: number) {
        this.state.speed = ms;
        this.notify();
    }

    private tickLoop() {
        if (!this.state.isRunning) return;
        this.performTick();
        this.timer = window.setTimeout(() => this.tickLoop(), this.state.speed);
    }

    /**
     * State Actions
     */
    public addProcess(processSource: Omit<SimProcess, 'state' | 'remainingTime' | 'waitingTime' | 'turnaroundTime' | 'blockedTime' | 'holdingMutexes' | 'script'> & { script?: SimProcess['script'] }) {
        const process: SimProcess = {
            ...processSource,
            state: 'NEW',
            remainingTime: processSource.burstTime,
            waitingTime: 0,
            turnaroundTime: 0,
            blockedTime: 0,
            holdingMutexes: [],
            script: processSource.script || []
        };

        this.state.processes.set(process.id, process);
        this.notify();
    }

    public addMutex(id: string, name: string) {
        const mutex: SimMutex = {
            id,
            name,
            state: 'AVAILABLE',
            ownerId: null,
            waitQueue: []
        };
        this.state.mutexes.set(id, mutex);
        this.notify();
    }

    public requestMutex(processId: string, mutexId: string) {
        const process = this.state.processes.get(processId);
        const mutex = this.state.mutexes.get(mutexId);

        if (!process || !mutex) return;

        // Find the core this process is currently running on
        const core = this.state.cores.find(c => c.activeProcessId === processId);

        if (mutex.state === 'AVAILABLE') {
            mutex.state = 'LOCKED';
            mutex.ownerId = processId;
            process.holdingMutexes.push(mutexId);

            // IF it was blocked, unblock it!
            if (process.state === 'BLOCKED') {
                process.state = 'READY';
                process.waitingForMutex = undefined;
                this.state.blockedQueue = this.state.blockedQueue.filter(id => id !== processId);
                if (!this.state.readyQueue.includes(processId)) {
                    this.state.readyQueue.push(processId);
                }
            }

            this.pushEvent({ type: 'MUTEX_ACQUIRED', processId, mutexId, coreId: core ? core.id : -1, time: this.state.time });
        } else {
            // Block the process
            if (core) {
                core.activeProcessId = null; // Kick off core
            } else {
                // Not on a core, likely in ready queue? Should be rare but handle it.
                this.state.readyQueue = this.state.readyQueue.filter(id => id !== processId);
            }

            process.state = 'BLOCKED';
            process.waitingForMutex = mutexId;
            mutex.waitQueue.push(processId);

            if (!this.state.blockedQueue.includes(processId)) {
                this.state.blockedQueue.push(processId);
            }

            this.pushEvent({ type: 'MUTEX_BLOCKED', processId, mutexId, coreId: core ? core.id : -1, time: this.state.time });
        }

        this.notify();
    }

    public releaseMutex(processId: string, mutexId: string) {
        const process = this.state.processes.get(processId);
        const mutex = this.state.mutexes.get(mutexId);

        if (!process || !mutex) return;
        if (mutex.ownerId !== processId) return; // Can't release if you don't own it

        mutex.ownerId = null;
        mutex.state = 'AVAILABLE';
        process.holdingMutexes = process.holdingMutexes.filter(id => id !== mutexId);
        const core = this.state.cores.find(c => c.activeProcessId === processId);
        this.pushEvent({ type: 'MUTEX_RELEASED', processId, mutexId, coreId: core ? core.id : -1, time: this.state.time });

        // Wake up next in queue
        if (mutex.waitQueue.length > 0) {
            const nextProcessId = mutex.waitQueue.shift()!;
            // Attempt grant immediately. requestMutex now handles the state transition back to READY.
            this.requestMutex(nextProcessId, mutexId);
        }

        this.notify();
    }

    /**
     * Main Simulation Logic
     */
    private performTick() {
        this.state.time += 1;

        // 1. Admit new processes
        this.state.processes.forEach((proc) => {
            if (proc.state === 'NEW' && proc.arrivalTime <= this.state.time) {
                proc.state = 'READY';
                this.state.readyQueue.push(proc.id);
                this.pushEvent({ type: 'PROCESS_ARRIVED', processId: proc.id, time: this.state.time });
            } else if (proc.state === 'READY') {
                proc.waitingTime += 1;
            } else if (proc.state === 'BLOCKED') {
                proc.blockedTime += 1;
            }
        });

        // 2. Handle active process execution on ALL cores
        this.state.cores.forEach(core => {
            if (core.activeProcessId) {
                const activeProc = this.state.processes.get(core.activeProcessId);
                if (activeProc) {

                    // Evaluate scripts: Is there an action scheduled for right now?
                    const actionsToTrigger = activeProc.script.filter(s => s.triggerRemainingTime === activeProc.remainingTime);
                    actionsToTrigger.forEach(action => {
                        if (action.type === 'REQUEST_MUTEX') {
                            this.requestMutex(activeProc.id, action.mutexId);
                        } else if (action.type === 'RELEASE_MUTEX') {
                            this.releaseMutex(activeProc.id, action.mutexId);
                        }
                        // Remove action from script so it only happens once
                        activeProc.script = activeProc.script.filter(s => s !== action);
                    });

                    // If the process wasn't blocked by its script...
                    if (activeProc.state === 'RUNNING') {
                        activeProc.remainingTime -= 1;

                        if (activeProc.remainingTime <= 0) {
                            // Finished
                            activeProc.state = 'TERMINATED';
                            activeProc.completionTime = this.state.time;
                            activeProc.turnaroundTime = this.state.time - activeProc.arrivalTime;

                            // Auto release mutexes upon termination
                            const mutexesToRelease = [...activeProc.holdingMutexes];
                            mutexesToRelease.forEach(mid => this.releaseMutex(activeProc.id, mid));

                            core.activeProcessId = null;
                            this.pushEvent({ type: 'PROCESS_FINISHED', processId: activeProc.id, coreId: core.id, time: this.state.time });
                        }
                    }
                }
            }
        });

        // 3. Scheduling: Fill empty cores
        this.state.cores.forEach(core => {
            if (!core.activeProcessId && this.state.readyQueue.length > 0) {
                const nextProcessId = this.state.readyQueue.shift()!;
                core.activeProcessId = nextProcessId;

                const p = this.state.processes.get(nextProcessId);
                if (p) {
                    p.state = 'RUNNING';
                    if (p.startTime === undefined) {
                        p.startTime = this.state.time;
                        this.pushEvent({ type: 'PROCESS_STARTED', processId: nextProcessId, coreId: core.id, time: this.state.time });
                    } else {
                        this.pushEvent({ type: 'CONTEXT_SWITCH', coreId: core.id, fromProcessId: null, toProcessId: nextProcessId, time: this.state.time });
                    }
                }
            }
        });

        this.updateStats();
        this.notify();
    }

    private updateStats() {
        // basic tracking: calculate utilization as cores * time where cores were active
        // we'd need historical tracking for full accuracy but this is a placeholder
    }
}
