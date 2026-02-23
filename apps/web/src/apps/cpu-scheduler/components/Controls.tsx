import React from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { AlgorithmType, SimulationState } from '../../../core/types';

interface Props {
    state: SimulationState;
    setState: React.Dispatch<React.SetStateAction<SimulationState>>;
    onReset: () => void;
}

export const Controls: React.FC<Props> = ({ state, setState, onReset }) => {

    const handleNumQueuesChange = (value: number) => {
        const numQueues = Math.max(2, Math.min(3, value));
        setState(s => {
            const newQuantums = Array.from({ length: numQueues }, (_, i) =>
                s.mlfqQuantums[i] ?? Math.pow(2, i + 1)
            );
            return {
                ...s,
                mlfqNumQueues: numQueues,
                mlfqQuantums: newQuantums,
                mlfqQueues: Array.from({ length: numQueues }, (_, i) => s.mlfqQueues[i] ?? []),
            };
        });
    };

    const handleQuantumChange = (level: number, value: number) => {
        setState(s => {
            const newQuantums = [...s.mlfqQuantums];
            newQuantums[level] = Math.max(1, value);
            return { ...s, mlfqQuantums: newQuantums };
        });
    };

    const handleCoresChange = (value: number) => {
        const numCores = Math.max(1, Math.min(8, value));
        setState(s => ({
            ...s,
            numCores,
            runningProcessIds: Array(numCores).fill(null),
            quantumRemaining: Array(numCores).fill(0),
            contextSwitchCooldown: Array(numCores).fill(0),
            mlfqCurrentLevel: Array(numCores).fill(0),
        }));
    };

    return (
        <div className="flex overflow-x-auto whitespace-nowrap items-center gap-4 w-full font-mono text-xs pb-2 custom-scrollbar">

            {/* Playback Controls */}
            <div className="flex items-center -space-x-px shrink-0">
                <button
                    onClick={() => setState(s => ({ ...s, isPlaying: !s.isPlaying }))}
                    className={`h-8 px-4 flex items-center justify-center border transition-colors ${state.isPlaying
                        ? 'bg-zinc-900 border-yellow-700 text-yellow-500 hover:bg-yellow-900/20'
                        : 'bg-zinc-900 border-green-800 text-green-500 hover:bg-green-900/20'
                        }`}
                >
                    {state.isPlaying ? (
                        <span className="flex items-center gap-2">[ PAUSE ]</span>
                    ) : (
                        <span className="flex items-center gap-2">[ EXEC ]</span>
                    )}
                </button>
                <button
                    onClick={onReset}
                    className="h-8 px-3 flex items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    title="Reset Simulation"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            <div className="w-px h-6 bg-zinc-800 mx-2 hidden sm:block shrink-0"></div>

            {/* Algorithm Selector */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-zinc-500 select-none">ALGO:</span>
                <div className="relative group">
                    <select
                        value={state.algorithm}
                        onChange={e => setState(s => ({ ...s, algorithm: e.target.value as AlgorithmType }))}
                        className="appearance-none bg-black border border-zinc-700 text-white h-8 pl-3 pr-8 focus:outline-none focus:border-primary cursor-pointer hover:border-zinc-500 transition-colors uppercase"
                        disabled={state.isPlaying}
                    >
                        <option value="FCFS">First Come First Serve</option>
                        <option value="SJF">Shortest Job First</option>
                        <option value="SRTF">Shortest Remaining Time</option>
                        <option value="RR">Round Robin</option>
                        <option value="PRIORITY">Priority</option>
                        <option value="PRIORITY_P">Preemptive Priority</option>
                        <option value="MLFQ">Multi-Level Feedback Queue</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-white transition-colors" />
                </div>
            </div>

            {/* Cores Input */}
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200 shrink-0">
                <span className="text-zinc-500 select-none">CORES:</span>
                <input
                    type="number"
                    value={state.numCores}
                    onChange={e => handleCoresChange(Number(e.target.value))}
                    className="bg-black border border-zinc-700 text-white h-8 w-14 px-2 focus:outline-none focus:border-primary text-center"
                    min={1}
                    max={8}
                    disabled={state.isPlaying}
                />
            </div>

            {/* Time Quantum (RR only) */}
            {state.algorithm === 'RR' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200 shrink-0">
                    <span className="text-zinc-500 select-none">Q_TIME:</span>
                    <input
                        type="number"
                        value={state.timeQuantum}
                        onChange={e => setState(s => ({ ...s, timeQuantum: Number(e.target.value) }))}
                        className="bg-black border border-zinc-700 text-white h-8 w-16 px-2 focus:outline-none focus:border-primary text-center"
                        min={1}
                        disabled={state.isPlaying}
                    />
                </div>
            )}

            {/* MLFQ Configuration */}
            {state.algorithm === 'MLFQ' && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-500 select-none">LEVELS:</span>
                        <input
                            type="number"
                            value={state.mlfqNumQueues}
                            onChange={e => handleNumQueuesChange(Number(e.target.value))}
                            className="bg-black border border-zinc-700 text-white h-8 w-14 px-2 focus:outline-none focus:border-primary text-center"
                            min={2}
                            max={3}
                            disabled={state.isPlaying}
                        />
                    </div>
                    <div className="w-px h-5 bg-zinc-800"></div>
                    <div className="flex items-center gap-1">
                        <span className="text-zinc-500 select-none">Q:</span>
                        {state.mlfqQuantums.map((q, i) => (
                            <div key={i} className="flex items-center gap-0.5">
                                <span className="text-zinc-600 text-[9px]">L{i}</span>
                                <input
                                    type="number"
                                    value={q}
                                    onChange={e => handleQuantumChange(i, Number(e.target.value))}
                                    className="bg-black border border-zinc-700 text-white h-7 w-10 px-1 focus:outline-none focus:border-primary text-center text-[10px]"
                                    min={1}
                                    disabled={state.isPlaying}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Priority Aging (PRIORITY / PRIORITY_P only) */}
            {(state.algorithm === 'PRIORITY' || state.algorithm === 'PRIORITY_P') && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-zinc-500">AGING:</span>
                        <div
                            onClick={() => setState(s => ({ ...s, priorityAgingEnabled: !s.priorityAgingEnabled }))}
                            className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${state.priorityAgingEnabled ? 'bg-primary' : 'bg-zinc-700'
                                }`}
                        >
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${state.priorityAgingEnabled ? 'translate-x-4' : 'translate-x-0.5'
                                }`} />
                        </div>
                    </label>
                    {state.priorityAgingEnabled && (
                        <div className="flex items-center gap-1 animate-in fade-in duration-150">
                            <span className="text-zinc-600 text-[9px]">INT</span>
                            <input
                                type="number"
                                value={state.priorityAgingInterval}
                                onChange={e => setState(s => ({ ...s, priorityAgingInterval: Math.max(1, Number(e.target.value)) }))}
                                className="bg-black border border-zinc-700 text-white h-7 w-10 px-1 focus:outline-none focus:border-primary text-center text-[10px]"
                                min={1}
                                disabled={state.isPlaying}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Context Switch Cost (all algorithms) */}
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200 shrink-0">
                <span className="text-zinc-500 select-none">CS_COST:</span>
                <input
                    type="number"
                    value={state.contextSwitchCost}
                    onChange={e => setState(s => ({ ...s, contextSwitchCost: Math.max(0, Number(e.target.value)) }))}
                    className="bg-black border border-zinc-700 text-white h-8 w-14 px-2 focus:outline-none focus:border-primary text-center"
                    min={0}
                    disabled={state.isPlaying}
                />
            </div>

            <div className="flex-1"></div>

            {/* Speed Control */}
            <div className="flex items-center gap-4 shrink-0">
                <span className="text-zinc-500 select-none hidden sm:inline">CLOCK_RATE:</span>
                <div className="flex items-center gap-2">
                    <span className="text-zinc-600">SLOW</span>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={2100 - state.speed}
                        onChange={e => setState(s => ({ ...s, speed: 2100 - Number(e.target.value) }))}
                        className="w-24 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary"
                    />
                    <span className="text-zinc-600">FAST</span>
                </div>
            </div>

            {/* Time Display */}
            <div className="flex items-center gap-2 border border-zinc-800 bg-black h-8 px-3 min-w-[100px] justify-between shrink-0">
                <span className="text-zinc-600">T=</span>
                <span className="text-primary font-bold">{state.currentTime}ms</span>
            </div>

        </div>
    );
};
