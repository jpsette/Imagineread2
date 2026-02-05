/**
 * Effects Types
 * 
 * Types and interfaces for timeline clip effects (zoom, pan, focus points).
 * This is a standalone module to keep the architecture clean.
 */

// ============================================
// EASING TYPES
// ============================================

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

// ============================================
// FOCUS POINT
// ============================================

/**
 * FocusPoint represents a point where the camera will focus
 * during guided reading (Motion Comic style).
 */
export interface FocusPoint {
    id: string;
    x: number;              // Horizontal position (0-100%)
    y: number;              // Vertical position (0-100%)
    scale: number;          // Zoom factor (1.0 = normal, 2.0 = 2x zoom)
    duration: number;       // Transition duration in ms
    easing: EasingType;     // Animation easing
    order: number;          // Order in sequence
}

// ============================================
// CLIP EFFECTS
// ============================================

/**
 * ClipEffects contains all effects applied to a timeline clip.
 */
export interface ClipEffects {
    focusPoints: FocusPoint[];  // List of focus points for guided reading
    autoZoom: boolean;          // Enable automatic zoom based on balloons
    initialScale: number;       // Initial zoom level (default: 1.0)
    initialX: number;           // Initial focus X (default: 50)
    initialY: number;           // Initial focus Y (default: 50)
}

// ============================================
// DEFAULTS
// ============================================

export const DEFAULT_FOCUS_POINT: Omit<FocusPoint, 'id' | 'order'> = {
    x: 50,
    y: 50,
    scale: 1.5,
    duration: 500,
    easing: 'ease-out'
};

export const DEFAULT_CLIP_EFFECTS: ClipEffects = {
    focusPoints: [],
    autoZoom: false,
    initialScale: 1.0,
    initialX: 50,
    initialY: 50
};

// ============================================
// UTILITIES
// ============================================

/**
 * Create a new focus point with default values
 */
export function createFocusPoint(
    order: number,
    overrides?: Partial<FocusPoint>
): FocusPoint {
    return {
        id: `fp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ...DEFAULT_FOCUS_POINT,
        order,
        ...overrides
    };
}

/**
 * Create default clip effects
 */
export function createClipEffects(
    overrides?: Partial<ClipEffects>
): ClipEffects {
    return {
        ...DEFAULT_CLIP_EFFECTS,
        ...overrides
    };
}
