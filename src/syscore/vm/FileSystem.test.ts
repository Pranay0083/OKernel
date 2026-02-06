import { describe, it, expect, beforeEach } from 'vitest';
import { MockFileSystem } from './FileSystem';

describe('MockFileSystem', () => {
    let fs: MockFileSystem;

    beforeEach(() => {
        fs = new MockFileSystem();
    });

    describe('listFiles()', () => {

        it('should return default files in /home/user', () => {
            const files = fs.listFiles();

            expect(files).toContain('README.txt');
            expect(files).toContain('secret.c');
        });

        it('should return array of strings', () => {
            const files = fs.listFiles();

            expect(Array.isArray(files)).toBe(true);
            files.forEach(f => expect(typeof f).toBe('string'));
        });

        it('should have exactly 2 default files', () => {
            const files = fs.listFiles();
            expect(files).toHaveLength(2);
        });

    });

    describe('createFile()', () => {

        it('should add a new file to the listing', () => {
            fs.createFile('newfile.txt');
            const files = fs.listFiles();

            expect(files).toContain('newfile.txt');
        });

        it('should allow creating multiple files', () => {
            fs.createFile('file1.txt');
            fs.createFile('file2.txt');
            fs.createFile('file3.txt');

            const files = fs.listFiles();

            expect(files).toContain('file1.txt');
            expect(files).toContain('file2.txt');
            expect(files).toContain('file3.txt');
        });

        it('should preserve existing default files after creation', () => {
            fs.createFile('newfile.txt');
            const files = fs.listFiles();

            expect(files).toContain('README.txt');
            expect(files).toContain('secret.c');
        });

        it('should handle file with extension', () => {
            fs.createFile('script.sh');
            const files = fs.listFiles();
            expect(files).toContain('script.sh');
        });

    });

    describe('default structure', () => {

        it('should create fresh instance with default files', () => {
            const freshFs = new MockFileSystem();
            const files = freshFs.listFiles();

            expect(files).toHaveLength(2);
            expect(files).toContain('README.txt');
        });

        it('should isolate instances from each other', () => {
            const fs1 = new MockFileSystem();
            const fs2 = new MockFileSystem();

            fs1.createFile('only_in_fs1.txt');

            expect(fs1.listFiles()).toContain('only_in_fs1.txt');
            expect(fs2.listFiles()).not.toContain('only_in_fs1.txt');
        });

    });

});
