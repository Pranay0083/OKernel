import { TerminalCommand } from '../types';

export const syscore: TerminalCommand = {
    name: 'syscore',
    description: 'SysCore Engine CLI Interface',
    execute: (args: string[]) => {
        if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
            return {
                type: 'response',
                content: (
                    <div className="space-y-2 text-zinc-400 font-mono text-xs">
                        <div>
                            <strong className="text-green-500">SysCore Engine v1.0.1</strong>
                            <p className="text-zinc-500">Unified Kernel Interface</p>
                        </div>

                        <div className="space-y-1">
                            <p className="font-bold text-white">Usage:</p>
                            <p>syscore &lt;module&gt;.&lt;submodule&gt; [options]</p>
                        </div>

                        <div className="space-y-1">
                            <p className="font-bold text-white">Modules:</p>
                            <ul className="pl-4 space-y-1">
                                <li>
                                    <strong className="text-primary">syscore.cpu</strong>
                                    <span className="text-zinc-500 block pl-4">Processor & Scheduler Management</span>
                                </li>
                                <li>
                                    <strong className="text-primary">syscore.mem</strong>
                                    <span className="text-zinc-500 block pl-4">Memory Management Unit (Pending)</span>
                                </li>
                                <li>
                                    <strong className="text-primary">syscore.algos</strong>
                                    <span className="text-zinc-500 block pl-4">Algorithm Registry</span>
                                </li>
                            </ul>
                        </div>

                        {/* <div className="space-y-1">
                            <p className="font-bold text-white">Common Commands:</p>
                            <ul className="pl-4">
                                <li><span className="text-green-400">syscore.ver</span> : Check implementation version</li>
                                <li><span className="text-green-400">syscore.cpu.info</span> : Dump CPU state</li>
                            </ul>
                        </div> */}
                    </div>
                )
            };
        }

        return { type: 'error', content: `Unrecognized option: ${args[0]}` };
    }
};
