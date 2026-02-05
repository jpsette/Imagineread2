/**
 * useImageTransform Hook
 * 
 * Encapsulates all drag and resize logic for an image element.
 * Extracted from ReaderPreview for cleaner, more maintainable code.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

export interface ImageBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

interface UseImageTransformOptions {
    initialBounds: ImageBounds;
    zoom?: number;
    minSize?: number;
    maxHistory?: number;
}

interface UseImageTransformReturn {
    bounds: ImageBounds;
    setBounds: (bounds: ImageBounds) => void;
    isDragging: boolean;
    resizeHandle: ResizeHandle;
    startDrag: (e: React.MouseEvent) => void;
    startResize: (handle: Exclude<ResizeHandle, null>) => (e: React.MouseEvent) => void;
    undo: () => void;
    canUndo: boolean;
    resetToInitial: (newBounds: ImageBounds) => void;
}

export function useImageTransform(options: UseImageTransformOptions): UseImageTransformReturn {
    const { initialBounds, zoom = 1, minSize = 30, maxHistory = 50 } = options;

    // State
    const [bounds, setBoundsState] = useState<ImageBounds>(initialBounds);
    const [isDragging, setIsDragging] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
    const [history, setHistory] = useState<ImageBounds[]>([]);

    // Refs for stable access in event handlers
    const boundsRef = useRef(bounds);
    const zoomRef = useRef(zoom);
    const isDraggingRef = useRef(false);
    const resizeHandleRef = useRef<ResizeHandle>(null);
    const dragStart = useRef({ x: 0, y: 0, bounds: initialBounds });

    // Keep refs in sync
    useEffect(() => { boundsRef.current = bounds; }, [bounds]);
    useEffect(() => { zoomRef.current = zoom; }, [zoom]);

    // Set bounds wrapper that also updates ref
    const setBounds = useCallback((newBounds: ImageBounds) => {
        boundsRef.current = newBounds;
        setBoundsState(newBounds);
    }, []);

    // Reset to new initial bounds (e.g., when image changes)
    const resetToInitial = useCallback((newBounds: ImageBounds) => {
        setBounds(newBounds);
        setHistory([]);
    }, [setBounds]);

    // Push current bounds to history
    const pushHistory = useCallback(() => {
        setHistory(prev => {
            const newHistory = [...prev, boundsRef.current];
            return newHistory.length > maxHistory ? newHistory.slice(-maxHistory) : newHistory;
        });
    }, [maxHistory]);

    // Undo
    const undo = useCallback(() => {
        if (history.length > 0) {
            const lastBounds = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setBounds(lastBounds);
        }
    }, [history, setBounds]);

    // Start drag
    const startDrag = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        pushHistory();
        isDraggingRef.current = true;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, bounds: boundsRef.current };
    }, [pushHistory]);

    // Start resize
    const startResize = useCallback((handle: Exclude<ResizeHandle, null>) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        pushHistory();
        resizeHandleRef.current = handle;
        setResizeHandle(handle);
        dragStart.current = { x: e.clientX, y: e.clientY, bounds: boundsRef.current };
    }, [pushHistory]);

    // Global mouse handlers
    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            if (!isDraggingRef.current && !resizeHandleRef.current) return;

            const currentZoom = zoomRef.current;
            const start = dragStart.current;
            const dx = (e.clientX - start.x) / currentZoom;
            const dy = (e.clientY - start.y) / currentZoom;

            let newBounds: ImageBounds;

            if (isDraggingRef.current) {
                // Dragging - move position
                newBounds = {
                    x: start.bounds.x + dx,
                    y: start.bounds.y + dy,
                    width: start.bounds.width,
                    height: start.bounds.height
                };
            } else {
                // Resizing
                const handle = resizeHandleRef.current!;
                newBounds = { ...start.bounds };
                const isCorner = handle.length === 2; // nw, ne, sw, se

                if (isCorner) {
                    // Corner handles: maintain aspect ratio using diagonal scale
                    // Calculate diagonal delta based on handle direction
                    let diagonalDelta: number;

                    // For each corner, determine the "positive" direction
                    if (handle === 'se') {
                        // SE: positive dx and positive dy both mean "grow"
                        diagonalDelta = (dx + dy) / 2;
                    } else if (handle === 'nw') {
                        // NW: negative dx and negative dy both mean "grow"
                        diagonalDelta = (-dx - dy) / 2;
                    } else if (handle === 'ne') {
                        // NE: positive dx and negative dy both mean "grow"
                        diagonalDelta = (dx - dy) / 2;
                    } else {
                        // SW: negative dx and positive dy both mean "grow"
                        diagonalDelta = (-dx + dy) / 2;
                    }

                    // Calculate scale factor based on diagonal movement
                    const scaleFactor = 1 + (diagonalDelta / Math.max(start.bounds.width, start.bounds.height));

                    // Apply scale to both dimensions
                    const newWidth = Math.max(minSize, start.bounds.width * scaleFactor);
                    const newHeight = Math.max(minSize, start.bounds.height * scaleFactor);

                    newBounds.width = newWidth;
                    newBounds.height = newHeight;

                    // Adjust position for corners that anchor from opposite side
                    if (handle.includes('w')) {
                        newBounds.x = start.bounds.x + (start.bounds.width - newWidth);
                    }
                    if (handle.includes('n')) {
                        newBounds.y = start.bounds.y + (start.bounds.height - newHeight);
                    }
                } else {
                    // Edge handles: free resize (single dimension)
                    if (handle === 'e') {
                        newBounds.width = Math.max(minSize, start.bounds.width + dx);
                    }
                    if (handle === 'w') {
                        const newWidth = Math.max(minSize, start.bounds.width - dx);
                        newBounds.x = start.bounds.x + (start.bounds.width - newWidth);
                        newBounds.width = newWidth;
                    }
                    if (handle === 's') {
                        newBounds.height = Math.max(minSize, start.bounds.height + dy);
                    }
                    if (handle === 'n') {
                        const newHeight = Math.max(minSize, start.bounds.height - dy);
                        newBounds.y = start.bounds.y + (start.bounds.height - newHeight);
                        newBounds.height = newHeight;
                    }
                }
            }

            setBoundsState(newBounds);
            boundsRef.current = newBounds;
        }

        function onMouseUp() {
            if (!isDraggingRef.current && !resizeHandleRef.current) return;

            isDraggingRef.current = false;
            resizeHandleRef.current = null;
            setIsDragging(false);
            setResizeHandle(null);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [minSize]);

    // Cursor style effect
    useEffect(() => {
        if (isDragging || resizeHandle) {
            document.body.style.userSelect = 'none';

            if (isDragging) {
                document.body.style.cursor = 'move';
            } else if (resizeHandle) {
                const cursorMap: Record<string, string> = {
                    'n': 'n-resize', 's': 's-resize', 'e': 'e-resize', 'w': 'w-resize',
                    'ne': 'ne-resize', 'nw': 'nw-resize', 'se': 'se-resize', 'sw': 'sw-resize'
                };
                document.body.style.cursor = cursorMap[resizeHandle] || '';
            }
        }
    }, [isDragging, resizeHandle]);

    return {
        bounds,
        setBounds,
        isDragging,
        resizeHandle,
        startDrag,
        startResize,
        undo,
        canUndo: history.length > 0,
        resetToInitial
    };
}
