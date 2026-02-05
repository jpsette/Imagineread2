/**
 * Reader Types
 * 
 * Type definitions for the Native Reader module.
 * Keeps data structures clean and reusable.
 */

import { Panel, Balloon } from '@shared/types';

/**
 * A single page with all its assets
 */
export interface PageData {
    id: string;
    order: number;
    fileName: string;
    imageUrl: string;
    panels: Panel[];
    balloons: Balloon[];
    previewImages: string[];
    translations: Record<string, string>; // balloonId -> translated text
}

/**
 * Package sent from Editor to Reader
 */
export interface ReaderPackage {
    projectId: string;
    projectName: string;
    pages: PageData[];
    createdAt: number;
}

/**
 * Display settings for the Reader
 */
export interface DisplaySettings {
    showBalloons: boolean;
    showText: boolean;
    enableZoom: boolean;
    enableAnimations: boolean;
    animationSpeed: number;
}

/**
 * Navigation state
 */
export interface NavigationState {
    currentPageIndex: number;
    currentPanelIndex: number;
}
