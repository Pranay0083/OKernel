import { TerminalCommand } from '../types';

export const about: TerminalCommand = {
    name: 'about',
    description: 'System information',
    execute: () => {
        return {
            type: 'response',
            content: "OKernel v0.3.0 - Powered by SysCore Engine. Developed by the OKernel Team."
        };
    }
};
