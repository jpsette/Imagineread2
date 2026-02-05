/**
 * ClipGhost Component
 * 
 * Floating ghost element that follows cursor during clip drag
 */

import React from 'react';
import { TimelineItem } from '@features/timeline';

interface ClipGhostProps {
    item: TimelineItem;
    index: number;
    dragPosition: { x: number; y: number };
    clipWidth: number;
    clipHeight: number;
    clickOffsetX: number;
}

export const ClipGhost: React.FC<ClipGhostProps> = ({
    item,
    index,
    dragPosition,
    clipWidth,
    clipHeight,
    clickOffsetX
}) => {
    return (
        <div
            className="fixed pointer-events-none z-50 rounded opacity-80 shadow-lg"
            style={{
                left: dragPosition.x - clickOffsetX,
                top: dragPosition.y - clipHeight / 2,
                width: clipWidth,
                height: clipHeight,
                backgroundColor: '#3b82f6'
            }}
        >
            <div className="h-full flex items-center gap-1 px-2 overflow-hidden">
                {item.imageUrl && (
                    <div className="w-6 h-6 shrink-0 rounded overflow-hidden border border-white/20">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <p className="text-[9px] font-medium text-white truncate">
                    {item.label || `Clip ${index + 1}`}
                </p>
            </div>
        </div>
    );
};
