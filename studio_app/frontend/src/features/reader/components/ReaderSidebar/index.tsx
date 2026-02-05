/**
 * ReaderSidebar Component
 * 
 * Main sidebar for the Reader module.
 * Features resizable split between Pages and Panels sections.
 * Uses the same robust resize pattern as DraggableWindow.
 */

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Layers, Settings2 } from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';
import { PageList } from './PageList';
import { PanelList } from './PanelList';
import { ViewControls } from './ViewControls';
import { usePanelNavigation } from '../../hooks';

export const ReaderSidebar: React.FC = () => {
    const { pages, getCurrentPage } = useReaderStore();
    const { hasPanels } = usePanelNavigation();
    const currentPage = getCurrentPage();

    const hasPages = pages.length > 0;
    const panelCount = currentPage?.previewImages?.length || 0;

    // Resizable split state
    const [splitRatio, setSplitRatio] = useState(0.4); // 40% for pages by default
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Store initial values when drag starts (same pattern as DraggableWindow)
    const dragRef = useRef<{ startY: number; startRatio: number } | null>(null);

    // Handle drag start (same pattern as DraggableWindow)
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        dragRef.current = {
            startY: e.clientY,
            startRatio: splitRatio
        };
    };

    // Global mouse handlers (same pattern as DraggableWindow.useEffect for resize)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && dragRef.current && containerRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const deltaY = e.clientY - dragRef.current.startY;
                const deltaRatio = deltaY / containerHeight;

                const newRatio = dragRef.current.startRatio + deltaRatio;
                const clampedRatio = Math.min(0.85, Math.max(0.15, newRatio));

                setSplitRatio(clampedRatio);
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                dragRef.current = null;
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, splitRatio]);

    return (
        <div className="w-64 bg-panel-bg border-r border-border-color flex flex-col h-full">
            {/* Main content area with resizable split */}
            <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Pages Section */}
                <div
                    className="overflow-hidden flex flex-col px-4 py-3 shrink-0"
                    style={{ height: `${splitRatio * 100}%` }}
                >
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                        <FileText size={10} />
                        Páginas
                        {hasPages && (
                            <span className="text-zinc-600 font-normal ml-1">({pages.length})</span>
                        )}
                    </label>
                    <div className="mt-2 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                        <PageList />
                    </div>
                </div>

                {/* Resizable Divider */}
                <div
                    className={`shrink-0 h-1 flex items-center justify-center cursor-row-resize transition-colors select-none ${isDragging ? 'bg-accent-blue/20' : 'hover:bg-white/5'
                        }`}
                    onMouseDown={handleMouseDown}
                >
                    <div className={`w-6 h-px rounded-full transition-colors ${isDragging ? 'bg-accent-blue' : 'bg-zinc-700 hover:bg-zinc-500'
                        }`} />
                </div>

                {/* Panels Section */}
                <div
                    className="overflow-hidden flex flex-col px-4 py-3 min-h-0 flex-1"
                >
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                        <Layers size={10} />
                        Quadros
                        {hasPanels && (
                            <span className="text-zinc-600 font-normal ml-1">({panelCount})</span>
                        )}
                    </label>
                    <div className="mt-2 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                        <PanelList />
                    </div>
                </div>
            </div>

            {/* View Controls */}
            <div className="px-4 py-3 border-t border-border-color shrink-0">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Settings2 size={10} />
                    Visualização
                </label>
                <ViewControls />
            </div>
        </div>
    );
};
