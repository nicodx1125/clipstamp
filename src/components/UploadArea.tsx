'use client';

import { useRef, useCallback, DragEvent, ChangeEvent, useState } from 'react';

interface UploadAreaProps {
    onImageAdd: (base64: string) => void;
}

export function UploadArea({ onImageAdd }: UploadAreaProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // ファイルをBase64に変換
    const fileToBase64 = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, []);

    // ファイル処理
    const handleFiles = useCallback(
        async (files: FileList | null) => {
            if (!files) return;
            for (const file of Array.from(files)) {
                if (file.type.startsWith('image/')) {
                    const base64 = await fileToBase64(file);
                    onImageAdd(base64);
                }
            }
        },
        [fileToBase64, onImageAdd]
    );

    // ファイル選択
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ドラッグ＆ドロップ
    const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    return (
        <button
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${isDragOver
                    ? 'bg-purple-500 text-white scale-105'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                />
            </svg>
            <span className="hidden sm:inline">画像を追加</span>
        </button>
    );
}
