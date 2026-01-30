import React from 'react';
import { Process } from '../../../core/types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    runningProcess: Process | undefined;
}

export const Cpu: React.FC<Props> = ({ runningProcess }) => {
    return (
        <div className="h-full w-full flex items-center justify-center p-4 bg-black border border-zinc-800 rounded-lg shadow-inner overflow-hidden relative">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-black to-black"></div>

            {/* The SOCKET (Container) */}
            <div className="aspect-square h-full max-h-[400px] w-auto relative flex items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800/50">

                {/* Gold Connectors (Pins) - positioned to bridge the gap */}
                {/* Left Pins */}
                <div className="absolute -left-1 top-8 bottom-8 flex flex-col justify-between py-4 w-4 z-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-600 to-yellow-500 rounded-l-full opacity-80"></div>
                    ))}
                </div>
                {/* Right Pins */}
                <div className="absolute -right-1 top-8 bottom-8 flex flex-col justify-between py-4 w-4 z-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-1 w-full bg-gradient-to-l from-transparent via-yellow-600 to-yellow-500 rounded-r-full opacity-80"></div>
                    ))}
                </div>
                {/* Top Pins */}
                <div className="absolute -top-1 left-8 right-8 flex justify-between px-4 h-4 z-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-1 h-full bg-gradient-to-b from-transparent via-yellow-600 to-yellow-500 rounded-t-full opacity-80"></div>
                    ))}
                </div>
                {/* Bottom Pins */}
                <div className="absolute -bottom-1 left-8 right-8 flex justify-between px-4 h-4 z-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-1 h-full bg-gradient-to-t from-transparent via-yellow-600 to-yellow-500 rounded-b-full opacity-80"></div>
                    ))}
                </div>

                {/* The CHIP (Active Content) */}
                <div className="w-[90%] h-[90%] relative z-10">
                    <AnimatePresence mode='wait'>
                        {runningProcess ? (
                            <motion.div
                                layoutId={`process-${runningProcess.id}`}
                                key={runningProcess.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full h-full bg-zinc-900 border-2 rounded-lg shadow-2xl overflow-hidden flex flex-col justify-between p-5"
                                style={{
                                    borderColor: runningProcess.color,
                                    boxShadow: `0 0 50px -10px ${runningProcess.color}30`
                                }}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start border-b border-white/5 pb-2">
                                    <div className="flex flex-col">
                                        <span className="text-zinc-500 font-bold text-[9px] tracking-widest uppercase">ID</span>
                                        <span className="text-xl font-mono text-white tracking-widest font-bold leading-none mt-1">
                                            {1000 + runningProcess.id}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-zinc-500 font-bold text-[9px] tracking-widest uppercase">PRI</span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${runningProcess.priority <= 2 ? 'bg-red-500 animate-pulse box-shadow-red' : 'bg-blue-500'}`}></div>
                                            <span className={`text-lg font-bold leading-none ${runningProcess.priority <= 2 ? 'text-red-500' : 'text-blue-500'}`}>
                                                P{runningProcess.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Core Identity (Compact) */}
                                <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                                    <div className="text-4xl font-black text-white tracking-tighter truncate max-w-full">
                                        {runningProcess.name}
                                    </div>
                                    <div className="text-[9px] text-zinc-600 mt-1 font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5">
                                        THREAD: 0x{(runningProcess.id * 1024).toString(16).toUpperCase().padStart(4, '0')}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-px bg-white/5 border border-white/5 rounded overflow-hidden mb-3">
                                    <div className="bg-zinc-900/80 p-2 text-center">
                                        <div className="text-[8px] text-zinc-500 font-bold uppercase">Arrival</div>
                                        <div className="text-xs font-mono text-zinc-300">{runningProcess.arrivalTime}</div>
                                    </div>
                                    <div className="bg-zinc-900/80 p-2 text-center">
                                        <div className="text-[8px] text-zinc-500 font-bold uppercase">Burst</div>
                                        <div className="text-xs font-mono text-zinc-300">{runningProcess.burstTime}</div>
                                    </div>
                                    <div className="bg-zinc-900/80 p-2 text-center">
                                        <div className="text-[8px] text-zinc-500 font-bold uppercase">Rem</div>
                                        <div className="text-sm font-mono text-white font-bold">{runningProcess.remainingTime}</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                                        <span>Execution Buffer</span>
                                        <span>{Math.round(((runningProcess.burstTime - runningProcess.remainingTime) / runningProcess.burstTime) * 100)}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full"
                                            style={{ backgroundColor: runningProcess.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((runningProcess.burstTime - runningProcess.remainingTime) / runningProcess.burstTime) * 100}%` }}
                                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                        />
                                    </div>
                                </div>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/20"
                            >
                                <div className="text-zinc-800 font-black text-5xl tracking-tighter opacity-30 select-none">IDLE</div>
                                <div className="text-zinc-800 text-[10px] font-mono mt-2 tracking-widest opacity-40">WAITING FOR INTERRUPT</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
