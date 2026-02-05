/**
 * Publication Store
 * 
 * Zustand store for managing closed packages and publication state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClosedPackage } from '../types';

interface PublicationState {
    // Window visibility
    showPublication: boolean;

    // Closed packages ready for publication
    closedPackages: ClosedPackage[];

    // Upload state
    isUploading: boolean;
    uploadingPackageId: string | null;
}

interface PublicationActions {
    setShowPublication: (show: boolean) => void;

    // Package management
    addClosedPackage: (pkg: ClosedPackage) => void;
    removeClosedPackage: (id: string) => void;

    // Update with Lite code after upload
    updatePackageWithLiteCode: (id: string, code: string, expiresAt: string | null) => void;

    // Upload state
    setIsUploading: (uploading: boolean, packageId?: string) => void;

    // Helpers
    getPackageById: (id: string) => ClosedPackage | undefined;
}

type PublicationStore = PublicationState & PublicationActions;

const initialState: PublicationState = {
    showPublication: false,
    closedPackages: [],
    isUploading: false,
    uploadingPackageId: null,
};

export const usePublicationStore = create<PublicationStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setShowPublication: (show) => set({ showPublication: show }),

            addClosedPackage: (pkg) => set((state) => ({
                closedPackages: [...state.closedPackages, pkg]
            })),

            removeClosedPackage: (id) => set((state) => ({
                closedPackages: state.closedPackages.filter(p => p.id !== id)
            })),

            updatePackageWithLiteCode: (id, code, expiresAt) => set((state) => ({
                closedPackages: state.closedPackages.map(pkg =>
                    pkg.id === id
                        ? { ...pkg, liteCode: code, publishedAt: Date.now(), expiresAt: expiresAt || undefined }
                        : pkg
                )
            })),

            setIsUploading: (uploading, packageId) => set({
                isUploading: uploading,
                uploadingPackageId: packageId || null
            }),

            getPackageById: (id) => get().closedPackages.find(p => p.id === id),
        }),
        {
            name: 'publication-store',
            partialize: (state) => ({
                closedPackages: state.closedPackages,
            }),
        }
    )
);
