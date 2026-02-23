import React from 'react';
import { MutexSimState, MutexAlgorithm } from '../../../syscore/mutex/types';
import { motion } from 'framer-motion';
import { Lock, Unlock, Check, X, Clock } from 'lucide-react';

interface Props {
    state: MutexSimState;
}

const RegisterBox: React.FC<{ label: string; value: string; color?: string; active?: boolean; sublabel?: string }> = ({ label, value, color = '#a1a1aa', active = false, sublabel }) => (
    <div className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${active ? 'border-green-700 bg-green-900/10' : 'border-zinc-800 bg-black/50'} transition-all duration-300 min-w-[60px]`}>
        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">{label}</span>
        <motion.span
            key={value}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-lg font-mono font-bold leading-none"
            style={{ color }}
        >
            {value}
        </motion.span>
        {sublabel && <span className="text-[7px] text-zinc-700">{sublabel}</span>}
    </div>
);

const LockIndicator: React.FC<{ locked: boolean; holderName: string | null; algorithm: MutexAlgorithm }> = ({ locked, holderName, algorithm }) => (
    <div className="flex flex-col items-center gap-3">
        <div className="text-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                {algorithm === 'TAS' ? 'ATOMIC LOCK (testAndSet)' : 'ATOMIC LOCK (compareAndSwap)'}
            </span>
        </div>
        <motion.div
            animate={{
                backgroundColor: locked ? '#ef4444' : '#22c55e',
                boxShadow: locked ? '0 0 30px rgba(239, 68, 68, 0.3)' : '0 0 30px rgba(34, 197, 94, 0.3)',
            }}
            className="w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 gap-0.5"
            style={{ borderColor: locked ? '#991b1b' : '#166534' }}
        >
            <span className="text-xs font-black text-white tracking-wider">{locked ? 'HELD' : 'FREE'}</span>
            {locked ? <Lock size={12} className="text-white/70" /> : <Unlock size={12} className="text-white/70" />}
        </motion.div>
        {locked && holderName && (
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-red-400 font-bold"
            >
                Held by: <span className="text-white">{holderName}</span>
            </motion.div>
        )}
        {!locked && (
            <div className="text-[10px] text-green-600">Available for acquisition</div>
        )}
        {/* Pseudocode */}
        <div className="bg-black/60 rounded border border-zinc-800 p-2 text-[9px] text-zinc-500 font-mono leading-relaxed max-w-[200px]">
            {algorithm === 'TAS' ? (
                <>
                    <div><span className="text-blue-400">while</span> <span className="text-amber-400">testAndSet</span>(&lock)</div>
                    <div className="pl-3 text-zinc-600">; // spin-wait</div>
                    <div className="text-green-500">// → enter CS</div>
                    <div className="text-purple-400 mt-1">lock = <span className="text-zinc-400">false</span> // exit</div>
                </>
            ) : (
                <>
                    <div><span className="text-blue-400">while</span> !<span className="text-amber-400">CAS</span>(&lock, 0, 1)</div>
                    <div className="pl-3 text-zinc-600">; // spin-wait</div>
                    <div className="text-green-500">// → enter CS</div>
                    <div className="text-purple-400 mt-1">lock = <span className="text-zinc-400">0</span> // exit</div>
                </>
            )}
        </div>
    </div>
);

const SemaphoreGauge: React.FC<{ value: number; max: number; activeNames: string[] }> = ({ value, max, activeNames }) => {
    const percentage = (value / max) * 100;
    return (
        <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SEMAPHORE COUNTER</span>
            <div className="relative w-20 h-20 rounded-full border-2 border-zinc-800 bg-black/50 flex items-center justify-center overflow-hidden">
                <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600/40 to-purple-400/10"
                    animate={{ height: `${percentage}%` }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                />
                <div className="relative z-10 flex flex-col items-center">
                    <span className="text-2xl font-black text-purple-400 font-mono">{value}</span>
                    <span className="text-[8px] text-zinc-600 font-bold">/ {max}</span>
                </div>
            </div>
            {activeNames.length > 0 && (
                <div className="text-[10px] text-green-400 font-bold text-center">
                    In CS: {activeNames.join(', ')}
                </div>
            )}
            {activeNames.length === 0 && (
                <div className="text-[10px] text-zinc-600">No threads in CS</div>
            )}
            {/* Pseudocode */}
            <div className="bg-black/60 rounded border border-zinc-800 p-2 text-[9px] text-zinc-500 font-mono leading-relaxed max-w-[200px]">
                <div className="flex items-center gap-1.5"><span className="text-amber-400">wait</span>(S): <span className="text-blue-400">if</span> S{'>'} 0 → S-- <Check size={8} className="text-green-500" /></div>
                <div className="pl-[4.5em] flex items-center gap-1.5"><span className="text-blue-400">else</span> → block <X size={8} className="text-red-500" /></div>
                <div className="mt-1"><span className="text-purple-400">signal</span>(S): S++ → wake</div>
            </div>
        </div>
    );
};

export const SharedMemory: React.FC<Props> = ({ state }) => {
    const { algorithm, shared, threads, activeThreadIds } = state;

    // Find who holds the lock (for TAS/CAS display)
    const holderName = activeThreadIds.length > 0
        ? threads.find(t => t.id === activeThreadIds[0])?.name ?? null
        : null;

    const activeNames = activeThreadIds
        .map(id => threads.find(t => t.id === id)?.name)
        .filter(Boolean) as string[];

    return (
        <div className="h-full w-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Shared Memory</span>
                <span className="text-[9px] text-zinc-700 font-mono">addr: 0xFFFF_0000</span>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">

                {/* Peterson / Dekker */}
                {(algorithm === 'PETERSON' || algorithm === 'DEKKER') && (
                    <>
                        <div className="flex flex-col gap-2 items-center">
                            <span className="text-[10px] text-zinc-500 font-bold">
                                {algorithm === 'PETERSON' ? "PETERSON'S FLAGS" : "DEKKER'S FLAGS"}
                            </span>
                            <div className="text-[9px] text-zinc-600 text-center mb-1">
                                flag[i] = true → "I want to enter CS"
                            </div>
                            <div className="flex gap-2">
                                {shared.flags.map((f, i) => {
                                    const threadName = threads[i]?.name ?? `T${i}`;
                                    return (
                                        <RegisterBox
                                            key={i}
                                            label={`${threadName}`}
                                            value={f ? 'WANT' : 'NO'}
                                            color={f ? '#f59e0b' : '#52525b'}
                                            active={f}
                                            sublabel={`flag[${i}]`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <div className="w-24 h-px bg-zinc-800"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="text-[9px] text-zinc-600 text-center">
                                turn = who yields priority
                            </div>
                            <RegisterBox
                                label="TURN"
                                value={`→ ${threads[shared.turn]?.name ?? `T${shared.turn}`}`}
                                color="#3b82f6"
                                sublabel={`defers to ${threads[shared.turn]?.name ?? '?'}`}
                            />
                        </div>
                        {/* Pseudocode */}
                        <div className="bg-black/60 rounded border border-zinc-800 p-2 text-[9px] text-zinc-500 font-mono leading-relaxed max-w-[220px]">
                            <div>flag[i] = <span className="text-amber-400">true</span></div>
                            <div>turn = <span className="text-blue-400">other</span></div>
                            <div><span className="text-blue-400">while</span> flag[other] && turn==other</div>
                            <div className="pl-3 text-zinc-600">; // wait</div>
                            <div className="text-green-500">// → enter CS</div>
                            <div className="text-purple-400 mt-1">flag[i] = <span className="text-zinc-400">false</span> // exit</div>
                        </div>
                    </>
                )}

                {/* Bakery */}
                {algorithm === 'BAKERY' && (
                    <>
                        <span className="text-[10px] text-zinc-500 font-bold">BAKERY TICKETS</span>
                        <div className="text-[9px] text-zinc-600 text-center">
                            Each thread takes a ticket — lowest number goes first
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-center">
                            {shared.tickets.map((t, i) => {
                                const threadName = threads[i]?.name ?? `T${i}`;
                                const isChoosing = shared.choosing[i];
                                return (
                                    <RegisterBox
                                        key={i}
                                        label={threadName}
                                        value={isChoosing ? '...' : t === 0 ? '0' : `#${t}`}
                                        color={isChoosing ? '#f59e0b' : t > 0 ? '#a78bfa' : '#52525b'}
                                        active={t > 0}
                                        sublabel={isChoosing ? 'choosing' : `ticket[${i}]`}
                                    />
                                );
                            })}
                        </div>
                        <div className="bg-black/60 rounded border border-zinc-800 p-2 text-[9px] text-zinc-500 font-mono leading-relaxed max-w-[220px]">
                            <div>ticket[i] = max(tickets) + 1</div>
                            <div><span className="text-blue-400">wait until</span> my ticket is lowest</div>
                            <div className="text-green-500">// → enter CS</div>
                            <div className="text-purple-400 mt-1">ticket[i] = <span className="text-zinc-400">0</span> // done</div>
                        </div>
                    </>
                )}

                {/* TAS / CAS */}
                {(algorithm === 'TAS' || algorithm === 'CAS') && (
                    <LockIndicator locked={shared.lock} holderName={holderName} algorithm={algorithm} />
                )}

                {/* Semaphore */}
                {algorithm === 'SEMAPHORE' && (
                    <SemaphoreGauge value={shared.semaphore} max={shared.semaphoreMax} activeNames={activeNames} />
                )}
            </div>
        </div>
    );
};
