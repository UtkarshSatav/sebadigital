import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
}

export function ImageUploader({ value, onChange, folder = 'products' }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, WebP, or GIF).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be under 5MB.');
            return;
        }

        setUploading(true);
        setProgress(0);

        const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(pct);
            },
            (error) => {
                console.error('Upload error:', error);
                alert('Upload failed: ' + error.message);
                setUploading(false);
            },
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                onChange(url);
                setUploading(false);
                setProgress(0);
            }
        );
    };

    const clearImage = () => {
        onChange('');
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="space-y-2">
            <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Preview */}
            {value ? (
                <div className="relative w-full h-40 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    <img
                        src={value}
                        alt="Product"
                        className="w-full h-full object-contain"
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => !uploading && fileRef.current?.click()}
                    className={`w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${uploading
                            ? 'border-blue-300 bg-blue-50 cursor-default'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                >
                    {uploading ? (
                        <>
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-blue-600 font-medium">{progress}% uploaded</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500">Click to upload image</span>
                            <span className="text-xs text-gray-400">JPEG, PNG, WebP · max 5MB</span>
                        </>
                    )}
                </div>
            )}

            {/* Upload button (when no image) */}
            {!value && !uploading && (
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Choose File
                </button>
            )}
        </div>
    );
}
