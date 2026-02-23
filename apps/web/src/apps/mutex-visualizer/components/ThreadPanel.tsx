import React from 'react';
import { MutexThread, ThreadState } from '../../../syscore/mutex/types';
import { motion } from 'framer-motion';

interface Props {
    threads: MutexThread[];
    activeThreadIds: number[];
}

const STATE_CONFIG: Record<ThreadState, { label: string; color: string; bgClass: string; borderClass: string; icon: string }> = {
    IDLE: { label: 'IDLE', color: '#52525b', bgClass: 'bg-zinc-900/30', borderClass: 'border-zinc-800', icon: '○' },
    WANTING: { label: 'WANT', color: '#f59e0b', bgClass: 'bg-amber-900/10', borderClass: 'border-amber-800/50', icon: '◎' },
    ENTERING: { label: 'SPIN', color: '#f97316', bgClass: 'bg-orange-900/10', borderClass: 'border-orange-800/50', icon: '↻' },
    IN_CS: { label: 'IN CS', color: '#22c55e', bgClass: 'bg-green-900/15', borderClass: 'border-green-700', icon: '●' },
    EXITING: { label: 'EXIT', color: '#a78bfa', bgClass: 'bg-purple-900/10', borderClass: 'border-purple-800/50', icon: '◇' },
};

const ThreadCard: React.FC<{ thread: MutexThread; isActive: boolean }> = ({ thread, isActive }) => {
    const config = STATE_CONFIG[thread.state];
    const csProgress = thread.csExecutionTime > 0
        ? ((thread.csExecutionTime - thread.csRemaining) / thread.csExecutionTime) * 100
        : 0;

    return (
        <motion.div
            layout="position"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative rounded-lg border-2 ${config.borderClass} ${config.bgClass} p-3 flex flex-col gap-2 overflow-hidden transition-colors duration-300`}
            style={{
                boxShadow: isActive ? `0 0 25px -5px ${thread.color}30` : 'none',
                minHeight: '130px',
            }}
        >
            {/* Active pulse ring */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 rounded-lg border-2"
                    style={{ borderColor: thread.color }}
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: thread.color }} />
                    <span className="text-sm font-black text-white tracking-wider">{thread.name}</span>
                </div>
                <span
                    className="text-[10px] px-2 py-0.5 rounded border font-bold tracking-wider flex items-center gap-1"
                    style={{
                        color: config.color,
                        borderColor: `${config.color}40`,
                        backgroundColor: `${config.color}15`,
                    }}
                >
                    <span>{config.icon}</span>
                    {config.label}
                </span>
            </div>

            {/* CS Progress — always visible, fixed height */}
            <div className="h-6">
                <div className="flex justify-between text-[8px] font-bold mb-0.5" style={{ color: thread.state === 'IN_CS' ? config.color : '#3f3f46' }}>
                    <span>{thread.state === 'IN_CS' ? 'EXECUTING CRITICAL SECTION' : 'CS IDLE'}</span>
                    <span>{thread.state === 'IN_CS' ? `${Math.round(csProgress)}%` : '—'}</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: thread.state === 'IN_CS' ? thread.color : '#27272a' }}
                        animate={{ width: thread.state === 'IN_CS' ? `${csProgress}%` : '0%' }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-1">
                <div className="bg-black/40 rounded px-2 py-1 text-center">
                    <div className="text-[7px] text-zinc-600 font-bold uppercase">CS Entries</div>
                    <div className="text-xs font-mono font-bold text-zinc-300">{thread.csCount}</div>
                </div>
                <div className="bg-black/40 rounded px-2 py-1 text-center">
                    <div className="text-[7px] text-zinc-600 font-bold uppercase">Wait Ticks</div>
                    <div className="text-xs font-mono font-bold text-zinc-300">{thread.totalWaitTicks}</div>
                </div>
                <div className="bg-black/40 rounded px-2 py-1 text-center">
                    <div className="text-[7px] text-zinc-600 font-bold uppercase">Spinning</div>
                    <div className={`text-xs font-mono font-bold ${thread.state === 'ENTERING' ? 'text-orange-400' : 'text-zinc-600'}`}>
                        {thread.state === 'ENTERING' ? `${thread.waitTicks}t` : '—'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const ThreadPanel: React.FC<Props> = ({ threads, activeThreadIds }) => {
    const cols = threads.length <= 2 ? 'grid-cols-2'
        : threads.length <= 4 ? 'grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-2 lg:grid-cols-4';

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Thread Pool</span>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 text-[8px] text-zinc-600">
                        <span>○ idle</span>
                        <span className="text-amber-600">◎ want</span>
                        <span className="text-orange-500">↻ spin</span>
                        <span className="text-green-500">● in cs</span>
                        <span className="text-purple-400">◇ exit</span>
                    </div>
                    <span className="text-[9px] text-zinc-700 font-mono">
                        active: {activeThreadIds.length}/{threads.length}
                    </span>
                </div>
            </div>
            <div className={`flex-1 grid ${cols} gap-2 p-3 content-start overflow-y-auto custom-scrollbar`}>
                {threads.map(t => (
                    <ThreadCard key={t.id} thread={t} isActive={activeThreadIds.includes(t.id)} />
                ))}
            </div>
        </div>
    );
};
