
/**
 * SysCore VM - Memory Management Unit (MMU)
 * 
 * Simulates physical RAM and provides safe access methods.
 * Endianness: Little Endian (x86 standard).
 */

export class Memory {
    private buffer: ArrayBuffer;
    private view: DataView;
    private u8: Uint8Array;

    // Memory Map
    static readonly SIZE = 1024 * 1024; // 1MB RAM
    static readonly CODE_BASE = 0x0000;
    static readonly DATA_BASE = 0x1000;
    static readonly HEAP_BASE = 0x5000;
    static readonly STACK_TOP = 0xFFFFF; // Top of 1MB

    private heapPtr: number = Memory.HEAP_BASE;

    constructor() {
        this.buffer = new ArrayBuffer(Memory.SIZE);
        this.view = new DataView(this.buffer);
        this.u8 = new Uint8Array(this.buffer);
    }

    /**
     * Reset Memory (Clear All)
     */
    reset() {
        this.u8.fill(0);
        this.heapPtr = Memory.HEAP_BASE;
    }

    getRaw(): Uint8Array {
        return this.u8;
    }

    // --- Basic Accessors ---

    read8(addr: number): number {
        return this.view.getUint8(addr);
    }

    write8(addr: number, val: number) {
        this.view.setUint8(addr, val);
    }

    read32(addr: number): number {
        return this.view.getInt32(addr, true); // true = Little Endian
    }

    write32(addr: number, val: number) {
        this.view.setInt32(addr, val, true);
    }

    // --- String / Array Helpers ---

    /**
     * Write a JS string to memory as a null-terminated C string.
     * Returns the address where it was written.
     */
    writeString(addr: number, str: string) {
        for (let i = 0; i < str.length; i++) {
            this.write8(addr + i, str.charCodeAt(i));
        }
        this.write8(addr + str.length, 0); // Null terminator
    }

    /**
     * Read a null-terminated C string from memory.
     */
    readString(addr: number): string {
        let str = "";
        let ptr = addr;
        while (true) {
            const char = this.read8(ptr);
            if (char === 0) break;
            str += String.fromCharCode(char);
            ptr++;
            // Safety break
            if (ptr - addr > 1000) break;
        }
        return str;
    }

    // --- Allocator (Bump Allocator for MVP) ---
    // Real C requires a free-list, but for "Shell Scripts" a reset-based bump allocator is often enough.

    malloc(size: number): number {
        const ptr = this.heapPtr;
        this.heapPtr += size;
        if (this.heapPtr >= Memory.STACK_TOP) {
            throw new Error("Out of Memory (Heap Collision)");
        }
        return ptr;
    }

    free(ptr: number) {
        // No-op for bump allocator. A real allocator is complex.
        // We rely on 'reset()' mostly.
    }

    // --- Inspection ---
    getUsage(): number {
        return this.heapPtr - Memory.HEAP_BASE;
    }
}
