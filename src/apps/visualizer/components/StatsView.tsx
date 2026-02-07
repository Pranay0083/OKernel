
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, Zap, Database, Server, Activity, ArrowRight } from 'lucide-react';

interface StatsViewProps {
    history: any[];
}

const COLORS = {
    MEM_READ: '#3b82f6', // blue
    MEM_WRITE: '#ef4444', // red
    ALU: '#10b981',       // green
    CONTROL: '#f59e0b',   // amber
    STACK: '#8b5cf6',     // purple
    FUNCTION: '#ec4899',  // pink
    OTHER: '#71717a'      // zinc
};

export function StatsView({ history }: StatsViewProps) {
    const stats = useMemo(() => {
        let totalCycles = 0;
        let instructionCount = 0;
        let memReads = 0;
        let memWrites = 0;
        let aluOps = 0;
        let branches = 0;

        const typeCounts: Record<string, number> = {};

        history.forEach(event => {
            if (event.hardware) {
                totalCycles += event.hardware.cost;
                instructionCount++;

                const type = event.hardware.type;
                typeCounts[type] = (typeCounts[type] || 0) + 1;

                if (type === 'MEM_READ') memReads++;
                if (type === 'MEM_WRITE') memWrites++;
                if (type === 'ALU') aluOps++;
                if (type === 'CONTROL') branches++;
            }
        });

        const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

        return {
            totalCycles,
            instructionCount,
            memReads,
            memWrites,
            aluOps,
            branches,
            pieData,
            cpi: instructionCount > 0 ? (totalCycles / instructionCount).toFixed(2) : "0.00"
        };
    }, [history]);

    // Instruction Stream (Last 50 items)
    const stream = history.filter(e => e.hardware).slice(-50).reverse();

    return (
        <div className="h-full w-full bg-[#0a0a0a] text-zinc-300 p-6 overflow-y-auto font-mono">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Cpu className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Hardware Inspector</h2>
                        <p className="text-xs text-zinc-500">MACHINE SYMPATHY DASHBOARD</p>
                    </div>
                </div>
                <div className="flex space-x-6 text-sm">
                    <div className="text-right">
                        <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Total Cycles</div>
                        <div className="text-2xl font-bold text-white">{stats.totalCycles.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Instructions</div>
                        <div className="text-2xl font-bold text-emerald-400">{stats.instructionCount.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Avg CPI</div>
                        <div className="text-2xl font-bold text-blue-400">{stats.cpi}</div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* 1. The Chip (Instruction Mix) */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-sm font-semibold text-zinc-300">Instruction Mix</h3>
                    </div>
                    <div className="flex-1 min-h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    nameKey="name"
                                    stroke="none"
                                    isAnimationActive={false}
                                >
                                    {stats.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.OTHER} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e4e4e7' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Label */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <div className="text-xs text-zinc-500">OPS</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] mt-4">
                        {stats.pieData.map((entry) => (
                            <div key={entry.name} className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] || COLORS.OTHER }} />
                                    <span>{entry.name}</span>
                                </div>
                                <span className="font-mono text-white">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. The Pipeline (Tape) */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex flex-col h-[350px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <ArrowRight className="w-4 h-4 text-zinc-500" />
                            <h3 className="text-sm font-semibold text-zinc-300">Execution Pipeline</h3>
                        </div>
                        <div className="text-xs text-zinc-500">LATEST 50 INSTRUCTIONS</div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                        {stream.map((evt, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 text-xs p-1.5 rounded bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors">
                                <div className="col-span-1 text-zinc-500 font-mono text-[10px]">#{stream.length - idx}</div>
                                <div className="col-span-2 font-mono text-purple-400 truncate" title={evt.function}>{evt.function}()</div>
                                <div className="col-span-1 text-zinc-600 font-mono">:{evt.line}</div>
                                <div className="col-span-3 font-mono text-white truncate" title={evt.hardware?.opcode}>{evt.hardware?.opcode}</div>
                                <div className="col-span-2">
                                    <span
                                        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                                        style={{
                                            backgroundColor: `${COLORS[evt.hardware?.type as keyof typeof COLORS]}20`,
                                            color: COLORS[evt.hardware?.type as keyof typeof COLORS]
                                        }}
                                    >
                                        {evt.hardware?.type}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right text-zinc-400 font-mono text-[10px]">
                                    {evt.hardware?.cost} cycles
                                </div>
                            </div>
                        ))}
                        {stream.length === 0 && (
                            <div className="text-center text-zinc-600 py-10">
                                No instructions recorded. Run code to see the pipeline.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Memory & Bus */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <Database className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-sm font-semibold text-zinc-300">Memory Bus</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-zinc-400">
                                <span>Reads ({stats.memReads})</span>
                                <span>{Math.round((stats.memReads / (stats.instructionCount || 1)) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.memReads / (stats.instructionCount || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-zinc-400">
                                <span>Writes ({stats.memWrites})</span>
                                <span>{Math.round((stats.memWrites / (stats.instructionCount || 1)) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-red-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.memWrites / (stats.instructionCount || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <Zap className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-sm font-semibold text-zinc-300">Processing Unit</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800/50 rounded p-3 text-center border border-white/5">
                            <div className="text-2xl font-bold text-emerald-400">{stats.aluOps}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">ALU Operations</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded p-3 text-center border border-white/5">
                            <div className="text-2xl font-bold text-amber-400">{stats.branches}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Control Flow</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
