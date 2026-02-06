import { describe, it, expect, beforeEach } from 'vitest';
import { Memory } from './Memory';

describe('Memory', () => {
    let memory: Memory;

    beforeEach(() => {
        memory = new Memory();
    });

    describe('8-bit operations', () => {

        it('should write and read 8-bit value', () => {
            memory.write8(0x100, 255);
            expect(memory.read8(0x100)).toBe(255);
        });

        it('should return 0 for uninitialized memory', () => {
            expect(memory.read8(0x500)).toBe(0);
        });

        it('should handle multiple writes at different addresses', () => {
            memory.write8(0x100, 10);
            memory.write8(0x101, 20);
            memory.write8(0x102, 30);

            expect(memory.read8(0x100)).toBe(10);
            expect(memory.read8(0x101)).toBe(20);
            expect(memory.read8(0x102)).toBe(30);
        });

        it('should overwrite existing value', () => {
            memory.write8(0x100, 100);
            memory.write8(0x100, 200);
            expect(memory.read8(0x100)).toBe(200);
        });

    });

    describe('32-bit operations', () => {

        it('should write and read positive 32-bit value', () => {
            memory.write32(0x100, 12345678);
            expect(memory.read32(0x100)).toBe(12345678);
        });

        it('should write and read negative 32-bit value (signed)', () => {
            memory.write32(0x100, -42);
            expect(memory.read32(0x100)).toBe(-42);
        });

        it('should write and read max signed int32', () => {
            memory.write32(0x100, 2147483647);
            expect(memory.read32(0x100)).toBe(2147483647);
        });

        it('should write and read min signed int32', () => {
            memory.write32(0x100, -2147483648);
            expect(memory.read32(0x100)).toBe(-2147483648);
        });

        it('should store in little endian format', () => {
            memory.write32(0x100, 0x12345678);
            // Little endian: least significant byte first
            expect(memory.read8(0x100)).toBe(0x78);
            expect(memory.read8(0x101)).toBe(0x56);
            expect(memory.read8(0x102)).toBe(0x34);
            expect(memory.read8(0x103)).toBe(0x12);
        });

    });

    describe('string operations', () => {

        it('should write and read a string', () => {
            memory.writeString(0x100, 'Hello');
            expect(memory.readString(0x100)).toBe('Hello');
        });

        it('should handle empty string', () => {
            memory.writeString(0x100, '');
            expect(memory.readString(0x100)).toBe('');
        });

        it('should null-terminate strings', () => {
            memory.writeString(0x100, 'Hi');
            expect(memory.read8(0x100)).toBe(72); // 'H'
            expect(memory.read8(0x101)).toBe(105); // 'i'
            expect(memory.read8(0x102)).toBe(0); // null
        });

        it('should stop reading at null terminator', () => {
            memory.writeString(0x100, 'ABC');
            memory.write8(0x101, 0); // Insert null after 'A'
            expect(memory.readString(0x100)).toBe('A');
        });

        it('should have safety limit on long reads', () => {
            // Write a very long string without null terminator
            for (let i = 0; i < 2000; i++) {
                memory.write8(0x100 + i, 65); // 'A'
            }
            const result = memory.readString(0x100);
            // Safety break triggers when ptr - addr > 1000, so max length is 1001
            expect(result.length).toBeLessThanOrEqual(1001);
        });

    });

    describe('allocator (malloc)', () => {

        it('should return heap base on first allocation', () => {
            const ptr = memory.malloc(10);
            expect(ptr).toBe(Memory.HEAP_BASE);
        });

        it('should increment pointer on subsequent allocations', () => {
            const ptr1 = memory.malloc(10);
            const ptr2 = memory.malloc(20);
            expect(ptr2).toBe(ptr1 + 10);
        });

        it('should throw on heap overflow', () => {
            expect(() => {
                memory.malloc(Memory.SIZE); // Larger than available
            }).toThrow('Out of Memory');
        });

    });

    describe('reset()', () => {

        it('should clear all memory to zero', () => {
            memory.write8(0x100, 255);
            memory.write32(0x200, 12345);
            memory.reset();

            expect(memory.read8(0x100)).toBe(0);
            expect(memory.read32(0x200)).toBe(0);
        });

        it('should reset heap pointer', () => {
            memory.malloc(100);
            memory.reset();
            const ptr = memory.malloc(10);
            expect(ptr).toBe(Memory.HEAP_BASE);
        });

    });

    describe('getters', () => {

        it('should return Uint8Array from getRaw()', () => {
            const raw = memory.getRaw();
            expect(raw).toBeInstanceOf(Uint8Array);
            expect(raw.length).toBe(Memory.SIZE);
        });

        it('should track heap usage with getUsage()', () => {
            expect(memory.getUsage()).toBe(0);
            memory.malloc(100);
            expect(memory.getUsage()).toBe(100);
            memory.malloc(50);
            expect(memory.getUsage()).toBe(150);
        });

    });

    describe('static constants', () => {

        it('should define memory size as 1MB', () => {
            expect(Memory.SIZE).toBe(1024 * 1024);
        });

        it('should define memory regions', () => {
            expect(Memory.CODE_BASE).toBeDefined();
            expect(Memory.DATA_BASE).toBeDefined();
            expect(Memory.HEAP_BASE).toBeDefined();
            expect(Memory.STACK_TOP).toBeDefined();
        });

    });

});
