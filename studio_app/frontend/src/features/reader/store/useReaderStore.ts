/**
 * Reader Store
 * 
 * State management for the Native Reader module.
 * Handles multi-page navigation and display settings.
 */

import { create } from 'zustand';
import { PageData, ReaderPackage } from '../types';

interface ReaderState {
    // Window visibility
    showReader: boolean;
    setShowReader: (show: boolean) => void;

    // Project data
    projectId: string | null;
    projectName: string | null;
    pages: PageData[];

    // Navigation
    currentPageIndex: number;
    currentPanelIndex: number;
    setCurrentPageIndex: (index: number) => void;
    setCurrentPanelIndex: (index: number) => void;

    // Display settings
    showBalloons: boolean;
    showText: boolean;
    enableZoom: boolean;
    enableAnimations: boolean;
    animationSpeed: number;
    setShowBalloons: (show: boolean) => void;
    setShowText: (show: boolean) => void;
    setEnableZoom: (enable: boolean) => void;
    setEnableAnimations: (enable: boolean) => void;
    setAnimationSpeed: (speed: number) => void;

    // Processing
    isProcessing: boolean;
    setIsProcessing: (processing: boolean) => void;

    // Timeline orientation
    timelineOrientation: 'horizontal' | 'vertical';
    setTimelineOrientation: (orientation: 'horizontal' | 'vertical') => void;

    // Actions
    loadPackage: (pkg: ReaderPackage) => void;
    reset: () => void;

    // Computed helpers (for convenience)
    getCurrentPage: () => PageData | null;
    getCurrentPanel: () => string | null; // Returns preview image URL
}

const initialState = {
    showReader: false,
    projectId: null,
    projectName: null,
    pages: [],
    currentPageIndex: 0,
    currentPanelIndex: 0,
    showBalloons: true,
    showText: true,
    enableZoom: true,
    enableAnimations: true,
    animationSpeed: 0.3,
    isProcessing: false,
    timelineOrientation: 'horizontal' as const,
};

export const useReaderStore = create<ReaderState>((set, get) => ({
    ...initialState,

    // Visibility
    setShowReader: (show) => set({ showReader: show }),

    // Navigation
    setCurrentPageIndex: (index) => set({
        currentPageIndex: index,
        currentPanelIndex: 0, // Reset panel when switching pages
    }),
    setCurrentPanelIndex: (index) => set({ currentPanelIndex: index }),

    // Display settings
    setShowBalloons: (show) => set({ showBalloons: show }),
    setShowText: (show) => set({ showText: show }),
    setEnableZoom: (enable) => set({ enableZoom: enable }),
    setEnableAnimations: (enable) => set({ enableAnimations: enable }),
    setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

    // Processing
    setIsProcessing: (processing) => set({ isProcessing: processing }),

    // Timeline
    setTimelineOrientation: (orientation) => set({ timelineOrientation: orientation }),

    // Load package from Editor
    loadPackage: (pkg) => set({
        projectId: pkg.projectId,
        projectName: pkg.projectName,
        pages: pkg.pages,
        currentPageIndex: 0,
        currentPanelIndex: 0,
        showReader: true,
    }),

    // Reset
    reset: () => set(initialState),

    // Computed: Get current page
    getCurrentPage: () => {
        const { pages, currentPageIndex } = get();
        return pages[currentPageIndex] || null;
    },

    // Computed: Get current panel image
    getCurrentPanel: () => {
        const { pages, currentPageIndex, currentPanelIndex } = get();
        const page = pages[currentPageIndex];
        if (!page) return null;
        return page.previewImages[currentPanelIndex] || page.imageUrl;
    },
}));
