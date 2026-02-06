import { describe, it, expect } from 'vitest';
import { execute } from './index';

// Mock dependencies if needed, but here we test pure logic mostly
// The file imports React which is fine in jsdom env

describe('SysCore Terminal Executor', () => {

  it('should ignore empty input', () => {
    expect(execute('')).toBeNull();
    expect(execute('   ')).toBeNull();
  });

  it('should execute direct commands', () => {
    // We assume 'help' command exists and returns a response
    // We don't check the exact content of help, just that it ran
    const result = execute('help');
    expect(result).not.toBeNull();
    // Commands usually return { type: 'response', content: ... }
    expect(result.type).toBe('response');
  });

  it('should return error for unknown commands', () => {
    const result = execute('not_a_real_command');
    expect(result.type).toBe('error');
    expect(result.content).toContain('not found');
  });

  it('should handle syscore.version API', () => {
    const result = execute('syscore.version');
    expect(result.type).toBe('response');
    expect(result.content).toContain('v0.3.0');
  });

  it('should handle syscore.cpu.info', () => {
    const result = execute('syscore.cpu.info');
    expect(result.type).toBe('response');
    expect(result.content).toEqual({ component: 'CpuInfo' });
  });

  it('should handle syscore.mem (Stub)', () => {
    const result = execute('syscore.mem');
    expect(result.type).toBe('response');
    // Content is a React element (JSX)
    // In Vitest/React, this is an object.
    // We can check if it looks like a react element or check props
    expect(result.content.props.children).toContain('Module not loaded');
  });

  it('should resolve algorithm info via syscore API', () => {
    const result = execute('syscore.algos.rr.info');
    expect(result.type).toBe('response');
    expect(result.content.component).toBe('AlgoInfo');
    // The data object is algo.info, which contains description
    expect(result.content.data.description).toContain('Round Robin');
  });

  it('should handle case-insensitive API calls', () => {
    const result = execute('SysCore.Algos.RR.Info');
    expect(result.type).toBe('response');
    expect(result.content.component).toBe('AlgoInfo');
  });

  it('should return error for invalid syscore paths', () => {
    const result = execute('syscore.fake.path');
    expect(result.type).toBe('error');
    expect(result.content).toContain('not found');
  });

});
