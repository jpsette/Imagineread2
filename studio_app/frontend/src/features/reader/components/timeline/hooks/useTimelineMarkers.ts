/**
 * Hook for generating time markers based on duration and zoom level
 */

import { useMemo } from 'react';
import { formatTime } from '../utils/formatTime';

export type MarkerType = 'tenth' | 'second' | 'quarter' | 'half' | 'minute';

export interface TimeMarker {
    time: number;
    label: string;
    percent: number;
    type: MarkerType;
}

export function useTimelineMarkers(displayDuration: number, zoom: number): TimeMarker[] {
    return useMemo(() => {
        const markers: TimeMarker[] = [];

        // Adjust step based on zoom level
        let step: number;
        if (zoom >= 10) {
            step = 500; // Every 500ms
        } else if (zoom >= 5) {
            step = 1000; // Every second
        } else if (zoom >= 1.2) {
            step = 1000; // Every second (starting at 20% zoom)
        } else {
            step = 5000; // Every 5 seconds
        }

        // Label interval - show labels at reasonable intervals
        const labelInterval = zoom >= 10 ? 1000 : zoom >= 5 ? 5000 : zoom >= 1.2 ? 5000 : 15000;

        for (let t = 0; t <= displayDuration; t += step) {
            const ms = t;
            const seconds = t / 1000;
            let type: MarkerType = 'tenth';
            let label = '';

            // Determine marker type based on time
            if (seconds % 60 === 0 && Number.isInteger(seconds)) {
                type = 'minute';
            } else if (seconds % 30 === 0 && Number.isInteger(seconds)) {
                type = 'half';
            } else if (seconds % 15 === 0 && Number.isInteger(seconds)) {
                type = 'quarter';
            } else if (ms % 1000 === 0) {
                type = 'second';
            }

            // Add label at intervals
            if (t % labelInterval === 0) {
                label = formatTime(t);
            }

            markers.push({
                time: t,
                label,
                percent: (t / displayDuration) * 100,
                type
            });
        }

        return markers;
    }, [displayDuration, zoom]);
}
