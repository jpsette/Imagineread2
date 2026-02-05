/**
 * usePathEditorStore
 * 
 * Store for managing path editor state globally.
 * Controls whether the editor window is visible and if we're in point-adding mode.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PathEditorState {
    // Whether the path editor window is visible
    isEditorOpen: boolean;

    // Whether we're in "adding point" mode (cursor changes to crosshair)
    isAddingPoint: boolean;

    // Active clip ID for path editing
    activeClipId: string | null;
}

interface PathEditorActions {
    openEditor: (clipId: string) => void;
    closeEditor: () => void;
    setAddingPoint: (isAdding: boolean) => void;
    toggleAddingPoint: () => void;
}

type PathEditorStore = PathEditorState & PathEditorActions;

const initialState: PathEditorState = {
    isEditorOpen: false,
    isAddingPoint: false,
    activeClipId: null
};

export const usePathEditorStore = create<PathEditorStore>()(
    devtools(
        (set) => ({
            ...initialState,

            openEditor: (clipId) => {
                set({
                    isEditorOpen: true,
                    activeClipId: clipId,
                    isAddingPoint: false
                });
            },

            closeEditor: () => {
                set({
                    isEditorOpen: false,
                    isAddingPoint: false,
                    activeClipId: null
                });
            },

            setAddingPoint: (isAdding) => {
                set({ isAddingPoint: isAdding });
            },

            toggleAddingPoint: () => {
                set((state) => ({ isAddingPoint: !state.isAddingPoint }));
            }
        }),
        { name: 'path-editor-store' }
    )
);
