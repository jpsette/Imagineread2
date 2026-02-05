/**
 * useEffectsStore
 * 
 * Zustand store for managing clip effects (zoom, focus points).
 * Independent store to keep architecture clean and modular.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ClipEffects, FocusPoint, createClipEffects, createFocusPoint, DEFAULT_CLIP_EFFECTS } from '../types/effects';

// ============================================
// STORE INTERFACE
// ============================================

interface EffectsState {
    // Map of clip ID to its effects
    clipEffects: Record<string, ClipEffects>;

    // Currently selected focus point for editing
    selectedFocusPointId: string | null;

    // Active clip being edited
    activeClipId: string | null;
}

interface EffectsActions {
    // Set active clip for editing
    setActiveClip: (clipId: string | null) => void;

    // Get effects for a clip (creates default if not exists)
    getClipEffects: (clipId: string) => ClipEffects;

    // Focus point management
    addFocusPoint: (clipId: string, x?: number, y?: number, scale?: number) => void;
    removeFocusPoint: (clipId: string, focusPointId: string) => void;
    updateFocusPoint: (clipId: string, focusPointId: string, updates: Partial<FocusPoint>) => void;
    reorderFocusPoints: (clipId: string, fromIndex: number, toIndex: number) => void;
    selectFocusPoint: (focusPointId: string | null) => void;

    // Clip effects settings
    setAutoZoom: (clipId: string, enabled: boolean) => void;
    setInitialView: (clipId: string, scale: number, x: number, y: number) => void;

    // Clear effects for a clip
    clearEffects: (clipId: string) => void;

    // Get selected focus point
    getSelectedFocusPoint: () => FocusPoint | null;
}

type EffectsStore = EffectsState & EffectsActions;

// ============================================
// INITIAL STATE
// ============================================

const initialState: EffectsState = {
    clipEffects: {},
    selectedFocusPointId: null,
    activeClipId: null
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useEffectsStore = create<EffectsStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setActiveClip: (clipId) => {
                set({ activeClipId: clipId, selectedFocusPointId: null });
            },

            getClipEffects: (clipId) => {
                const effects = get().clipEffects[clipId];
                return effects || DEFAULT_CLIP_EFFECTS;
            },

            addFocusPoint: (clipId, x = 50, y = 50, scale = 1.5) => {
                set((state) => {
                    const currentEffects = state.clipEffects[clipId] || createClipEffects();
                    const order = currentEffects.focusPoints.length;
                    const newPoint = createFocusPoint(order, { x, y, scale });

                    return {
                        clipEffects: {
                            ...state.clipEffects,
                            [clipId]: {
                                ...currentEffects,
                                focusPoints: [...currentEffects.focusPoints, newPoint]
                            }
                        },
                        selectedFocusPointId: newPoint.id
                    };
                });
            },

            removeFocusPoint: (clipId, focusPointId) => {
                set((state) => {
                    const currentEffects = state.clipEffects[clipId];
                    if (!currentEffects) return state;

                    const updatedPoints = currentEffects.focusPoints
                        .filter(p => p.id !== focusPointId)
                        .map((p, index) => ({ ...p, order: index }));

                    return {
                        clipEffects: {
                            ...state.clipEffects,
                            [clipId]: {
                                ...currentEffects,
                                focusPoints: updatedPoints
                            }
                        },
                        selectedFocusPointId: state.selectedFocusPointId === focusPointId
                            ? null
                            : state.selectedFocusPointId
                    };
                });
            },

            updateFocusPoint: (clipId, focusPointId, updates) => {
                set((state) => {
                    const currentEffects = state.clipEffects[clipId];
                    if (!currentEffects) return state;

                    const updatedPoints = currentEffects.focusPoints.map(p =>
                        p.id === focusPointId ? { ...p, ...updates } : p
                    );

                    return {
                        clipEffects: {
                            ...state.clipEffects,
                            [clipId]: {
                                ...currentEffects,
                                focusPoints: updatedPoints
                            }
                        }
                    };
                });
            },

            reorderFocusPoints: (clipId, fromIndex, toIndex) => {
                set((state) => {
                    const currentEffects = state.clipEffects[clipId];
                    if (!currentEffects) return state;

                    const points = [...currentEffects.focusPoints];
                    const [removed] = points.splice(fromIndex, 1);
                    points.splice(toIndex, 0, removed);

                    const reorderedPoints = points.map((p, index) => ({ ...p, order: index }));

                    return {
                        clipEffects: {
                            ...state.clipEffects,
                            [clipId]: {
                                ...currentEffects,
                                focusPoints: reorderedPoints
                            }
                        }
                    };
                });
            },

            selectFocusPoint: (focusPointId) => {
                set({ selectedFocusPointId: focusPointId });
            },

            setAutoZoom: (clipId, enabled) => {
                set((state) => {
                    const currentEffects = state.clipEffects[clipId] || createClipEffects();
                    return {
                        clipEffects: {
                            ...state.clipEffects,
                            [clipId]: {
                                ...currentEffects,
                                autoZoom: enabled
                            }
                        }
                    };
                });
            },

            setInitialView: (clipId, scale, x, y) => {
                set((state) => {
                    const currentEffects = state.clipEffects[clipId] || createClipEffects();
                    return {
                        clipEffects: {
                            ...state.clipEffects,
                            [clipId]: {
                                ...currentEffects,
                                initialScale: scale,
                                initialX: x,
                                initialY: y
                            }
                        }
                    };
                });
            },

            clearEffects: (clipId) => {
                set((state) => {
                    const { [clipId]: _, ...rest } = state.clipEffects;
                    return {
                        clipEffects: rest,
                        selectedFocusPointId: null
                    };
                });
            },

            getSelectedFocusPoint: () => {
                const state = get();
                if (!state.activeClipId || !state.selectedFocusPointId) return null;

                const effects = state.clipEffects[state.activeClipId];
                if (!effects) return null;

                return effects.focusPoints.find(p => p.id === state.selectedFocusPointId) || null;
            }
        }),
        { name: 'effects-store' }
    )
);
