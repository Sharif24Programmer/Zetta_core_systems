import { useState, useRef } from 'react';

/**
 * Validate image file
 */
const validateImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File too large. Maximum size is 5MB.'
        };
    }

    return { valid: true, error: null };
};

const ImageUploader = ({ onImageSelect, maxImages = 3 }) => {
    const [previews, setPreviews] = useState([]);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setError(null);

        if (previews.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        const validFiles = [];
        const newPreviews = [];

        for (const file of files) {
            const validation = validateImage(file);
            if (!validation.valid) {
                setError(validation.error);
                continue;
            }

            validFiles.push(file);
            newPreviews.push({
                file,
                preview: URL.createObjectURL(file)
            });
        }

        setPreviews(prev => [...prev, ...newPreviews]);
        onImageSelect([...previews.map(p => p.file), ...validFiles]);
    };

    const removeImage = (index) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
        onImageSelect(newPreviews.map(p => p.file));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Preview Grid */}
            {previews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={preview.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {previews.length < maxImages && (
                <button
                    type="button"
                    onClick={triggerFileInput}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Add Image</span>
                </button>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <p className="text-xs text-slate-400">
                Max {maxImages} images. JPEG, PNG, GIF, WebP up to 5MB each.
            </p>
        </div>
    );
};

export default ImageUploader;
