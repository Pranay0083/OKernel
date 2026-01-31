
/**
 * SysCore 2.1 - C-to-JS Kernel Transpiler
 * 
 * Converts C-subset code into an Async Function body.
 * Now supports user-defined functions!
 */

export class Transpiler {
    static compile(cCode: string): string {
        let js = cCode;

        // 1. Pre-process (Comments)
        js = js.replace(/\/\/[^\n]*/g, '');

        // 2. Collect User Function Names
        // Match: void|int|char* name(...) {
        const funcRegex = /(?:void|int|char\s*\*)\s+(\w+)\s*\(/g;
        const userFunctions = new Set<string>();
        let match;
        while ((match = funcRegex.exec(js)) !== null) {
            if (match[1] !== 'main' && match[1] !== 'if' && match[1] !== 'while' && match[1] !== 'for' && match[1] !== 'switch') {
                userFunctions.add(match[1]);
            }
        }

        // 3. Replace Function CALLS with await
        // We do this BEFORE converting definitions so we don't mess up "async function name" later? 
        // Or we do it carefully.
        // Logic: \bname\s*\( -> await name(
        // But exclude: void name(, int name(
        userFunctions.forEach(func => {
            // Negative lookbehind for type keywords is hard in JS Regex (supported in modern, but let's be safe).
            // Instead, we replace ONLY if NOT preceded by type keyword.

            // Actually, simplest way: 
            // 1. Replace definitions to placeholders first? NO.
            // 2. Replace calls.

            const callRegex = new RegExp(`(?<!function\\s|void\\s|int\\s|char\\s|char\\*\\s)\\b${func}\\s*\\(`, 'g');
            js = js.replace(callRegex, `await ${func}(`);
        });

        // 4. Convert Function DEFINITIONS
        // void foo(char* x, int y) { -> async function foo(x, y) {

        // A. Remove types from arguments
        // This is tricky globally. Let's do it inside the function def regex if possible or just global cleanup.
        // Global cleanup of argument types inside (...) is hard.
        // Let's replace the whole definition line.

        js = js.replace(/(void|int|char\s*\*)\s+(\w+)\s*\(([^)]*)\)\s*\{/g, (match, type, name, args) => {
            if (name === 'main') return match; // Leave main for later special handling

            // Clean args: "char* cmd, int x" -> "cmd, x"
            const cleanArgs = args.split(',').map((arg: string) => {
                const parts = arg.trim().split(/\s+/);
                return parts[parts.length - 1].replace('*', ''); // Last part is var name
            }).join(', ');

            return `async function ${name}(${cleanArgs}) {`;
        });

        // 5. Transpile Standard C (printf, etc)
        // printf(...) -> await __sys.print(...)
        js = js.replace(/printf\s*\(([^;]+)\);/g, 'await __sys.print($1);');

        // get_input(x) -> x = await __sys.input()
        js = js.replace(/get_input\s*\(([^)]+)\);/g, '$1 = await __sys.input();');

        // strcmp
        js = js.replace(/strcmp\s*\(([^,]+),\s*([^)]+)\)\s*==\s*0/g, '$1 === $2');
        js = js.replace(/strcmp\s*\(([^,]+),\s*([^)]+)\)\s*!=\s*0/g, '$1 !== $2');

        // 6. Variable Declarations
        // char cmd[100]; -> let cmd = "";
        js = js.replace(/char\s+(\w+)\[\d+\];/g, 'let $1 = "";');
        js = js.replace(/int\s+(\w+)\s*=/g, 'let $1 =');
        js = js.replace(/int\s+(\w+);/g, 'let $1 = 0;');
        js = js.replace(/char\s*\*\s*(\w+);/g, 'let $1 = "";');
        js = js.replace(/char\s*\*\s*(\w+)\s*=/g, 'let $1 =');

        // 7. Loop Guards
        js = js.replace(/while\s*\(([^)]+)\)\s*\{/g, 'while ($1) { await __sys.yield();');
        js = js.replace(/for\s*\(([^)]+)\)\s*\{/g, 'for ($1) { await __sys.yield();');
        js = js.replace(/while\s*\(1\)/g, 'while(true)');

        // 8. Main & Headers
        js = js.replace(/#include\s+<[^>]+>/g, '');
        js = js.replace(/#define\s+(\w+)\s+(.+)/g, 'const $1 = $2;'); // Support #define constants

        js = js.replace(/int\s+main\s*\(\)\s*\{/, 'async function kernel_main() {');
        js = js.replace(/return\s+0;/g, 'return;');

        // Wrap
        js += '\nreturn kernel_main;';

        return js;
    }
}
