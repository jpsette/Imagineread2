/**
 * ReaderMenu Component
 * 
 * Dropdown menu for the Native Reader in the top menu bar.
 * Provides options to open the reader and configure animations.
 */

import React from 'react';
import { BookOpen, Zap, ZoomIn } from 'lucide-react';
import { useReaderStore } from '../store/useReaderStore';

interface ReaderMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReaderMenu: React.FC<ReaderMenuProps> = ({ isOpen, onClose }) => {
    const {
        showReader,
        setShowReader,
        enableAnimations,
        setEnableAnimations,
        enableZoom,
        setEnableZoom,
    } = useReaderStore();

    if (!isOpen) return null;

    return (
        <div className="absolute top-full left-0 mt-1 w-56 bg-surface border border-border-color rounded-lg shadow-xl py-1 z-50 ring-1 ring-black/50 animate-in fade-in zoom-in-95 duration-100">
            {/* Header */}
            <div className="px-3 py-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                Leitor Nativo
            </div>

            {/* Open Reader Button */}
            <button
                onClick={() => {
                    setShowReader(!showReader);
                    onClose();
                }}
                className="w-full text-left px-4 py-2 text-[13px] text-text-primary hover:bg-accent-blue hover:text-white transition-colors flex items-center gap-2"
            >
                <BookOpen size={14} />
                <span>{showReader ? 'Fechar Leitor' : 'Abrir Leitor'}</span>
            </button>

            {/* Divider */}
            <div className="h-px bg-white/10 my-1" />

            {/* Settings Header */}
            <div className="px-3 py-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                Configurações
            </div>

            {/* Toggle: Animations */}
            <label className="flex items-center gap-2 px-4 py-1.5 hover:bg-surface-hover cursor-pointer group">
                <input
                    type="checkbox"
                    checked={enableAnimations}
                    onChange={() => setEnableAnimations(!enableAnimations)}
                    className="rounded border-zinc-600 bg-zinc-800 text-accent-blue focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <Zap size={14} className="text-text-muted group-hover:text-text-primary" />
                <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">
                    Animações de Balões
                </span>
            </label>

            {/* Toggle: Zoom */}
            <label className="flex items-center gap-2 px-4 py-1.5 hover:bg-surface-hover cursor-pointer group">
                <input
                    type="checkbox"
                    checked={enableZoom}
                    onChange={() => setEnableZoom(!enableZoom)}
                    className="rounded border-zinc-600 bg-zinc-800 text-accent-blue focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <ZoomIn size={14} className="text-text-muted group-hover:text-text-primary" />
                <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">
                    Zoom Interativo
                </span>
            </label>
        </div>
    );
};
