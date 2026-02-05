/**
 * TimelineTrack Component
 * 
 * Track area containing clips and playhead.
 * Accepts dropped panels from the sidebar with position-based placement.
 */

import React, { useState, useRef } from 'react';
import { TimelineItem, DEFAULT_DURATION } from '@features/timeline';
import { TimelineClip } from './TimelineClip';

interface ClipPosition {
    item: TimelineItem;
    startPercent: number;
    widthPercent: number;
}

interface TimelineTrackProps {
    trackId: string;
    trackHeight: number;
    clipPositions: ClipPosition[];
    selectedItemId: string | null;
    playheadPercent: number;
    zoom: number;
    totalDuration: number;
    onSelectItem: (id: string) => void;
    onRemoveItem: (id: string) => void;
    onResizeItem: (itemId: string, newDuration: number) => void;
    onMoveItem: (itemId: string, newStartTime: number) => void;
    onMoveToTrack?: (itemId: string, newTrackId: string, newStartTime: number) => void;
    onDropPanel?: (panelData: { type: string; id: string; pageIndex: number; imageUrl: string; label: string }, startTime: number, trackId: string) => void;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
    trackId,
    trackHeight,
    clipPositions,
    selectedItemId,
    playheadPercent,
    zoom,
    totalDuration,
    onSelectItem,
    onRemoveItem,
    onResizeItem,
    onMoveItem,
    onMoveToTrack,
    onDropPanel
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [ghostPosition, setGhostPosition] = useState<number | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // Calculate ghost width in percent (default duration)
    const ghostWidthPercent = (DEFAULT_DURATION / totalDuration) * 100;

    // Snap interval in milliseconds (1 second)
    const snapInterval = 1000;

    const snapToMarker = (value: number): number => {
        return Math.round(value / snapInterval) * snapInterval;
    };

    const calculateStartTime = (clientX: number): number => {
        if (!trackRef.current) return 0;
        const rect = trackRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        const rawTime = percent * totalDuration;
        // Apply snap to markers
        return snapToMarker(rawTime);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);

        // Calculate ghost position
        const startTime = calculateStartTime(e.clientX);
        const ghostPercent = (startTime / totalDuration) * 100;
        setGhostPosition(ghostPercent);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
        setGhostPosition(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        setGhostPosition(null);

        try {
            const data = e.dataTransfer.getData('application/json');
            if (data) {
                const dragData = JSON.parse(data);
                const startTime = calculateStartTime(e.clientX);

                if (dragData.type === 'clip' && onMoveToTrack) {
                    // Existing clip being moved to this track
                    onMoveToTrack(dragData.itemId, trackId, startTime);
                } else if (dragData.type === 'panel' && onDropPanel) {
                    // New panel from sidebar
                    onDropPanel(dragData, startTime, trackId);
                }
            }
        } catch (err) {
            console.error('Failed to parse drop data:', err);
        }
    };

    return (
        <div
            ref={trackRef}
            className={`relative transition-colors border-b border-zinc-600 ${isDragOver ? 'bg-blue-500/10' : 'bg-[#1e1e20]'}`}
            style={{ height: trackHeight }}
            data-track-id={trackId}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div style={{ width: `${100 * zoom}%`, height: '100%', position: 'relative' }}>
                {/* Drop zone indicator */}
                {isDragOver && clipPositions.length === 0 && ghostPosition === null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-purple-400">Solte o quadro aqui</span>
                    </div>
                )}

                {/* Ghost preview during drag */}
                {isDragOver && ghostPosition !== null && (
                    <div
                        className="absolute top-1 bottom-1 rounded opacity-80 shadow-lg pointer-events-none z-10"
                        style={{
                            left: `${ghostPosition}%`,
                            width: `${Math.max(ghostWidthPercent, 1)}%`,
                            backgroundColor: '#3b82f6'
                        }}
                    >
                        <div className="h-full flex items-center justify-center">
                            <span className="text-[10px] text-white font-medium">
                                {(DEFAULT_DURATION / 1000).toFixed(0)}s
                            </span>
                        </div>
                    </div>
                )}

                {/* Clips */}
                {clipPositions.map((pos, index) => (
                    <TimelineClip
                        key={pos.item.id}
                        item={pos.item}
                        index={index}
                        isSelected={selectedItemId === pos.item.id}
                        leftPercent={pos.startPercent}
                        widthPercent={pos.widthPercent}
                        trackId={trackId}
                        totalDuration={totalDuration}
                        onSelect={() => onSelectItem(pos.item.id)}
                        onRemove={() => onRemoveItem(pos.item.id)}
                        onResize={onResizeItem}
                        onMove={onMoveItem}
                        onMoveToTrack={onMoveToTrack}
                    />
                ))}

                {/* Playhead line */}
                <div
                    className="absolute top-0 bottom-0 pointer-events-none z-30"
                    style={{ left: `${playheadPercent}%` }}
                >
                    <div className="w-px h-full bg-red-500" />
                </div>
            </div>
        </div>
    );
};
