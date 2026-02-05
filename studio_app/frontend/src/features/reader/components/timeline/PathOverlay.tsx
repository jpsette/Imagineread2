/**
 * PathOverlay Component
 * 
 * SVG overlay that renders path points and connecting lines on top of an image.
 * Handles click events for adding new points.
 */

import React from 'react';
import { useEffectsStore } from './stores/useEffectsStore';
import { FocusPoint } from './types/effects';

interface PathOverlayProps {
    clipId: string;
    isAddingPoint: boolean;
    onPointAdded: (x: number, y: number) => void;
    containerRef: React.RefObject<HTMLDivElement>;
}

export const PathOverlay: React.FC<PathOverlayProps> = ({
    clipId,
    isAddingPoint,
    onPointAdded,
    containerRef
}) => {
    const { getClipEffects, selectedFocusPointId, selectFocusPoint } = useEffectsStore();

    const effects = getClipEffects(clipId);
    const points = effects.focusPoints;

    const handleClick = (e: React.MouseEvent) => {
        if (!isAddingPoint || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        onPointAdded(x, y);
    };

    const handlePointClick = (e: React.MouseEvent, pointId: string) => {
        e.stopPropagation();
        selectFocusPoint(pointId);
    };

    if (points.length === 0 && !isAddingPoint) return null;

    return (
        <div
            className={`absolute inset-0 ${isAddingPoint ? 'cursor-crosshair' : 'pointer-events-none'}`}
            onClick={handleClick}
        >
            <svg className="w-full h-full" style={{ pointerEvents: isAddingPoint ? 'none' : 'auto' }}>
                {/* Lines connecting points */}
                {points.length > 1 && points.map((point: FocusPoint, index: number) => {
                    if (index === 0) return null;
                    const prevPoint = points[index - 1];
                    return (
                        <line
                            key={`line-${point.id}`}
                            x1={`${prevPoint.x}%`}
                            y1={`${prevPoint.y}%`}
                            x2={`${point.x}%`}
                            y2={`${point.y}%`}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            className="pointer-events-none"
                        />
                    );
                })}

                {/* Points */}
                {points.map((point: FocusPoint, index: number) => {
                    const isSelected = selectedFocusPointId === point.id;
                    return (
                        <g
                            key={point.id}
                            onClick={(e) => handlePointClick(e, point.id)}
                            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                        >
                            {/* Outer ring for selected */}
                            {isSelected && (
                                <circle
                                    cx={`${point.x}%`}
                                    cy={`${point.y}%`}
                                    r="18"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    className="animate-pulse"
                                />
                            )}
                            {/* Point circle */}
                            <circle
                                cx={`${point.x}%`}
                                cy={`${point.y}%`}
                                r="12"
                                fill={isSelected ? '#3b82f6' : '#1e40af'}
                                stroke="white"
                                strokeWidth="2"
                            />
                            {/* Point number */}
                            <text
                                x={`${point.x}%`}
                                y={`${point.y}%`}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="white"
                                fontSize="10"
                                fontWeight="bold"
                                className="pointer-events-none"
                            >
                                {index + 1}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
