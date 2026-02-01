import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Shield, Lock, Eye, Server } from 'lucide-react';

export const Privacy = () => {
    return (
        <Layout>
            <div className="container mx-auto px-4 pt-32 pb-24 max-w-3xl">
                <div className="mb-12 border-b border-zinc-800 pb-6">
                    <div className="text-xs font-mono text-zinc-500 mb-2">Legal Compliance</div>
                    <h1 className="text-4xl font-bold text-white font-mono">/etc/privacy.conf</h1>
                </div>

                <div className="space-y-12 text-zinc-300 leading-relaxed font-mono text-sm">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="text-green-500" size={20} /> Data Collection Policy
                        </h2>
                        <div className="p-6 bg-zinc-900/50 rounded border border-zinc-800 space-y-4">
                            <p>
                                <strong className="text-white">TL;DR:</strong> We do not sell, trade, or actively monitor your personal data.
                            </p>
                            <p>
                                OKernel is an open-source educational project. Our primary goal is to provide a platform for learning Operating Systems concepts.
                                Most of the execution (SysCore Engine, Compilation) happens <span className="text-green-500">locally in your browser</span>.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Server className="text-blue-500" size={20} /> Third-Party Services
                        </h2>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="min-w-[4px] bg-zinc-700 rounded-full"></div>
                                <div>
                                    <strong className="text-white block mb-1">Supabase (Authentication & Config)</strong>
                                    We use Supabase for authentication (if you log in as an Admin) and to fetch dynamic system configurations (like the Message of the Day).
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="min-w-[4px] bg-zinc-700 rounded-full"></div>
                                <div>
                                    <strong className="text-white block mb-1">Netlify / Vercel (Hosting)</strong>
                                    Standard server logs (IP address, User Agent) may be processed by our hosting provider for security and reliability purposes.
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Eye className="text-yellow-500" size={20} /> Local Storage
                        </h2>
                        <p>
                            We use <code>localStorage</code> to save your preferences (theme settings, shell history) on your device.
                            This data never leaves your browser unless explicitly synced.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-zinc-800">
                        <p className="text-zinc-500 text-xs text-center">
                            Last Updated: February 2026. <br />
                            For concerns, open an issue on our GitHub repository.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};
