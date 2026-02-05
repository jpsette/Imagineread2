/**
 * MobilePreviewModal Component
 * 
 * Shared modal for displaying mobile preview.
 * Used by ReaderPreview and NavigationBar.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { MobilePreview } from '@features/editor/components/mobile-preview';

interface MobilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentImage: string | null;
    currentIndex: number;
    totalPanels: number;
}

export const MobilePreviewModal: React.FC<MobilePreviewModalProps> = ({
    isOpen,
    onClose,
    currentImage,
    currentIndex,
    totalPanels,
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
                <X size={20} />
            </button>

            {/* Preview content */}
            <div className="relative z-10 scale-[1.75]">
                <MobilePreview
                    currentImage={currentImage}
                    currentIndex={currentIndex}
                    totalPanels={totalPanels}
                />
            </div>
        </div>,
        document.body
    );
};
