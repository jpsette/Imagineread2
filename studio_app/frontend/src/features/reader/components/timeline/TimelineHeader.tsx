/**
 * TimelineHeader Component
 * 
 * Header with playback controls, zoom, snap toggle, and settings
 */

import React, { useState } from 'react';
import {
    Play, Pause, SkipBack, SkipForward,
    ZoomIn, ZoomOut, Magnet, Settings
} from 'lucide-react';

interface TimelineHeaderProps {
    isPlaying: boolean;
    snapEnabled: boolean;
    zoom: number;
    orientation: 'horizontal' | 'vertical';
    timeValue: number;
    timeUnit: 'seconds' | 'minutes';
    onPlayPause: () => void;
    onSkipBack: () => void;
    onSkipForward: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onToggleSnap: () => void;
    onOrientationChange: (orientation: 'horizontal' | 'vertical') => void;
    onTimeValueChange: (value: number) => void;
    onTimeUnitChange: (unit: 'seconds' | 'minutes') => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
    isPlaying,
    snapEnabled,
    zoom,
    orientation,
    timeValue,
    timeUnit,
    onPlayPause,
    onSkipBack,
    onSkipForward,
    onZoomIn,
    onZoomOut,
    onToggleSnap,
    onOrientationChange,
    onTimeValueChange,
    onTimeUnitChange
}) => {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0f0f11] border-b border-white/5 relative z-50">
            {/* Left side - Title and duration config */}
            <div className="flex items-center gap-2 px-2 py-1">
                <span className="text-xs font-semibold text-white">Timeline</span>
                <input
                    type="number"
                    min={1}
                    max={timeUnit === 'seconds' ? 60 : 10}
                    value={timeValue}
                    onChange={(e) => onTimeValueChange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-[10px] text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border-none outline-none text-center hover:bg-zinc-700 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                <select
                    value={timeUnit}
                    onChange={(e) => onTimeUnitChange(e.target.value as 'seconds' | 'minutes')}
                    className="text-[10px] text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border-none outline-none cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                    <option value="seconds">Segundos</option>
                    <option value="minutes">Minutos</option>
                </select>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center gap-1">
                {/* Transport Controls */}
                <div className="flex items-center gap-0.5 mr-2">
                    <button
                        onClick={onSkipBack}
                        className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                        <SkipBack size={12} />
                    </button>
                    <button
                        onClick={onPlayPause}
                        className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-red-500 text-white' : 'bg-purple-500 text-white'
                            }`}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                        onClick={onSkipForward}
                        className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                        <SkipForward size={12} />
                    </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 px-2 border-l border-white/10">
                    <button
                        onClick={onZoomOut}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ZoomOut size={12} />
                    </button>
                    <span className="text-[10px] text-zinc-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={onZoomIn}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ZoomIn size={12} />
                    </button>
                </div>

                {/* Snap Toggle */}
                <button
                    onClick={onToggleSnap}
                    className={`p-1.5 rounded transition-colors ${snapEnabled ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:bg-white/10'}`}
                    title="Snap to clips"
                >
                    <Magnet size={12} />
                </button>

                {/* Settings */}
                <div className="relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-500'}`}
                    >
                        <Settings size={12} />
                    </button>

                    {/* Settings Dropdown */}
                    {showSettings && (
                        <div className="absolute right-0 bottom-full mb-1 bg-[#1a1a1c] border border-white/10 rounded-lg shadow-xl z-50 min-w-[160px] py-1">
                            <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">Timeline</div>
                            <button
                                onClick={() => { onOrientationChange('horizontal'); setShowSettings(false); }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-colors ${orientation === 'horizontal' ? 'text-purple-400' : 'text-zinc-300'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${orientation === 'horizontal' ? 'bg-purple-400' : 'bg-transparent border border-zinc-600'}`} />
                                Horizontal
                            </button>
                            <button
                                onClick={() => { onOrientationChange('vertical'); setShowSettings(false); }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-colors ${orientation === 'vertical' ? 'text-purple-400' : 'text-zinc-300'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${orientation === 'vertical' ? 'bg-purple-400' : 'bg-transparent border border-zinc-600'}`} />
                                Vertical
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
