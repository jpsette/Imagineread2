/**
 * ViewControls Component
 * 
 * Toggle controls for display settings.
 */

import React from 'react';
import { Square, Type, Zap, ZoomIn } from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';

export const ViewControls: React.FC = () => {
    const {
        showBalloons,
        setShowBalloons,
        showText,
        setShowText,
        enableAnimations,
        setEnableAnimations,
        enableZoom,
        setEnableZoom,
    } = useReaderStore();

    const toggles = [
        {
            label: 'Balões',
            icon: Square,
            active: showBalloons,
            toggle: () => setShowBalloons(!showBalloons),
            color: 'blue'
        },
        {
            label: 'Texto',
            icon: Type,
            active: showText,
            toggle: () => setShowText(!showText),
            color: 'green'
        },
        {
            label: 'Animações',
            icon: Zap,
            active: enableAnimations,
            toggle: () => setEnableAnimations(!enableAnimations),
            color: 'yellow'
        },
        {
            label: 'Zoom',
            icon: ZoomIn,
            active: enableZoom,
            toggle: () => setEnableZoom(!enableZoom),
            color: 'purple'
        },
    ];

    const colorMap: Record<string, string> = {
        blue: 'bg-blue-500/20 text-blue-400',
        green: 'bg-green-500/20 text-green-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
        purple: 'bg-purple-500/20 text-purple-400',
    };

    const dotColorMap: Record<string, string> = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="bg-white/5 border border-white/5 rounded-xl p-2 space-y-1">
            {toggles.map(({ label, icon: Icon, active, toggle, color }) => (
                <button
                    key={label}
                    onClick={toggle}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-all ${active
                            ? colorMap[color]
                            : 'text-zinc-500 hover:bg-white/5'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <Icon size={14} />
                        {label}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${active ? dotColorMap[color] : 'bg-zinc-600'
                        }`} />
                </button>
            ))}
        </div>
    );
};
