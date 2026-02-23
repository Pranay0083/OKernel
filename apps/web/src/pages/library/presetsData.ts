export type CPUPresetConfig = {
    algorithm: 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'MLFQ' | 'PRIORITY' | 'PRIORITY_P';
    numCores: number;
    timeQuantum?: number;
    mlfqNumQueues?: number;
    mlfqQuantums?: number[];
    processes: {
        name: string;
        arrivalTime: number;
        burstTime: number;
        priority: number;
    }[];
};

export type MutexPresetConfig = {
    algorithm: 'PETERSON' | 'DEKKER' | 'BAKERY' | 'TAS' | 'CAS' | 'SEMAPHORE';
    numThreads: number;
    semaphoreMax?: number;
};

export type Preset = {
    id: string;
    type: 'cpu' | 'mutex';
    title: string;
    purpose: string;
    solution: string;
    config: CPUPresetConfig | MutexPresetConfig;
};

export const presetsData: Preset[] = [
    // --- CPU Scheduler Presets ---
    {
        id: 'cpu-convoy-effect',
        type: 'cpu',
        title: 'The Convoy Effect',
        purpose: 'Demonstrates how a single CPU-bound process can hold up many shorter processes in First-Come, First-Served scheduling, leading to poor average waiting times.',
        solution: 'Notice the high Average Waiting Time. Switching the algorithm to Shortest Job First (SJF) or Round Robin (RR) will solve this issue by allowing shorter processes to execute sooner.',
        config: {
            algorithm: 'FCFS',
            numCores: 1,
            processes: [
                { name: 'P1 (Heavy)', arrivalTime: 0, burstTime: 24, priority: 1 },
                { name: 'P2 (Light)', arrivalTime: 1, burstTime: 3, priority: 1 },
                { name: 'P3 (Light)', arrivalTime: 2, burstTime: 3, priority: 1 },
            ]
        }
    },
    {
        id: 'cpu-starvation',
        type: 'cpu',
        title: 'Priority Starvation',
        purpose: 'Shows how low-priority processes might never get CPU time if high-priority processes keep arriving continuously (in Preemptive Priority scheduling).',
        solution: 'Observe how P1 (low priority) never completes. Implement aging (increasing priority over time) or switch to a fair-share algorithm like Round Robin.',
        config: {
            algorithm: 'PRIORITY_P',
            numCores: 1,
            processes: [
                { name: 'P1 (Low Pri)', arrivalTime: 0, burstTime: 10, priority: 5 },
                { name: 'P2 (High Pri)', arrivalTime: 1, burstTime: 3, priority: 1 },
                { name: 'P3 (High Pri)', arrivalTime: 3, burstTime: 4, priority: 1 },
                { name: 'P4 (High Pri)', arrivalTime: 6, burstTime: 3, priority: 1 },
                { name: 'P5 (High Pri)', arrivalTime: 8, burstTime: 4, priority: 1 },
            ]
        }
    },
    {
        id: 'cpu-rr-thrashing',
        type: 'cpu',
        title: 'Round Robin Thrashing',
        purpose: 'Highlights the cost of context switching when the Time Quantum is set too low relative to process burst times.',
        solution: 'The system spends more time switching contexts than doing actual work. Increase the Time Quantum to improve CPU utilization.',
        config: {
            algorithm: 'RR',
            numCores: 1,
            timeQuantum: 1,
            processes: [
                { name: 'A', arrivalTime: 0, burstTime: 8, priority: 1 },
                { name: 'B', arrivalTime: 0, burstTime: 8, priority: 1 },
                { name: 'C', arrivalTime: 0, burstTime: 8, priority: 1 },
            ]
        }
    },
    {
        id: 'cpu-ideal-rr',
        type: 'cpu',
        title: 'Optimal Round Robin',
        purpose: 'Shows a well-tuned Time Quantum that provides fair response times without excessive context switching overhead.',
        solution: 'Notice how all processes make steady progress and the turnaround times are relatively balanced.',
        config: {
            algorithm: 'RR',
            numCores: 1,
            timeQuantum: 4,
            processes: [
                { name: 'A', arrivalTime: 0, burstTime: 8, priority: 1 },
                { name: 'B', arrivalTime: 0, burstTime: 8, priority: 1 },
                { name: 'C', arrivalTime: 0, burstTime: 8, priority: 1 },
            ]
        }
    },
    {
        id: 'cpu-sjf-optimal',
        type: 'cpu',
        title: 'SJF Turnaround Minimization',
        purpose: 'Demonstrates mathematically that Shortest Job First is optimal for minimizing average waiting and turnaround time for a given set of processes.',
        solution: 'Compare the average waiting time here (SJF) with the same workload in FCFS or Round Robin. SJF will always yield the lowest average.',
        config: {
            algorithm: 'SJF',
            numCores: 1,
            processes: [
                { name: 'P1', arrivalTime: 0, burstTime: 6, priority: 1 },
                { name: 'P2', arrivalTime: 0, burstTime: 2, priority: 1 },
                { name: 'P3', arrivalTime: 0, burstTime: 8, priority: 1 },
                { name: 'P4', arrivalTime: 0, burstTime: 1, priority: 1 },
                { name: 'P5', arrivalTime: 0, burstTime: 4, priority: 1 },
            ]
        }
    },
    {
        id: 'cpu-srtf-preemption',
        type: 'cpu',
        title: 'SRTF Preemption',
        purpose: 'Shows Shortest Remaining Time First interrupting a running process because a new process arrived with a shorter burst time than what the current process has left.',
        solution: 'Watch P1 get preempted by P2 at t=1, and then P2 getting executed immediately.',
        config: {
            algorithm: 'SRTF',
            numCores: 1,
            processes: [
                { name: 'P1 (Long)', arrivalTime: 0, burstTime: 12, priority: 1 },
                { name: 'P2 (Short)', arrivalTime: 1, burstTime: 2, priority: 1 },
                { name: 'P3 (Med)', arrivalTime: 2, burstTime: 4, priority: 1 },
            ]
        }
    },
    {
        id: 'cpu-mlfq-demotion',
        type: 'cpu',
        title: 'MLFQ Penalty Demotion',
        purpose: 'Illustrates Multi-Level Feedback Queue demoting a CPU-hogging process to lower-priority queues while keeping interactive/short processes in the top queue.',
        solution: 'Watch the heavy process sink to Q2 while the shorter processes finish quickly in Q0.',
        config: {
            algorithm: 'MLFQ',
            numCores: 1,
            mlfqNumQueues: 3,
            mlfqQuantums: [2, 4, 8],
            processes: [
                { name: 'CPU Hog', arrivalTime: 0, burstTime: 20, priority: 1 },
                { name: 'Interactive 1', arrivalTime: 1, burstTime: 2, priority: 1 },
                { name: 'Interactive 2', arrivalTime: 3, burstTime: 1, priority: 1 },
                { name: 'Interactive 3', arrivalTime: 5, burstTime: 3, priority: 1 },
            ]
        }
    },
    {
        id: 'cpu-multicore-balancing',
        type: 'cpu',
        title: 'Multi-Core Load Balancing',
        purpose: 'Illustrates how multiple cores can handle parallel workloads efficiently, reducing the overall turnaround time drastically compared to single-core execution.',
        solution: 'Compare the Gantt chart and total time taken with the single-core scenario. Tasks are distributed across cores as soon as they arrive.',
        config: {
            algorithm: 'FCFS',
            numCores: 4,
            processes: [
                { name: 'Web Req 1', arrivalTime: 0, burstTime: 5, priority: 1 },
                { name: 'Web Req 2', arrivalTime: 0, burstTime: 8, priority: 1 },
                { name: 'DB Query 1', arrivalTime: 0, burstTime: 3, priority: 1 },
                { name: 'File I/O', arrivalTime: 1, burstTime: 6, priority: 1 },
                { name: 'Web Req 3', arrivalTime: 2, burstTime: 2, priority: 1 },
                { name: 'DB Query 2', arrivalTime: 3, burstTime: 4, priority: 1 },
            ]
        }
    },
    {
        id: 'cpu-asymmetric-multicore',
        type: 'cpu',
        title: 'Multi-Core Bottleneck',
        purpose: 'Shows a scenario where having multiple cores doesn\'t speed up execution perfectly because one monolithic sequential task takes dominant time.',
        solution: 'Amdahl\'s Law in action: Even with 4 cores, the total time is bound by the 20-burst Long Task. The other cores sit idle after finishing their short work.',
        config: {
            algorithm: 'RR',
            numCores: 4,
            timeQuantum: 4,
            processes: [
                { name: 'Long Task', arrivalTime: 0, burstTime: 20, priority: 1 },
                { name: 'Micro 1', arrivalTime: 0, burstTime: 2, priority: 1 },
                { name: 'Micro 2', arrivalTime: 0, burstTime: 3, priority: 1 },
                { name: 'Micro 3', arrivalTime: 0, burstTime: 1, priority: 1 },
            ]
        }
    },

    // --- Mutex Visualizer Presets ---
    {
        id: 'mutex-petersons',
        type: 'mutex',
        title: "Understanding Peterson's Solution",
        purpose: 'A classic software-based solution to the critical section problem for two processes. It guarantees mutual exclusion, progress, and bounded waiting.',
        solution: 'Watch how the "turn" and "flags" variables are used to break ties. It perfectly synchronizes 2 threads but scales poorly to N threads.',
        config: {
            algorithm: 'PETERSON',
            numThreads: 2
        }
    },
    {
        id: 'mutex-dekkers',
        type: 'mutex',
        title: "Dekker's Algorithm",
        purpose: 'The first known correct solution to the mutual exclusion problem in concurrent programming. Slightly more complex than Peterson\'s.',
        solution: 'Observe the strict turn-taking fallback mechanism when both threads express interest simultaneously.',
        config: {
            algorithm: 'DEKKER',
            numThreads: 2
        }
    },
    {
        id: 'mutex-bakery-n',
        type: 'mutex',
        title: "Lamport's Bakery Algorithm",
        purpose: 'Demonstrates a software algorithm designed for N processes. It uses a ticketing system similar to a bakery shop to establish order.',
        solution: 'Notice how each thread grabs a "ticket". Threads with the smallest ticket enter the Critical Section first, ensuring FIFO fairness.',
        config: {
            algorithm: 'BAKERY',
            numThreads: 5
        }
    },
    {
        id: 'mutex-tas-contention',
        type: 'mutex',
        title: 'Test-And-Set Spinlock (High Contention)',
        purpose: 'Shows what happens when many threads hammer a single hardware-level Test-And-Set lock. High CPU waste due to busy-waiting.',
        solution: 'Observe the high "WAIT Σ". All threads constantly poll memory, showing why spinlocks are bad for uniprocessors or long critical sections.',
        config: {
            algorithm: 'TAS',
            numThreads: 6
        }
    },
    {
        id: 'mutex-cas-optimistic',
        type: 'mutex',
        title: 'Compare-And-Swap (Lock-Free Primitive)',
        purpose: 'Visualizes the atomic CAS operation, often used as a building block for lock-free data structures rather than pure mutual exclusion.',
        solution: 'Watch threads attempt to swap memory conditionally. It achieves similar locking to TAS but is more versatile.',
        config: {
            algorithm: 'CAS',
            numThreads: 4
        }
    },
    {
        id: 'mutex-semaphore-pool',
        type: 'mutex',
        title: 'Counting Semaphores (Resource Pool)',
        purpose: 'Shows how semaphores can be used to manage access to a limited pool of identical resources (e.g., 2 database connections for 5 threads).',
        solution: 'Observe that exactly the number of semaphore slots (2) can enter the Critical Section simultaneously, while others wait.',
        config: {
            algorithm: 'SEMAPHORE',
            numThreads: 5,
            semaphoreMax: 2
        }
    },
    {
        id: 'mutex-semaphore-binary',
        type: 'mutex',
        title: 'Binary Semaphore (Mutex Mode)',
        purpose: 'Demonstrates a semaphore initialized to 1 acting identically to a mutual exclusion lock.',
        solution: 'Because the max value is 1, only 1 thread can ever enter at a time. It\'s functionally equivalent to a pure Mutex.',
        config: {
            algorithm: 'SEMAPHORE',
            numThreads: 4,
            semaphoreMax: 1
        }
    },
    {
        id: 'mutex-semaphore-barrier',
        type: 'mutex',
        title: 'Semaphore as a Barrier (Wide Open)',
        purpose: 'Shows a semaphore initialized to N letting all N threads in simultaneously, useful for throttling or rate-limiting.',
        solution: 'With max set to 8 for 8 threads, there is zero contention. They all enter and exit freely.',
        config: {
            algorithm: 'SEMAPHORE',
            numThreads: 8,
            semaphoreMax: 8
        }
    }
];
