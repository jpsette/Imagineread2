/**
 * ReaderWorkspace Component
 * 
 * Main workspace area for the Reader.
 * Contains only ReaderPreview (device mockups).
 */

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';
import { ReaderPreview } from './ReaderPreview';

export const ReaderWorkspace: React.FC = () => {
    const { pages } = useReaderStore();

    const hasPages = pages.length > 0;

    // Empty state
    if (!hasPages) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 bg-app-bg">
                <ImageIcon size={64} className="opacity-30 mb-4" />
                <p className="text-lg font-medium mb-2">Nenhum projeto carregado</p>
                <p className="text-sm text-zinc-500">
                    Use "Enviar para preparação" no Workstation para enviar um projeto
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-app-bg overflow-hidden">
            <ReaderPreview />
        </div>
    );
};
