/**
 * TimelineEditor Component
 * 
 * Main container for the Timeline Editor feature.
 * Combines SourcePanel, PreviewPlayer, and TimelineTrack.
 */

import React, { useEffect } from 'react';
import { ArrowLeft, Save, Download, Settings, Hand, Play } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { SourceItem } from '../../types';
import { TimelineTrack } from './TimelineTrack';
import { SourcePanel } from '../SourcePanel';
import { PreviewPlayer } from '../PreviewPlayer';

interface TimelineEditorProps {
    comicId: string;
    comicName: string;
    pages: SourceItem[];
    panels: SourceItem[];
    onBack?: () => void;
    onSave?: () => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
    comicId,
    comicName,
    pages,
    panels,
    onBack,
    onSave
}) => {
    const { project, initProject, isDirty, setMode, addItem } = useTimelineStore();

    // Initialize project on mount
    useEffect(() => {
        if (!project || project.comicId !== comicId) {
            initProject(comicId, comicName);
        }
    }, [comicId, comicName]);

    // Handle drop from source panel
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (data) {
            try {
                const item: SourceItem = JSON.parse(data);
                addItem(item);
            } catch (err) {
                console.error('Failed to parse dropped item:', err);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    return (
        <div className="w-full h-full flex flex-col bg-app-bg">
            {/* Header */}
            <header className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-border-color bg-panel-bg">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-sm font-semibold text-white">Timeline Editor</h1>
                        <p className="text-xs text-text-muted">{comicName}</p>
                    </div>
                </div>

                {/* Center - Mode Toggle */}
                <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
                    <button
                        onClick={() => setMode('tap')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                            ${project?.mode === 'tap'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'text-text-muted hover:text-white'
                            }`}
                    >
                        <Hand size={14} />
                        Tap
                    </button>
                    <button
                        onClick={() => setMode('autoplay')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                            ${project?.mode === 'autoplay'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'text-text-muted hover:text-white'
                            }`}
                    >
                        <Play size={14} />
                        Auto-play
                    </button>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onSave}
                        disabled={!isDirty}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                            ${isDirty
                                ? 'bg-accent-blue text-white hover:bg-accent-blue/80'
                                : 'bg-white/5 text-text-muted cursor-not-allowed'
                            }`}
                    >
                        <Save size={14} />
                        Salvar
                    </button>
                    <button className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors">
                        <Download size={18} />
                    </button>
                    <button className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors">
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Preview */}
                <div className="w-72 shrink-0 border-r border-border-color">
                    <PreviewPlayer />
                </div>

                {/* Center: Timeline (with drop zone) */}
                <div
                    className="flex-1 flex flex-col overflow-hidden"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <TimelineTrack />
                </div>

                {/* Right: Source Panel */}
                <div className="w-64 shrink-0">
                    <SourcePanel pages={pages} panels={panels} />
                </div>
            </div>
        </div>
    );
};
