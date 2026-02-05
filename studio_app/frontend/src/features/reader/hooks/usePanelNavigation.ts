/**
 * usePanelNavigation Hook
 * 
 * Handles navigation between panels within a page.
 */

import { useCallback } from 'react';
import { useReaderStore } from '../store/useReaderStore';

export function usePanelNavigation() {
    const {
        getCurrentPage,
        currentPanelIndex,
        setCurrentPanelIndex
    } = useReaderStore();

    const currentPage = getCurrentPage();
    const totalPanels = currentPage?.previewImages.length || 0;
    const hasPanels = totalPanels > 0;
    const canGoNext = currentPanelIndex < totalPanels - 1;
    const canGoPrevious = currentPanelIndex > 0;

    const goToPanel = useCallback((index: number) => {
        if (index >= 0 && index < totalPanels) {
            setCurrentPanelIndex(index);
        }
    }, [totalPanels, setCurrentPanelIndex]);

    const goToNextPanel = useCallback(() => {
        if (canGoNext) {
            setCurrentPanelIndex(currentPanelIndex + 1);
        }
    }, [canGoNext, currentPanelIndex, setCurrentPanelIndex]);

    const goToPreviousPanel = useCallback(() => {
        if (canGoPrevious) {
            setCurrentPanelIndex(currentPanelIndex - 1);
        }
    }, [canGoPrevious, currentPanelIndex, setCurrentPanelIndex]);

    return {
        currentPanelIndex,
        totalPanels,
        hasPanels,
        canGoNext,
        canGoPrevious,
        goToPanel,
        goToNextPanel,
        goToPreviousPanel,
    };
}
