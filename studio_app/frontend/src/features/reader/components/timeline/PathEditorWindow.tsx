/**
 * PathEditorWindow Component
 * 
 * Floating draggable window for editing path points.
 * Shows list of points with add/remove capabilities.
 */

import React, { useState, useRef, useCallback } from 'react';
import { X, Plus, Trash2, Move, MousePointer2 } from 'lucide-react';
import { useEffectsStore } from './stores/useEffectsStore';
import { FocusPoint } from './types/effects';

interface PathEditorWindowProps {
    clipId: string;
    onClose: () => void;
    onAddModeChange: (isAdding: boolean) => void;
    isAddingPoint: boolean;
}

export const PathEditorWindow: React.FC<PathEditorWindowProps> = ({
    clipId,
    onClose,
    onAddModeChange,
    isAddingPoint
}) => {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const {
        getClipEffects,
        removeFocusPoint,
        selectFocusPoint,
        selectedFocusPointId
    } = useEffectsStore();

    const effects = getClipEffects(clipId);
    const points = effects.focusPoints;

    // Window drag handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.no-drag')) return;
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    }, [position]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y
        });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Attach/detach global mouse events
    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleDeletePoint = (pointId: string) => {
        removeFocusPoint(clipId, pointId);
    };

    const toggleAddMode = () => {
        onAddModeChange(!isAddingPoint);
    };

    return (
        <div
            className="fixed z-50 bg-zinc-900 rounded-lg shadow-2xl border border-zinc-700 min-w-[280px]"
            style={{
                left: position.x,
                top: position.y,
                cursor: isDragging ? 'grabbing' : 'default'
            }}
        >
            {/* Header - Draggable */}
            <div
                className="flex items-center justify-between px-3 py-2 bg-zinc-800 rounded-t-lg cursor-grab border-b border-zinc-700"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <Move size={14} className="text-zinc-500" />
                    <span className="text-sm font-medium text-white">Editor de Caminho</span>
                </div>
                <button
                    onClick={onClose}
                    className="no-drag p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="p-3">
                {/* Add Point Button */}
                <button
                    onClick={toggleAddMode}
                    className={`no-drag w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg mb-3 transition-colors ${isAddingPoint
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                >
                    {isAddingPoint ? (
                        <>
                            <MousePointer2 size={16} className="animate-pulse" />
                            <span className="text-sm font-medium">Clique na imagem para adicionar</span>
                        </>
                    ) : (
                        <>
                            <Plus size={16} />
                            <span className="text-sm font-medium">Adicionar Ponto</span>
                        </>
                    )}
                </button>

                {/* Points List */}
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {points.length === 0 ? (
                        <div className="text-center py-4 text-zinc-500 text-sm">
                            Nenhum ponto adicionado
                        </div>
                    ) : (
                        points.map((point: FocusPoint, index: number) => (
                            <div
                                key={point.id}
                                onClick={() => selectFocusPoint(point.id)}
                                className={`no-drag flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${selectedFocusPointId === point.id
                                        ? 'bg-blue-600/20 border border-blue-500'
                                        : 'bg-zinc-800 hover:bg-zinc-700 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                                        {index + 1}
                                    </div>
                                    <div className="text-xs text-zinc-300">
                                        <span>X: {point.x.toFixed(0)}%</span>
                                        <span className="mx-2 text-zinc-600">|</span>
                                        <span>Y: {point.y.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePoint(point.id);
                                    }}
                                    className="p-1 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Info */}
                {points.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-700 text-center">
                        <span className="text-[10px] text-zinc-500">
                            {points.length} ponto{points.length !== 1 ? 's' : ''} no caminho
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
