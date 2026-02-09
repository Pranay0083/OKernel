
import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Shield, Lock, Eye, Server } from 'lucide-react';

export const Privacy = () => {
    return (
        <Layout>
            <div className="container mx-auto px-6 pt-32 pb-24 max-w-4xl bg-[#050505] min-h-screen text-zinc-300 font-mono">

                {/* Header */}
                <div className="mb-16 border-b border-zinc-800 pb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-400 text-[10px] font-mono rounded mb-4 uppercase tracking-widest">
                        <Shield size={12} className="text-green-500" />
                        <span>SECURITY_PROTOCOL_V1</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">PRIVACY POLICY</h1>
                    <p className="text-zinc-500 font-mono text-xs">
                        &gt; Data handling and retention specifications.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-zinc-800 pb-4 uppercase tracking-wider font-mono text-xs">
                            <Server size={14} className="text-blue-500" /> 1. DATA_COLLECTION
                        </h2>
                        <div className="bg-[#0A0A0A] border border-zinc-800 p-6 space-y-4 text-xs leading-relaxed text-zinc-400">
                            <p>
                                <strong className="text-white">1.1 Authentication Data:</strong> When you authenticate via Google OAuth, we store your email address and unique provider ID. We do not store passwords.
                            </p>
                            <p>
                                <strong className="text-white">1.2 Execution Logs:</strong> We may retain anonymized C++/Python execution traces for performance debugging of the SysCore Engine.
                            </p>
                            <p>
                                <strong className="text-white">1.3 Local Storage:</strong> Configuration settings and un-synced project files are stored in your browser's `localStorage` and `IndexedDB`.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-zinc-800 pb-4 uppercase tracking-wider font-mono text-xs">
                            <Lock size={14} className="text-red-500" /> 2. DATA_SECURITY
                        </h2>
                        <div className="bg-[#0A0A0A] border border-zinc-800 p-6 space-y-4 text-xs leading-relaxed text-zinc-400">
                            <p>
                                All traffic is encrypted in transit via TLS 1.3. Database persistence is handled by Supabase with Row Level Security (RLS) policies enabled.
                            </p>
                            <div className="p-3 bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-500 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Encryption: AES-256-GCM
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-zinc-800 pb-4 uppercase tracking-wider font-mono text-xs">
                            <Eye size={14} className="text-yellow-500" /> 3. USER_RIGHTS
                        </h2>
                        <div className="bg-[#0A0A0A] border border-zinc-800 p-6 space-y-4 text-xs leading-relaxed text-zinc-400">
                            <p>
                                You retain full ownership of any code snippets or diagrams created within OKernel.
                            </p>
                            <p>
                                To request a full data export or account deletion, please submit a ticket via the Feedback terminal or email privacy@syscore.dev.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-20 pt-8 border-t border-zinc-800 text-center text-[10px] text-zinc-600 font-mono">
                    LAST_UPDATED: 2026-02-08 | REF: COMPLIANCE-2026-A
                </div>
            </div>
        </Layout>
    );
};
