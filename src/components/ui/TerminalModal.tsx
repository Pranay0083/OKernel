
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface TerminalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: 'info' | 'danger' | 'warning';
    confirmText?: string;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({
    isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'CONFIRM'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-[400px] border border-zinc-800 bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`px-4 py-2 border-b border-zinc-800 flex items-center justify-between ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-900 text-zinc-400'
                    }`}>
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                        {type === 'danger' && <AlertTriangle size={14} />}
                        {title}
                    </div>
                    <button onClick={onClose} className="hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 font-mono text-sm text-zinc-300">
                    <p>{message}</p>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white"
                    >
                        CANCEL
                    </Button>
                    {onConfirm && (
                        <Button
                            size="sm"
                            onClick={() => { onConfirm(); onClose(); }}
                            className={
                                type === 'danger'
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-green-600 hover:bg-green-500 text-black'
                            }
                        >
                            {confirmText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
