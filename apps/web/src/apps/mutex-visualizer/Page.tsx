import React, { useState } from 'react';
import { useMutex } from './useMutex';
import { Controls } from './components/Controls';
import { SharedMemory } from './components/SharedMemory';
import { ThreadPanel } from './components/ThreadPanel';
import { EventLog } from './components/EventLog';
import { CodeTracePanel } from './components/CodeTracePanel';
import { WaitGraphPanel } from './components/WaitGraphPanel';
import { Layout } from '../../components/layout/Layout';
import { Loader } from '../../components/ui/Loader';
import { LayoutGroup } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { MutexPresetConfig } from '../../pages/library/presetsData';

const BOOT_LOGS = [
    "> INITIALIZING_MUTEX_ENGINE...",
    "> LOADING_ALGORITHMS [PETERSON, DEKKER, BAKERY, TAS, CAS, SEMAPHORE]...",
    "> ALLOCATING_SHARED_MEMORY_REGION...",
    "> SPAWNING_THREAD_POOL...",
    "> STARTING_VISUALIZER... OK"
];

// Removed ALGO_INFO

export const MutexVisualizerPage = () => {
    const [booting, setBooting] = useState(true);

    const handleBootComplete = React.useCallback(() => {
        setBooting(false);
    }, []);

    const { state, setState, reset, setAlgorithm, setNumThreads, setSemaphoreValue, initFromPreset, stepGlobal, stepThread } = useMutex();
    const location = useLocation();

    React.useEffect(() => {
        const presetConfig = location.state?.presetConfig as MutexPresetConfig | undefined;
        if (presetConfig && state.currentStep === 0) {
            initFromPreset(presetConfig);
            // Also need to clear the state so going back doesn't keep initializing
            window.history.replaceState({}, document.title);
        }
    }, [location.state, initFromPreset, state.currentStep]);

    // const info = ... // Removed

    // Stats
    const totalCSEntries = state.threads.reduce((sum, t) => sum + t.csCount, 0);
    const totalContentionTicks = state.threads.reduce((sum, t) => sum + t.totalWaitTicks, 0);

    if (booting) {
        return <Loader logs={BOOT_LOGS} onComplete={handleBootComplete} />;
    }

    return (
        <Layout showFooter={false} isApp={true}>
            <LayoutGroup>
                <div className="h-auto lg:h-[calc(100vh-64px)] p-2 bg-background font-mono text-sm flex flex-col gap-2 lg:grid lg:grid-cols-12 lg:grid-rows-[60px_minmax(0,1fr)_260px] overflow-y-auto lg:overflow-hidden">

                    {/* ── Row 1: Controls & Stats ── */}
                    <div className="lg:col-span-12 h-[60px] bg-card border border-border rounded-lg flex items-center px-4 justify-between gap-4 overflow-hidden shrink-0">
                        <div className="flex-1">
                            <Controls
                                state={state}
                                setState={setState}
                                onReset={reset}
                                onStep={stepGlobal}
                                onAlgorithmChange={setAlgorithm}
                                onThreadCountChange={setNumThreads}
                                onSemaphoreChange={setSemaphoreValue}
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-black border border-zinc-800 px-3 py-1 min-w-[80px] flex flex-col justify-center shadow-inner">
                                <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">CS TOTAL</span>
                                <span className="text-lg font-mono text-green-500 leading-none tracking-widest">{totalCSEntries}</span>
                            </div>
                            <div className="bg-black border border-zinc-800 px-3 py-1 min-w-[80px] flex flex-col justify-center shadow-inner">
                                <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">WAIT Σ</span>
                                <span className="text-lg font-mono text-orange-500 leading-none tracking-widest">{totalContentionTicks}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Row 2: Main Visualization ── */}
                    <div className="lg:col-span-12 grid grid-cols-12 gap-2 min-h-0 lg:h-full h-[700px] shrink-0">

                        {/* Left: Shared Memory + RAG */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 h-full min-h-0">
                            {/* Shared Memory Panel */}
                            <div className="bg-card border border-border rounded-lg flex-1 overflow-hidden flex flex-col shadow-sm">
                                <SharedMemory state={state} />
                            </div>

                            {/* RAG Panel */}
                            <div className="bg-card border border-border rounded-lg flex-1 overflow-hidden flex flex-col shadow-sm">
                                <WaitGraphPanel state={state} />
                            </div>
                        </div>

                        {/* Right: Thread Pool */}
                        <div className="col-span-12 lg:col-span-8 bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm h-full">
                            <ThreadPanel threads={state.threads} activeThreadIds={state.activeThreadIds} isPlaying={state.isPlaying} onStepThread={stepThread} />
                        </div>
                    </div>

                    {/* ── Row 3: Code Trace & Event Log ── */}
                    <div className="lg:col-span-12 grid grid-cols-12 gap-2 lg:h-[260px] h-[500px] shrink-0">
                        <div className="col-span-12 lg:col-span-6 bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm h-full max-h-full">
                            <CodeTracePanel state={state} />
                        </div>
                        <div className="col-span-12 lg:col-span-6 bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm h-full max-h-full">
                            <EventLog events={state.events} currentStep={state.currentStep} />
                        </div>
                    </div>
                </div>
            </LayoutGroup>
        </Layout>
    );
};
