
import React from 'react';
import { WikiIntro } from './content/WikiIntro';
import { WikiScheduler } from './content/WikiScheduler';
import { WikiConcurrency } from './content/WikiConcurrency';
import { WikiMemory } from './content/WikiMemory';
import { WikiSysCalls } from './content/WikiSysCalls';
import { WikiThreads } from './content/WikiThreads';
import { WikiDeadlocks } from './content/WikiDeadlocks';

export const WIKI_NAVIGATION = [
    {
        title: "Kernel Fundamentals",
        items: [
            {
                id: 'intro',
                title: 'Introduction',
                path: '/algo-wiki',
                component: <WikiIntro />,
                description: "Operating System basics and the Von Neumann architecture."
            },
            {
                id: 'syscalls',
                title: 'System Calls',
                path: '/algo-wiki/syscalls',
                component: <WikiSysCalls />,
                description: "The interface between user applications and the kernel."
            }
        ]
    },
    {
        title: "Process Management",
        items: [
            {
                id: 'scheduling',
                title: 'CPU Scheduling',
                path: '/algo-wiki/scheduling',
                component: <WikiScheduler />,
                description: "FCFS, SJF, Round Robin, and Priority Scheduling algorithms explained."
            },
            {
                id: 'threads',
                title: 'Threads & Processes',
                path: '/algo-wiki/threads',
                component: <WikiThreads />,
                description: "PCB, Context Switching, and Thread models."
            }
        ]
    },
    {
        title: "Concurrency",
        items: [
            {
                id: 'synchronization',
                title: 'Synchronization',
                path: '/algo-wiki/synchronization',
                component: <WikiConcurrency />,
                description: "Mutexes, Semaphores, and the Critical Section Problem."
            },
            {
                id: 'deadlocks',
                title: 'Deadlocks',
                path: '/algo-wiki/deadlocks',
                component: <WikiDeadlocks />,
                description: "Deadlock detection, prevention, and the Banker's Algorithm."
            }
        ]
    },
    {
        title: "Memory Management",
        items: [
            {
                id: 'virtual-memory',
                title: 'Virtual Memory',
                path: '/algo-wiki/memory',
                component: <WikiMemory />,
                description: "Paging, Segmentation, and the Translation Lookaside Buffer (TLB)."
            }
        ]
    }
];
