/**
 * PageList Component
 * 
 * Displays a simple list of pages for navigation.
 */

import React from 'react';
import { useReaderStore } from '../../store/useReaderStore';
import { usePageNavigation } from '../../hooks';

export const PageList: React.FC = () => {
    const { pages } = useReaderStore();
    const { currentPageIndex, goToPage, hasPages } = usePageNavigation();

    if (!hasPages) {
        return (
            <div className="text-center py-4 text-zinc-600 text-xs">
                Nenhuma página carregada
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {pages.map((page, index) => (
                <button
                    key={page.id}
                    onClick={() => goToPage(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${currentPageIndex === index
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'hover:bg-zinc-800/50 text-zinc-300'
                        }`}
                >
                    <span className="text-xs font-medium">
                        Página {index + 1}
                    </span>

                    {/* Active indicator */}
                    {currentPageIndex === index && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                </button>
            ))}
        </div>
    );
};
