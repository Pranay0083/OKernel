import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Terminal, Github, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSystemConfig } from '../hooks/useSystemConfig';

export const About = () => {
    const { config } = useSystemConfig();

    return (
        <Layout>
            <div className="container mx-auto px-4 pt-32 pb-24 max-w-4xl">

                {/* Header */}
                <div className="mb-12 border-b border-zinc-800 pb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-400 text-xs font-mono rounded mb-4">
                        <span>$ whoami</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 font-mono">ABOUT_PROJECT.md</h1>
                    <p className="text-zinc-500 font-mono text-sm">
                        &gt; Open source educational tooling for systems engineering.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-12">
                        <section>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
                                <Terminal size={16} className="text-primary" /> MISSION_STATEMENT
                            </h2>
                            <p className="text-zinc-400 leading-relaxed font-mono text-sm mb-4">
                                "Code is poetry, but OS is logic."
                            </p>
                            <p className="text-zinc-400 leading-relaxed font-mono text-sm">
                                Standard O.S. textbooks rely on static Gantt charts. This visualizer bridges the gap between
                                <span className="text-zinc-300"> theory and kernel-level execution</span>.
                                By simulating CPU pulses, context switching overhead, and queue states in real-time,
                                we provide a deterministic environment for analyzing scheduler efficiency.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
                                <Terminal size={16} className="text-primary" /> THE_TEAM
                            </h2>
                            <div className="space-y-4">
                                <TeamMember name="Vaiditya Tanwar" role="Project Lead & Design" github="@vaiditya2501" />
                                <TeamMember name="Yashi Gupta" role="Core Logic & Algo" github="@yashi-gupta" />
                                <TeamMember name="Antigravity" role="UI Implementation" github="@antigravity" />
                                <TeamMember name="Community" role="Open Source" github="@contributors" />
                            </div>
                        </section>
                        <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
                            <h3 className="text-white font-bold mb-2">Open Source</h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                This project is MIT Licensed. Contributions to the scheduling engine or UI are welcome.
                            </p>
                            <div className="bg-black p-3 rounded flex items-center justify-between font-mono text-xs text-zinc-500">
                                <span>git clone https://github.com/Vaiditya2207/cpu-scheduler-visualizer.git</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Code Stats */}
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
                                <Terminal size={16} className="text-primary" /> CHANGELOG_HISTORY
                            </h2>
                            <div className="font-mono text-xs space-y-4 border-l border-zinc-800 pl-4">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                    <div className="text-white font-bold mb-1">v0.2.0 - OKernel</div>
                                    <p className="text-zinc-500">Integrated SysCore Engine. Full terminal shell simulation. Standardized UI components.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                                    <div className="text-zinc-400 font-bold mb-1">v0.1.1 - UI Polish</div>
                                    <p className="text-zinc-500">Dark mode implementation. Added animations and sound effects.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                                    <div className="text-zinc-400 font-bold mb-1">v0.1.0 - Init</div>
                                    <p className="text-zinc-500">Initial prototype. Basic scheduler visualization algorithm.</p>
                                </div>
                            </div>
                        </section>

                        <div className="p-6 bg-black rounded-lg border border-zinc-800 font-mono text-xs">
                            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="ml-auto text-zinc-500">user@dev:~$ cloc .</span>
                            </div>
                            <div className="space-y-2 text-zinc-300">
                                <div className="flex justify-between">
                                    <span>------------------------------------------------</span>
                                </div>
                                <div className="flex justify-between font-bold text-white">
                                    <span>Language</span>
                                    <span>files</span>
                                    <span>code</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>------------------------------------------------</span>
                                </div>
                                <div className="flex justify-between text-blue-400">
                                    <span>TypeScript</span>
                                    <span>24</span>
                                    <span>2,840</span>
                                </div>
                                <div className="flex justify-between text-yellow-400">
                                    <span>React/TSX</span>
                                    <span>18</span>
                                    <span>1,902</span>
                                </div>
                                <div className="flex justify-between text-green-400">
                                    <span>SQL</span>
                                    <span>5</span>
                                    <span>450</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>------------------------------------------------</span>
                                </div>
                                <div className="flex justify-between font-bold text-green-500">
                                    <span>{config.version}</span>
                                    <span>Total</span>
                                    <span>5,192</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const TeamMember = ({ name, role, github }: { name: string, role: string, github: string }) => (
    <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded border border-zinc-800">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                {name.substring(0, 2).toUpperCase()}
            </div>
            <div>
                <div className="text-sm font-bold text-white">{name}</div>
                <div className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">{role}</div>
            </div>
        </div>
        <span className="text-xs text-zinc-600 font-mono">{github}</span>
    </div>
);
