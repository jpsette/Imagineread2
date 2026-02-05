/**
 * TimelineRuler Component
 * 
 * Renders the time ruler with hierarchical tick marks
 */

import React from 'react';
import { TimeMarker } from './hooks/useTimelineMarkers';

interface TimelineRulerProps {
    markers: TimeMarker[];
    zoom: number;
    playheadPercent: number;
    onMouseDown: (e: React.MouseEvent) => void;
    onWheel: (e: React.WheelEvent) => void;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
    markers,
    zoom,
    playheadPercent,
    onMouseDown,
    onWheel
}) => {
    return (
        <div
            className="h-5 bg-[#0f0f11] border-b border-zinc-600 relative cursor-pointer"
            onMouseDown={onMouseDown}
            onWheel={onWheel}
        >
            <div
                style={{ width: `${100 * zoom}%`, position: 'relative', height: '100%' }}
            >
                {markers.map((marker, i) => {
                    // Height based on marker type: minute > half > quarter > second
                    const tickHeight = marker.type === 'minute' ? 'h-5'
                        : marker.type === 'half' ? 'h-4'
                            : marker.type === 'quarter' ? 'h-3'
                                : marker.type === 'second' ? 'h-2'
                                    : 'h-1';

                    const tickColor = marker.type === 'minute' ? 'bg-zinc-500'
                        : marker.type === 'half' ? 'bg-zinc-600'
                            : marker.type === 'quarter' ? 'bg-zinc-700'
                                : marker.type === 'second' ? 'bg-zinc-700'
                                    : 'bg-zinc-800';

                    return (
                        <div
                            key={i}
                            className="absolute top-0 h-full flex flex-col justify-start"
                            style={{ left: `${marker.percent}%` }}
                        >
                            <div className={`w-px ${tickHeight} ${tickColor}`} />
                            {marker.label && (
                                <span className="text-[10px] text-zinc-500 ml-1 whitespace-nowrap">
                                    {marker.label}
                                </span>
                            )}
                        </div>
                    );
                })}

                {/* Playhead marker on ruler */}
                <div
                    className="absolute top-0 bottom-0 pointer-events-none z-30"
                    style={{ left: `${playheadPercent}%` }}
                >
                    <div className="w-3 h-3 bg-red-500 rounded-sm rotate-45 transform -translate-x-1/2 translate-y-1" />
                </div>
            </div>
        </div>
    );
};
