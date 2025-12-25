'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { StampImage } from '@/types';

interface ImageGridProps {
    images: StampImage[];
    onRemove: (id: string) => void;
    onCopy: (base64: string) => void;
}

export function ImageGrid({ images, onRemove, onCopy }: ImageGridProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = useCallback(
        async (image: StampImage) => {
            onCopy(image.data);
            setCopiedId(image.id);
            setTimeout(() => setCopiedId(null), 1000);
        },
        [onCopy]
    );

    if (images.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400">
                <p className="text-xl">まだスタンプがありません</p>
                <p className="mt-2">上のエリアから画像を追加してください</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {images.map((image) => (
                <div
                    key={image.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                    onMouseEnter={() => setHoveredId(image.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleCopy(image)}
                >
                    <Image
                        src={image.data}
                        alt="stamp"
                        fill
                        className="object-contain p-2"
                        unoptimized
                    />

                    {/* コピー成功表示 */}
                    {copiedId === image.id && (
                        <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="white"
                                className="w-10 h-10"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5"
                                />
                            </svg>
                        </div>
                    )}

                    {/* ホバー時のオーバーレイ */}
                    {hoveredId === image.id && copiedId !== image.id && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                                クリックでコピー
                            </span>
                        </div>
                    )}

                    {/* 削除ボタン */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(image.id);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
