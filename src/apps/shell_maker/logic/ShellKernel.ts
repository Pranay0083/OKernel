
import { Transpiler } from './Transpiler';
import { MockFileSystem } from './FileSystem';
import { sprintf } from './sprintf';

/**
 * SysCore 2.1 - Enhanced Shell Kernel
 * 
 * Uses C-to-JS transpilation to support "Real" execution logic (loops, vars).
 */

export class ShellKernel {
    // We now use a continuous buffer instead of line array
    private outputBuffer: string = "";
    private fs: MockFileSystem;

    // State for run-loop
    private isInternalWaiting = true;
    private inputResolver: ((value: string) => void) | null = null;
    private killSignal = false;

    constructor() {
        this.fs = new MockFileSystem();
    }

    /**
     * Terminate any running process loop.
     */
    kill() {
        this.killSignal = true;
        if (this.inputResolver) {
            this.inputResolver('');
        }
    }

    private emitUpdate(onUpdate: (logs: string[], waiting: boolean) => void) {
        // Split buffer into lines for the UI
        // We preserve empty lines to render \n properly
        const lines = this.outputBuffer.split('\n');
        onUpdate(lines, this.isInternalWaiting);
    }

    async boot(code: string, onUpdate: (logs: string[], waiting: boolean) => void) {
        this.killSignal = false;
        this.outputBuffer = "";

        let jsCode = "";
        try {
            jsCode = Transpiler.compile(code);
        } catch (e: any) {
            this.outputBuffer += `[COMPILER ERROR]: ${e.message}\n`;
            this.emitUpdate(onUpdate);
            return;
        }

        const __sys = {
            print: async (...args: any[]) => {
                let output = "";
                if (args.length > 1 && typeof args[0] === 'string' && args[0].includes('%')) {
                    output = sprintf(args[0], ...args.slice(1));
                } else {
                    output = args.join(' ');
                }

                // Append to buffer stream
                this.outputBuffer += output;

                this.emitUpdate(onUpdate);
            },
            input: async () => {
                this.isInternalWaiting = true;
                this.emitUpdate(onUpdate);
                return new Promise<string>(resolve => {
                    this.inputResolver = resolve;
                });
            },
            yield: async () => {
                if (this.killSignal) throw new Error("SIGKILL");
                await new Promise(r => setTimeout(r, 0));
            },
            fs: this.fs
        };

        try {
            const factory = new Function('__sys', jsCode);
            const mainFn = factory(__sys);

            this.outputBuffer += "[KERNEL] Booting...\n";
            this.emitUpdate(onUpdate);

            await mainFn();

            this.outputBuffer += "\n[KERNEL] Process exited with code 0.\n";
            this.emitUpdate(onUpdate);

        } catch (e: any) {
            if (e.message === "SIGKILL") {
                this.outputBuffer += "\n[KERNEL] Terminated by user.\n";
            } else {
                this.outputBuffer += `\n[KERNEL PANIC]: ${e.message}\n`;
                console.error(e);
            }
            this.emitUpdate(onUpdate);
        }
    }

    sendInput(text: string) {
        if (this.inputResolver) {
            const trimmed = text.trim();
            // Echo input to buffer + newline (Standard terminal behavior)
            // ensuring we don't double-newline if the user hit enter but sent empty? 
            // usually Enter sends "" -> "\n"
            this.outputBuffer += trimmed + "\n";

            this.isInternalWaiting = false;
            const resolve = this.inputResolver;
            this.inputResolver = null;
            resolve(trimmed);
        }
    }
}
