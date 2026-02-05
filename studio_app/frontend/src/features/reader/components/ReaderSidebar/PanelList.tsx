/**
 * PanelList Component
 * 
 * Displays thumbnails of panels in the current page.
 * Panels can be dragged to the timeline with custom ghost overlay.
 */

import React, { useState, useEffect } from 'react';
import { useReaderStore } from '../../store/useReaderStore';
import { usePanelNavigation } from '../../hooks';
import { createPortal } from 'react-dom';

interface DragState {
    isDragging: boolean;
    imageUrl: string;
    label: string;
    x: number;
    y: number;
}

export const PanelList: React.FC = () => {
    const { getCurrentPage } = useReaderStore();
    const { currentPanelIndex, goToPanel, hasPanels } = usePanelNavigation();
    const [dragState, setDragState] = useState<DragState | null>(null);

    const currentPage = getCurrentPage();

    // Track position during drag using the 'drag' event
    useEffect(() => {
        if (!dragState) return;

        const handleDrag = (e: DragEvent) => {
            // During drag, clientX/Y can be 0 at the end, filter those out
            if (e.clientX > 0 && e.clientY > 0) {
                setDragState(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
            }
        };

        const handleDragEnd = () => {
            setDragState(null);
        };

        document.addEventListener('drag', handleDrag);
        document.addEventListener('dragend', handleDragEnd);
        document.addEventListener('drop', handleDragEnd);

        return () => {
            document.removeEventListener('drag', handleDrag);
            document.removeEventListener('dragend', handleDragEnd);
            document.removeEventListener('drop', handleDragEnd);
        };
    }, [dragState]);

    if (!currentPage || !hasPanels) {
        return (
            <div className="text-center py-4 text-zinc-600 text-xs">
                Nenhum quadro nesta página
            </div>
        );
    }

    const handleDragStart = (e: React.DragEvent, index: number, imageUrl: string) => {
        // Set drag data with panel info
        const panelData = {
            type: 'panel',
            id: `panel-${currentPage.id}-${index}`,
            pageIndex: currentPage.order,
            imageUrl: imageUrl,
            label: `Quadro ${index + 1}`
        };
        e.dataTransfer.setData('application/json', JSON.stringify(panelData));
        e.dataTransfer.effectAllowed = 'copy';

        // Create transparent canvas to hide native drag ghost completely
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, 1, 1);
        }
        e.dataTransfer.setDragImage(canvas, 0, 0);

        // Start custom ghost
        setDragState({
            isDragging: true,
            imageUrl,
            label: `Quadro ${index + 1}`,
            x: e.clientX,
            y: e.clientY
        });
    };

    return (
        <>
            <div className="space-y-2">
                {currentPage.previewImages.map((imageUrl, index) => (
                    <button
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index, imageUrl)}
                        onClick={() => goToPanel(index)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all cursor-grab active:cursor-grabbing ${currentPanelIndex === index
                            ? 'bg-blue-500/20 border border-blue-500/40'
                            : 'bg-zinc-800/50 border border-transparent hover:bg-zinc-800'
                            }`}
                    >
                        {/* Thumbnail */}
                        <div className="w-12 h-16 rounded overflow-hidden bg-zinc-900 flex-shrink-0">
                            <img
                                src={imageUrl}
                                alt={`Quadro ${index + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                                Quadro {index + 1}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">
                                Arraste para a timeline
                            </p>
                        </div>

                        {/* Active indicator */}
                        {currentPanelIndex === index && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                    </button>
                ))}
            </div>

            {/* Custom Drag Ghost Overlay */}
            {dragState && createPortal(
                <div
                    className="fixed pointer-events-none z-[9999]"
                    style={{
                        left: dragState.x + 15,
                        top: dragState.y - 30
                    }}
                >
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 shadow-xl opacity-90" style={{ backgroundColor: '#3b82f6' }}>
                        <div className="w-8 h-10 rounded overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/20">
                            <img
                                src={dragState.imageUrl}
                                alt={dragState.label}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-white">
                            <p className="text-xs font-medium">{dragState.label}</p>
                            <p className="text-[10px] text-blue-100">10s</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
