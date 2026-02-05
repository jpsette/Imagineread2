/**
 * Hook for timeline zoom functionality
 */

import { useState, useCallback } from 'react';

interface UseTimelineZoomReturn {
    zoom: number;
    setZoom: (zoom: number | ((prev: number) => number)) => void;
    handleWheel: (e: React.WheelEvent) => void;
}

export function useTimelineZoom(minZoom = 1, maxZoom = 20): UseTimelineZoomReturn {
    const [zoom, setZoom] = useState(1);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.2 : 0.2; // Scroll down = zoom out, scroll up = zoom in
        setZoom(prev => Math.max(minZoom, Math.min(maxZoom, prev + delta * prev)));
    }, [minZoom, maxZoom]);

    return { zoom, setZoom, handleWheel };
}
