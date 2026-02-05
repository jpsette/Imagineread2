/**
 * TimelineBar Component - Premiere Style
 * 
 * Professional timeline interface inspired by Adobe Premiere Pro.
 * Refactored to use modular sub-components.
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTimelineStore } from '@features/timeline';
import { useReaderStore } from '../../store/useReaderStore';

import { DEFAULT_TRACK_HEIGHT, MIN_TRACK_HEIGHT, MAX_TRACK_HEIGHT, RULER_HEIGHT } from './constants';
import { useTimelineZoom } from './hooks/useTimelineZoom';
import { useTimelineMarkers } from './hooks/useTimelineMarkers';
import { usePlayhead } from './hooks/usePlayhead';
import { TimelineHeader } from './TimelineHeader';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTrack } from './TimelineTrack';
import { TimelineTools } from './TimelineTools';

interface Track {
    id: string;
    name: string;
}

export const TimelineBar: React.FC = () => {
    const [isExpanded] = useState(true);
    const [trackHeight, setTrackHeight] = useState(DEFAULT_TRACK_HEIGHT);
    const [snapEnabled, setSnapEnabled] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [timeUnit, setTimeUnit] = useState<'seconds' | 'minutes'>('minutes');
    const [timeValue, setTimeValue] = useState<number>(5);

    // Multiple tracks support
    const [tracks, setTracks] = useState<Track[]>([
        { id: 'track-1', name: 'Track 1' }
    ]);

    const trackRef = useRef<HTMLDivElement>(null);
    const resizeStartY = useRef<number>(0);
    const resizeStartHeight = useRef<number>(0);

    const { project, removeItem, selectItem, selectedItemId, initProject, addItem, updateItem } = useTimelineStore();
    const { projectName, projectId, timelineOrientation: orientation, setTimelineOrientation: setOrientation } = useReaderStore();

    // Custom hooks
    const { zoom, setZoom, handleWheel } = useTimelineZoom();

    // Calculate max duration from user input (in ms)
    const maxDuration = useMemo(() => {
        const multiplier = timeUnit === 'minutes' ? 60 * 1000 : 1000;
        return timeValue * multiplier;
    }, [timeValue, timeUnit]);

    const displayDuration = maxDuration;

    const { setPlayheadTime, playheadPercent, handlePlayheadMouseDown } = usePlayhead({
        displayDuration,
        trackRef
    });

    const timeMarkers = useTimelineMarkers(displayDuration, zoom);

    // Initialize project if not exists
    useEffect(() => {
        if (projectId && !project) {
            initProject(projectId, projectName || 'Untitled');
        }
    }, [projectId, project, initProject, projectName]);

    const items = project?.items || [];

    // Use startTime for clip positions (supports free positioning)
    const clipPositions = useMemo(() => {
        return items.map((item: typeof items[0]) => {
            const startTime = item.startTime ?? 0;
            return {
                item,
                startPercent: (startTime / displayDuration) * 100,
                widthPercent: (item.duration / displayDuration) * 100
            };
        });
    }, [items, displayDuration]);

    // Resize handlers
    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizeStartY.current = e.clientY;
        resizeStartHeight.current = trackHeight;
    };

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const delta = resizeStartY.current - e.clientY;
            const newHeight = Math.max(MIN_TRACK_HEIGHT, Math.min(MAX_TRACK_HEIGHT, resizeStartHeight.current + delta));
            setTrackHeight(newHeight);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Handle drop from sidebar
    const handleDropPanel = (panelData: { type: string; id: string; pageIndex: number; imageUrl: string; label: string }, startTime: number, trackId: string) => {
        // Add item at the drop position (startTime) with trackId
        addItem({
            id: panelData.id,
            type: 'panel',
            pageIndex: panelData.pageIndex,
            imageUrl: panelData.imageUrl,
            label: panelData.label,
            trackId: trackId
        }, Math.round(startTime));
    };

    // Handle clip move (drag to reposition)
    const handleMoveItem = (itemId: string, newStartTime: number) => {
        // Clamp to valid range
        const clampedStart = Math.max(0, Math.round(newStartTime));
        updateItem(itemId, { startTime: clampedStart });
    };

    // Handle resize - single point of rounding
    const handleResizeItem = (itemId: string, newDuration: number) => {
        updateItem(itemId, { duration: Math.round(newDuration) });
    };

    // Add new track
    const handleAddTrack = () => {
        const newTrackId = `track-${Date.now()}`; // Use timestamp for unique ID
        setTracks(prev => [
            { id: newTrackId, name: `Track ${prev.length + 1}` },
            ...prev
        ]);
    };

    // Delete track (only if more than one track exists)
    const [trackContextMenu, setTrackContextMenu] = useState<{ x: number; y: number; trackId: string } | null>(null);

    const handleDeleteTrack = (trackId: string) => {
        if (tracks.length <= 1) return; // Keep at least one track
        setTracks(prev => prev.filter(t => t.id !== trackId));
        // TODO: Move clips from deleted track to another track or delete them
        setTrackContextMenu(null);
    };

    const handleTrackContextMenu = (e: React.MouseEvent, trackId: string) => {
        e.preventDefault();
        setTrackContextMenu({ x: e.clientX, y: e.clientY, trackId });
    };

    // Close context menu on click anywhere
    useEffect(() => {
        if (trackContextMenu) {
            const handleClick = () => setTrackContextMenu(null);
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [trackContextMenu]);

    // Handle moving clip to a different track
    const handleMoveToTrack = (itemId: string, newTrackId: string, newStartTime: number) => {
        updateItem(itemId, {
            trackId: newTrackId,
            startTime: Math.max(0, Math.round(newStartTime))
        });
    };

    // Calculate total height for all tracks
    const totalTracksHeight = tracks.length * trackHeight;

    return (
        <div className="shrink-0 bg-[#1a1a1c] border-t border-white/10 select-none overflow-visible">
            {/* Resize Handle */}
            {isExpanded && (
                <div
                    className={`h-1.5 cursor-ns-resize flex items-center justify-center hover:bg-purple-500/30 transition-colors ${isResizing ? 'bg-purple-500/50' : 'bg-transparent'}`}
                    onMouseDown={handleResizeStart}
                >
                    <div className="w-8 h-0.5 rounded-full bg-white/20" />
                </div>
            )}

            {/* Header */}
            <TimelineHeader
                isPlaying={isPlaying}
                snapEnabled={snapEnabled}
                zoom={zoom}
                orientation={orientation}
                timeValue={timeValue}
                timeUnit={timeUnit}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onSkipBack={() => setPlayheadTime(0)}
                onSkipForward={() => setPlayheadTime(displayDuration)}
                onZoomIn={() => setZoom(z => Math.min(4, z + 0.25))}
                onZoomOut={() => setZoom(z => Math.max(0.25, z - 0.25))}
                onToggleSnap={() => setSnapEnabled(!snapEnabled)}
                onOrientationChange={setOrientation}
                onTimeValueChange={setTimeValue}
                onTimeUnitChange={setTimeUnit}
            />

            {/* Timeline Content - Horizontal */}
            {isExpanded && orientation === 'horizontal' && (
                <div className="flex">
                    {/* Features Sidebar - divided vertically: Tools (70%) | Tracks (30%) */}
                    <div
                        className="w-64 shrink-0 bg-[#0f0f11] border-r border-white/10 flex"
                        style={{ height: totalTracksHeight + RULER_HEIGHT + 8 }}
                    >
                        {/* Tools Section - 70% width (left) */}
                        <div className="flex-[7] border-r border-zinc-700 flex flex-col">
                            {/* Ruler spacer */}
                            <div style={{ height: RULER_HEIGHT }} className="border-b border-zinc-700 flex items-center justify-center">
                                <span className="text-[10px] text-zinc-500 font-medium">Ferramentas</span>
                            </div>
                            {/* Tools content area */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                                <TimelineTools />
                            </div>
                        </div>

                        {/* Tracks Section - 30% width (right) */}
                        <div className="flex-[3] flex flex-col">
                            {/* Ruler spacer with Add Track button */}
                            <div style={{ height: RULER_HEIGHT }} className="border-b border-zinc-700 flex items-center justify-center">
                                <button
                                    onClick={handleAddTrack}
                                    className="flex items-center gap-1 px-1 py-0.5 text-[9px] text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                                    title="Adicionar nova track"
                                >
                                    <Plus size={10} />
                                    <span>Track</span>
                                </button>
                            </div>

                            {/* Track labels */}
                            <div className="flex-1 overflow-y-auto">
                                {tracks.map((track) => (
                                    <div
                                        key={track.id}
                                        className="flex items-center justify-center px-1 border-b border-zinc-700/50 text-[9px] text-zinc-500 cursor-pointer hover:bg-zinc-800/50 hover:text-zinc-300 transition-colors"
                                        style={{ height: trackHeight }}
                                        onContextMenu={(e) => handleTrackContextMenu(e, track.id)}
                                    >
                                        {track.name}
                                    </div>
                                ))}
                            </div>

                            {/* Track Context Menu */}
                            {trackContextMenu && (
                                <div
                                    className="fixed bg-zinc-800 rounded shadow-lg border border-zinc-700 py-1 z-50"
                                    style={{ left: trackContextMenu.x, top: trackContextMenu.y }}
                                >
                                    <button
                                        onClick={() => handleDeleteTrack(trackContextMenu.trackId)}
                                        disabled={tracks.length <= 1}
                                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 ${tracks.length <= 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-red-400 hover:bg-zinc-700'}`}
                                    >
                                        <Trash2 size={12} />
                                        Excluir Track
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline Area */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <div ref={trackRef} className="w-full" style={{ height: totalTracksHeight + RULER_HEIGHT + 8 }}>
                            <div style={{ width: '100%', position: 'relative' }}>
                                {/* Time Ruler */}
                                <TimelineRuler
                                    markers={timeMarkers}
                                    zoom={zoom}
                                    playheadPercent={playheadPercent}
                                    onMouseDown={handlePlayheadMouseDown}
                                    onWheel={handleWheel}
                                />

                                {/* Tracks */}
                                {tracks.map((track) => {
                                    // Filter clips for this specific track
                                    // Items without trackId default to 'track-1'
                                    const trackClips = clipPositions.filter(
                                        pos => (pos.item.trackId || 'track-1') === track.id
                                    );
                                    return (
                                        <TimelineTrack
                                            key={track.id}
                                            trackId={track.id}
                                            trackHeight={trackHeight}
                                            clipPositions={trackClips}
                                            selectedItemId={selectedItemId}
                                            playheadPercent={playheadPercent}
                                            zoom={zoom}
                                            totalDuration={displayDuration}
                                            onSelectItem={selectItem}
                                            onRemoveItem={removeItem}
                                            onResizeItem={handleResizeItem}
                                            onMoveItem={handleMoveItem}
                                            onMoveToTrack={handleMoveToTrack}
                                            onDropPanel={handleDropPanel}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
