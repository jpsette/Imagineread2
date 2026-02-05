/**
 * useTimelineStore
 * 
 * Zustand store for Timeline state management.
 * Handles items, selection, playback, and project data.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    TimelineItem,
    TimelineProject,
    PlaybackMode,
    TransitionType,
    SourceItem,
    createTimelineItem,
    createTimelineProject
} from '../types';

// ============================================
// STORE INTERFACE
// ============================================

interface TimelineState {
    // Project
    project: TimelineProject | null;
    isLoading: boolean;
    isDirty: boolean;

    // Selection
    selectedItemId: string | null;

    // Playback
    playheadPosition: number;   // Current position in ms
    isPlaying: boolean;
    currentItemIndex: number;   // Index of currently playing item

    // UI
    zoom: number;               // Timeline zoom level (1 = 100%)
}

interface TimelineActions {
    // Project
    initProject: (comicId: string, name: string) => void;
    loadProject: (project: TimelineProject) => void;
    clearProject: () => void;

    // Items
    addItem: (source: SourceItem, startTime?: number) => void;
    addItemAt: (source: SourceItem, index: number) => void;
    removeItem: (itemId: string) => void;
    updateItem: (itemId: string, updates: Partial<TimelineItem>) => void;
    reorderItems: (fromIndex: number, toIndex: number) => void;
    clearItems: () => void;

    // Selection
    selectItem: (itemId: string | null) => void;
    selectNext: () => void;
    selectPrevious: () => void;

    // Playback
    play: () => void;
    pause: () => void;
    stop: () => void;
    seek: (positionMs: number) => void;
    goToItem: (index: number) => void;
    nextItem: () => void;
    previousItem: () => void;

    // Settings
    setMode: (mode: PlaybackMode) => void;
    setDefaultDuration: (ms: number) => void;
    setDefaultTransition: (transition: TransitionType) => void;
    setZoom: (zoom: number) => void;

    // Utilities
    getSelectedItem: () => TimelineItem | null;
    getCurrentItem: () => TimelineItem | null;
    getItemAtPlayhead: () => TimelineItem | null;
    getTotalDuration: () => number;
}

type TimelineStore = TimelineState & TimelineActions;

// ============================================
// INITIAL STATE
// ============================================

const initialState: TimelineState = {
    project: null,
    isLoading: false,
    isDirty: false,
    selectedItemId: null,
    playheadPosition: 0,
    isPlaying: false,
    currentItemIndex: 0,
    zoom: 1
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useTimelineStore = create<TimelineStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // ========== PROJECT ==========

            initProject: (comicId, name) => {
                const project = createTimelineProject(comicId, name);
                set({ project, isDirty: false, selectedItemId: null, currentItemIndex: 0 });
            },

            loadProject: (project) => {
                set({ project, isDirty: false, selectedItemId: null, currentItemIndex: 0 });
            },

            clearProject: () => {
                set(initialState);
            },

            // ========== ITEMS ==========

            addItem: (source, explicitStartTime) => {
                const { project } = get();
                if (!project) return;

                const order = project.items.length;
                // Use explicit startTime if provided, otherwise calculate from existing items
                const startTime = explicitStartTime !== undefined
                    ? explicitStartTime
                    : project.items.reduce((sum, item) => sum + item.duration, 0);

                const newItem = createTimelineItem(source, order, {
                    duration: project.defaultDuration,
                    transition: project.defaultTransition,
                    startTime,
                    trackId: source.trackId
                });

                set({
                    project: {
                        ...project,
                        items: [...project.items, newItem],
                        updatedAt: new Date().toISOString()
                    },
                    isDirty: true
                });
            },

            addItemAt: (source, index) => {
                const { project } = get();
                if (!project) return;

                const newItem = createTimelineItem(source, index, {
                    duration: project.defaultDuration,
                    transition: project.defaultTransition
                });

                const items = [...project.items];
                items.splice(index, 0, newItem);

                // Update order for all items
                const reorderedItems = items.map((item, i) => ({ ...item, order: i }));

                set({
                    project: {
                        ...project,
                        items: reorderedItems,
                        updatedAt: new Date().toISOString()
                    },
                    isDirty: true
                });
            },

            removeItem: (itemId) => {
                const { project, selectedItemId } = get();
                if (!project) return;

                const items = project.items
                    .filter(item => item.id !== itemId)
                    .map((item, i) => ({ ...item, order: i }));

                set({
                    project: {
                        ...project,
                        items,
                        updatedAt: new Date().toISOString()
                    },
                    selectedItemId: selectedItemId === itemId ? null : selectedItemId,
                    isDirty: true
                });
            },

            updateItem: (itemId, updates) => {
                const { project } = get();
                if (!project) return;

                const items = project.items.map(item =>
                    item.id === itemId ? { ...item, ...updates } : item
                );

                set({
                    project: {
                        ...project,
                        items,
                        updatedAt: new Date().toISOString()
                    },
                    isDirty: true
                });
            },

            reorderItems: (fromIndex, toIndex) => {
                const { project } = get();
                if (!project) return;

                const items = [...project.items];
                const [removed] = items.splice(fromIndex, 1);
                items.splice(toIndex, 0, removed);

                // Update order for all items
                const reorderedItems = items.map((item, i) => ({ ...item, order: i }));

                set({
                    project: {
                        ...project,
                        items: reorderedItems,
                        updatedAt: new Date().toISOString()
                    },
                    isDirty: true
                });
            },

            clearItems: () => {
                const { project } = get();
                if (!project) return;

                set({
                    project: {
                        ...project,
                        items: [],
                        updatedAt: new Date().toISOString()
                    },
                    selectedItemId: null,
                    currentItemIndex: 0,
                    isDirty: true
                });
            },

            // ========== SELECTION ==========

            selectItem: (itemId) => {
                set({ selectedItemId: itemId });
            },

            selectNext: () => {
                const { project, selectedItemId } = get();
                if (!project || project.items.length === 0) return;

                const currentIndex = project.items.findIndex(i => i.id === selectedItemId);
                const nextIndex = currentIndex < project.items.length - 1 ? currentIndex + 1 : 0;
                set({ selectedItemId: project.items[nextIndex].id });
            },

            selectPrevious: () => {
                const { project, selectedItemId } = get();
                if (!project || project.items.length === 0) return;

                const currentIndex = project.items.findIndex(i => i.id === selectedItemId);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : project.items.length - 1;
                set({ selectedItemId: project.items[prevIndex].id });
            },

            // ========== PLAYBACK ==========

            play: () => set({ isPlaying: true }),
            pause: () => set({ isPlaying: false }),
            stop: () => set({ isPlaying: false, currentItemIndex: 0, playheadPosition: 0 }),

            seek: (positionMs) => {
                const { project } = get();
                if (!project) return;

                // Calculate which item we're at based on position
                let accumulated = 0;
                let itemIndex = 0;

                for (let i = 0; i < project.items.length; i++) {
                    const itemEnd = accumulated + project.items[i].duration;
                    if (positionMs < itemEnd) {
                        itemIndex = i;
                        break;
                    }
                    accumulated = itemEnd;
                    itemIndex = i;
                }

                set({ playheadPosition: positionMs, currentItemIndex: itemIndex });
            },

            goToItem: (index) => {
                const { project } = get();
                if (!project || index < 0 || index >= project.items.length) return;

                // Calculate position for this item
                let position = 0;
                for (let i = 0; i < index; i++) {
                    position += project.items[i].duration;
                }

                set({ currentItemIndex: index, playheadPosition: position });
            },

            nextItem: () => {
                const { project, currentItemIndex } = get();
                if (!project) return;

                const nextIndex = Math.min(currentItemIndex + 1, project.items.length - 1);
                get().goToItem(nextIndex);
            },

            previousItem: () => {
                const { currentItemIndex } = get();
                const prevIndex = Math.max(currentItemIndex - 1, 0);
                get().goToItem(prevIndex);
            },

            // ========== SETTINGS ==========

            setMode: (mode) => {
                const { project } = get();
                if (!project) return;

                set({
                    project: { ...project, mode, updatedAt: new Date().toISOString() },
                    isDirty: true
                });
            },

            setDefaultDuration: (ms) => {
                const { project } = get();
                if (!project) return;

                set({
                    project: { ...project, defaultDuration: ms, updatedAt: new Date().toISOString() },
                    isDirty: true
                });
            },

            setDefaultTransition: (transition) => {
                const { project } = get();
                if (!project) return;

                set({
                    project: { ...project, defaultTransition: transition, updatedAt: new Date().toISOString() },
                    isDirty: true
                });
            },

            setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(4, zoom)) }),

            // ========== UTILITIES ==========

            getSelectedItem: () => {
                const { project, selectedItemId } = get();
                if (!project || !selectedItemId) return null;
                return project.items.find(i => i.id === selectedItemId) || null;
            },

            getCurrentItem: () => {
                const { project, currentItemIndex } = get();
                if (!project || project.items.length === 0) return null;
                return project.items[currentItemIndex] || null;
            },

            getItemAtPlayhead: () => {
                const { project, playheadPosition } = get();
                if (!project || project.items.length === 0) return null;

                // Find the item that contains the playhead position
                // Each item has startTime and duration
                for (const item of project.items) {
                    const itemStart = item.startTime ?? 0;
                    const itemEnd = itemStart + item.duration;
                    if (playheadPosition >= itemStart && playheadPosition < itemEnd) {
                        return item;
                    }
                }
                return null;
            },

            getTotalDuration: () => {
                const { project } = get();
                if (!project) return 0;
                return project.items.reduce((sum, item) => sum + item.duration, 0);
            }
        }),
        { name: 'timeline-store' }
    )
);
