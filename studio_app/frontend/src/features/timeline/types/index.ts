/**
 * Timeline Types
 * 
 * Types for the Timeline/Storyboard feature.
 * Supports tap-to-advance and auto-play modes.
 */

// ============================================
// CONSTANTS
// ============================================

export const TRANSITIONS = [
    'none',
    'fade',
    'slide-left',
    'slide-right',
    'slide-up',
    'slide-down',
    'zoom-in',
    'zoom-out',
    'blur'
] as const;

export const PLAYBACK_MODES = ['tap', 'autoplay'] as const;

// ============================================
// TYPES
// ============================================

export type TransitionType = typeof TRANSITIONS[number];
export type PlaybackMode = typeof PLAYBACK_MODES[number];

/**
 * Single item in the timeline (panel or full page)
 */
export interface TimelineItem {
    id: string;
    type: 'panel' | 'page';
    sourceId: string;           // ID of the source panel/page
    pageIndex: number;          // Index of the source page
    imageUrl: string;           // Image URL for preview
    label: string;              // Display label
    startTime: number;          // Start time in ms (position on timeline)
    duration: number;           // Duration in ms (for autoplay)
    order: number;              // Position in timeline
    transition: TransitionType; // Entry transition effect
    transitionDuration: number; // Transition duration in ms
    trackId?: string;           // Track ID for multi-track support
}

/**
 * Timeline project containing all items
 */
export interface TimelineProject {
    id: string;
    name: string;
    comicId: string;            // Parent comic/project ID
    mode: PlaybackMode;
    items: TimelineItem[];
    defaultDuration: number;    // Default duration for new items (ms)
    defaultTransition: TransitionType;
    createdAt: string;
    updatedAt: string;
}

/**
 * Source item from the editor (panel or page)
 */
export interface SourceItem {
    id: string;
    type: 'panel' | 'page';
    pageIndex: number;
    imageUrl: string;
    label: string;              // Display label (e.g., "Page 1", "Panel 3")
    trackId?: string;           // Track ID for multi-track support
}

// ============================================
// DEFAULTS
// ============================================

export const DEFAULT_DURATION = 10000;          // 10 seconds
export const DEFAULT_TRANSITION: TransitionType = 'fade';
export const DEFAULT_TRANSITION_DURATION = 300; // 300ms

/**
 * Create a new timeline item from a source
 */
export function createTimelineItem(
    source: SourceItem,
    order: number,
    overrides?: Partial<TimelineItem>
): TimelineItem {
    return {
        id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: source.type,
        sourceId: source.id,
        pageIndex: source.pageIndex,
        imageUrl: source.imageUrl,
        label: source.label,
        startTime: 0,  // Will be calculated when added
        duration: DEFAULT_DURATION,
        order,
        transition: DEFAULT_TRANSITION,
        transitionDuration: DEFAULT_TRANSITION_DURATION,
        ...overrides
    };
}

/**
 * Create a new timeline project
 */
export function createTimelineProject(
    comicId: string,
    name: string
): TimelineProject {
    const now = new Date().toISOString();
    return {
        id: `proj-${Date.now()}`,
        name,
        comicId,
        mode: 'tap',
        items: [],
        defaultDuration: DEFAULT_DURATION,
        defaultTransition: DEFAULT_TRANSITION,
        createdAt: now,
        updatedAt: now
    };
}
