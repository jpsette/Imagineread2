/**
 * prepareForReader Utility
 * 
 * Collects data from the Editor and sends it to the Reader.
 * This is the bridge between Editor and Reader modules.
 * 
 * Usage:
 *   import { prepareForReader } from '@features/reader/utils';
 *   prepareForReader({ ... });
 */

import { useReaderStore } from '../store/useReaderStore';
import { PageData, ReaderPackage } from '../types';

interface PrepareOptions {
    projectId: string;
    projectName: string;
    pages: PageData[];
}

/**
 * Sends data from Editor to Reader and opens the Reader window.
 */
export function prepareForReader(options: PrepareOptions): void {
    const { loadPackage } = useReaderStore.getState();

    const pkg: ReaderPackage = {
        projectId: options.projectId,
        projectName: options.projectName,
        pages: options.pages,
        createdAt: Date.now(),
    };

    loadPackage(pkg);
}

/**
 * Creates a PageData object from Editor state.
 * Helper to format data correctly.
 */
export function createPageData(params: {
    id: string;
    order: number;
    fileName: string;
    imageUrl: string;
    panels: any[];
    balloons: any[];
    previewImages: string[];
    translations?: Record<string, string>;
}): PageData {
    return {
        id: params.id,
        order: params.order,
        fileName: params.fileName,
        imageUrl: params.imageUrl,
        panels: params.panels,
        balloons: params.balloons,
        previewImages: params.previewImages,
        translations: params.translations || {},
    };
}
