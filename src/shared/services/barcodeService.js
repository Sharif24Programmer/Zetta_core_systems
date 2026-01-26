/**
 * Barcode Scanner Service
 * Supports USB barcode scanners and camera-based scanning
 */

import { Html5Qrcode } from 'html5-qrcode';

let scannerInstance = null;
let usbListenerActive = false;
let usbBuffer = '';
let usbTimeout = null;

/**
 * Start USB barcode scanner listener
 * USB scanners act like keyboard input - rapid keystrokes ending with Enter
 */
export const startUsbScanner = (onScan) => {
    if (usbListenerActive) return;

    const handleKeyDown = (e) => {
        // Ignore if focus is in an input field (let user type)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Clear timeout on each keystroke
        if (usbTimeout) clearTimeout(usbTimeout);

        // Enter key signals end of barcode
        if (e.key === 'Enter') {
            if (usbBuffer.length >= 4) { // Minimum barcode length
                onScan(usbBuffer.trim());
            }
            usbBuffer = '';
            return;
        }

        // Add character to buffer (alphanumeric only)
        if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
            usbBuffer += e.key;
        }

        // Reset buffer after 100ms of inactivity (user typing is slower)
        usbTimeout = setTimeout(() => {
            usbBuffer = '';
        }, 100);
    };

    document.addEventListener('keydown', handleKeyDown);
    usbListenerActive = true;

    console.log('[Barcode] USB scanner listener started');

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        usbListenerActive = false;
        usbBuffer = '';
        if (usbTimeout) clearTimeout(usbTimeout);
        console.log('[Barcode] USB scanner listener stopped');
    };
};

/**
 * Start camera barcode scanner
 */
export const startCameraScanner = async (elementId, onScan, onError = null) => {
    if (scannerInstance) {
        await stopCameraScanner();
    }

    try {
        scannerInstance = new Html5Qrcode(elementId);

        await scannerInstance.start(
            { facingMode: 'environment' }, // Rear camera
            {
                fps: 10,
                qrbox: { width: 250, height: 100 }, // Optimized for barcodes
                aspectRatio: 1.5
            },
            (decodedText) => {
                onScan(decodedText);
            },
            (errorMessage) => {
                // Ignore frequent scan failures (no barcode in view)
                if (onError && !errorMessage.includes('NotFoundException')) {
                    onError(errorMessage);
                }
            }
        );

        console.log('[Barcode] Camera scanner started');
        return true;
    } catch (error) {
        console.error('[Barcode] Failed to start camera:', error);
        if (onError) onError(error.message);
        return false;
    }
};

/**
 * Stop camera scanner
 */
export const stopCameraScanner = async () => {
    if (scannerInstance) {
        try {
            await scannerInstance.stop();
            scannerInstance = null;
            console.log('[Barcode] Camera scanner stopped');
        } catch (error) {
            console.error('[Barcode] Error stopping camera:', error);
        }
    }
};

/**
 * Check if camera is available
 */
export const isCameraAvailable = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(device => device.kind === 'videoinput');
    } catch {
        return false;
    }
};

/**
 * Get available cameras
 */
export const getCameras = async () => {
    try {
        return await Html5Qrcode.getCameras();
    } catch {
        return [];
    }
};

export default {
    startUsbScanner,
    startCameraScanner,
    stopCameraScanner,
    isCameraAvailable,
    getCameras
};
