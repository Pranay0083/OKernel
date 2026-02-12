import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { CheckCircle2, Circle, Clock, Lock, Database, Cpu, Network } from 'lucide-react';

export const Roadmap = () => {
    const steps = [
        {
            title: 'CPU Scheduling \u0026 SysCore Engine',
            description: 'Core visualization engine + SysCore Engine 2 (VM Integration).',
            status: 'completed',
            date: 'Q1 2026',
            icon: <Cpu size={20} />,
        },
        {
            title: 'Memory Virtualization',
            description: 'Physical RAM Inspection (1MB Heap/Stack Visualization).',
            status: 'completed',
            date: 'Q1 2026',
            icon: <Database size={20} />,
        },
        {
            title: 'Process Synchronization',
            description: 'Visualizing locks, semaphores, and concurrency problems (Dining Philosophers).',
            status: 'in-progress',
            date: 'Q2 2026',
            icon: <Lock size={20} />,
        },
        {
            title: 'Distributed Systems',
            description: 'Raft consensus visualization and network partitioning simulations.',
            status: 'planned',
            date: 'Q4 2026',
            icon: <Network size={20} />,
        },
    ];

    return (
        <Layout>
            <div className="container mx-auto px-4 pt-12 pb-20 max-w-4xl">
                <div className="mb-12 border-b border-border pb-6">
                    <h1 className="text-3xl font-bold font-mono tracking-tight mb-2">product_roadmap.md</h1>
                    <p className="text-muted-foreground font-mono text-sm">
                        &gt; Visualizing the future of computer science education.
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-px bg-border" />

                    <div className="space-y-12">
                        {steps.map((step, index) => (
                            <div key={index} className="relative pl-16 group">
                                {/* Timeline Node */}
                                <div className={`absolute left-[21px] top-1 w-3 h-3 rounded-full border-2 z-10 bg-background ${step.status === 'completed' ? 'border-primary bg-primary' :
                                    step.status === 'in-progress' ? 'border-blue-500 animate-pulse' :
                                        'border-muted-foreground'
                                    }`} />

                                <Card className="p-6 relative border-l-4 border-l-transparent hover:border-l-primary transition-all">
                                    <div className="absolute top-6 right-6 font-mono text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                        {step.date}
                                    </div>

                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${step.status === 'completed' ? 'bg-primary/10 text-primary' :
                                            step.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-secondary text-muted-foreground'
                                            }`}>
                                            {step.icon}
                                        </div>
                                        <h3 className="text-xl font-bold">{step.title}</h3>
                                    </div>

                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        {step.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
                                        {step.status === 'completed' ? (
                                            <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={12} /> Live</span>
                                        ) : step.status === 'in-progress' ? (
                                            <span className="text-blue-500 flex items-center gap-1"><Clock size={12} /> In Development</span>
                                        ) : (
                                            <span className="text-muted-foreground flex items-center gap-1"><Circle size={12} /> Planned</span>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suggest Feature CTA */}
                <div className="mt-16 text-center p-8 border border-dashed border-border rounded-lg bg-secondary/20">
                    <h3 className="font-bold mb-2">Have a suggestion?</h3>
                    <p className="text-muted-foreground text-sm mb-4">We are open source. Contribute on GitHub or suggest a feature.</p>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-mono">
                        git push origin feature/new-idea -&gt;
                    </a>
                </div>
            </div>
        </Layout>
    );
};
