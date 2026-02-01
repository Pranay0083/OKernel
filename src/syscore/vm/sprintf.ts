
/**
 * Simple sprintf implementation for SysCore Kernel
 */
export const sprintf = (format: string, ...args: any[]): string => {
    let i = 0;
    return format.replace(/%[sd]/g, (match) => {
        const val = args[i++];
        return val !== undefined ? String(val) : match;
    });
};
