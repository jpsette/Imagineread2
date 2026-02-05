/**
 * useClipDrag Hook
 * 
 * Encapsulates drag and resize logic for timeline clips
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TimelineItem } from '@features/timeline';

interface UseClipDragOptions {
    item: TimelineItem;
    trackId: string;
    totalDuration: number;
    clipRef: React.RefObject<HTMLDivElement>;
    snapInterval?: number; // Snap interval in milliseconds (default: 1000ms = 1 second)
    onResize?: (itemId: string, newDuration: number) => void;
    onMove?: (itemId: string, newStartTime: number) => void;
    onMoveToTrack?: (itemId: string, newTrackId: string, newStartTime: number) => void;
}

interface DragState {
    isDragging: boolean;
    isResizing: 'left' | 'right' | null;
    dragPosition: { x: number; y: number } | null;
    clipWidth: number;
    clipHeight: number;
    clickOffsetX: number;
}

export const useClipDrag = ({
    item,
    trackId,
    totalDuration,
    clipRef,
    snapInterval = 1000, // Default: snap to every second
    onResize,
    onMove,
    onMoveToTrack
}: UseClipDragOptions) => {
    const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

    // Snap value to nearest marker interval
    const snapToMarker = useCallback((value: number): number => {
        if (snapInterval <= 0) return value;
        return Math.round(value / snapInterval) * snapInterval;
    }, [snapInterval]);

    const initialDataRef = useRef({
        startX: 0,
        startY: 0,
        startDuration: 0,
        startTime: 0,
        trackWidth: 0,
        msPerPixel: 0,
        clipWidth: 0,
        clipHeight: 0,
        clickOffsetX: 0
    });

    // Start resize operation
    const handleResizeStart = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
        e.stopPropagation();
        e.preventDefault();

        const trackElement = clipRef.current?.parentElement;
        const trackWidth = trackElement?.getBoundingClientRect().width || 800;
        const msPerPixel = totalDuration / trackWidth;
        const clipRect = clipRef.current?.getBoundingClientRect();

        initialDataRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startDuration: item.duration,
            startTime: item.startTime ?? 0,
            trackWidth,
            msPerPixel,
            clipWidth: clipRect?.width || 100,
            clipHeight: clipRect?.height || 40,
            clickOffsetX: 0
        };
        setIsResizing(side);
    }, [clipRef, item.duration, item.startTime, totalDuration]);

    // Start drag operation
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        // Note: Don't call e.preventDefault() here as it blocks onClick for selection

        const trackElement = clipRef.current?.parentElement;
        const trackWidth = trackElement?.getBoundingClientRect().width || 800;
        const msPerPixel = totalDuration / trackWidth;
        const clipRect = clipRef.current?.getBoundingClientRect();
        const clickOffsetX = clipRect ? e.clientX - clipRect.left : 0;

        initialDataRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startDuration: item.duration,
            startTime: item.startTime ?? 0,
            trackWidth,
            msPerPixel,
            clipWidth: clipRect?.width || 100,
            clipHeight: clipRect?.height || 40,
            clickOffsetX
        };

        setDragPosition({ x: e.clientX, y: e.clientY });
        setIsDragging(true);
    }, [clipRef, item.duration, item.startTime, totalDuration]);

    // Handle mouse move during drag/resize
    const handleMouseMove = useCallback((e: MouseEvent) => {
        const { startX, startDuration, startTime, msPerPixel } = initialDataRef.current;
        const deltaX = e.clientX - startX;
        const deltaMs = deltaX * msPerPixel;

        if (isResizing && onResize) {
            if (isResizing === 'right') {
                let newDuration = startDuration + deltaMs;
                newDuration = Math.max(500, Math.min(newDuration, totalDuration * 0.8));
                onResize(item.id, newDuration);
            } else {
                let newStartTime = startTime + deltaMs;
                let newDuration = startDuration - deltaMs;

                if (newStartTime < 0) {
                    newDuration = startDuration + startTime;
                    newStartTime = 0;
                }

                newDuration = Math.max(500, Math.min(newDuration, totalDuration * 0.8));

                onResize(item.id, newDuration);
                if (onMove) {
                    onMove(item.id, newStartTime);
                }
            }
        } else if (isDragging) {
            setDragPosition({ x: e.clientX, y: e.clientY });

            if (onMove) {
                let newStartTime = startTime + deltaMs;
                newStartTime = Math.max(0, Math.min(newStartTime, totalDuration - item.duration));
                // Apply snap to markers
                newStartTime = snapToMarker(newStartTime);
                onMove(item.id, newStartTime);
            }
        }
    }, [isResizing, isDragging, onResize, onMove, item.id, item.duration, totalDuration, snapToMarker]);

    // Handle mouse up - finalize drag/resize
    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (isDragging && onMoveToTrack) {
            const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
            const trackElement = elementUnderMouse?.closest('[data-track-id]') as HTMLElement | null;

            if (trackElement) {
                const targetTrackId = trackElement.getAttribute('data-track-id');
                if (targetTrackId && targetTrackId !== trackId) {
                    const trackRect = trackElement.getBoundingClientRect();
                    const { clickOffsetX } = initialDataRef.current;
                    const relativeX = e.clientX - trackRect.left - clickOffsetX;
                    const percent = relativeX / trackRect.width;
                    let newStartTime = percent * totalDuration;
                    // Apply snap when moving to new track
                    newStartTime = snapToMarker(Math.max(0, newStartTime));

                    onMoveToTrack(item.id, targetTrackId, newStartTime);
                }
            }
        }
        setIsResizing(null);
        setIsDragging(false);
        setDragPosition(null);
    }, [isDragging, onMoveToTrack, trackId, item.id, totalDuration, snapToMarker]);

    // Set up global mouse event listeners
    useEffect(() => {
        if (isResizing || isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isResizing, isDragging, handleMouseMove, handleMouseUp]);

    const isActive = isResizing !== null || isDragging;

    const ghostState: DragState = {
        isDragging,
        isResizing,
        dragPosition,
        clipWidth: initialDataRef.current.clipWidth,
        clipHeight: initialDataRef.current.clipHeight,
        clickOffsetX: initialDataRef.current.clickOffsetX
    };

    return {
        isDragging,
        isResizing,
        isActive,
        dragPosition,
        ghostState,
        initialDataRef,
        handleResizeStart,
        handleDragStart
    };
};
