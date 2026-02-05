/**
 * Hook for playhead functionality
 * 
 * Uses local state and syncs with the timeline store via useEffect
 */

import { useState, useCallback, useEffect } from 'react';
import { useTimelineStore } from '@features/timeline';

interface UsePlayheadProps {
    displayDuration: number;
    trackRef: React.RefObject<HTMLDivElement>;
}

interface UsePlayheadReturn {
    playheadTime: number;
    setPlayheadTime: (time: number) => void;
    playheadPercent: number;
    isDragging: boolean;
    handlePlayheadMouseDown: (e: React.MouseEvent) => void;
}

export function usePlayhead({ displayDuration, trackRef }: UsePlayheadProps): UsePlayheadReturn {
    const [playheadTime, setPlayheadTimeLocal] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Get the seek function from store (but not the position to avoid re-render issues)
    const seek = useTimelineStore((state) => state.seek);

    const playheadPercent = (playheadTime / displayDuration) * 100;

    // Sync local state to store whenever playheadTime changes
    useEffect(() => {
        seek(playheadTime);
    }, [playheadTime, seek]);

    const calculateTimeFromMouse = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!trackRef.current) return playheadTime;
        const rect = trackRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        return percent * displayDuration;
    }, [displayDuration, trackRef, playheadTime]);

    const handlePlayheadMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const newTime = calculateTimeFromMouse(e);
        setPlayheadTimeLocal(newTime);
    }, [calculateTimeFromMouse]);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newTime = calculateTimeFromMouse(e);
            setPlayheadTimeLocal(newTime);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, calculateTimeFromMouse]);

    return {
        playheadTime,
        setPlayheadTime: setPlayheadTimeLocal,
        playheadPercent,
        isDragging,
        handlePlayheadMouseDown
    };
}
