
import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Scale, AlertTriangle, ShieldCheck, Gavel } from 'lucide-react';

export const Terms = () => {
    return (
        <Layout>
            <div className="container mx-auto px-6 pt-32 pb-24 max-w-4xl bg-[#050505] min-h-screen text-zinc-300 font-mono">

                {/* Header */}
                <div className="mb-16 border-b border-zinc-800 pb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-400 text-[10px] font-mono rounded mb-4 uppercase tracking-widest">
                        <Scale size={12} className="text-green-500" />
                        <span>LEGAL_AGREEMENT_V1</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">TERMS OF SERVICE</h1>
                    <p className="text-zinc-500 font-mono text-xs">
                        &gt; Conditions for usage of the SysCore Runtime Environment.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-zinc-800 pb-4 uppercase tracking-wider font-mono text-xs">
                            <ShieldCheck size={14} className="text-blue-500" /> 1. ACCEPTANCE_OF_TERMS
                        </h2>
                        <div className="bg-[#0A0A0A] border border-zinc-800 p-6 space-y-4 text-xs leading-relaxed text-zinc-400">
                            <p>
                                By accessing OKernel (the "Platform"), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
                            </p>
                            <p>
                                The Platform is provided for educational purposes. We reserve the right to modify these terms at any time.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-zinc-800 pb-4 uppercase tracking-wider font-mono text-xs">
                            <AlertTriangle size={14} className="text-yellow-500" /> 2. USAGE_LIMITS
                        </h2>
                        <div className="bg-[#0A0A0A] border border-zinc-800 p-6 space-y-4 text-xs leading-relaxed text-zinc-400">
                            <p>
                                <strong className="text-white">2.1 Resource Quotas:</strong> Users are allocated a fixed amount of CPU time and memory (1MB Heap) per execution cycle. Attempts to bypass these limits may result in temporary bans.
                            </p>
                            <p>
                                <strong className="text-white">2.2 Malicious Code:</strong> You must not attempt to upload viruses, trojans, or any code designed to compromise the SysCore Sandbox.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-zinc-800 pb-4 uppercase tracking-wider font-mono text-xs">
                            <Gavel size={14} className="text-red-500" /> 3. DISCLAIMER
                        </h2>
                        <div className="bg-[#0A0A0A] border border-zinc-800 p-6 space-y-4 text-xs leading-relaxed text-zinc-400">
                            <p className="uppercase text-white font-bold">
                                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
                            </p>
                            <p>
                                In no event shall the authors be liable for any claim, damages or other liability arising from the use of the software.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-20 pt-8 border-t border-zinc-800 text-center text-[10px] text-zinc-600 font-mono">
                    LAST_UPDATED: 2026-02-08 | REF: TOS-2026-A
                </div>
            </div>
        </Layout>
    );
};
