import { TerminalCommand } from '../types';

export const about: TerminalCommand = {
    name: 'about',
    description: 'System information',
    execute: () => {
        return {
            type: 'response',
            content: "OKernel v1.0.1 - Powered by SysCore Engine. Developed by the OKernel Team."
        };
    }
};
