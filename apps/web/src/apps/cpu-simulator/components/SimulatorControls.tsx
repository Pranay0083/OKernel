import React, { useState } from 'react';
import { SimState, SimMutex, Scenario } from '../../../syscore/cpu-simulator/types';
import { Play, Square, FastForward, Plus, Lock, Settings, Cpu, Layers, Trash2 } from 'lucide-react';
import { PREDEFINED_SCENARIOS } from '../../../syscore/cpu-simulator/engine';

interface SimulatorControlsProps {
    state: SimState | null;
    onStart: () => void;
    onPause: () => void;
    onStep: () => void;
    onSpeedChange: (speed: number) => void;
    onAddProcess: (arrivalTime: number, burstTime: number) => void;
    onRequestMutex: (processId: string, mutexId: string) => void;
    onReleaseMutex: (processId: string, mutexId: string) => void;
    onSystemAction: (type: string, value: string) => void;
    loadScenario: (scenarioId: string) => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
    state,
    onStart,
    onPause,
    onStep,
    onSpeedChange,
    onAddProcess,
    onRequestMutex,
    onReleaseMutex,
    onSystemAction,
    loadScenario
}) => {
    const [burstInput, setBurstInput] = useState('5');
    const [arrivalInput, setArrivalInput] = useState('0');
    const [mutexNameInput, setMutexNameInput] = useState('');

    if (!state) return null;

    const handleAddProcess = () => {
        onAddProcess(
            parseInt(arrivalInput, 10) || 0,
            parseInt(burstInput, 10) || 5
        );
    };

    const availableMutexes = Array.from(state.mutexes.values());

    return (
        <div className="flex flex-col gap-4 bg-zinc-900 border border-white/10 rounded-lg p-4 backdrop-blur-md">

            {/* Header: Scenario & Playback */}
            <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">Scenario:</span>
                    <select
                        className="bg-zinc-950 border border-zinc-800 text-sm font-sans rounded px-3 py-1.5 text-white outline-none w-56 focus:border-blue-500/50 transition-colors"
                        onChange={e => loadScenario(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>Load Environment...</option>
                        {PREDEFINED_SCENARIOS.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                    </select>
                </div>

                <div className="h-8 w-px bg-white/10 hidden md:block"></div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={state.isRunning ? onPause : onStart}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded font-mono text-sm transition-all active:scale-95 ${state.isRunning ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'}`}
                    >
                        {state.isRunning ? <Square size={14} /> : <Play size={14} />}
                        {state.isRunning ? 'PAUSE' : 'START'}
                    </button>

                    <button
                        onClick={onStep}
                        disabled={state.isRunning}
                        className="flex items-center gap-2 px-4 py-1.5 rounded font-mono text-sm bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-30 transition-all active:scale-95"
                    >
                        <FastForward size={14} />
                        STEP
                    </button>
                </div>

                <div className="flex-1"></div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
                        <span>CORES:</span>
                        <select
                            className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-blue-400 outline-none w-14"
                            value={state.cores.length}
                            onChange={e => onSystemAction('SET_CORES', e.target.value)}
                        >
                            {[1, 2, 4, 6, 8].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
                        <span>TICK:</span>
                        <select
                            className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-green-400 outline-none"
                            value={state.speed}
                            onChange={e => onSpeedChange(Number(e.target.value))}
                        >
                            <option value={2000}>2.0s</option>
                            <option value={1000}>1.0s</option>
                            <option value={300}>0.3s</option>
                            <option value={100}>0.1s</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Config Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Process Injection */}
                <div className="space-y-3 border border-white/5 rounded-lg p-3 bg-zinc-950/30 backdrop-blur-sm">
                    <div className="text-xs text-zinc-400 font-mono font-bold uppercase tracking-widest mb-1 flex justify-between items-center">
                        <span className="flex items-center gap-1.5"><Plus size={14} className="text-green-500" /> Process Lab</span>
                        <span className="text-[10px] text-zinc-600 font-normal">Next: P{state.processes.size + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-mono">Arrival Tick</label>
                            <input
                                type="number" min="0"
                                value={arrivalInput}
                                onChange={e => setArrivalInput(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded px-2 py-1.5 text-zinc-300 font-mono text-xs outline-none focus:border-green-500/30 transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-mono">Burst Time (ms)</label>
                            <input
                                type="number" min="1"
                                value={burstInput}
                                onChange={e => setBurstInput(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded px-2 py-1.5 text-green-400 font-mono text-xs outline-none focus:border-green-500/30 transition-colors"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddProcess}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-500 rounded font-mono text-xs transition-all active:scale-95"
                    >
                        FORK NEW PROCESS
                    </button>
                </div>

                {/* Mutex Factory */}
                <div className="space-y-3 border border-white/5 rounded-lg p-3 bg-zinc-950/30 backdrop-blur-sm">
                    <div className="text-xs text-zinc-400 font-mono font-bold uppercase tracking-widest mb-1">
                        <span className="flex items-center gap-1.5"><Layers size={14} className="text-purple-500" /> Mutex Factory</span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={mutexNameInput}
                            onChange={e => setMutexNameInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && mutexNameInput && (onSystemAction('CREATE_MUTEX', mutexNameInput), setMutexNameInput(''))}
                            className="flex-1 bg-zinc-900/50 border border-white/10 rounded px-3 py-1.5 text-purple-400 font-mono text-xs outline-none focus:border-purple-500/30 transition-colors"
                            placeholder="Unique Lock ID..."
                        />
                        <button
                            onClick={() => { if (mutexNameInput) { onSystemAction('CREATE_MUTEX', mutexNameInput); setMutexNameInput(''); } }}
                            className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded font-mono text-xs transition-colors"
                        >
                            ADD
                        </button>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">
                        Create system-wide locks. Note: Processes in Scenarios follow scripts, but Sandbox mode lets you trigger these manually.
                    </p>
                </div>

                {/* Manual Interrupts */}
                <div className="space-y-3 border border-white/5 rounded-lg p-3 bg-zinc-950/30 backdrop-blur-sm flex flex-col">
                    <div className="text-xs text-zinc-400 font-mono font-bold uppercase tracking-widest mb-1">
                        <span className="flex items-center gap-1.5"><Settings size={14} className="text-blue-500" /> Hardware Interrupts</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2 min-h-[90px] overflow-y-auto pr-2 custom-scrollbar">
                        {state.cores.some(c => c.activeProcessId) ? (
                            state.cores.map(core => {
                                if (!core.activeProcessId) return null;
                                const activeProcess = core.activeProcessId;
                                return (
                                    <div key={core.id} className="border border-white/10 p-2 rounded-md bg-zinc-950/50 shadow-sm">
                                        <div className="text-[10px] text-zinc-500 font-mono mb-1.5 flex justify-between">
                                            <span>CORE_{core.id}</span>
                                            <span className="text-blue-400">{activeProcess}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {availableMutexes.map(m => {
                                                const isOwnedByActive = m.ownerId === activeProcess;

                                                return (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => isOwnedByActive ? onReleaseMutex(activeProcess, m.id) : onRequestMutex(activeProcess, m.id)}
                                                        className={`flex items-center gap-1 px-2 py-1 rounded font-mono text-[9px] whitespace-nowrap border transition-all active:scale-95 ${isOwnedByActive
                                                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                                                            : m.state === 'LOCKED'
                                                                ? 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-50'
                                                                : 'bg-zinc-800/50 text-zinc-400 border-white/5 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <Lock size={10} />
                                                        {isOwnedByActive ? `RELEASE ${m.id}` : `REQUEST ${m.id}`}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-xs font-mono text-zinc-600 p-2 italic text-center border border-dashed border-white/5 rounded-md mt-2">
                                System Idle: No threads on hardware
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
