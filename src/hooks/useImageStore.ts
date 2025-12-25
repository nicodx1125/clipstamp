'use client';

import { useState, useEffect, useCallback } from 'react';
import { StampImage } from '@/types';

const STORAGE_KEY = 'clipstamp-images';

export function useImageStore() {
    const [images, setImages] = useState<StampImage[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // localStorageから画像を読み込む
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setImages(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load images from localStorage:', error);
        }
        setIsLoaded(true);
    }, []);

    // 画像が変更されたらlocalStorageに保存
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
            } catch (error) {
                console.error('Failed to save images to localStorage:', error);
            }
        }
    }, [images, isLoaded]);

    // 画像を追加
    const addImage = useCallback((base64Data: string) => {
        const newImage: StampImage = {
            id: crypto.randomUUID(),
            data: base64Data,
            createdAt: Date.now(),
        };
        setImages((prev) => [newImage, ...prev]);
    }, []);

    // 画像を削除
    const removeImage = useCallback((id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    }, []);

    return {
        images,
        isLoaded,
        addImage,
        removeImage,
    };
}
