import { TerminalCommand } from '../types';

export const help: TerminalCommand = {
    name: 'help',
    description: 'List available commands',
    execute: () => {
        return {
            type: 'response',
            content: {
                // Return structured data, let the renderer format it, or return JSX/Component directly?
                // For SysCore, let's return raw data or simple strings, and let the hook map it.
                // But current useTerminal logic expects JSX sometimes. 
                // Let's stick to returning an object that the hook can render.
                component: 'HelpResponse'
            }
        };
    }
};
