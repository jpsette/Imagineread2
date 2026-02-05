/**
 * usePageNavigation Hook
 * 
 * Handles navigation between pages in the Reader.
 */

import { useCallback } from 'react';
import { useReaderStore } from '../store/useReaderStore';

export function usePageNavigation() {
    const {
        pages,
        currentPageIndex,
        setCurrentPageIndex
    } = useReaderStore();

    const totalPages = pages.length;
    const hasPages = totalPages > 0;
    const canGoNext = currentPageIndex < totalPages - 1;
    const canGoPrevious = currentPageIndex > 0;

    const goToPage = useCallback((index: number) => {
        if (index >= 0 && index < totalPages) {
            setCurrentPageIndex(index);
        }
    }, [totalPages, setCurrentPageIndex]);

    const goToNextPage = useCallback(() => {
        if (canGoNext) {
            setCurrentPageIndex(currentPageIndex + 1);
        }
    }, [canGoNext, currentPageIndex, setCurrentPageIndex]);

    const goToPreviousPage = useCallback(() => {
        if (canGoPrevious) {
            setCurrentPageIndex(currentPageIndex - 1);
        }
    }, [canGoPrevious, currentPageIndex, setCurrentPageIndex]);

    return {
        currentPageIndex,
        totalPages,
        hasPages,
        canGoNext,
        canGoPrevious,
        goToPage,
        goToNextPage,
        goToPreviousPage,
    };
}
