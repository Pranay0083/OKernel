
import { Transpiler } from './Transpiler';
import { MockFileSystem } from './FileSystem';
import { sprintf } from './sprintf';
import { Memory } from './Memory';

/**
 * SysCore 2.1 - Enhanced Shell Kernel
 * 
 * Uses C-to-JS transpilation to support "Real" execution logic (loops, vars).
 */

export class ShellKernel {
    // We now use a continuous buffer instead of line array
    private outputBuffer: string = "";
    private fs: MockFileSystem;
    private mem: Memory;

    // State for run-loop
    private isInternalWaiting = true;
    private inputResolver: ((value: string) => void) | null = null;
    private killSignal = false;

    constructor() {
        this.fs = new MockFileSystem();
        this.mem = new Memory();
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

    inspectMemory(): Uint8Array {
        return this.mem.getRaw();
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
        await this.mem.reset(); // Wipe RAM on boot!

        // Stack Pointer Simulation (Top of stack)
        let sp = Memory.STACK_TOP;

        let jsCode = "";
        try {
            jsCode = Transpiler.compile(code);
        } catch (e: unknown) {
            this.outputBuffer += `[COMPILER ERROR]: ${e instanceof Error ? e.message : String(e)}\n`;
            this.emitUpdate(onUpdate);
            return;
        }

        const __sys = {
            // I/O
            print: async (...args: unknown[]) => {
                let output = "";
                const format = args[0];

                if (args.length > 1 && typeof format === 'string' && format.includes('%')) {
                    // Intercept %s args - if they are numbers (pointers), read string from RAM
                    // Simple heuristic: If the format specifier for this arg is %s, and arg is number, readString
                    // This is a weak parser (doesn't track index), but for "%s...%s" it works if we assume greedy.
                    // Better: Pass ALL args to a memory-aware sprintf.

                    // We need a custom sprintf that can read memory if it sees %s and a number
                    // For MVP: Let's simple check.
                    // Actually, we can just hack it: If it's a number and looks like a pointer (>= 0x1000), try to read?
                    // No, that's dangerous. 10 is a number, 0x1000 is a number.

                    // Solution: The Transpiler should handle this? No, Transpiler doesn't know types easily.
                    // Better: ShellKernel knows. 

                    // Let's implement specific 'strcmp' which expects (ptr, string).

                    // For PRINTF: 
                    // users do: printf("Command: %s", cmd);
                    // cmd is a NUMBER (pointer).
                    // sprintf sees ("...%s", 4096). replacing %s with "4096".
                    // We want "help".

                    // Hacky Fix for MVP:
                    // Iterate args. If we find a number, check if we can read a string from it? 
                    // No. 
                    // Let's rely on valid C: %s implies string. 
                    // We modify sprintf.ts to take 'mem' instance?

                    // Inline expansion for now:
                    let argIndex = 1;
                    // We need a loop to await replacements, or a helper
                    const matches = [...format.matchAll(/%[sd]/g)];
                    output = format;
                    for (const match of matches) {
                        let val = args[argIndex++];
                        if (match[0] === '%s' && typeof val === 'number') {
                            val = await this.mem.readString(val);
                        }
                        output = output.replace(match[0], val !== undefined ? String(val) : match[0]);
                    }

                } else {
                    output = args.join(' ');
                }

                this.outputBuffer += output;
                this.emitUpdate(onUpdate);
            },

            input: async (addr: number) => {
                this.isInternalWaiting = true;
                this.emitUpdate(onUpdate);
                const str = await new Promise<string>(resolve => {
                    this.inputResolver = resolve;
                });
                // Write string to RAM at 'addr'
                await this.mem.writeString(addr, str);
                return str;
            },

            strcmp: async (ptr: number, compareTo: string) => {
                const str = await this.mem.readString(ptr);
                return str === compareTo ? 0 : 1;
            },

            sprintf: async (ptr: number, fmt: string, ...args: unknown[]) => {
                const str = sprintf(fmt, ...args);
                await this.mem.writeString(ptr, str);
                return str.length;
            },

            clear: async () => {
                this.outputBuffer = "";
                this.emitUpdate(onUpdate);
            },
            yield: async () => {
                if (this.killSignal) throw new Error("SIGKILL");
                await new Promise(r => setTimeout(r, 0));
            },

            // Memory / VM API
            malloc: async (size: number) => await this.mem.malloc(size),
            // free: (ptr: number) => this.mem.free(ptr), // No-op for now

            write32: async (addr: number, val: number) => await this.mem.write32(addr, val),
            read32: async (addr: number) => await this.mem.read32(addr),

            write8: async (addr: number, val: number) => await this.mem.write8(addr, val),
            read8: async (addr: number) => await this.mem.read8(addr),

            writeString: async (addr: number, val: string) => await this.mem.writeString(addr, val),
            readString: async (addr: number) => await this.mem.readString(addr),

            // Stack Allocator (Simple bump down)
            stack_alloc: async (size: number) => {
                sp -= size;
                // We might want to sync SP to backend if it's part of VMState
                return sp;
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

        } catch (e: unknown) {
            if (e instanceof Error && e.message === "SIGKILL") {
                this.outputBuffer += "\n[KERNEL] Terminated by user.\n";
            } else {
                const errorMessage = e instanceof Error ? e.message : String(e);
                this.outputBuffer += `\n[KERNEL PANIC]: ${errorMessage}\n`;
                // Dump code for debugging
                this.outputBuffer += `\n--- DEBUG DUMP ---\n${jsCode}\n------------------\n`;
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
