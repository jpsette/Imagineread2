/**
 * TimelineClip Component
 * 
 * Renders a single clip on the timeline track with resize and drag handles
 */

import React, { useEffect, useRef, useState } from 'react';
import { TimelineItem } from '@features/timeline';
import { useClipDrag } from './hooks/useClipDrag';
import { ClipGhost } from './ClipGhost';
import { ClipContextMenu } from './ClipContextMenu';

interface TimelineClipProps {
    item: TimelineItem;
    index: number;
    isSelected: boolean;
    leftPercent: number;
    widthPercent: number;
    trackId: string;
    onSelect: () => void;
    onRemove: () => void;
    onResize?: (itemId: string, newDuration: number) => void;
    onMove?: (itemId: string, newStartTime: number) => void;
    onMoveToTrack?: (itemId: string, newTrackId: string, newStartTime: number) => void;
    totalDuration?: number;
}

export const TimelineClip: React.FC<TimelineClipProps> = ({
    item,
    index,
    isSelected,
    leftPercent,
    widthPercent,
    trackId,
    onSelect,
    onRemove,
    onResize,
    onMove,
    onMoveToTrack,
    totalDuration = 300000
}) => {
    const clipRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    // Use custom hook for drag/resize logic
    const {
        isDragging,
        isActive,
        dragPosition,
        initialDataRef,
        handleResizeStart,
        handleDragStart
    } = useClipDrag({
        item,
        trackId,
        totalDuration,
        clipRef,
        onResize,
        onMove,
        onMoveToTrack
    });

    // Handle keyboard events (DELETE key) and close menu on click outside
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSelected && (e.key === 'Delete' || e.key === 'Backspace')) {
                e.preventDefault();
                onRemove();
            }
            if (e.key === 'Escape') {
                setContextMenu(null);
            }
        };

        const handleClickOutside = () => {
            setContextMenu(null);
        };

        if (isSelected) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [isSelected, onRemove]);

    // Handle right-click context menu
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    return (
        <>
            {/* Main clip element */}
            <div
                ref={clipRef}
                className={`absolute top-1 bottom-1 rounded ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isSelected
                    ? 'ring-2 ring-purple-500 z-10'
                    : 'hover:ring-1 hover:ring-white/30'
                    } ${isActive ? 'z-20' : ''}`}
                style={{
                    left: `${leftPercent}%`,
                    width: `${Math.max(widthPercent, 1)}%`,
                    backgroundColor: '#3b82f6',
                    opacity: isDragging ? 0 : 1,
                    transition: 'opacity 0.1s ease'
                }}
                data-clip-id={item.id}
                data-track-id={trackId}
                onClick={onSelect}
                onContextMenu={handleContextMenu}
                onMouseDown={(e) => {
                    // Always select on mouse down to ensure selection happens
                    onSelect();
                    handleDragStart(e);
                }}
            >
                {/* Clip content */}
                <div className="h-full flex items-center gap-1 px-2 overflow-hidden">
                    {item.imageUrl && (
                        <div className="w-8 h-8 shrink-0 rounded overflow-hidden border border-white/20">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <p className="text-[10px] font-medium text-white truncate">
                        {item.label || `Clip ${index + 1}`}
                    </p>
                </div>

                {/* Left resize handle */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-l"
                    onMouseDown={(e) => handleResizeStart(e, 'left')}
                >
                    <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/40 rounded" />
                </div>

                {/* Right resize handle */}
                <div
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-r"
                    onMouseDown={(e) => handleResizeStart(e, 'right')}
                >
                    <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/40 rounded" />
                </div>
            </div>

            {/* Context menu */}
            {contextMenu && (
                <ClipContextMenu
                    position={contextMenu}
                    onRemove={onRemove}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {/* Floating ghost during drag */}
            {isDragging && dragPosition && (
                <ClipGhost
                    item={item}
                    index={index}
                    dragPosition={dragPosition}
                    clipWidth={initialDataRef.current.clipWidth}
                    clipHeight={initialDataRef.current.clipHeight}
                    clickOffsetX={initialDataRef.current.clickOffsetX}
                />
            )}
        </>
    );
};
