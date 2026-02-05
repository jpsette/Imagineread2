/**
 * TimelineTools Component
 * 
 * Toolbar component for applying effects to timeline clips (zoom, focus points).
 * Independent component in the Tools area (70% sidebar).
 */

import React, { useEffect, useState } from 'react';
import { Target, ZoomIn, ZoomOut, Trash2, Route } from 'lucide-react';
import { useEffectsStore } from './stores/useEffectsStore';
import { usePathEditorStore } from './stores/usePathEditorStore';
import { useTimelineStore } from '@features/timeline';

interface TimelineToolsProps {
    className?: string;
}

export const TimelineTools: React.FC<TimelineToolsProps> = ({ className = '' }) => {
    const { project, selectedItemId } = useTimelineStore();
    const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);

    const {
        activeClipId,
        setActiveClip,
        getClipEffects,
        addFocusPoint,
        selectedFocusPointId,
        updateFocusPoint,
        removeFocusPoint,
        getSelectedFocusPoint,
        selectFocusPoint
    } = useEffectsStore();

    // Listen for click events on timeline clips globally
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Find the closest element with data-clip-id
            const clipElement = target.closest('[data-clip-id]');
            if (clipElement) {
                const clipId = clipElement.getAttribute('data-clip-id');
                if (clipId) {
                    setLocalSelectedId(clipId);
                }
            }
        };

        document.addEventListener('mousedown', handleGlobalClick, true);
        return () => document.removeEventListener('mousedown', handleGlobalClick, true);
    }, []);

    // Use local selection, store selection, or first item as fallback
    const effectiveClipId = localSelectedId || selectedItemId || (project?.items?.[0]?.id ?? null);

    // Sync active clip with effective selected clip
    useEffect(() => {
        if (effectiveClipId !== activeClipId) {
            setActiveClip(effectiveClipId);
        }
    }, [effectiveClipId, activeClipId, setActiveClip]);

    // Derived state
    const effects = effectiveClipId ? getClipEffects(effectiveClipId) : null;
    const selectedPoint = getSelectedFocusPoint();
    const hasClipSelected = !!effectiveClipId;
    const hasFocusPoints = effects && effects.focusPoints.length > 0;

    // Tool handlers - use effectiveClipId directly for immediate response
    const handleAddFocusPoint = () => {
        if (effectiveClipId) {
            addFocusPoint(effectiveClipId);
        }
    };

    // Handler for adding a path point (same as focus point but with sequential positioning)
    const handleAddPathPoint = () => {
        if (effectiveClipId) {
            // Add a new point with position based on existing points
            const numPoints = effects?.focusPoints.length || 0;
            // Distribute points in a grid-like pattern for better visibility
            const gridCols = 3;
            const x = 20 + ((numPoints % gridCols) * 30); // 20%, 50%, 80%
            const y = 20 + (Math.floor(numPoints / gridCols) * 30); // rows
            addFocusPoint(effectiveClipId, x, y, 1.5);
        }
    };

    // Handler to open the path editor window
    const { openEditor, isEditorOpen } = usePathEditorStore();
    const handleOpenPathEditor = () => {
        if (effectiveClipId) {
            openEditor(effectiveClipId);
        }
    };

    const handleZoomIn = () => {
        if (effectiveClipId && selectedFocusPointId && selectedPoint) {
            const newScale = Math.min(selectedPoint.scale + 0.25, 3.0);
            updateFocusPoint(effectiveClipId, selectedFocusPointId, { scale: newScale });
        }
    };

    const handleZoomOut = () => {
        if (effectiveClipId && selectedFocusPointId && selectedPoint) {
            const newScale = Math.max(selectedPoint.scale - 0.25, 1.0);
            updateFocusPoint(effectiveClipId, selectedFocusPointId, { scale: newScale });
        }
    };

    const handleDeleteFocusPoint = () => {
        if (effectiveClipId && selectedFocusPointId) {
            removeFocusPoint(effectiveClipId, selectedFocusPointId);
        }
    };

    // Button component for consistency
    const ToolButton: React.FC<{
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
        disabled?: boolean;
        active?: boolean;
        danger?: boolean;
    }> = ({ icon, label, onClick, disabled = false, active = false, danger = false }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex flex-col items-center gap-1 p-2 rounded transition-colors
                ${disabled
                    ? 'opacity-40 cursor-not-allowed text-zinc-600'
                    : danger
                        ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                        : active
                            ? 'bg-blue-500/30 text-blue-400'
                            : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }
            `}
            title={label}
        >
            {icon}
            <span className="text-[8px] font-medium">{label}</span>
        </button>
    );

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Tools Grid */}
            <div className="p-2 border-b border-zinc-700">
                <div className="grid grid-cols-2 gap-1">
                    <ToolButton
                        icon={<Route size={16} />}
                        label="Caminho"
                        onClick={handleOpenPathEditor}
                        disabled={!hasClipSelected}
                        active={isEditorOpen}
                    />
                    <ToolButton
                        icon={<Target size={16} />}
                        label="Foco"
                        onClick={handleAddFocusPoint}
                        disabled={!hasClipSelected}
                    />
                    <ToolButton
                        icon={<ZoomIn size={16} />}
                        label="Zoom+"
                        onClick={handleZoomIn}
                        disabled={!selectedFocusPointId}
                    />
                    <ToolButton
                        icon={<ZoomOut size={16} />}
                        label="Zoom-"
                        onClick={handleZoomOut}
                        disabled={!selectedFocusPointId}
                    />
                </div>
            </div>

            {/* Focus Points List */}
            <div className="flex-1 overflow-y-auto p-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] text-zinc-500 font-medium uppercase">Pontos Focais</span>
                    {selectedFocusPointId && (
                        <button
                            onClick={handleDeleteFocusPoint}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Remover ponto"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>

                {!hasClipSelected ? (
                    <div className="text-[9px] text-zinc-600 text-center py-4">
                        Selecione um clip
                    </div>
                ) : !hasFocusPoints ? (
                    <div className="text-[9px] text-zinc-600 text-center py-4">
                        Clique em "Foco" para<br />adicionar ponto focal
                    </div>
                ) : (
                    <div className="space-y-1">
                        {effects?.focusPoints.map((point, index) => (
                            <button
                                key={point.id}
                                onClick={() => selectFocusPoint(point.id)}
                                className={`
                                    w-full p-2 rounded text-left transition-colors
                                    ${selectedFocusPointId === point.id
                                        ? 'bg-blue-500/30 border border-blue-500/50'
                                        : 'bg-zinc-800 hover:bg-zinc-700'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white font-medium">
                                        Ponto {index + 1}
                                    </span>
                                    <span className="text-[9px] text-zinc-400">
                                        {point.scale.toFixed(1)}x
                                    </span>
                                </div>
                                <div className="text-[8px] text-zinc-500 mt-0.5">
                                    {point.duration}ms • {point.easing}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Point Properties */}
            {selectedPoint && (
                <div className="p-2 border-t border-zinc-700 bg-zinc-800/50">
                    <div className="text-[9px] text-zinc-500 font-medium uppercase mb-2">
                        Propriedades
                    </div>
                    <div className="space-y-2">
                        {/* Scale Slider */}
                        <div>
                            <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                                <span>Zoom</span>
                                <span>{selectedPoint.scale.toFixed(2)}x</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={selectedPoint.scale}
                                onChange={(e) => {
                                    if (activeClipId && selectedFocusPointId) {
                                        updateFocusPoint(activeClipId, selectedFocusPointId, {
                                            scale: parseFloat(e.target.value)
                                        });
                                    }
                                }}
                                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        {/* Duration Slider */}
                        <div>
                            <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                                <span>Duração</span>
                                <span>{selectedPoint.duration}ms</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="2000"
                                step="100"
                                value={selectedPoint.duration}
                                onChange={(e) => {
                                    if (activeClipId && selectedFocusPointId) {
                                        updateFocusPoint(activeClipId, selectedFocusPointId, {
                                            duration: parseInt(e.target.value)
                                        });
                                    }
                                }}
                                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        {/* Easing Selector */}
                        <div>
                            <span className="text-[9px] text-zinc-400 block mb-1">Animação</span>
                            <select
                                value={selectedPoint.easing}
                                onChange={(e) => {
                                    if (activeClipId && selectedFocusPointId) {
                                        updateFocusPoint(activeClipId, selectedFocusPointId, {
                                            easing: e.target.value as any
                                        });
                                    }
                                }}
                                className="w-full bg-zinc-700 text-[10px] text-white rounded px-2 py-1 border-none outline-none"
                            >
                                <option value="linear">Linear</option>
                                <option value="ease-in">Ease In</option>
                                <option value="ease-out">Ease Out</option>
                                <option value="ease-in-out">Ease In-Out</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
