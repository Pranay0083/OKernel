
export interface TerminalCommand {
    name: string;
    description: string;
    execute: (args: string[]) => { type: 'system' | 'response' | 'error'; content: string | any } | null;
    // Returns null if async (handled internally or via callback, but here we simplify to sync return largely)
}

export type TerminalOutput = {
    type: 'command' | 'response' | 'error' | 'system';
    content: string | any;
    timestamp?: number;
};
