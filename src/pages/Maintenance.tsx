import React from 'react';
import { PowerOff, Hammer } from 'lucide-react';

interface MaintenanceProps {
    message?: string;
    status?: string;
}

export const Maintenance = ({ message, status = 'MAINTENANCE' }: MaintenanceProps) => {
    const isOffline = status === 'OFFLINE';

    return (
        <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center p-4 z-50 font-mono text-center">
            <div className="max-w-2xl w-full space-y-8">
                {/* Icon */}
                <div className={`mx-auto w-16 h-16 rounded-full border flex items-center justify-center relative ${isOffline ? 'bg-red-500/5 border-red-500/20' : 'bg-zinc-900 border-zinc-800'
                    }`}>
                    {isOffline ? (
                        <PowerOff size={32} className="text-red-500" />
                    ) : (
                        <>
                            <div className="absolute inset-0 rounded-full border-t-2 border-green-500 animate-spin"></div>
                            <Hammer size={32} className="text-green-500 animate-pulse" />
                        </>
                    )}
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {isOffline ? 'SYSTEM_OFFLINE' : 'SYSTEM_UPDATE_IN_PROGRESS'}
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        {isOffline
                            ? 'The server is currently unreachable. Please check back later.'
                            : 'The kernel is currently recompiling. Please wait.'}
                    </p>
                </div>

                {message && (
                    <div className={`p-4 rounded border text-xs ${isOffline
                        ? 'border-red-500/20 bg-red-500/5 text-red-400'
                        : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400'
                        }`}>
                        &gt; {message}
                    </div>
                )}

                {/* Progress Bar Mockup (Only for Maintenance) */}
                {!isOffline && (
                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-8">
                        <div className="h-full bg-green-500 w-2/3 animate-[pulse_2s_infinite]"></div>
                    </div>
                )}

                <div className="pt-8 text-[10px] text-zinc-600 uppercase tracking-widest">
                    {isOffline ? 'CONNECTION_TERMINATED' : 'syscore_v2.0_bootloader'}
                </div>
            </div>
        </div>
    );
};
