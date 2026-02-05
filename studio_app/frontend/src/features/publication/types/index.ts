/**
 * Publication Types
 * 
 * Type definitions for the Publication module.
 * Handles closed packages ready for publishing via ImagineRead Lite.
 */

import { PageData } from '@features/reader/types';
import { TimelineProject } from '@features/timeline/types';

/**
 * A closed package ready for publication
 * Contains all data: pages, panels, balloons, animations, timeline
 */
export interface ClosedPackage {
    id: string;
    projectId: string;
    projectName: string;
    coverUrl: string;              // First page as cover
    closedAt: number;              // Timestamp of closing

    // Complete data
    pages: PageData[];             // All pages with panels/balloons
    timelineData: TimelineProject | null; // Timeline animation data

    // Publication status
    liteCode?: string;             // ImagineRead Lite code
    publishedAt?: number;          // Publication timestamp
    expiresAt?: string;            // Expiration date (Free tier)
}

/**
 * Response from ImagineRead Lite API upload
 */
export interface LiteUploadResponse {
    success: boolean;
    code: string;
    codeFormatted: string;
    originalName: string;
    fileType: string;
    fileSizeBytes: number;
    expiresAt: string | null;
    message: string;
}
