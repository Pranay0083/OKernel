import React from 'react';
import { Cpu, BarChart, Clock, List } from 'lucide-react';

export const SchedulerModulePage = () => {
    return (
        <div className="space-y-12 max-w-4xl animate-fade-in pb-20">
             <div className="space-y-6 border-b border-zinc-800 pb-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded-full border border-blue-500/20">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Module
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">CPU Scheduler</h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    A visual environment for comparing process scheduling algorithms.
                    Watch how the OS kernel decides which process gets the CPU next.
                </p>
            </div>

            {/* Overview */}
            <div className="space-y-4" id="overview">
                <h2 className="text-2xl font-bold text-white">Overview</h2>
                <p className="text-zinc-400 leading-relaxed">
                    The Scheduler module simulates a single-core CPU. You can submit processes with different properties (Arrival Time, Burst Time, Priority) and observe how different algorithms handle the queue.
                </p>
            </div>

            {/* Algorithms */}
            <div className="space-y-8" id="algorithms">
                <h2 className="text-2xl font-bold text-white">Supported Algorithms</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AlgoCard 
                        title="First Come First Serve (FCFS)" 
                        code="FCFS"
                        desc="The simplest algorithm. Processes are executed in the exact order they arrive. Non-preemptive."
                        pros="Simple, fair."
                        cons="Convoy Effect (short processes wait for long ones)."
                    />
                    <AlgoCard 
                        title="Shortest Job First (SJF)" 
                        code="SJF"
                        desc="Selects the process with the smallest burst time. Can be preemptive (SRTF) or non-preemptive."
                        pros="Minimizes average waiting time."
                        cons="Requires knowing burst time in advance; Starvation."
                    />
                    <AlgoCard 
                        title="Round Robin (RR)" 
                        code="RR"
                        desc="Each process gets a small unit of CPU time (Time Quantum). If not finished, it goes to the back of the queue."
                        pros="Fair, responsive."
                        cons="Context switch overhead if Quantum is too small."
                    />
                     <AlgoCard 
                        title="Priority Scheduling" 
                        code="PRIO"
                        desc="Processes are assigned a priority number. The CPU is given to the process with the highest priority."
                        pros="Important tasks run first."
                        cons="Indefinite blocking (Starvation) of low priority tasks."
                    />
                </div>
            </div>

            {/* Metrics */}
             <div className="space-y-4" id="metrics">
                <h2 className="text-2xl font-bold text-white">Key Metrics</h2>
                <p className="text-zinc-400 mb-4">The visualizer automatically calculates these for every simulation run.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-green-400">
                            <Clock size={16} />
                            <span className="font-bold text-sm">Turnaround Time</span>
                        </div>
                        <p className="text-xs text-zinc-500">Completion Time - Arrival Time</p>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <BarChart size={16} />
                            <span className="font-bold text-sm">Waiting Time</span>
                        </div>
                        <p className="text-xs text-zinc-500">Turnaround Time - Burst Time</p>
                    </div>
                     <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                            <List size={16} />
                            <span className="font-bold text-sm">Context Switches</span>
                        </div>
                        <p className="text-xs text-zinc-500">Total times the CPU changed process</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlgoCard = ({ title, code, desc, pros, cons }: any) => (
    <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-colors group">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">{title}</h3>
            <span className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-zinc-500">{code}</span>
        </div>
        <p className="text-sm text-zinc-400 mb-4 h-16">{desc}</p>
        <div className="space-y-2 text-xs">
            <div className="flex gap-2">
                <span className="text-green-500 font-bold w-8">PROS</span>
                <span className="text-zinc-500">{pros}</span>
            </div>
            <div className="flex gap-2">
                <span className="text-red-500 font-bold w-8">CONS</span>
                <span className="text-zinc-500">{cons}</span>
            </div>
        </div>
    </div>
);
