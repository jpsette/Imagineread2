/**
 * ReaderPreview Component
 * 
 * Device preview (Mobile/Tablet) for the Native Reader.
 * Shows the current page/panel inside a device mockup.
 * Image can be dragged and resized freely.
 * 
 * IMPORTANT: Only shows content when:
 * 1. The item is in the timeline
 * 2. The playhead is over that item
 * 
 * Decomposed into:
 * - DeviceSelector: device type and zoom controls
 * - ImageManipulator: image drag/resize handling
 * - MobilePreviewModal: fullscreen preview (shared)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePanelNavigation, useImageTransform } from '../../hooks';
import { DeviceSelector, DEVICES, DeviceType } from './DeviceSelector';
import { ImageManipulator } from './ImageManipulator';
import { MobilePreviewModal } from '../shared';
import { useTimelineStore } from '@features/timeline';
import { PathEditorWindow } from '../timeline/PathEditorWindow';
import { PathOverlay } from '../timeline/PathOverlay';
import { usePathEditorStore } from '../timeline/stores/usePathEditorStore';
import { useEffectsStore } from '../timeline/stores/useEffectsStore';

export const ReaderPreview: React.FC = () => {
    const [selectedDevice, setSelectedDevice] = useState<DeviceType>('mobile');
    const [zoom, setZoom] = useState(1);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [imageSelected, setImageSelected] = useState(false);

    const { currentPanelIndex, totalPanels } = usePanelNavigation();
    const { getItemAtPlayhead } = useTimelineStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Path editor state
    const { isEditorOpen, closeEditor, activeClipId, isAddingPoint, setAddingPoint } = usePathEditorStore();
    const { addFocusPoint } = useEffectsStore();

    const device = DEVICES[selectedDevice];

    // Get the item currently under the playhead
    const currentTimelineItem = getItemAtPlayhead();
    // Only show image if there's an item under the playhead
    const currentImage = currentTimelineItem?.imageUrl || null;

    // Image transform hook
    const transform = useImageTransform({
        initialBounds: { x: 0, y: 0, width: 150, height: 200 },
        zoom,
        minSize: 30,
        maxHistory: 50
    });

    // Load natural image size on image change
    useEffect(() => {
        if (currentImage) {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(device.width / img.width, device.height / img.height) * 0.8;
                const w = img.width * scale;
                const h = img.height * scale;
                transform.resetToInitial({
                    x: (device.width - w) / 2,
                    y: (device.height - h) / 2,
                    width: w,
                    height: h
                });
            };
            img.src = currentImage;
        }
    }, [currentImage, device.width, device.height]);

    // Wheel zoom handler
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.min(3.0, Math.max(0.3, prev + delta)));
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    // CTRL+Z undo handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                transform.undo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [transform.undo]);

    // Deselect on workspace click
    const handleWorkspaceClick = () => setImageSelected(false);

    // Handle adding path points
    const handlePathPointAdded = useCallback((x: number, y: number) => {
        if (activeClipId) {
            addFocusPoint(activeClipId, x, y, 1.5);
        }
    }, [activeClipId, addFocusPoint]);

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0c]">
            {/* Device Selector & Zoom */}
            <DeviceSelector
                selectedDevice={selectedDevice}
                onDeviceChange={setSelectedDevice}
                zoom={zoom}
                onZoomChange={setZoom}
                onPreviewClick={() => setShowMobilePreview(true)}
            />

            {/* Preview Area */}
            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden flex items-center justify-center bg-app-bg"
                onClick={handleWorkspaceClick}
            >
                {/* Zoomable container */}
                <div className="relative" style={{ transform: `scale(${zoom})` }}>
                    {/* Ghost image layer - 50% opacity, shows outside device bounds */}
                    {currentImage && (
                        <div
                            className="absolute pointer-events-none opacity-50"
                            style={{
                                left: transform.bounds.x,
                                top: transform.bounds.y,
                                width: transform.bounds.width,
                                height: transform.bounds.height
                            }}
                        >
                            <img
                                src={currentImage}
                                alt=""
                                draggable={false}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'fill',
                                    display: 'block'
                                }}
                            />
                        </div>
                    )}

                    {/* Container with clipping for image inside device - 100% opacity */}
                    <div
                        className="relative overflow-hidden"
                        style={{
                            width: device.width,
                            height: device.height,
                            borderRadius: device.borderRadius
                        }}
                    >
                        {/* Image with manipulation controls (clipped to device area) */}
                        <div className="absolute inset-0 z-[1]">
                            <ImageManipulator
                                imageUrl={currentImage}
                                bounds={transform.bounds}
                                isSelected={imageSelected}
                                onSelect={() => setImageSelected(true)}
                                onStartDrag={transform.startDrag}
                                onStartResize={transform.startResize}
                            />
                        </div>
                    </div>

                    {/* Device Frame Border (z-index 10 - always on top) */}
                    <div
                        className="absolute inset-0 border-4 border-zinc-500/50 pointer-events-none z-[10]"
                        style={{
                            width: device.width,
                            height: device.height,
                            borderRadius: device.borderRadius
                        }}
                    >
                        <div
                            className="absolute inset-2 border border-zinc-600/30"
                            style={{ borderRadius: `calc(${device.borderRadius} - 0.5rem)` }}
                        />
                    </div>

                    {/* Empty state */}
                    {!currentImage && (
                        <div
                            className="absolute flex items-center justify-center pointer-events-none"
                            style={{ width: device.width, height: device.height, left: 0, top: 0 }}
                        >
                            <div className="text-center text-white/30">
                                <p className="text-sm font-medium mb-1">Sem imagens</p>
                                <p className="text-xs">Envie páginas do Workstation</p>
                            </div>
                        </div>
                    )}

                    {/* Device label */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/30 whitespace-nowrap pointer-events-none">
                        {device.name} • {device.realWidth}×{device.realHeight}
                    </div>
                </div>
            </div>

            {/* Mobile Preview Modal (shared) */}
            <MobilePreviewModal
                isOpen={showMobilePreview}
                onClose={() => setShowMobilePreview(false)}
                currentImage={currentImage}
                currentIndex={currentPanelIndex}
                totalPanels={totalPanels}
            />

            {/* Path Editor Window */}
            {isEditorOpen && activeClipId && (
                <PathEditorWindow
                    clipId={activeClipId}
                    onClose={closeEditor}
                    onAddModeChange={setAddingPoint}
                    isAddingPoint={isAddingPoint}
                />
            )}

            {/* Path Overlay on Image */}
            {activeClipId && currentImage && (
                <div
                    ref={imageContainerRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) scale(${zoom})`,
                        width: device.width,
                        height: device.height
                    }}
                >
                    <PathOverlay
                        clipId={activeClipId}
                        isAddingPoint={isAddingPoint}
                        onPointAdded={handlePathPointAdded}
                        containerRef={imageContainerRef}
                    />
                </div>
            )}
        </div>
    );
};
