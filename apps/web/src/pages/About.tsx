
import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Terminal, Users, Code, Globe } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { APP_VERSION, RELEASE_NAME } from '../version';

export const About = () => {
    const { config } = useSystemConfig();

    return (
        <Layout>
            <div className="container mx-auto px-6 pt-32 pb-24 max-w-5xl text-zinc-300">

                {/* Header */}
                <div className="mb-20 border-b border-zinc-800 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-400 text-[10px] font-mono rounded mb-4 uppercase tracking-widest">
                            <span>$ whoami</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">ABOUT THE PROJECT</h1>
                        <p className="text-zinc-500 font-mono text-xs">
                            &gt; Open source educational tooling for systems engineering.
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-4xl font-bold text-zinc-800">v{config.version.replace('v', '')}</div>
                        <div className="text-zinc-600 font-mono text-xs uppercase">Current Build</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Main Content (Left 2 cols) */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-zinc-800 pb-4 uppercase tracking-wider font-mono text-xs">
                                <Terminal size={14} className="text-green-500" /> MISSION_STATEMENT
                            </h2>
                            <blockquote className="text-2xl font-serif text-white mb-6 border-l-2 border-green-500 pl-6 italic">
                                "Code is poetry, but OS is logic."
                            </blockquote>
                            <p className="text-zinc-400 leading-relaxed text-sm mb-6">
                                Standard O.S. textbooks rely on static Gantt charts. OKernel bridges the gap between
                                <span className="text-zinc-300"> theory and kernel-level execution</span>.
                            </p>
                            <p className="text-zinc-400 leading-relaxed text-sm">
                                With <strong>SysCore Engine 2.1</strong>, we now simulate a full C++ execution environment,
                                including Stack/Heap visualization, process scheduling, and mutex locking in real-time.
                                We've expanded from a simple scheduler visualizer to a comprehensive runtime analysis platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-zinc-800 pb-4 uppercase tracking-wider font-mono text-xs">
                                <Users size={14} className="text-blue-500" /> THE_TEAM
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TeamMember name="Vaiditya Tanwar" role="Project Lead & Design" github="@vaiditya2501" />
                                <TeamMember name="Yashi Gupta" role="Core Logic & Algo" github="@yashiigupta" />
                                <TeamMember name="Antigravity" role="UI Implementation" github="@antigravity" />
                                <TeamMember name="Community" role="Open Source" github="@contributors" />
                            </div>
                        </section>

                        <div className="p-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] group-hover:bg-green-500/10 transition-colors"></div>
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Globe size={16} /> Open Source</h3>
                            <p className="text-zinc-400 text-xs mb-6 max-w-lg leading-relaxed">
                                This project is MIT Licensed. Contributions to the scheduling engine or UI are welcome.
                                We believe in free access to high-quality engineering education tools.
                            </p>
                            <div className="bg-black p-4 border border-zinc-800 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                                <span>git clone https://github.com/Vaiditya2207/OKernel.git</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Code Stats/Meta */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-zinc-800 pb-4 uppercase tracking-wider font-mono text-xs">
                                <Code size={14} className="text-purple-500" /> CHANGELOG_HISTORY
                            </h2>
                            <div className="font-mono text-[10px] space-y-6 pl-4 border-l border-zinc-800 relative">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-green-500 border border-black shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    <div className="text-white font-bold mb-1">v{APP_VERSION} - {RELEASE_NAME}</div>
                                    <p className="text-zinc-500 text-xs">Feb 22 — Mutex Educational Enhancements (Wait Graph & Tracing). Scenarios Library.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-zinc-800 border border-zinc-600"></div>
                                    <div className="text-zinc-400 font-bold mb-1">v1.1.0 - Hard Tech</div>
                                    <p className="text-zinc-500 text-xs">Code Tracer Landing Page. C++ Support. UI Overhaul.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-zinc-800 border border-zinc-600"></div>
                                    <div className="text-zinc-400 font-bold mb-1">v1.0.1 - Test Suite</div>
                                    <p className="text-zinc-500 text-xs">140 Unit Tests. Quality Assurance.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-zinc-800 border border-zinc-600"></div>
                                    <div className="text-zinc-400 font-bold mb-1">v1.0.0 - SysCore Engine 2</div>
                                    <p className="text-zinc-500 text-xs">Virtual Machine, RAM Inspector.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-zinc-800 border border-zinc-600"></div>
                                    <div className="text-zinc-400 font-bold mb-1">v0.4.0 - Architecture</div>
                                    <p className="text-zinc-500 text-xs">Architecture Blueprints.</p>
                                </div>
                            </div>
                        </section>

                        <div className="p-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 font-mono text-[10px]">
                            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="ml-auto text-zinc-500">user@dev:~$ cloc .</span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 gap-y-2 text-zinc-300">
                                <div className="col-span-3 text-zinc-800">--------------------------------</div>

                                <span className="font-bold text-zinc-500 uppercase">Language</span>
                                <span className="font-bold text-zinc-500 text-right uppercase">files</span>
                                <span className="font-bold text-zinc-500 text-right uppercase">code</span>

                                <div className="col-span-3 text-zinc-800">--------------------------------</div>

                                <span className="text-blue-400">TypeScript</span>
                                <span className="text-blue-400 text-right">38</span>
                                <span className="text-blue-400 text-right">3,120</span>

                                <span className="text-yellow-400">React/TSX</span>
                                <span className="text-yellow-400 text-right">56</span>
                                <span className="text-yellow-400 text-right">4,200</span>

                                <span className="text-green-400">SQL</span>
                                <span className="text-green-400 text-right">08</span>
                                <span className="text-green-400 text-right">650</span>

                                <div className="col-span-3 text-zinc-800">--------------------------------</div>

                                <span className="font-bold text-green-500">v{APP_VERSION}</span>
                                <span className="font-bold text-green-500 text-right">Total</span>
                                <span className="font-bold text-green-500 text-right">7,970</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </Layout >
    );
};

const TeamMember = ({ name, role, github }: { name: string, role: string, github: string }) => (
    <div className="flex items-center justify-between p-4 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-zinc-600 transition-colors group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
                {name.substring(0, 2).toUpperCase()}
            </div>
            <div>
                <div className="text-sm font-bold text-white mb-0.5">{name}</div>
                <div className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">{role}</div>
            </div>
        </div>
        <a href={`https://github.com/${github.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-[10px] text-zinc-600 font-mono hover:text-green-500 transition-colors">
            {github}
        </a>
    </div>
);
