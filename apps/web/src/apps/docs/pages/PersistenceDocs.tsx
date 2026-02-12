import React from 'react';
import { Database, Cloud, Key, Shield, Server, Code } from 'lucide-react';

export const PersistenceDocs: React.FC = () => {
    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-100 mb-4 flex items-center gap-3">
                    <Database className="text-purple-400" size={32} />
                    Persistence & Storage
                </h1>
                <p className="text-xl text-gray-400">
                    OKernel leverages Supabase (PostgreSQL) for secure user authentication, session persistence, and code snippet storage.
                </p>
            </div>

            {/* Architecture Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="architecture">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Cloud className="text-blue-400" size={20} />
                        <h3 className="text-lg font-semibold text-gray-200">Cloud Sync</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                        All user data is synchronized in real-time. Code written in the editor is automatically saved to your account profile.
                    </p>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="text-green-400" size={20} />
                        <h3 className="text-lg font-semibold text-gray-200">Row Level Security</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Database access is governed by strict RLS policies, ensuring users can only read and modify their own data.
                    </p>
                </div>
            </div>

            {/* Data Models */}
            <section className="space-y-4" id="schema">
                <h2 className="text-2xl font-semibold text-gray-100 border-b border-gray-800 pb-2">
                    Data Schema
                </h2>
                <p className="text-gray-300">
                    The persistence layer consists of three primary tables designed to separate authentication, user profiles, and application content.
                </p>

                <div className="space-y-4 mt-6">
                    {/* Profiles */}
                    <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center gap-2">
                            <Server size={14} className="text-gray-500" />
                            <span className="text-sm font-mono text-gray-300">public.profiles</span>
                        </div>
                        <div className="p-4 grid gap-2 font-mono text-sm">
                            <div className="grid grid-cols-3 border-b border-gray-800/50 pb-1 mb-1 text-gray-500">
                                <span>Column</span>
                                <span>Type</span>
                                <span>Description</span>
                            </div>
                            <div className="grid grid-cols-3 text-gray-300">
                                <span className="text-yellow-400">id</span>
                                <span className="text-blue-400">uuid</span>
                                <span className="text-gray-500">References auth.users</span>
                            </div>
                            <div className="grid grid-cols-3 text-gray-300">
                                <span className="text-yellow-400">username</span>
                                <span className="text-blue-400">text</span>
                                <span className="text-gray-500">Unique display name</span>
                            </div>
                            <div className="grid grid-cols-3 text-gray-300">
                                <span className="text-yellow-400">avatar_url</span>
                                <span className="text-blue-400">text</span>
                                <span className="text-gray-500">Profile image path</span>
                            </div>
                        </div>
                    </div>

                    {/* Snippets */}
                    <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center gap-2">
                            <Code className="text-gray-500" size={14} />
                            <span className="text-sm font-mono text-gray-300">public.snippets</span>
                        </div>
                        <div className="p-4 grid gap-2 font-mono text-sm">
                            <div className="grid grid-cols-3 border-b border-gray-800/50 pb-1 mb-1 text-gray-500">
                                <span>Column</span>
                                <span>Type</span>
                                <span>Description</span>
                            </div>
                            <div className="grid grid-cols-3 text-gray-300">
                                <span className="text-yellow-400">id</span>
                                <span className="text-blue-400">uuid</span>
                                <span className="text-gray-500">Primary Key</span>
                            </div>
                            <div className="grid grid-cols-3 text-gray-300">
                                <span className="text-yellow-400">user_id</span>
                                <span className="text-blue-400">uuid</span>
                                <span className="text-gray-500">Owner reference</span>
                            </div>
                            <div className="grid grid-cols-3 text-gray-300">
                                <span className="text-yellow-400">code</span>
                                <span className="text-blue-400">text</span>
                                <span className="text-gray-500">Raw source code</span>
                            </div>
                             <div className="grid grid-cols-3 text-gray-300">
                                <span className="text-yellow-400">language</span>
                                <span className="text-blue-400">text</span>
                                <span className="text-gray-500">c, python, or js</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Authentication Flow */}
            <section className="space-y-4" id="auth">
                <h2 className="text-2xl font-semibold text-gray-100 border-b border-gray-800 pb-2">
                    Authentication
                </h2>
                <p className="text-gray-300">
                    We use standard JWT-based authentication. When you log in via GitHub or Email, Supabase issues a session token that OKernel stores in local storage.
                </p>
                <div className="flex items-center gap-3 bg-yellow-900/10 border border-yellow-700/30 p-4 rounded-lg">
                    <Key className="text-yellow-500 flex-shrink-0" />
                    <p className="text-sm text-yellow-200/80">
                        <strong>Security Note:</strong> The kernel visualization engine runs entirely client-side. Your code is only sent to the server if you explicitly choose to save it or use the cloud compilation service.
                    </p>
                </div>
            </section>
        </div>
    );
};
