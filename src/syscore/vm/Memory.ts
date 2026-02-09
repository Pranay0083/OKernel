
/**
 * SysCore VM - Memory Management Unit (MMU)
 * 
 * Now refactored to be an API wrapper for the Rust backend.
 */

const API_BASE = "http://localhost:3001/api/vm";

export class Memory {
    static readonly SIZE = 1024 * 1024; // 1MB RAM
    static readonly CODE_BASE = 0x0000;
    static readonly DATA_BASE = 0x1000;
    static readonly HEAP_BASE = 0x5000;
    static readonly STACK_TOP = 0xFFFFF;

    private localBuffer: Uint8Array = new Uint8Array(Memory.SIZE);
    private heapPtr: number = Memory.HEAP_BASE;

    constructor() {}

    private async callApi(endpoint: string, body: any) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`API Error (${response.status}): ${text}`);
            }
            return await response.json();
        } catch (e) {
            console.error(`Fetch error on ${endpoint}:`, e);
            throw e;
        }
    }

    async reset() {
        this.heapPtr = Memory.HEAP_BASE;
        this.localBuffer.fill(0);
        await this.callApi('/reset', this.getState());
    }

    private getState() {
        return {
            memory: {
                heapPtr: this.heapPtr
            },
            fs: {
                root: {
                    name: "root",
                    type: "dir",
                    children: {} 
                }
            }
        };
    }

    async read8(addr: number): Promise<number> {
        return this.localBuffer[addr];
    }

    async write8(addr: number, val: number) {
        this.localBuffer[addr] = val;
        await this.callApi('/write', {
            state: this.getState(),
            address: addr,
            data: val.toString(),
            isString: false
        });
    }

    async read32(addr: number): Promise<number> {
        const view = new DataView(this.localBuffer.buffer);
        return view.getInt32(addr, true);
    }

    async write32(addr: number, val: number) {
        const view = new DataView(this.localBuffer.buffer);
        view.setInt32(addr, val, true);
        await this.callApi('/write', {
            state: this.getState(),
            address: addr,
            data: val.toString(),
            isString: false
        });
    }

    async writeString(addr: number, str: string) {
        for (let i = 0; i < str.length; i++) {
            this.localBuffer[addr + i] = str.charCodeAt(i);
        }
        this.localBuffer[addr + str.length] = 0;

        await this.callApi('/write', {
            state: this.getState(),
            address: addr,
            data: str,
            isString: true
        });
    }

    async readString(addr: number): Promise<string> {
        let str = "";
        let ptr = addr;
        while (true) {
            const char = this.localBuffer[ptr];
            if (char === 0) break;
            str += String.fromCharCode(char);
            ptr++;
            if (ptr - addr > 1000) break;
        }
        return str;
    }

    async malloc(size: number): Promise<number> {
        const result = await this.callApi('/malloc', {
            state: this.getState(),
            size: size
        });
        
        if (result.Ok) {
            const oldPtr = this.heapPtr;
            this.heapPtr = result.Ok.memory.heapPtr;
            return oldPtr;
        } else {
            throw new Error(result.Err || "Out of Memory");
        }
    }

    getRaw(): Uint8Array {
        return this.localBuffer;
    }

    getUsage(): number {
        return this.heapPtr - Memory.HEAP_BASE;
    }
}
