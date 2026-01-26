import { storage } from '../../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Generate unique filename
 */
const generateFileName = (originalName) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${random}.${extension}`;
};

/**
 * Upload image to Firebase Storage
 */
export const uploadImage = async (file, tenantId, ticketId) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 5MB.');
    }

    // Generate unique filename
    const fileName = generateFileName(file.name);

    // Create storage reference
    const storageRef = ref(storage, `support/${tenantId}/${ticketId}/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (files, tenantId, ticketId) => {
    const uploadPromises = Array.from(files).map(file =>
        uploadImage(file, tenantId, ticketId)
    );

    return Promise.all(uploadPromises);
};
