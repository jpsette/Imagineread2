/**
 * TimelineItem Component
 * 
 * Individual item in the timeline track.
 * Displays thumbnail, duration, and transition indicator.
 */

import React from 'react';
import { GripVertical, Clock, Sparkles } from 'lucide-react';
import { TimelineItem as TimelineItemType } from '../../types';

interface TimelineItemProps {
    item: TimelineItemType;
    isSelected: boolean;
    isDragging?: boolean;
    onSelect: () => void;
    onDurationChange?: (duration: number) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
    item,
    isSelected,
    isDragging,
    onSelect
}) => {
    const durationSeconds = (item.duration / 1000).toFixed(1);

    return (
        <div
            onClick={onSelect}
            className={`
                relative flex-shrink-0 cursor-pointer transition-all duration-150
                ${isSelected
                    ? 'ring-2 ring-accent-blue scale-105 z-10'
                    : 'hover:ring-1 hover:ring-white/30'
                }
                ${isDragging ? 'opacity-50' : ''}
            `}
            style={{ width: 80 }}
        >
            {/* Drag Handle */}
            <div className="absolute top-0 left-0 w-4 h-full flex items-center justify-center bg-black/30 cursor-grab active:cursor-grabbing z-10">
                <GripVertical size={12} className="text-white/50" />
            </div>

            {/* Thumbnail */}
            <div className="relative w-full aspect-[3/4] bg-zinc-800 rounded-md overflow-hidden">
                <img
                    src={item.imageUrl}
                    alt={`Item ${item.order + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                />

                {/* Order Badge */}
                <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white">
                    {item.order + 1}
                </div>

                {/* Transition Indicator */}
                {item.transition !== 'none' && (
                    <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-purple-500/80 text-[8px] text-white flex items-center gap-0.5">
                        <Sparkles size={8} />
                        {item.transition}
                    </div>
                )}
            </div>

            {/* Duration Bar */}
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-text-secondary">
                <Clock size={10} />
                <span>{durationSeconds}s</span>
            </div>

            {/* Type Badge */}
            <div className={`
                absolute -top-1 -left-1 px-1 py-0.5 rounded text-[8px] font-bold
                ${item.type === 'page' ? 'bg-blue-500' : 'bg-green-500'} text-white
            `}>
                {item.type === 'page' ? 'PG' : 'Q'}
            </div>
        </div>
    );
};
