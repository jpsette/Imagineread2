/**
 * ClipContextMenu Component
 * 
 * Right-click context menu for timeline clips
 */

import React from 'react';
import { Trash2 } from 'lucide-react';

interface ClipContextMenuProps {
    position: { x: number; y: number };
    onRemove: () => void;
    onClose: () => void;
}

export const ClipContextMenu: React.FC<ClipContextMenuProps> = ({
    position,
    onRemove,
    onClose
}) => {
    const handleRemove = () => {
        onRemove();
        onClose();
    };

    return (
        <div
            className="fixed bg-zinc-800 rounded shadow-lg border border-zinc-700 py-1 z-50"
            style={{
                left: position.x,
                top: position.y
            }}
        >
            <button
                onClick={handleRemove}
                className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-zinc-700 flex items-center gap-2"
            >
                <Trash2 size={12} />
                Excluir
            </button>
        </div>
    );
};
