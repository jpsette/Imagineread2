/**
 * TimelineTrack Component
 * 
 * Horizontal track containing all timeline items.
 * Supports drag-and-drop reordering.
 */

import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { TimelineItem } from './TimelineItem';

export const TimelineTrack: React.FC = () => {
    const { project, selectedItemId, selectItem, reorderItems, removeItem } = useTimelineStore();
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    if (!project) {
        return (
            <div className="h-full flex items-center justify-center text-text-muted">
                Nenhum projeto carregado
            </div>
        );
    }

    const items = project.items;

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDropIndex(index);
    };

    const handleDragEnd = () => {
        if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
            reorderItems(dragIndex, dropIndex);
        }
        setDragIndex(null);
        setDropIndex(null);
    };

    const handleDragLeave = () => {
        setDropIndex(null);
    };

    // Keyboard handlers
    const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            removeItem(itemId);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a0c]">
            {/* Track Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-border-color bg-panel-bg">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">Timeline</span>
                    <span className="text-xs text-text-muted">
                        {items.length} {items.length === 1 ? 'item' : 'itens'}
                    </span>
                </div>
                <div className="text-xs text-text-muted">
                    Total: {(project.items.reduce((sum, i) => sum + i.duration, 0) / 1000).toFixed(1)}s
                </div>
            </div>

            {/* Track Content */}
            <div
                ref={trackRef}
                className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar"
            >
                <div className="flex items-center gap-2 p-4 min-h-full">
                    {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                <Plus size={24} className="text-text-muted" />
                            </div>
                            <p className="text-sm text-text-secondary mb-1">Timeline vazia</p>
                            <p className="text-xs text-text-muted">
                                Arraste quadros ou páginas do painel ao lado
                            </p>
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragLeave={handleDragLeave}
                                onKeyDown={(e) => handleKeyDown(e, item.id)}
                                tabIndex={0}
                                className={`
                                    relative transition-transform duration-150
                                    ${dropIndex === index && dragIndex !== index ? 'translate-x-2' : ''}
                                `}
                            >
                                {/* Drop Indicator */}
                                {dropIndex === index && dragIndex !== null && dragIndex !== index && (
                                    <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-accent-blue rounded-full" />
                                )}

                                <TimelineItem
                                    item={item}
                                    isSelected={selectedItemId === item.id}
                                    isDragging={dragIndex === index}
                                    onSelect={() => selectItem(item.id)}
                                />
                            </div>
                        ))
                    )}

                    {/* Drop zone at end */}
                    {items.length > 0 && (
                        <div
                            className="w-20 h-24 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center"
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDropIndex(items.length);
                            }}
                            onDragLeave={handleDragLeave}
                        >
                            <Plus size={20} className="text-white/20" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
