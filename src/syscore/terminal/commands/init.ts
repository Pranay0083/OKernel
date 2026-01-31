import { TerminalCommand } from '../types';

export const init: TerminalCommand = {
    name: 'init',
    description: 'Launch an application',
    execute: (args: string[]) => {
        if (args.length === 0) {
            return { type: 'error', content: 'Usage: init <app_name>' };
        } else if (args[0].toLowerCase() === 'cpu_scheduler') {
            return {
                type: 'system',
                content: {
                    action: 'navigate',
                    path: '/dev/scheduler',
                    message: 'INITIALIZING CPU SCHEDULER...'
                }
            };
        } else if (args[0] === 'shell' || args[0] === 'sh') {
            return {
                type: 'system',
                content: {
                    action: 'navigate',
                    path: '/dev/shell',
                    message: 'INITIALIZING SHELL MAKER...'
                }
            };
        } else {
            return { type: 'error', content: `Error: Application '${args[0]}' not found.` };
        }
    }
};
