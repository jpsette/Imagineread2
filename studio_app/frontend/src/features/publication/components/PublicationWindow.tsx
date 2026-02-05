/**
 * PublicationWindow Component
 * 
 * Fullscreen overlay for managing closed packages and QR code generation.
 * Similar structure to ReaderWindow for UI consistency.
 */

import React from 'react';
import { X, Upload, Package } from 'lucide-react';
import { usePublicationStore } from '../store/usePublicationStore';
import { PublicationFileCard } from './PublicationFileCard';

export const PublicationWindow: React.FC = () => {
    const { showPublication, setShowPublication, closedPackages } = usePublicationStore();

    if (!showPublication) return null;

    const hasPackages = closedPackages.length > 0;

    return (
        <div className="fixed inset-0 z-[300] bg-[#09090b] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 h-12 bg-[#0c0c0e] border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <span className="text-lg">📤</span>
                    <h1 className="text-sm font-semibold text-white">Publicação</h1>
                    {hasPackages && (
                        <>
                            <span className="text-white/30">•</span>
                            <span className="text-sm text-white/60">{closedPackages.length} arquivo(s)</span>
                        </>
                    )}
                </div>
                <button
                    onClick={() => setShowPublication(false)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-red-500/20 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {hasPackages ? (
                    <div className="max-w-6xl mx-auto">
                        {/* Info Banner */}
                        <div className="mb-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-start gap-3">
                            <Upload className="text-purple-400 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-sm text-purple-200">
                                    Publique seus arquivos para gerar QR Codes.
                                    Escaneie no app <strong>ImagineRead</strong> para visualizar no mobile.
                                </p>
                                <p className="text-xs text-purple-400/60 mt-1">
                                    Arquivos gratuitos expiram em 24 horas.
                                </p>
                            </div>
                        </div>

                        {/* Grid of Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {closedPackages.map((pkg) => (
                                <PublicationFileCard key={pkg.id} package_={pkg} />
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                            <Package className="text-zinc-600" size={32} />
                        </div>
                        <h2 className="text-lg font-medium text-white mb-2">Nenhum arquivo fechado</h2>
                        <p className="text-sm text-zinc-500 max-w-md">
                            Finalize seus projetos no Menu <strong>Preparação</strong> e clique em
                            <span className="text-green-400 font-medium"> "Fechar Arquivo"</span> para
                            enviá-los para publicação.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
