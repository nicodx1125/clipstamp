'use client';

import { useRef, useCallback, DragEvent, ChangeEvent } from 'react';

interface UploadAreaProps {
    onImageAdd: (base64: string) => void;
}

export function UploadArea({ onImageAdd }: UploadAreaProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer text-center"
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="white"
                        className="w-8 h-8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                        />
                    </svg>
                </div>
                <div>
                    <p className="text-lg font-semibold text-gray-700">
                        画像をドラッグ＆ドロップ
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        またはクリックしてファイルを選択
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        💡 Ctrl+V でクリップボードから貼り付けも可能
                    </p>
                </div>
            </div>
        </div>
    );
}
