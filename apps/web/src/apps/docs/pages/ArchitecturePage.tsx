import React from 'react';
import { ArrowDown, Database, Server, Globe, Monitor, Code, Workflow } from 'lucide-react';

export const ArchitecturePage = () => {
    return (
        <div className="space-y-12 max-w-4xl animate-fade-in">
            <div className="space-y-6 border-b border-zinc-800 pb-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded-full border border-blue-500/20">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    System Design
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Code Tracer Architecture</h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    The Code Tracer bridges the gap between client-side visualization and server-side execution. It uses a custom gRPC protocol to stream state deltas from an ephemeral container.
                </p>
            </div>

            {/* High Level Diagram */}
            <div className="space-y-6" id="data-flow">
                <h2 className="text-2xl font-bold text-white">Data Flow Pipeline</h2>
                
                <div className="bg-zinc-950 p-8 rounded-xl border border-zinc-800 relative overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                    <div className="relative z-10 flex flex-col gap-8 items-center max-w-2xl mx-auto">
                        
                        {/* Client Layer */}
                        <div className="w-full flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg">
                            <div className="p-3 bg-zinc-800 rounded text-green-500"><Monitor size={24} /></div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-white">Client (React Application)</h3>
                                <p className="text-xs text-zinc-500">User Interface & Visualizer Renderer</p>
                            </div>
                            <div className="px-2 py-1 bg-green-900/30 text-green-400 text-[10px] font-mono rounded">WebSocket</div>
                        </div>

                        <ArrowDown className="text-zinc-600" />

                        {/* API Gateway */}
                        <div className="w-full flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg">
                            <div className="p-3 bg-zinc-800 rounded text-blue-500"><Globe size={24} /></div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-white">API Gateway (Load Balancer)</h3>
                                <p className="text-xs text-zinc-500">Route distribution & Auth verification</p>
                            </div>
                            <div className="px-2 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-mono rounded">REST / gRPC</div>
                        </div>

                        <ArrowDown className="text-zinc-600" />

                        {/* Orchestrator */}
                        <div className="w-full flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg">
                            <div className="p-3 bg-zinc-800 rounded text-purple-500"><Workflow size={24} /></div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-white">SysCore Orchestrator</h3>
                                <p className="text-xs text-zinc-500">Container Provisioning & Lifecycle Management</p>
                            </div>
                        </div>

                        <div className="flex gap-8 w-full">
                             {/* Container Instances */}
                            <div className="flex-1 p-4 border border-zinc-800 border-dashed rounded bg-zinc-900/30 flex flex-col items-center gap-2">
                                <Code size={20} className="text-zinc-500" />
                                <span className="text-xs font-mono text-zinc-500">Container A (Python)</span>
                            </div>
                             <div className="flex-1 p-4 border border-zinc-800 border-dashed rounded bg-zinc-900/30 flex flex-col items-center gap-2">
                                <Code size={20} className="text-zinc-500" />
                                <span className="text-xs font-mono text-zinc-500">Container B (C++)</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Core Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="core-components">
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Database className="text-green-500" size={20} /> State Capture
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Unlike standard debuggers which pause execution, SysCore uses a custom <code>sys.settrace</code> hook to capture the entire heap state at every opcode execution. This data is serialized using Protocol Buffers for maximum efficiency.
                    </p>
                 </div>
                 
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Server className="text-purple-500" size={20} /> Ephemeral Sandbox
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Security is paramount. Each execution request spins up a fresh, isolated Docker container with strict resource limits (CPU quotas, memory caps) and no network access, preventing malicious code from affecting the host.
                    </p>
                 </div>
            </div>
        </div>
    );
};
