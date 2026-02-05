/**
 * PreviewPlayer Component
 * 
 * Preview of the current timeline item in a device frame.
 * Shows the selected or current playing item.
 */

import React from 'react';
import { Smartphone, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';

export const PreviewPlayer: React.FC = () => {
    const {
        project,
        isPlaying,
        play,
        pause,
        nextItem,
        previousItem,
        getSelectedItem,
        getCurrentItem
    } = useTimelineStore();

    // Show selected item if any, otherwise show current playing item
    const displayItem = getSelectedItem() || getCurrentItem();

    if (!project) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#0a0a0c]">
                <div className="text-center text-text-muted">
                    <Smartphone size={48} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum projeto</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a0c]">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-center gap-2 px-3 py-2 border-b border-border-color bg-panel-bg">
                <Smartphone size={14} className="text-text-secondary" />
                <span className="text-xs font-medium text-white">Preview</span>
                {displayItem && (
                    <span className="text-xs text-text-muted">
                        #{displayItem.order + 1} / {project.items.length}
                    </span>
                )}
            </div>

            {/* Preview Area */}
            <div className="flex-1 flex items-center justify-center p-4">
                {/* Device Frame */}
                <div className="relative">
                    {/* Phone Frame */}
                    <div
                        className="relative border-4 border-zinc-600/50 bg-black overflow-hidden"
                        style={{
                            width: 220,
                            height: 440,
                            borderRadius: '2rem'
                        }}
                    >
                        {/* Inner border */}
                        <div
                            className="absolute inset-1 border border-zinc-700/30"
                            style={{ borderRadius: 'calc(2rem - 4px)' }}
                        />

                        {/* Content */}
                        {displayItem ? (
                            <img
                                src={displayItem.imageUrl}
                                alt={`Preview ${displayItem.order + 1}`}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center text-white/30">
                                    <p className="text-sm mb-1">Timeline vazia</p>
                                    <p className="text-xs">Adicione itens para visualizar</p>
                                </div>
                            </div>
                        )}

                        {/* Transition indicator */}
                        {displayItem && displayItem.transition !== 'none' && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-purple-500/80 text-[10px] text-white">
                                {displayItem.transition}
                            </div>
                        )}
                    </div>

                    {/* Device Label */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/30 whitespace-nowrap">
                        Mobile • 360×800
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 border-t border-border-color bg-panel-bg">
                <button
                    onClick={previousItem}
                    disabled={!project.items.length}
                    className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                    <SkipBack size={18} />
                </button>

                <button
                    onClick={isPlaying ? pause : play}
                    disabled={!project.items.length}
                    className="p-3 rounded-full bg-accent-blue text-white hover:bg-accent-blue/80 disabled:opacity-30 transition-colors"
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>

                <button
                    onClick={nextItem}
                    disabled={!project.items.length}
                    className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                    <SkipForward size={18} />
                </button>
            </div>

            {/* Mode Indicator */}
            <div className="shrink-0 flex items-center justify-center py-2 border-t border-border-color">
                <span className={`text-[10px] px-2 py-0.5 rounded ${project.mode === 'tap'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-orange-500/20 text-orange-400'
                    }`}>
                    {project.mode === 'tap' ? '👆 Tap Mode' : '▶️ Auto-play'}
                </span>
            </div>
        </div>
    );
};
