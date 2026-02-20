
/**
 * SysCore 2.0 - Virtual File System (VFS)
 * 
 * Simulated In-Memory File System - Now refactored to be an API wrapper.
 */

import { config } from '../../config';

const API_BASE = `${config.apiUrl}/api/vm/fs`;

export class MockFileSystem {
    // We maintain a local representation for the UI, but operations go to backend
    private files: string[] = ['README.txt', 'secret.c'];

    constructor() { }

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

            if(!response.ok) {
                const error = await response.text();
                throw new Error(`FS API Error (${response.status}): ${error}`);
            }

            let result: any;
            try {
                result = await response.json();
            } catch {
                throw new Error("Invalid JSON response from FS API");
            }

            if (!result.success) {
                throw new Error(result.error || "File listing failed");
            }

            this.files = result.files;
            return this.files;

        } catch (e) {
            console.error("FS API Error:", e);
            throw e;
        }
    }

    async createFile(name: string) {
        try {
            const response = await fetch(`${API_BASE}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    op: "create",
                    path: "/home/user",
                    name: name
                })
            });
            if(!response.ok) {
                const error = await response.text();
                throw new Error(`FS create failed (${response.status}): ${error}`);
            }

            let result: any;
            try {
                result = await response.json();
            } catch {
                throw new Error("Invalid JSON response from FS API");
            }

            if (!result.success) {
                throw new Error(result.error || "File creation failed");
            }

            if (!this.files.includes(name)) {
                this.files.push(name);
            }
        } catch (e) {
            console.error("FS API Error:", e);
            throw e;
        }
    }
}