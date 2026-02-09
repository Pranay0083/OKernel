
/**
 * SysCore 2.0 - Virtual File System (VFS)
 * 
 * Simulated In-Memory File System - Now refactored to be an API wrapper.
 */

const API_BASE = "http://localhost:3001/api/vm/fs";

export class MockFileSystem {
    // We maintain a local representation for the UI, but operations go to backend
    private files: string[] = ['README.txt', 'secret.c'];

    constructor() {}

    async listFiles(): Promise<string[]> {
        try {
            const response = await fetch(`${API_BASE}/ls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    op: "ls",
                    path: "/home/user"
                })
            });
            const result = await response.json();
            if (result.success) {
                this.files = result.files;
                return this.files;
            }
        } catch (e) {
            console.error("FS API Error:", e);
        }
        return this.files;
    }

    async createFile(name: string) {
        try {
            await fetch(`${API_BASE}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    op: "create",
                    path: "/home/user",
                    name: name
                })
            });
            if (!this.files.includes(name)) {
                this.files.push(name);
            }
        } catch (e) {
            console.error("FS API Error:", e);
        }
    }
}
