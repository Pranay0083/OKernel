import React from 'react';

export interface SystemAction {
    action: string;
    path?: string;
    message?: string;
}

export interface TerminalCommand {
    name: string;
    description: string;
    execute: (args: string[]) => { type: 'system' | 'response' | 'error'; content: string | React.ReactNode | { component: string; data?: unknown } | SystemAction } | null;
    // Returns null if async (handled internally or via callback, but here we simplify to sync return largely)
}

export type TerminalOutput = {
    type: 'command' | 'response' | 'error' | 'system';
    content: string | React.ReactNode | { component: string; data?: unknown } | SystemAction;
    timestamp?: number;
};
