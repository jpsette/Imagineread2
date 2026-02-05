/**
 * ImagineRead Lite Integration Service
 * 
 * Handles file uploads to ImagineRead Lite API and QR code generation.
 */

import { LiteUploadResponse } from '../types';

// Use production API by default, can be overridden for development
const LITE_API_BASE = 'https://lite.imagineread.com';

/**
 * Upload a file to ImagineRead Lite and get an access code
 */
export async function uploadToLite(file: File): Promise<LiteUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${LITE_API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail || 'Failed to upload file');
    }

    return response.json();
}

/**
 * Generate a QR code data URL for a given Lite code
 * Uses qrcode library or fallback to external API
 */
export async function generateQRCodeDataUrl(code: string): Promise<string> {
    // Use QR Code API as fallback (works without dependencies)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`imagineread://lite/${code}`)}`;

    // Fetch and convert to data URL for offline use
    try {
        const response = await fetch(qrApiUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch {
        // Return API URL directly if conversion fails
        return qrApiUrl;
    }
}

/**
 * Format code for display (e.g., "ABCD1234" -> "ABCD-1234")
 */
export function formatCode(code: string): string {
    if (code.length === 8) {
        return `${code.slice(0, 4)}-${code.slice(4)}`;
    }
    return code;
}

/**
 * Get the deep link URL for a Lite code
 */
export function getDeepLinkUrl(code: string): string {
    return `imagineread://lite/${code}`;
}

/**
 * Get the web URL for a Lite code
 */
export function getWebUrl(code: string): string {
    return `${LITE_API_BASE}/${code}`;
}
