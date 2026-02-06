import { help } from './commands/help';
import { about } from './commands/about';
import { init } from './commands/init';
import { syscore } from './commands/syscore_cli';
// import { curr } from './commands/curr'; // To be implemented if needed
// import { exit } from './commands/exit'; // To be implemented

import { TerminalCommand } from './types';
import { algos } from '../cpu'; // For syscore.cpu access

const commands: Record<string, TerminalCommand> = {
    help,
    about,
    init,
    syscore,
};

// Main Execution Engine
export const execute = (input: string): any => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const [cmdName, ...args] = trimmed.split(' ');

    // 1. Direct Commands (e.g. 'syscore', 'help')
    if (commands[cmdName.toLowerCase()]) {
        return commands[cmdName.toLowerCase()].execute(args);
    }

    // 2. SysCore API (Reflection for syscore.*)
    if (cmdName.toLowerCase().startsWith('syscore.')) {
        return handleSysCoreAPI(cmdName, args);
    }

    // 3. Special Case: Applications (Legacy support)
    if (cmdName === 'applications') {
        return {
            type: 'response',
            content: { component: 'ApplicationsList' }
        };
    }

    // 4. Special Case: Curr (Legacy support)
    if (cmdName === 'curr') {
        return {
            type: 'response',
            content: { component: 'RoadmapStatus' }
        };
    }

    // 5. Special Case: Exit (Legacy support)
    if (cmdName === 'exit') {
        return {
            type: 'system',
            content: {
                action: 'navigate',
                path: '/',
                message: 'SHUTTING DOWN SYSCORE...'
            }
        };
    }

    return { type: 'error', content: `Command not found: ${cmdName}` };
};

const handleSysCoreAPI = (path: string, args: string[]): any => {
    // path examples: 'syscore.cpu', 'syscore.cpu.info', 'syscore.algos.rr'
    const parts = path.toLowerCase().split('.');

    // Hierarchy Level 1: Module
    const module = parts[1]; // cpu, algos, mem, ver, version

    // --- VERSION ---
    if (module === 'version' || module === 'ver') {
        return { type: 'response', content: 'SysCore Engine v0.3.0-stable' };
    }

    // --- CPU MODULE ---
    if (module === 'cpu') {
        const sub = parts[2];

        // 'syscore.cpu' -> Show Module Help
        if (!sub || args.includes('-h') || args.includes('--help')) {
            return {
                type: 'response',
                content: (
                    <div className="space-y-2 text-zinc-400 font-mono text-xs">
                        <div>
                            <strong className="text-blue-400">MODULE: syscore.cpu</strong>
                            <p className="text-zinc-500">Central Processing Unit & Scheduler</p>
                        </div>
                        <div className="pl-2 border-l-2 border-zinc-800">
                            <p>Available Properties/Methods:</p>
                            <ul className="list-disc list-inside pl-2 text-zinc-300">
                                <li><strong className="text-white">info</strong> : Display simplified CPU state</li>
                                <li><strong className="text-white">load</strong> : Current load average (Mock)</li>
                            </ul>
                        </div>
                    </div>
                )
            };
        }

        // 'syscore.cpu.info'
        if (sub === 'info') {
            return { type: 'response', content: { component: 'CpuInfo' } };
        }

        // 'syscore.cpu.load' (Mock)
        if (sub === 'load') {
            return { type: 'response', content: 'Load Average: 0.12, 0.08, 0.05' };
        }
    }

    // --- ALGOS MODULE ---
    if (module === 'algos') {
        const algoName = parts[2]; // e.g. 'round_robin', 'rr'
        const method = parts[3];   // e.g. 'info'

        // 'syscore.algos' -> List Algos
        if (!algoName || args.includes('-h') || args.includes('--help')) {
            return {
                type: 'response',
                content: (
                    <div className="space-y-2 text-zinc-400 font-mono text-xs">
                        <div>
                            <strong className="text-yellow-400">MODULE: syscore.algos</strong>
                            <p className="text-zinc-500">Scheduling Algorithms Registry</p>
                        </div>
                        <div className="pl-2">
                            <p className="mb-1 text-white underline">Available Algorithms:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(algos).map(a => (
                                    <div key={a.code} className="bg-zinc-900/50 p-1 px-2 rounded border border-zinc-800">
                                        <span className="text-green-400 font-bold">{a.name}</span>
                                        <span className="block text-zinc-600 text-[10px]">syscore.algos.{a.name.toLowerCase().replace(/ /g, '_')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-2">Tip: Use syscore.algos.&lt;name&gt;.info for details.</p>
                    </div>
                )
            };
        }

        // 'syscore.algos.<name>'
        // Find algo by fuzzy name
        const key = Object.keys(algos).find(k =>
            algos[k as keyof typeof algos].name.toLowerCase().replace(/ /g, '_') === algoName ||
            k.toLowerCase() === algoName
        );

        if (key) {
            const algo = algos[key as keyof typeof algos];

            // 'syscore.algos.rr.info'
            if (method === 'info') {
                return {
                    type: 'response',
                    content: {
                        component: 'AlgoInfo',
                        data: algo.info
                    }
                };
            }

            // 'syscore.algos.rr' (Default view)
            return {
                type: 'response',
                content: (
                    <div className="space-y-1 text-zinc-400 font-mono text-xs">
                        <div>
                            <strong className="text-green-400">ALGORITHM: {algo.name} [{algo.code}]</strong>
                        </div>
                        <p className="text-zinc-500 italic">"{algo.info.description.substring(0, 50)}..."</p>
                        <ul className="pl-2 mt-2 space-y-1 border-l border-zinc-700">
                            <li><span className="text-zinc-500">Type:</span> {algo.code}</li>
                            <li><span className="text-zinc-500">Method:</span> .info</li>
                        </ul>
                    </div>
                )
            };
        }
    }

    // --- MEM MODULE (Stub) ---
    if (module === 'mem') {
        return {
            type: 'response',
            content: (
                <div className="text-zinc-500 italic">
                    [syscore.mem] Module not loaded. Memory Management Unit initialization pending (v0.4.0).
                </div>
            )
        };
    }

    return { type: 'error', content: `SysCore API path not found or access denied: ${path}` };
}
