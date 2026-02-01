import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { FileText, Github, Scale, AlertTriangle } from 'lucide-react';

export const Terms = () => {
    return (
        <Layout>
            <div className="container mx-auto px-4 pt-32 pb-24 max-w-3xl">
                <div className="mb-12 border-b border-zinc-800 pb-6">
                    <div className="text-xs font-mono text-zinc-500 mb-2">Legal Compliance</div>
                    <h1 className="text-4xl font-bold text-white font-mono">/etc/terms_of_service.txt</h1>
                </div>

                <div className="space-y-12 text-zinc-300 leading-relaxed font-mono text-sm">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Scale className="text-white" size={20} /> MIT License
                        </h2>
                        <div className="p-6 bg-zinc-900/50 rounded border border-zinc-800 font-mono text-xs text-zinc-400">
                            <p className="mb-4">
                                Copyright (c) 2026 Vaiditya Tanwar
                            </p>
                            <p className="mb-4">
                                Permission is hereby granted, free of charge, to any person obtaining a copy
                                of this software and associated documentation files (the "Software"), to deal
                                in the Software without restriction, including without limitation the rights
                                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                                copies of the Software, and to permit persons to whom the Software is
                                furnished to do so, subject to the following conditions:
                            </p>
                            <p>
                                The above copyright notice and this permission notice shall be included in all
                                copies or substantial portions of the Software.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-yellow-500" size={20} /> Disclaimer of Warranty
                        </h2>
                        <p>
                            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                            SOFTWARE.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Github className="text-white" size={20} /> Open Source Etiquette
                        </h2>
                        <p className="mb-4">
                            This is an educational project. While you are free to fork and modify it:
                        </p>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>Please provide attribution to the original repository.</li>
                            <li>Do not use this platform to distribute malicious code or malware.</li>
                            <li>Respect the community guidelines when opening Issues or Pull Requests.</li>
                        </ul>
                    </section>

                    <section className="pt-8 border-t border-zinc-800">
                        <p className="text-zinc-500 text-xs text-center">
                            Last Updated: February 2026.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};
