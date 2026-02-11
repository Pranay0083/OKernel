import React from 'react';
import { Cpu, Split, Zap, Activity, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SympathyDocs: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-12 max-w-4xl animate-fade-in pb-20">
            {/* Header */}
            <div className="space-y-6 border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-mono rounded-full border border-purple-500/20">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    Deep Dive
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Zap size={32} className="text-yellow-400" />
                    Sympathy Engine
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    "Machine Sympathy" is the ability to understand how hardware executes your code.
                    The Sympathy Engine visualizes the low-level cost of high-level operations.
                </p>
            </div>

            {/* Concept */}
            <div className="space-y-4" id="concept">
                <h2 className="text-2xl font-bold text-white">Why "Sympathy"?</h2>
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                    <p className="text-zinc-400 leading-relaxed mb-4">
                        Modern developers often treat the CPU as a black box. We write `a + b` and expect it to work.
                        But physically, that operation involves fetching data from L1 cache, loading it into registers,
                        executing an ALU instruction, and writing back to memory.
                    </p>
                    <p className="text-zinc-400 leading-relaxed">
                        OKernel's Sympathy mode exposes these hidden costs. It tracks every opcode and maps it to simulated hardware units
                        (ALU, Control Unit, Memory Bus) so you can see <em>where</em> your program spends its energy.
                    </p>
                </div>
            </div>

            {/* ALU Table */}
            <div className="space-y-6" id="alu-table">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Cpu size={24} className="text-green-500" />
                    ALU Operation Costs
                </h2>
                <p className="text-zinc-400">
                    The engine assigns a "Hardware Cost" to Python bytecodes. Higher costs indicate more complex silicon operations.
                </p>

                <div className="border border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-900 text-zinc-500 font-mono text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 border-b border-zinc-800">Opcode Family</th>
                                <th className="px-6 py-3 border-b border-zinc-800">Hardware Unit</th>
                                <th className="px-6 py-3 border-b border-zinc-800">Cost (Cycles)</th>
                                <th className="px-6 py-3 border-b border-zinc-800">Examples</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 bg-zinc-950/50 text-zinc-300 font-mono">
                            <tr className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-6 py-4 text-blue-400">BINARY_ADD / SUB</td>
                                <td className="px-6 py-4"><span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs">ALU</span></td>
                                <td className="px-6 py-4">1</td>
                                <td className="px-6 py-4 text-zinc-500">x + y</td>
                            </tr>
                            <tr className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-6 py-4 text-blue-400">BINARY_MULTIPLY</td>
                                <td className="px-6 py-4"><span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs">ALU</span></td>
                                <td className="px-6 py-4">3</td>
                                <td className="px-6 py-4 text-zinc-500">x * y</td>
                            </tr>
                            <tr className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-6 py-4 text-blue-400">BINARY_POWER</td>
                                <td className="px-6 py-4"><span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs">ALU (Heavy)</span></td>
                                <td className="px-6 py-4">10</td>
                                <td className="px-6 py-4 text-zinc-500">x ** y</td>
                            </tr>
                            <tr className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-6 py-4 text-purple-400">FOR_ITER</td>
                                <td className="px-6 py-4"><span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs">CONTROL</span></td>
                                <td className="px-6 py-4">3</td>
                                <td className="px-6 py-4 text-zinc-500">for i in range(...)</td>
                            </tr>
                            <tr className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-6 py-4 text-orange-400">STORE_NAME</td>
                                <td className="px-6 py-4"><span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs">MEM_WRITE</span></td>
                                <td className="px-6 py-4">2</td>
                                <td className="px-6 py-4 text-zinc-500">x = 10</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Comparison Mode */}
            <div className="space-y-6" id="comparison">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Split size={24} className="text-purple-500" />
                    Comparison Mode
                </h2>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 space-y-4">
                        <p className="text-zinc-400">
                            The <strong>Benchmark Studio</strong> allows you to execute two different implementations of an algorithm side-by-side.
                            This is the ultimate test of "Machine Sympathy" - seeing how subtle code changes affect hardware usage.
                        </p>
                        <ul className="space-y-2 text-zinc-400 text-sm">
                            <li className="flex items-center gap-2">
                                <Activity size={14} className="text-green-500" />
                                <span>Compare <strong>Total Duration</strong> (Wall clock time)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Activity size={14} className="text-blue-500" />
                                <span>Compare <strong>Instruction Count</strong> (CPU efficiency)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Activity size={14} className="text-purple-500" />
                                <span>Compare <strong>Memory Usage</strong> (Heap allocation)</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => navigate('/platform/sympathy')}
                            className="mt-4 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors border border-zinc-700 text-sm font-bold flex items-center gap-2"
                        >
                            Open Benchmark Studio <Terminal size={14} />
                        </button>
                    </div>

                    {/* Visual Aid */}
                    <div className="flex-1 bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-center">
                        <div className="flex gap-2 opacity-80">
                            <div className="w-24 h-32 bg-zinc-900 border border-zinc-800 rounded flex flex-col items-center justify-center gap-2">
                                <div className="w-12 h-2 bg-zinc-800 rounded" />
                                <div className="w-16 h-2 bg-zinc-800 rounded" />
                                <div className="mt-4 text-[10px] text-green-500 font-mono">Variant A</div>
                            </div>
                            <div className="flex items-center text-zinc-600 font-bold">VS</div>
                            <div className="w-24 h-32 bg-zinc-900 border border-zinc-800 rounded flex flex-col items-center justify-center gap-2">
                                <div className="w-12 h-2 bg-zinc-800 rounded" />
                                <div className="w-16 h-2 bg-zinc-800 rounded" />
                                <div className="mt-4 text-[10px] text-purple-500 font-mono">Variant B</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
