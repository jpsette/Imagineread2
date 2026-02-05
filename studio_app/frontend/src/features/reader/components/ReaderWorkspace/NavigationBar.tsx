/**
 * NavigationBar Component
 * 
 * Top bar with navigation controls and actions.
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { usePanelNavigation, usePageNavigation } from '../../hooks';
import { useReaderStore } from '../../store/useReaderStore';
import { MobilePreviewModal } from '../shared';

export const NavigationBar: React.FC = () => {
    const { getCurrentPanel } = useReaderStore();
    const {
        currentPanelIndex,
        totalPanels,
        canGoNext,
        canGoPrevious,
        goToNextPanel,
        goToPreviousPanel
    } = usePanelNavigation();
    const { currentPageIndex, totalPages } = usePageNavigation();

    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const currentImage = getCurrentPanel();

    return (
        <>
            <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
                {/* Page indicator */}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>Página {currentPageIndex + 1}/{totalPages}</span>
                    <span className="text-zinc-700">|</span>
                </div>

                {/* Panel navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPreviousPanel}
                        disabled={!canGoPrevious}
                        className="p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-zinc-400 font-mono min-w-[60px] text-center">
                        {totalPanels > 0 ? `${currentPanelIndex + 1} / ${totalPanels}` : '—'}
                    </span>
                    <button
                        onClick={goToNextPanel}
                        disabled={!canGoNext}
                        className="p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Preview Button */}
                    <button
                        onClick={() => setShowMobilePreview(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-medium"
                    >
                        <Smartphone size={14} />
                        Preview
                    </button>
                </div>
            </div>

            {/* Mobile Preview Modal (shared component) */}
            <MobilePreviewModal
                isOpen={showMobilePreview}
                onClose={() => setShowMobilePreview(false)}
                currentImage={currentImage}
                currentIndex={currentPanelIndex}
                totalPanels={totalPanels}
            />
        </>
    );
};
