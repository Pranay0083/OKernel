import React from 'react';
import { WikiIntro } from './content/WikiIntro';
import { WikiProcesses } from './content/WikiProcesses';
import { WikiScheduler } from './content/WikiScheduler';
import { WikiConcurrency } from './content/WikiConcurrency';
import { WikiSemaphores } from './content/WikiSemaphores';
import { WikiMonitors } from './content/WikiMonitors';
import { WikiDeadlocks } from './content/WikiDeadlocks';
import { WikiMainMemory } from './content/WikiMainMemory';
import { WikiMassStorage } from './content/WikiMassStorage';
import { WikiFileSystems } from './content/WikiFileSystems';
import { WikiIO } from './content/WikiIO';
import { WikiSecurity } from './content/WikiSecurity';
import { WikiDistributed } from './content/WikiDistributed';
// We'll keep these imports if they still exist, but we will focus the nav on what we just built
import { WikiVirtualMemory } from './content/WikiMemory';
import { WikiThreads } from './content/WikiThreads';

export const WIKI_NAVIGATION = [
    {
        title: "Kernel Fundamentals",
        items: [
            {
                id: 'intro',
                title: 'Introduction',
                path: '/algo-wiki',
                component: <WikiIntro />,
                description: "Operating System basics, Kernel Architectures, and Dual-Mode Operation."
            }
        ]
    },
    {
        title: "Process Management",
        items: [
            {
                id: 'processes',
                title: 'Processes & Threads',
                path: '/algo-wiki/processes',
                component: <WikiProcesses />,
                description: "Process Control Blocks, State Machines, and Threading Models."
            },
            {
                id: 'threads',
                title: 'Threads & Concurrency',
                path: '/algo-wiki/threads',
                component: <WikiThreads />,
            },
            {
                id: 'scheduling',
                title: 'CPU Scheduling',
                path: '/algo-wiki/scheduling',
                component: <WikiScheduler />,
                description: "FCFS, SJF, SRTF, Round Robin, and MLFQ algorithms."
            }
        ]
    },
    {
        title: "Synchronization",
        items: [
            {
                id: 'concurrency',
                title: 'Data Inconsistency & Mutual Exclusion',
                path: '/algo-wiki/concurrency',
                component: <WikiConcurrency />,
            },
            {
                id: 'semaphores',
                title: 'Semaphores & Classic Problems',
                path: '/algo-wiki/semaphores',
                component: <WikiSemaphores />,
            },
            {
                id: 'monitors',
                title: 'Monitors & Condition Variables',
                path: '/algo-wiki/monitors',
                component: <WikiMonitors />,
                description: "Dining Philosophers, Deadlock Conditions, and Monitors."
            },
            {
                id: 'deadlocks',
                title: 'Deadlock Architectures',
                path: '/algo-wiki/deadlocks',
                component: <WikiDeadlocks />,
            }
        ]
    },
    {
        title: "Memory Management",
        items: [
            {
                id: 'main-memory',
                title: 'Main Memory Hardware',
                path: '/algo-wiki/main-memory',
                component: <WikiMainMemory />,
            },
            {
                id: 'memory',
                title: 'Virtual Memory Theory',
                path: '/algo-wiki/memory',
                component: <WikiVirtualMemory />,
            }
        ]
    },
    {
        title: "Storage & I/O",
        items: [
            {
                id: 'mass-storage',
                title: 'Disk Architecture & RAID',
                path: '/algo-wiki/mass-storage',
                component: <WikiMassStorage />,
            },
            {
                id: 'file-systems',
                title: 'File System Architectures',
                path: '/algo-wiki/file-systems',
                component: <WikiFileSystems />,
            },
            {
                id: 'io-management',
                title: 'I/O Hardware & DMA',
                path: '/algo-wiki/io-management',
                component: <WikiIO />,
            }
        ]
    },
    {
        title: "Advanced Topics",
        items: [
            {
                id: 'security',
                title: 'Protection & Security',
                path: '/algo-wiki/security',
                component: <WikiSecurity />,
            },
            {
                id: 'distributed',
                title: 'Distributed Consensus',
                path: '/algo-wiki/distributed',
                component: <WikiDistributed />,
            }
        ]
    }
];
