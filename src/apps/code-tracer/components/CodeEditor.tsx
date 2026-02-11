import React, { useEffect, useRef } from 'react';
import { Editor, useMonaco } from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    onChange: (value: string) => void;
    language: 'python' | 'cpp';
    highlightLine?: number;
    lineExecutionTimes?: Record<number, number>; // Line Number -> Duration (ns)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language, highlightLine, lineExecutionTimes, options: customOptions }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorRef = useRef<any>(null);
    const monaco = useMonaco();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    useEffect(() => {
        if (!editorRef.current || !monaco) return;

        const editor = editorRef.current;
        const model = editor.getModel();

        if (!model) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decorations: any[] = [];
        if (highlightLine) {
            decorations.push({
                range: new monaco.Range(highlightLine, 1, highlightLine, 1),
                options: {
                    isWholeLine: true,
                    className: 'bg-green-500/20 border-l-2 border-green-500',
                    glyphMarginClassName: 'bg-green-500 w-2 h-2 rounded-full ml-1',
                },
            });
        }

        // Add heat/duration decorations
        if (lineExecutionTimes) {
            Object.entries(lineExecutionTimes).forEach(([line, duration]) => {
                const lineNum = parseInt(line);
                if (duration > 0) {
                    // Normalize intensity (0.1 to 0.6 opacity)
                    // const intensity = 0.1 + (duration / maxDuration) * 0.5;
                    // const color = duration > 1000000 ? `rgba(239, 68, 68, ${intensity})` : `rgba(59, 130, 246, ${intensity})`; // Unused

                    decorations.push({
                        range: new monaco.Range(lineNum, 1, lineNum, 1),
                        options: {
                            isWholeLine: false, // Don't highlight whole line background, maybe just gutter or end?
                            // Let's use afterContentClassName to show time at end of line
                            afterContentClassName: 'text-xs text-zinc-500 ml-4 font-mono opacity-50',
                            after: {
                                content: duration < 1000 ? `${duration}ns` : duration < 1000000 ? `${(duration / 1000).toFixed(0)}µs` : `${(duration / 1000000).toFixed(1)}ms`
                            }
                        }
                    });
                }
            });
        }

        const oldDecorations = editor.getDecorationsInRange(model.getFullModelRange())
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((d: any) => d.options.className?.includes('bg-green-500/20') || d.options.afterContentClassName?.includes('text-xs'))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((d: any) => d.id);

        editor.deltaDecorations(oldDecorations, decorations);

        // Reveal the line
        if (highlightLine) {
            editor.revealLineInCenter(highlightLine);
        }

    }, [highlightLine, monaco, lineExecutionTimes]);

    return (
        <Editor
            height="100%"
            defaultLanguage={language}
            value={code}
            theme="vs-dark"
            onChange={(val) => onChange(val || '')}
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
                fontFamily: 'JetBrains Mono, monospace',
                glyphMargin: true,
                ...customOptions
            }}
        />
    );
};

export default CodeEditor;
