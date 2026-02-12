
import React from 'react';
import { Layout, Globe, Code2, Power } from 'lucide-react';
import { ArchIntro } from './content/ArchIntro';
import { ArchPhilosophies } from './content/ArchPhilosophies';
import { ArchLanguages } from './content/ArchLanguages';
import { ArchBoot } from './content/ArchBoot';

export const ARCH_NAVIGATION = [
    {
        title: "System Architecture",
        items: [
            {
                id: 'intro',
                title: 'Kernel Models',
                path: '/os-concepts',
                icon: <Layout size={16} />,
                component: <ArchIntro />,
                description: "Monolithic, Microkernel, and Hybrid architectures compared."
            },
            {
                id: 'philosophies',
                title: 'Design Philosophies',
                path: '/os-concepts/philosophies',
                icon: <Globe size={16} />,
                component: <ArchPhilosophies />,
                description: "Unix's 'Everything is a File' vs Windows' Object Manager."
            },
            {
                id: 'languages',
                title: 'Kernel Languages',
                path: '/os-concepts/languages',
                icon: <Code2 size={16} />,
                component: <ArchLanguages />,
                description: "C dominance and the rise of Rust in the kernel."
            },
            {
                id: 'boot',
                title: 'Boot Process',
                path: '/os-concepts/boot',
                icon: <Power size={16} />,
                component: <ArchBoot />,
                description: "From BIOS/UEFI to PID 1."
            }
        ]
    }
];
