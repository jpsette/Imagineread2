import React, { useState, useCallback, useEffect } from 'react';
import { X, Trash2, Edit3, Download, Send } from 'lucide-react';
import { Button } from '@shared/ui/Button';

import { ExportModal } from './ExportModal';
import { FileEntry } from '@shared/types';
import { GridCanvas } from './components/workstation/GridCanvas';
import { prepareForReader, createPageData, useReaderStore } from '@features/reader';

// Note: Ensure PageCard is not duplicated if exported from Grid
// If PageCard is used in DragOverlay inside Grid, we don't need it here unless we have a specific overlay here. 
// The Grid handles its own DragOverlay.

interface ComicWorkstationProps {
    comic: { id: string; name: string };
    pages: FileEntry[];
    onClose: () => void;
    onSelectPage: (pageId: string, pageUrl: string) => void;
    onAddPages: (files: File[]) => void;
    onDeletePages: (pageIds: string[]) => void;
    onReorderPages: (pageIds: string[]) => void;
}

export const ComicWorkstation: React.FC<ComicWorkstationProps> = ({
    comic,
    pages,
    onClose,
    onSelectPage,
    onAddPages,
    onDeletePages,
    onReorderPages
}) => {
    const [orderedPages, setOrderedPages] = useState<FileEntry[]>([]);  // Optimistic UI
    const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Check if this comic is in preparation mode
    const { projectId: readerProjectId, pages: readerPages } = useReaderStore();
    const isInPreparation = readerProjectId === comic.id && readerPages.length > 0;

    // Sync store -> local state
    // We update orderedPages when the list of IDs changes (files added/removed)
    // or when the component mounts.
    const pagesHash = pages.map(p => p.id).join(',');

    useEffect(() => {
        setOrderedPages(pages);
    }, [pagesHash, pages]);

    // Actions Wrapper
    const handleClose = onClose;

    const handleSelectPage = useCallback((pageId: string) => {
        const page = pages.find(p => p.id === pageId);
        if (page) onSelectPage(pageId, page.url);
    }, [pages, onSelectPage]);

    // Multi-selection handler
    const handlePageClick = useCallback((pageId: string, e: React.MouseEvent) => {
        const newSet = new Set(selectedPageIds);
        if (e.shiftKey && lastSelectedId) {
            const lastIndex = orderedPages.findIndex(p => p.id === lastSelectedId);
            const currIndex = orderedPages.findIndex(p => p.id === pageId);
            if (lastIndex !== -1 && currIndex !== -1) {
                const start = Math.min(lastIndex, currIndex);
                const end = Math.max(lastIndex, currIndex);
                for (let i = start; i <= end; i++) {
                    newSet.add(orderedPages[i].id);
                }
            }
        } else if (e.metaKey || e.ctrlKey) {
            if (newSet.has(pageId)) {
                newSet.delete(pageId);
                setLastSelectedId(null);
            } else {
                newSet.add(pageId);
                setLastSelectedId(pageId);
            }
        } else {
            newSet.clear();
            newSet.add(pageId);
            setLastSelectedId(pageId);
        }
        setSelectedPageIds(newSet);
    }, [selectedPageIds, lastSelectedId, orderedPages]);

    // Bulk delete handler
    const handleBulkDelete = useCallback(() => {
        if (selectedPageIds.size === 0) return;
        if (confirm(`Excluir ${selectedPageIds.size} página(s)?`)) {
            onDeletePages(Array.from(selectedPageIds));
            setSelectedPageIds(new Set());
            setLastSelectedId(null);
        }
    }, [selectedPageIds, onDeletePages]);

    // Edit single page (Trigger overlay)
    const handleEditPage = useCallback(() => {
        if (selectedPageIds.size !== 1) return;
        const pageId = Array.from(selectedPageIds)[0];
        handleSelectPage(pageId);
    }, [selectedPageIds]);

    // Add pages handler (Passed down to Grid)
    // Note: The Grid handles the input ref clearing now.

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && selectedPageIds.size > 0) {
                handleBulkDelete();
            }
            if (e.key === 'Enter' && selectedPageIds.size === 1) {
                handleEditPage();
            }
            if (e.key === 'Escape') {
                setSelectedPageIds(new Set());
                setLastSelectedId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPageIds, handleBulkDelete, handleEditPage]);


    if (!comic) {
        return <div className="text-white p-10">Loading Comic...</div>;
    }

    return (
        <>
            {/* MASTER CONTAINER */}
            <div className="fixed inset-0 bg-app-bg z-50 overflow-hidden flex flex-col">

                {/* Background Atmosphere */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a20] via-[#09090b] to-[#050505] opacity-80" />
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                {/* MAIN CONTENT LAYER - Z-10 */}
                {/* HEADER (Toolbar) */}
                <div className="shrink-0 z-50 px-6 pt-4 pb-2 flex items-start justify-between pointer-events-none">
                    <div className="pointer-events-auto">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-md">{comic.name}</h1>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-zinc-400 font-mono">
                                {orderedPages.length} PAGES
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                        {/* Status badge when in preparation - click to return to editing */}
                        {isInPreparation && (
                            <button
                                onClick={() => {
                                    if (confirm('Deseja sair da preparação e voltar para edição? Os dados de preparação serão perdidos.')) {
                                        useReaderStore.getState().reset();
                                    }
                                }}
                                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-amber-500/20 hover:border-amber-500/30 hover:text-amber-400 transition-all cursor-pointer min-w-[180px] justify-center"
                            >
                                <div className="w-2 h-2 rounded-full bg-green-500 group-hover:bg-amber-500 animate-pulse transition-colors" />
                                <span className="group-hover:hidden">Quadrinho em preparação</span>
                                <span className="hidden group-hover:inline">← Voltar para edição</span>
                            </button>
                        )}

                        <Button
                            onClick={handleEditPage}
                            disabled={selectedPageIds.size !== 1 || isInPreparation}
                            variant={selectedPageIds.size === 1 && !isInPreparation ? 'primary' : 'ghost'}
                            size="sm"
                            icon={Edit3}
                            className={`${selectedPageIds.size !== 1 || isInPreparation ? '!opacity-50 !cursor-not-allowed !text-zinc-600 pointer-events-none' : ''}`}
                        >
                            <span className="hidden sm:inline">Editar</span>
                        </Button>

                        <Button
                            onClick={handleBulkDelete}
                            disabled={selectedPageIds.size === 0 || isInPreparation}
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            className={`${selectedPageIds.size === 0 || isInPreparation ? '!opacity-50 !cursor-not-allowed !text-zinc-600 !bg-black/20 !border-white/5 pointer-events-none' : ''}`}
                        >
                            <span className="hidden sm:inline">Excluir {selectedPageIds.size > 0 ? `(${selectedPageIds.size})` : ''}</span>
                        </Button>

                        <div className="w-px h-6 bg-white/10 mx-1" />

                        <Button
                            onClick={() => setIsExportModalOpen(true)}
                            variant="ghost"
                            size="sm"
                            icon={Download}
                        >
                            <span className="hidden sm:inline">Exportar</span>
                        </Button>

                        {!isInPreparation ? (
                            <Button
                                onClick={() => {
                                    // Collect all pages and send to Reader
                                    const pagesData = orderedPages.map((page, index) => createPageData({
                                        id: page.id,
                                        order: index,
                                        fileName: page.name || `page-${index + 1}`,
                                        imageUrl: page.url,
                                        panels: [],
                                        balloons: [],
                                        previewImages: [page.url],
                                    }));
                                    prepareForReader({
                                        projectId: comic.id,
                                        projectName: comic.name,
                                        pages: pagesData,
                                    });
                                }}
                                variant="ghost"
                                size="sm"
                                icon={Send}
                                className="text-green-400 hover:bg-green-500/10"
                            >
                                <span className="hidden sm:inline">Enviar para preparação</span>
                            </Button>
                        ) : (
                            <Button
                                onClick={() => useReaderStore.getState().setShowReader(true)}
                                variant="ghost"
                                size="sm"
                                icon={Send}
                                className="text-green-400 bg-green-500/10"
                            >
                                <span className="hidden sm:inline">Abrir Preparação</span>
                            </Button>
                        )}

                        <Button
                            onClick={handleClose}
                            variant="ghost"
                            size="sm"
                            icon={X}
                            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-zinc-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all ml-1 p-0"
                        />
                    </div>
                </div>

                {/* VIRTUALIZED GRID AREA */}
                {/* The Grid Component now handles DnD, Sortable, and AutoSizer */}
                <GridCanvas
                    orderedPages={orderedPages}
                    selectedPageIds={selectedPageIds}
                    onReorderPages={onReorderPages}
                    onSelectPageClick={handlePageClick}
                    onEditPage={(pageId) => {
                        if (isInPreparation) return; // Block editing when in preparation
                        handleSelectPage(pageId);
                    }}
                    onAddPages={onAddPages}
                    setOrderedPages={setOrderedPages}
                />
            </div>

            {comic && (
                <ExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    projectId={comic.id}
                    projectName={comic.name}
                    pages={orderedPages}
                />
            )}
        </>
    );
};

export default ComicWorkstation;
