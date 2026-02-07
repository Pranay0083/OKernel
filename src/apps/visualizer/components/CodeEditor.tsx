import React, { useEffect, useRef } from 'react';
import { Editor, useMonaco } from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    onChange: (value: string) => void;
    language: 'python' | 'cpp';
    highlightLine?: number;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language, highlightLine }) => {
    const editorRef = useRef<any>(null);
    const monaco = useMonaco();

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    useEffect(() => {
        if (!editorRef.current || !monaco) return;

        const editor = editorRef.current;
        const model = editor.getModel();

        if (!model) return;

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

        const oldDecorations = editor.getDecorationsInRange(model.getFullModelRange())
            .filter((d: any) => d.options.className?.includes('bg-green-500/20'))
            .map((d: any) => d.id);

        editor.deltaDecorations(oldDecorations, decorations);

        // Reveal the line
        if (highlightLine) {
            editor.revealLineInCenter(highlightLine);
        }

    }, [highlightLine, monaco]);

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
            }}
        />
    );
};

export default CodeEditor;
