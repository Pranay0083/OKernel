
import React from 'react';
import Editor from '@monaco-editor/react';

interface EditorWindowProps {
    code: string;
    onChange: (value: string | undefined) => void;
}

export const EditorWindow: React.FC<EditorWindowProps> = ({ code, onChange }) => {
    return (
        <div className="h-full w-full bg-[#1e1e1e] flex flex-col">
            <div className="h-8 bg-[#2d2d2d] flex items-center px-4 border-b border-black">
                <span className="text-xs text-zinc-400 font-mono">shell_kernel.c</span>
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    defaultLanguage="cpp"
                    theme="vs-dark"
                    value={code}
                    onChange={onChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "JetBrains Mono, monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
};
