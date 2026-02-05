/**
 * PageViewer Component
 * 
 * Renders a panel preview image.
 * Note: Balloon overlay was removed because preview images are generated from 
 * the canvas which already includes the balloons rendered.
 */

import React from 'react';

interface PageViewerProps {
    imageUrl: string | null;
}

export const PageViewer: React.FC<PageViewerProps> = ({
    imageUrl,
}) => {
    if (!imageUrl) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                No image
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Page Image - Already contains rendered balloons from canvas capture */}
            <img
                src={imageUrl}
                alt="Comic page"
                className="w-full h-full object-contain"
                draggable={false}
            />
        </div>
    );
};
