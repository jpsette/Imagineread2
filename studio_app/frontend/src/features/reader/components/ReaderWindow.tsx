/**
 * ReaderWindow Component
 * 
 * Fullscreen window for the Native Reader module.
 * Uses modular sidebar and workspace components.
 * Includes Timeline bar at the bottom OR vertical on right.
 */

import React from 'react';
import { X, PackageCheck } from 'lucide-react';
import { ReaderSidebar } from './ReaderSidebar';
import { ReaderWorkspace } from './ReaderWorkspace';
import { TimelineBar } from './timeline';
import { useReaderStore } from '../store/useReaderStore';
import { useTimelineStore } from '@features/timeline';
import { usePublicationStore, ClosedPackage } from '@features/publication';

export const ReaderWindow: React.FC = () => {
    const { showReader, setShowReader, projectName, projectId, pages, reset: resetReader } = useReaderStore();
    const { project: timelineProject } = useTimelineStore();
    const { addClosedPackage, setShowPublication } = usePublicationStore();

    if (!showReader) return null;

    const handleCloseFile = () => {
        if (!projectId || pages.length === 0) {
            alert('Nenhum arquivo para fechar. Adicione páginas primeiro.');
            return;
        }

        // Create closed package with all data
        const closedPackage: ClosedPackage = {
            id: `pkg-${Date.now()}`,
            projectId: projectId,
            projectName: projectName || 'Projeto sem nome',
            coverUrl: pages[0]?.imageUrl || '',
            closedAt: Date.now(),
            pages: pages,
            timelineData: timelineProject,
        };

        // Add to publication store
        addClosedPackage(closedPackage);

        // Reset the reader
        resetReader();

        // Open publication window
        setShowPublication(true);
    };

    return (
        <div className="fixed inset-0 z-[300] bg-[#09090b] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 h-12 bg-[#0c0c0e] border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <span className="text-lg">📱</span>
                    <h1 className="text-sm font-semibold text-white">Leitor Nativo</h1>
                    {projectName && (
                        <>
                            <span className="text-white/30">•</span>
                            <span className="text-sm text-white/60">{projectName}</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Close File Button */}
                    <button
                        onClick={handleCloseFile}
                        className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <PackageCheck size={16} />
                        Fechar Arquivo
                    </button>

                    {/* Close Window */}
                    <button
                        onClick={() => setShowReader(false)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-red-500/20 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                <ReaderSidebar />
                <ReaderWorkspace />
            </div>

            {/* Timeline Bar at bottom */}
            <TimelineBar />
        </div>
    );
};
