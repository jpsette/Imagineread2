/**
 * PublicationFileCard Component
 * 
 * Card displaying a closed package with cover, status, and actions.
 */

import React, { useState } from 'react';
import { QrCode, Trash2, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { ClosedPackage } from '../types';
import { usePublicationStore } from '../store/usePublicationStore';
import { uploadToLite } from '../services/liteService';
import { QRCodeModal } from './QRCodeModal';

interface PublicationFileCardProps {
    package_: ClosedPackage;
}

export const PublicationFileCard: React.FC<PublicationFileCardProps> = ({ package_ }) => {
    const { updatePackageWithLiteCode, removeClosedPackage, isUploading, uploadingPackageId, setIsUploading } = usePublicationStore();
    const [showQRModal, setShowQRModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isPublished = !!package_.liteCode;
    const isCurrentlyUploading = isUploading && uploadingPackageId === package_.id;

    const handlePublish = async () => {
        setError(null);
        setIsUploading(true, package_.id);

        try {
            // Create a JSON blob of the package data for upload
            const packageData = JSON.stringify({
                projectName: package_.projectName,
                pages: package_.pages,
                timeline: package_.timelineData,
            });

            const blob = new Blob([packageData], { type: 'application/json' });
            const file = new File([blob], `${package_.projectName}.json`, { type: 'application/json' });

            const response = await uploadToLite(file);

            if (response.success) {
                updatePackageWithLiteCode(package_.id, response.code, response.expiresAt);
                setShowQRModal(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao publicar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja remover este arquivo da lista de publicação?')) {
            removeClosedPackage(package_.id);
        }
    };

    return (
        <>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors group">
                {/* Cover Image */}
                <div className="aspect-[3/4] relative overflow-hidden bg-zinc-800">
                    <img
                        src={package_.coverUrl}
                        alt={package_.projectName}
                        className="w-full h-full object-cover"
                    />

                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 ${isPublished
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-800/80 text-zinc-400'
                        }`}>
                        {isPublished ? (
                            <>
                                <CheckCircle size={10} />
                                Publicado
                            </>
                        ) : (
                            <>
                                <Clock size={10} />
                                Pendente
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="p-3">
                    <h3 className="text-sm font-medium text-white truncate">{package_.projectName}</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                        Fechado em {new Date(package_.closedAt).toLocaleDateString('pt-BR')}
                    </p>

                    {error && (
                        <p className="text-[10px] text-red-400 mt-1">{error}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="px-3 pb-3 flex gap-2">
                    {isPublished ? (
                        <button
                            onClick={() => setShowQRModal(true)}
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <QrCode size={14} />
                            Ver QR Code
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={isCurrentlyUploading}
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {isCurrentlyUploading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Publicando...
                                </>
                            ) : (
                                <>
                                    <QrCode size={14} />
                                    Publicar
                                </>
                            )}
                        </button>
                    )}

                    <button
                        onClick={handleDelete}
                        className="px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remover"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQRModal && package_.liteCode && (
                <QRCodeModal
                    code={package_.liteCode}
                    projectName={package_.projectName}
                    expiresAt={package_.expiresAt}
                    onClose={() => setShowQRModal(false)}
                />
            )}
        </>
    );
};
