/**
 * StatusBar Component
 * 
 * Displays system status at the bottom of the editor.
 * Uses a simplified state model.
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';

export const StatusBar: React.FC = () => {
    return (
        <div className="h-6 bg-[#09090b] border-t border-white/5 flex items-center justify-between px-3 text-[10px] select-none z-50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={12} />
                    <span>System Ready</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <span className="text-gray-500">Imagine Read Engine v1.0</span>
            </div>

            <div className="flex items-center gap-4 text-gray-500">
                <span>ImagineRead Studio</span>
            </div>
        </div>
    );
};
