import { describe, it, expect } from 'vitest';
import { Transpiler } from './Transpiler';

describe('SysCore Transpiler', () => {
  
  it('should compile integer declarations correctly', () => {
    const code = 'int x = 10;';
    const result = Transpiler.compile(code);
    
    // Expect stack allocation and initialization
    expect(result).toContain('const x_ptr = __sys.stack_alloc(4);');
    expect(result).toContain('__sys.write32(x_ptr, 10);');
  });

  it('should compile integer assignments correctly', () => {
    const code = `
      int y;
      y = 20;
    `;
    const result = Transpiler.compile(code);
    
    expect(result).toContain('const y_ptr = __sys.stack_alloc(4);');
    // Default init to 0
    expect(result).toContain('__sys.write32(y_ptr, 0);'); 
    // Assignment
    expect(result).toContain('__sys.write32(y_ptr, 20);');
  });

  it('should handle increment/decrement operators', () => {
    const code = `
      int i = 0;
      i++;
      i--;
    `;
    const result = Transpiler.compile(code);
    
    expect(result).toContain('__sys.write32(i_ptr, __sys.read32(i_ptr) + 1);');
    expect(result).toContain('__sys.write32(i_ptr, __sys.read32(i_ptr) - 1);');
  });

  it('should compile variable reads in expressions', () => {
    // Note: The transpiler replaces variable names with read calls, excluding the definition
    const code = `
      int a = 5;
      int b = a;
    `;
    const result = Transpiler.compile(code);
    
    // The second line 'int b = a;' involves reading 'a'
    // This is tricky because the regex might replace 'a' inside the init part of 'b'
    // Let's check if __sys.read32(a_ptr) appears
    expect(result).toContain('__sys.read32(a_ptr)');
  });

  it('should inject yield into infinite while loops', () => {
    const code = 'while(1) { }';
    const result = Transpiler.compile(code);
    
    expect(result).toContain('while(true)');
    expect(result).toContain('await __sys.yield();');
  });

  it('should inject yield into standard while loops', () => {
    // We must declare x so the transpiler knows to transform it
    const code = `
      int x = 10;
      while (x > 0) { }
    `;
    const result = Transpiler.compile(code);
    
    // read32 is synchronous in the transpiler logic currently
    expect(result).toContain('while (__sys.read32(x_ptr) > 0) { await __sys.yield();');
  });

  it('should inject yield into for loops', () => {
    const code = 'for (int i=0; i<10; i++) { }';
    const result = Transpiler.compile(code);
    
    // Check that yield is injected regardless of header complexity
    expect(result).toContain('await __sys.yield();');
    
    // Check initialization happened
    expect(result).toContain('const i_ptr = __sys.stack_alloc(4);');
  });

  it('should compile printf calls to sys print', () => {
    const code = 'printf("Hello World");';
    const result = Transpiler.compile(code);
    
    expect(result).toContain('await __sys.print("Hello World");');
  });

  it('should compile main function to async kernel_main', () => {
    const code = 'int main() { return 0; }';
    const result = Transpiler.compile(code);
    
    expect(result).toContain('async function kernel_main() {');
    expect(result).toContain('return;'); // return 0 -> return
    expect(result).toContain('return kernel_main;');
  });
  
  it('should handle user defined functions', () => {
      const code = `
        void helper() { }
        int main() { helper(); return 0; }
      `;
      const result = Transpiler.compile(code);

      expect(result).toContain('async function helper() {');
      expect(result).toContain('await helper(');
  });

});
