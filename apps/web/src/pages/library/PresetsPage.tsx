import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { presetsData, Preset } from './presetsData';

export const PresetsPage: React.FC = () => {
    const navigate = useNavigate();

    const handlePresetClick = (preset: Preset) => {
        if (preset.type === 'cpu') {
            navigate('/cpu-scheduler', { state: { presetConfig: preset.config } });
        } else if (preset.type === 'mutex') {
            navigate('/mutex-visualizer', { state: { presetConfig: preset.config } });
        }
    };

    const cpuPresets = presetsData.filter(p => p.type === 'cpu');
    const mutexPresets = presetsData.filter(p => p.type === 'mutex');

    const renderPresetCard = (preset: Preset) => (
        <div
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className="group relative bg-[#18181b]/60 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-primary/20 transition-all cursor-pointer flex flex-col"
        >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg border ${preset.type === 'cpu' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
                    {preset.type === 'cpu' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    )}
                </div>
                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-primary transition-colors">{preset.title}</h3>
            </div>

            <p className="text-zinc-400 text-sm mb-6 flex-1">
                {preset.purpose}
            </p>

            <div className="mt-auto bg-black/40 border border-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Educational Focus</span>
                </div>
                <p className="text-xs text-zinc-500 font-mono">
                    {preset.solution}
                </p>
            </div>
        </div>
    );

    return (
        <Layout showFooter={true}>
            <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pt-24 pb-20 relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-4">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            /library/presets
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Educational Scenarios <span className="text-zinc-500">Library</span></h1>
                        <p className="text-zinc-400 max-w-2xl text-lg">
                            Explore predefined case studies modeling common operating system phenomenon. Load a preset to interactively debug and understand complex scheduling and synchronization problems.
                        </p>
                    </div>

                    <div className="mb-16">
                        <h2 className="text-2xl font-bold mb-6 font-mono border-b border-white/10 pb-2"><span className="text-blue-500 mr-2">def</span>CPU_Scheduler_Models():</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cpuPresets.map(renderPresetCard)}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-6 font-mono border-b border-white/10 pb-2"><span className="text-purple-500 mr-2">def</span>Mutex_Synchronization():</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mutexPresets.map(renderPresetCard)}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
