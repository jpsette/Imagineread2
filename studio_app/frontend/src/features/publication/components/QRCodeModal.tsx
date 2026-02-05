/**
 * QRCodeModal Component
 * 
 * Modal displaying the generated QR code and formatted code.
 */

import React, { useEffect, useState } from 'react';
import { X, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import { generateQRCodeDataUrl, formatCode, getWebUrl } from '../services/liteService';

interface QRCodeModalProps {
    code: string;
    projectName: string;
    expiresAt?: string;
    onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
    code,
    projectName,
    expiresAt,
    onClose
}) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        generateQRCodeDataUrl(code).then(setQrCodeUrl);
    }, [code]);

    const handleCopyCode = async () => {
        await navigator.clipboard.writeText(formatCode(code));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenWeb = () => {
        window.open(getWebUrl(code), '_blank');
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Smartphone className="text-purple-400" size={20} />
                        <h2 className="text-lg font-semibold text-white">QR Code Gerado</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center gap-6">
                    {/* Project Name */}
                    <p className="text-sm text-zinc-400">{projectName}</p>

                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-xl">
                        {qrCodeUrl ? (
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                className="w-48 h-48"
                            />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Code Display */}
                    <div className="flex items-center gap-3 bg-zinc-900 px-6 py-3 rounded-xl">
                        <span className="text-2xl font-mono font-bold text-white tracking-widest">
                            {formatCode(code)}
                        </span>
                        <button
                            onClick={handleCopyCode}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Copiar código"
                        >
                            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                        </button>
                    </div>

                    {/* Instructions */}
                    <p className="text-xs text-zinc-500 text-center max-w-xs">
                        Escaneie este QR Code no app <strong>ImagineRead</strong> para abrir o arquivo no seu dispositivo móvel.
                    </p>

                    {/* Expiration */}
                    {expiresAt && (
                        <p className="text-xs text-yellow-500/80">
                            ⏱️ Expira em: {new Date(expiresAt).toLocaleDateString('pt-BR')}
                        </p>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={handleOpenWeb}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        <ExternalLink size={14} />
                        Abrir na Web
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
