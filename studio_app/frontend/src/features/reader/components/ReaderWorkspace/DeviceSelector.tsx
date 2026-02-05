/**
 * DeviceSelector Component
 * 
 * Buttons to select device type (mobile/tablet) and zoom controls.
 */

import React from 'react';
import { Smartphone, Tablet, Eye } from 'lucide-react';

// Device configurations
export const DEVICES = {
    mobile: {
        name: 'Mobile',
        width: 340,
        height: 760,
        realWidth: 360,
        realHeight: 800,
        borderRadius: '2.5rem',
        icon: Smartphone
    },
    tablet: {
        name: 'Tablet',
        width: 600,
        height: 960,
        realWidth: 800,
        realHeight: 1280,
        borderRadius: '1.5rem',
        icon: Tablet
    }
} as const;

export type DeviceType = keyof typeof DEVICES;

interface DeviceSelectorProps {
    selectedDevice: DeviceType;
    onDeviceChange: (device: DeviceType) => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    onPreviewClick: () => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
    selectedDevice,
    onDeviceChange,
    zoom,
    onZoomChange,
    onPreviewClick,
}) => {
    return (
        <div className="shrink-0 flex items-center justify-center gap-2 px-3 py-2 border-b border-border-color bg-panel-bg">
            {/* Device buttons */}
            {(Object.keys(DEVICES) as DeviceType[]).map((deviceKey) => {
                const d = DEVICES[deviceKey];
                const Icon = d.icon;
                const isSelected = selectedDevice === deviceKey;
                return (
                    <button
                        key={deviceKey}
                        onClick={() => onDeviceChange(deviceKey)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isSelected
                            ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                            : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <Icon size={14} />
                        {d.name}
                        <span className="text-[10px] opacity-60">{d.realWidth}×{d.realHeight}</span>
                    </button>
                );
            })}

            {/* Separator */}
            <div className="w-px h-5 bg-border-color mx-2" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onZoomChange(Math.max(0.3, zoom - 0.1))}
                    className="w-6 h-6 rounded flex items-center justify-center text-xs text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                >
                    −
                </button>
                <span className="text-xs text-text-secondary w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button
                    onClick={() => onZoomChange(Math.min(3.0, zoom + 0.1))}
                    className="w-6 h-6 rounded flex items-center justify-center text-xs text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                >
                    +
                </button>
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-border-color mx-2" />

            {/* Preview Button */}
            <button
                onClick={onPreviewClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-colors"
            >
                <Eye size={14} />
                Preview
            </button>
        </div>
    );
};
