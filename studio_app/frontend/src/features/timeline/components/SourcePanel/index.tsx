/**
 * SourcePanel Component
 * 
 * Panel showing available pages and panels to add to timeline.
 * Items can be dragged to the timeline or clicked to add.
 */

import React, { useState } from 'react';
import { Image, Grid3X3, Plus } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { SourceItem } from '../../types';

interface SourcePanelProps {
    pages: SourceItem[];
    panels: SourceItem[];
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ pages, panels }) => {
    const [activeTab, setActiveTab] = useState<'pages' | 'panels'>('panels');
    const { addItem } = useTimelineStore();

    const items = activeTab === 'pages' ? pages : panels;

    const handleAddItem = (item: SourceItem) => {
        addItem(item);
    };

    const handleDragStart = (e: React.DragEvent, item: SourceItem) => {
        e.dataTransfer.setData('application/json', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="w-full h-full flex flex-col bg-panel-bg border-l border-border-color">
            {/* Header */}
            <div className="shrink-0 px-3 py-2 border-b border-border-color">
                <h3 className="text-xs font-semibold text-white mb-2">Banco de Fontes</h3>

                {/* Tabs */}
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors
                            ${activeTab === 'pages'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Image size={12} />
                        Páginas
                        <span className="text-[10px] opacity-60">({pages.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('panels')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors
                            ${activeTab === 'panels'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Grid3X3 size={12} />
                        Quadros
                        <span className="text-[10px] opacity-60">({panels.length})</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            {activeTab === 'pages' ? <Image size={20} className="text-text-muted" /> : <Grid3X3 size={20} className="text-text-muted" />}
                        </div>
                        <p className="text-xs text-text-muted">
                            {activeTab === 'pages' ? 'Nenhuma página disponível' : 'Nenhum quadro disponível'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                className="group relative cursor-grab active:cursor-grabbing"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-[3/4] bg-zinc-800 rounded-md overflow-hidden border border-transparent hover:border-white/20 transition-colors">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.label}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => handleAddItem(item)}
                                            className="p-2 rounded-full bg-accent-blue text-white hover:scale-110 transition-transform"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {/* Label */}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                                        <p className="text-[10px] font-medium text-white truncate">
                                            {item.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-3 py-2 border-t border-border-color">
                <p className="text-[10px] text-text-muted text-center">
                    Arraste ou clique em + para adicionar
                </p>
            </div>
        </div>
    );
};
