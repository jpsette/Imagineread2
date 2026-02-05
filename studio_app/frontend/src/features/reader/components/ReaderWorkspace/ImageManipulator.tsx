/**
 * ImageManipulator Component
 * 
 * Handles image display, selection, drag and resize within the device frame.
 */

import React from 'react';
import type { ImageBounds } from '../../hooks/useImageTransform';

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ImageManipulatorProps {
    imageUrl: string | null;
    bounds: ImageBounds;
    isSelected: boolean;
    onSelect: () => void;
    onStartDrag: (e: React.MouseEvent) => void;
    onStartResize: (handle: ResizeHandle) => (e: React.MouseEvent) => void;
}

export const ImageManipulator: React.FC<ImageManipulatorProps> = ({
    imageUrl,
    bounds,
    isSelected,
    onSelect,
    onStartDrag,
    onStartResize,
}) => {
    if (!imageUrl) return null;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect();
    };

    return (
        <>
            {/* Image container */}
            <div
                className="absolute pointer-events-none"
                style={{
                    left: bounds.x,
                    top: bounds.y,
                    width: bounds.width,
                    height: bounds.height
                }}
            >
                <img
                    src={imageUrl}
                    alt="Preview"
                    draggable={false}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',
                        display: 'block'
                    }}
                />
            </div>

            {/* Selection area - handles click and drag */}
            <div
                className={`absolute ${isSelected ? 'cursor-move' : 'cursor-pointer'}`}
                style={{
                    left: bounds.x,
                    top: bounds.y,
                    width: bounds.width,
                    height: bounds.height
                }}
                onClick={handleClick}
                onMouseDown={isSelected ? onStartDrag : undefined}
            >
                {isSelected && (
                    <>
                        {/* Selection border */}
                        <div className="absolute inset-0 border-2 border-blue-400 pointer-events-none" />

                        {/* Corner handles (proportional resize) */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-blue-400 cursor-nw-resize" onMouseDown={onStartResize('nw')} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-blue-400 cursor-ne-resize" onMouseDown={onStartResize('ne')} />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-blue-400 cursor-sw-resize" onMouseDown={onStartResize('sw')} />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-blue-400 cursor-se-resize" onMouseDown={onStartResize('se')} />

                        {/* Edge handles (free resize) */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-400 cursor-n-resize" onMouseDown={onStartResize('n')} />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-400 cursor-s-resize" onMouseDown={onStartResize('s')} />
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-400 cursor-w-resize" onMouseDown={onStartResize('w')} />
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-400 cursor-e-resize" onMouseDown={onStartResize('e')} />
                    </>
                )}
            </div>
        </>
    );
};
