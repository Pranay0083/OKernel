
/**
 * SysCore 2.0 - Virtual File System (VFS)
 * 
 * Simulated In-Memory File System for the Shell Maker.
 */

interface FileNode {
    name: string;
    type: 'file' | 'dir';
    content?: string;
    children?: Record<string, FileNode>;
}

export class MockFileSystem {
    private root: FileNode;

    constructor() {
        this.root = {
            name: 'root',
            type: 'dir',
            children: {
                'home': {
                    name: 'home',
                    type: 'dir',
                    children: {
                        'user': {
                            name: 'user',
                            type: 'dir',
                            children: {
                                'README.txt': { name: 'README.txt', type: 'file', content: 'Welcome to SysCore!' },
                                'secret.c': { name: 'secret.c', type: 'file', content: 'void main() { ... }' }
                            }
                        }
                    }
                },
                'bin': {
                    name: 'bin',
                    type: 'dir',
                    children: {
                        'ls': { name: 'ls', type: 'file' },
                        'sh': { name: 'sh', type: 'file' }
                    }
                }
            }
        };
    }

    // Simplified: Just list files in /home/user for now
    listFiles(): string[] {
        const userDir = this.root.children?.['home']?.children?.['user']?.children;
        return userDir ? Object.keys(userDir) : [];
    }

    createFile(name: string) {
        const userDir = this.root.children?.['home']?.children?.['user']?.children;
        if (userDir) {
            userDir[name] = { name, type: 'file', content: '' };
        }
    }
}
