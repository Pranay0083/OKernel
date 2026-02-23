import React from 'react';
import { Process, AlgorithmType } from '../../../core/types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    queue: number[];
    processes: Process[];
    algorithm?: AlgorithmType;
    mlfqQueues?: number[][];
    mlfqQuantums?: number[];
}

const QUEUE_LEVEL_COLORS = [
    { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-400', dot: 'bg-red-500', label: 'HIGH PRIORITY' },
    { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', dot: 'bg-amber-500', label: 'MED PRIORITY' },
    { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-400', dot: 'bg-blue-500', label: 'LOW PRIORITY' },
    { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-400', dot: 'bg-purple-500', label: 'BASELINE' },
    { border: 'border-zinc-500/30', bg: 'bg-zinc-500/5', text: 'text-zinc-400', dot: 'bg-zinc-500', label: 'LOWEST' },
];

const ProcessCard: React.FC<{ process: Process; index: number; showQueueLevel?: boolean }> = ({ process, index, showQueueLevel }) => {
    const address = `0x${(1024 + (index * 64)).toString(16).toUpperCase().padStart(4, '0')}`;

    return (
        <motion.div
            key={process.id}
            layoutId={`process-${process.id}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative bg-zinc-950 border border-zinc-800 hover:border-primary/50 group transition-colors overflow-hidden rounded-sm"
        >
            {/* Header: Address */}
            <div className="bg-zinc-900/80 px-2 py-1 flex justify-between items-center border-b border-zinc-800">
                <span className="text-[9px] text-zinc-600 font-mono">{address}</span>
                {showQueueLevel ? (
                    <span className={`text-[8px] font-bold ${QUEUE_LEVEL_COLORS[process.queueLevel]?.text ?? 'text-zinc-500'}`}>
                        Q{process.queueLevel}
                    </span>
                ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${process.priority <= 2 ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' :
                        process.priority <= 4 ? 'bg-orange-500' :
                            'bg-blue-500'
                        }`}></div>
                )}
            </div>

            {/* Body: Data */}
            <div className="p-2 space-y-1">
                <div className="flex justify-between items-end">
                    <span className="text-white font-bold text-sm">{process.name}</span>
                    <span className="text-[9px] text-zinc-500">P{process.priority}</span>
                </div>

                {/* Data Visual */}
                <div className="flex gap-0.5 h-1.5 w-full mt-1 opacity-50">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={`flex-1 rounded-[1px] ${i < (process.priority + 2) ? 'bg-zinc-600 group-hover:bg-primary' : 'bg-zinc-900'}`}></div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-900 text-[9px] text-zinc-500">
                    <div>BT: <span className="text-zinc-300">{process.burstTime}</span></div>
                    <div>REM: <span className="text-zinc-300">{process.remainingTime}</span></div>
                </div>
            </div>

            {/* Corner decorative */}
            <div className="absolute top-0 right-0 w-2 h-2 border-l border-b border-zinc-800 bg-zinc-950"></div>
        </motion.div>
    );
};

export const ReadyQueue: React.FC<Props> = ({ queue, processes, algorithm, mlfqQueues, mlfqQuantums }) => {
    const isMLFQ = algorithm === 'MLFQ' && mlfqQueues;

    return (
        <div className="h-full flex flex-col font-mono text-xs bg-black p-4 overflow-hidden relative">
            {/* Cyberpunk Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.5)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-3 border-b border-zinc-900 pb-2 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary animate-pulse rounded-full"></div>
                    <span className="text-zinc-400 font-bold">{isMLFQ ? 'MLFQ_BUFFER' : 'MEM_BUFFER'}</span>
                </div>
                <span className="text-zinc-600 bg-zinc-900 px-2 rounded text-[10px]">
                    {isMLFQ ? `${mlfqQueues.length} QUEUES` : 'ADDR: 0x0000 - 0xFFFF'}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar z-10 pr-2">
                {isMLFQ ? (
                    // ── MLFQ: Multi-level queue view ──
                    <div className="space-y-3">
                        {mlfqQueues.map((levelQueue, level) => {
                            const colors = QUEUE_LEVEL_COLORS[level] ?? QUEUE_LEVEL_COLORS[QUEUE_LEVEL_COLORS.length - 1];
                            const quantum = mlfqQuantums?.[level] ?? '∞';
                            return (
                                <div key={level} className={`border ${colors.border} rounded-md overflow-hidden ${colors.bg}`}>
                                    {/* Queue Level Header */}
                                    <div className="px-3 py-1.5 flex justify-between items-center border-b border-zinc-800/50">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${level === 0 ? 'animate-pulse' : ''}`}></div>
                                            <span className={`font-bold text-[10px] ${colors.text}`}>
                                                Q{level}
                                            </span>
                                            <span className="text-zinc-600 text-[9px]">
                                                {colors.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-600 text-[9px]">
                                                {level < mlfqQueues.length - 1 ? `RR q=${quantum}` : 'FCFS'}
                                            </span>
                                            <span className={`text-[9px] px-1 rounded ${levelQueue.length > 0 ? colors.text + ' bg-white/5' : 'text-zinc-700'}`}>
                                                {levelQueue.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Queue Contents */}
                                    <div className="p-2">
                                        {levelQueue.length === 0 ? (
                                            <div className="h-10 flex items-center justify-center text-zinc-800 border border-dashed border-zinc-800/50 rounded text-[10px]">
                                                EMPTY
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                                <AnimatePresence mode="popLayout">
                                                    {levelQueue.map((id, idx) => {
                                                        const process = processes.find(p => p.id === id);
                                                        if (!process) return null;
                                                        return <ProcessCard key={id} process={process} index={idx} showQueueLevel />;
                                                    })}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // ── Standard flat queue view ──
                    <div className="content-start grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        <AnimatePresence mode="popLayout">
                            {queue.length === 0 && (
                                <div className="col-span-full h-24 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-900 rounded-lg">
                                    <span className="font-bold text-lg opacity-50">NULL POINTER</span>
                                    <span className="text-[10px]">BUFFER IS EMPTY</span>
                                </div>
                            )}
                            {queue.map((id, index) => {
                                const process = processes.find(p => p.id === id);
                                if (!process) return null;
                                return <ProcessCard key={id} process={process} index={index} />;
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};
