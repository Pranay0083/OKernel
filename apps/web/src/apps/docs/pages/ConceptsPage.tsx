import React from 'react';
import { Construction, BookOpen } from 'lucide-react';

export const ConceptsPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-yellow-500">
                <Construction size={32} />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Documentation in Progress</h1>
                <p className="text-zinc-500 max-w-md">
                    We are currently writing the detailed documentation for this module. Please check back later or explore the interactive visualizer.
                </p>
            </div>
            <a 
                href="https://en.wikipedia.org/wiki/Operating_system" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-sm text-zinc-300 transition-colors"
            >
                <BookOpen size={14} /> Read External Resources
            </a>
        </div>
    );
};
