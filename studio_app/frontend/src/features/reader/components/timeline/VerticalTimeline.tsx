/**
 * VerticalTimeline Component
 * 
 * Vertical timeline displayed on the right side of the workspace
 */

import React, { useMemo, useState } from 'react';
import { Settings } from 'lucide-react';
import { useTimelineZoom } from './hooks/useTimelineZoom';
import { useTimelineMarkers } from './hooks/useTimelineMarkers';
import { useReaderStore } from '../../store/useReaderStore';

export const VerticalTimeline: React.FC = () => {
    const { zoom, handleWheel } = useTimelineZoom();
    const { setTimelineOrientation } = useReaderStore();
    const [playheadTime] = useState(0);
    const [timeUnit] = useState<'seconds' | 'minutes'>('minutes');
    const [timeValue] = useState<number>(5);
    const [showSettings, setShowSettings] = useState(false);

    // Calculate max duration from user input (in ms)
    const maxDuration = useMemo(() => {
        const multiplier = timeUnit === 'minutes' ? 60 * 1000 : 1000;
        return timeValue * multiplier;
    }, [timeValue, timeUnit]);

    const displayDuration = maxDuration;
    const playheadPercent = (playheadTime / displayDuration) * 100;

    const markers = useTimelineMarkers(displayDuration, zoom);

    return (
        <div className="w-14 shrink-0 bg-[#1a1a1c] border-l border-white/10 flex flex-col">
            {/* Header with Settings */}
            <div className="h-8 bg-[#0f0f11] border-b border-white/10 flex items-center justify-center relative">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-500'}`}
                >
                    <Settings size={12} />
                </button>

                {/* Settings Dropdown */}
                {showSettings && (
                    <div className="absolute left-0 top-full mt-1 bg-[#1a1a1c] border border-white/10 rounded-lg shadow-xl z-50 min-w-[140px] py-1">
                        <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">Timeline</div>
                        <button
                            onClick={() => { setTimelineOrientation('horizontal'); setShowSettings(false); }}
                            className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-colors text-zinc-300"
                        >
                            <span className="w-2 h-2 rounded-full bg-transparent border border-zinc-600" />
                            Horizontal
                        </button>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-colors text-purple-400"
                        >
                            <span className="w-2 h-2 rounded-full bg-purple-400" />
                            Vertical
                        </button>
                    </div>
                )}
            </div>

            {/* Vertical Time Ruler - full height */}
            <div
                className="flex-1 bg-[#0f0f11] relative overflow-y-auto overflow-x-hidden cursor-pointer"
                onWheel={handleWheel}
            >
                <div style={{ height: `${100 * zoom}%`, minHeight: '100%', position: 'relative' }}>
                    {markers.map((marker, i) => {
                        const tickWidth = marker.type === 'minute' ? 'w-3'
                            : marker.type === 'half' ? 'w-3'
                                : marker.type === 'quarter' ? 'w-2'
                                    : marker.type === 'second' ? 'w-1.5'
                                        : 'w-1';

                        const tickColor = marker.type === 'minute' ? 'bg-zinc-400'
                            : marker.type === 'half' ? 'bg-zinc-500'
                                : marker.type === 'quarter' ? 'bg-zinc-600'
                                    : marker.type === 'second' ? 'bg-zinc-600'
                                        : 'bg-zinc-700';

                        return (
                            <div
                                key={i}
                                className="absolute left-0 w-full flex flex-row items-center"
                                style={{ top: `${marker.percent}%` }}
                            >
                                <div className={`${tickWidth} h-px ${tickColor}`} />
                                {marker.label && (
                                    <span className="text-[7px] text-zinc-400 ml-0.5 whitespace-nowrap font-mono">{marker.label}</span>
                                )}
                            </div>
                        );
                    })}

                    {/* Vertical Playhead */}
                    <div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 pointer-events-none z-30"
                        style={{ top: `${playheadPercent}%` }}
                    >
                        <div className="absolute right-0 -translate-y-1/2">
                            <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-red-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
