
/**
 * SysCore 2.1 - C-to-JS Kernel Transpiler
 * 
 * Converts C-subset code into an Async Function body.
 * Now supports user-defined functions!
 */

export class Transpiler {

    static compile(cCode: string): string {
        let js = cCode;
        const vars = new Set<string>(); // Track integer variables

        // 1. Pre-process (Comments)
        js = js.replace(/\/\/[^\n]*/g, '');

        // 2. Identify and Transpile Variable Declarations (Integers)
        // int x = 10; -> const x_ptr = __sys.stack_alloc(4); __sys.write32(x_ptr, 10);
        // int x;      -> const x_ptr = __sys.stack_alloc(4); __sys.write32(x_ptr, 0);

        // Note: We use a specific suffix '_ptr' to avoid collision with JS keywords if user uses them.
        // We capture the declaration relative to the scope? No, global replace for now (MVP).

        // Regex for "int var =" or "int var;"
        js = js.replace(/int\s+(\w+)(\s*=\s*([^;]+))?;/g, (match, name, eqPart, val) => {
            vars.add(name);
            const initVal = val ? val.trim() : '0';
            return `const ${name}_ptr = __sys.stack_alloc(4); __sys.write32(${name}_ptr, ${initVal});`;
        });

        // 3. Transpile Assignments (L-Values)
        // x = 20; -> __sys.write32(x_ptr, 20);
        vars.forEach(v => {
            const assignRegex = new RegExp(`\\b${v}\\s*=\\s*([^;]+);`, 'g');
            js = js.replace(assignRegex, `__sys.write32(${v}_ptr, $1);`);

            // x++; -> __sys.write32(x_ptr, __sys.read32(x_ptr) + 1);
            // We match 'x++' possibly without a semicolon (for loops)
            const incRegex = new RegExp(`\\b${v}\\+\\+;?`, 'g');
            js = js.replace(incRegex, `__sys.write32(${v}_ptr, __sys.read32(${v}_ptr) + 1);`);

            // x--;
            const decRegex = new RegExp(`\\b${v}--;?`, 'g');
            js = js.replace(decRegex, `__sys.write32(${v}_ptr, __sys.read32(${v}_ptr) - 1);`);
        });

        // 4. Transpile Reads (R-Values)
        // Any remaining occurrence of 'x' that isn't x_ptr must be a read.
        vars.forEach(v => {
            // Negative lookahead to ensure we don't match x_ptr
            const readRegex = new RegExp(`\\b${v}\\b(?!_ptr)`, 'g');
            js = js.replace(readRegex, `__sys.read32(${v}_ptr)`);
        });

        // 5. User Functions (Async Wrapper)
        const funcRegex = /(?:void|int|char\s*\*)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
        const userFunctions = new Set<string>();
        let match;
        while ((match = funcRegex.exec(js)) !== null) {
            if (match[1] !== 'main' && match[1] !== 'if' && match[1] !== 'while' && match[1] !== 'for') {
                userFunctions.add(match[1]);
            }
        }

        userFunctions.forEach(func => {
            const callRegex = new RegExp(`(?<!function\\s|void\\s|int\\s|char\\s|char\\*\\s)\\b${func}\\s*\\(`, 'g');
            js = js.replace(callRegex, `await ${func}(`);
        });

        // Function Definitions
        js = js.replace(/(void|int|char\s*\*)\s+(\w+)\s*\(([^)]*)\)\s*\{/g, (match, type, name, args) => {
            if (name === 'main') return match;
            const cleanArgs = args.split(',').map((arg: string) => {
                const parts = arg.trim().split(/\s+/);
                return parts[parts.length - 1].replace('*', '');
            }).join(', ');
            return `async function ${name}(${cleanArgs}) {`;
        });

        // 6. SysCalls
        // Use word boundary to ensure we don't match sprintf as s[printf]
        js = js.replace(/\bprintf\s*\(([^;]+)\);/g, 'await __sys.print($1);');
        // get_input special handling: C passes array pointer. JS passes ptr.
        // get_input(cmd) -> cmd is x_ptr (if int) or just the string buffer?
        // Wait, char arrays.

        // 7. Char Arrays (Strings)
        // char cmd[100]; -> const cmd_ptr = __sys.malloc(100); __sys.write8(cmd_ptr, 0);
        js = js.replace(/char\s+(\w+)\[(\d+)\];/g, (match, name, size) => {
            return `const ${name} = __sys.malloc(${size}); __sys.write8(${name}, 0);`; // Null init
        });

        // get_input(cmd) -> await __sys.input(cmd) ?
        // We need execution logic to write input into RAM.
        js = js.replace(/get_input\s*\(([^)]+)\);/g, 'await __sys.input($1);');

        // strcmp(cmd, "str")
        // We need a helper for this: __sys.strcmp(cmd, "str")
        js = js.replace(/strcmp\s*\(([^,]+),\s*([^)]+)\)/g, '__sys.strcmp($1, $2)');

        // sprintf(buf, "fmt", ...) -> __sys.sprintf(buf, "fmt", ...)
        js = js.replace(/sprintf\s*\(([^,]+),/g, '__sys.sprintf($1,');

        // Constants (Simulated)
        js = js.replace(/clear\s*\(\);/g, 'await __sys.clear();');

        // 8. Loop Guards
        // Updated regex to use non-greedy match (.*?) to handle nested parentheses like __sys.read32(...)
        js = js.replace(/while\s*\((.*?)\)\s*\{/g, 'while ($1) { await __sys.yield();');
        js = js.replace(/for\s*\((.*?)\)\s*\{/g, 'for ($1) { await __sys.yield();');
        js = js.replace(/while\s*\(1\)/g, 'while(true)');

        // 9. Cleanup
        js = js.replace(/#include\s+<[^>]+>/g, '');
        js = js.replace(/#define\s+(\w+)\s+(.+)/g, 'const $1 = $2;');
        js = js.replace(/int\s+main\s*\(\)\s*\{/, 'async function kernel_main() {');
        js = js.replace(/return\s+0;/g, 'return;');

        js += '\nreturn kernel_main;';

        return js;
    }
}
