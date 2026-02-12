import React from 'react';
import { Terminal, Code, Play, Box } from 'lucide-react';

export const ShellMakerDocs: React.FC = () => {
    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-100 mb-4 flex items-center gap-3">
                    <Terminal className="text-blue-400" size={32} />
                    Shell Maker
                </h1>
                <p className="text-xl text-gray-400">
                    A dedicated environment for building, testing, and visualizing custom shell implementations using our virtual kernel.
                </p>
            </div>

            {/* Feature Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="features">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Code className="text-green-400" size={20} />
                        <h3 className="text-lg font-semibold text-gray-200">Monaco Editor</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Full-featured code editor with syntax highlighting, auto-completion, and error checking for C/C++ shell development.
                    </p>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Play className="text-yellow-400" size={20} />
                        <h3 className="text-lg font-semibold text-gray-200">Live Execution</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Instantly compile and run your shell code against the virtual kernel (SysCore) to see command execution in real-time.
                    </p>
                </div>
            </div>

            {/* Implementation Guide */}
            <section className="space-y-4" id="building">
                <h2 className="text-2xl font-semibold text-gray-100 border-b border-gray-800 pb-2">
                    Building a Custom Shell
                </h2>
                <p className="text-gray-300">
                    The Shell Maker module provides a template for creating a basic REPL (Read-Eval-Print Loop). Your shell interacts with the system via standard system calls.
                </p>

                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Basic Structure</h3>
                    <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800 font-mono text-sm overflow-x-auto">
                        <pre className="text-gray-300">
{`#include <sys/types.h>
#include <unistd.h>
#include <stdio.h>

int main() {
    char input[1024];
    
    while(1) {
        // 1. Display Prompt
        printf("myshell> ");
        
        // 2. Read Input
        if (fgets(input, sizeof(input), stdin) == NULL) {
            break;
        }
        
        // 3. Parse & Execute
        // Your logic to tokenize and fork/exec commands
    }
    return 0;
}`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* Integration Details */}
            <section className="space-y-4" id="integration">
                <h2 className="text-2xl font-semibold text-gray-100 border-b border-gray-800 pb-2">
                    SysCore Integration
                </h2>
                <p className="text-gray-300">
                    The editor environment is sandboxed but connected to the <code className="text-blue-300 bg-blue-900/20 px-1 py-0.5 rounded">SysCore</code> backend via gRPC. When you click "Run", the following happens:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>The C code is sent to the backend transpiler.</li>
                    <li>Code is converted to safer, executable JS/Wasm instructions.</li>
                    <li>The virtual process is spawned in the kernel scheduler.</li>
                    <li>Standard I/O is piped back to the terminal output pane.</li>
                </ul>
            </section>

             <section className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <Box className="text-blue-400 mt-1" size={20} />
                    <div>
                        <h4 className="font-semibold text-blue-300">Pro Tip: Process Visualization</h4>
                        <p className="text-sm text-blue-200/80 mt-1">
                            While running your shell, switch to the <strong>Process View</strong> tab to watch how the kernel manages your shell's process Control Block (PCB) and memory allocation in real-time.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};
