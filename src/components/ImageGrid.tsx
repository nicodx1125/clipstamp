'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StampImage } from '@/types';

interface ImageGridProps {
    images: StampImage[];
    onRemove: (id: string) => void;
    onCopy: (base64: string) => void;
    onReorder: (images: StampImage[]) => void;
}

interface SortableItemProps {
    image: StampImage;
    onRemove: (id: string) => void;
    onCopy: (base64: string) => void;
}

function SortableItem({ image, onRemove, onCopy }: SortableItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    const handleCopy = async () => {
        if (isDragging) return;
        onCopy(image.data);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative aspect-square rounded-xl overflow-hidden bg-gray-800 shadow-md hover:shadow-xl hover:shadow-purple-500/10 transition-shadow cursor-grab active:cursor-grabbing group border border-gray-700 ${isDragging ? 'ring-2 ring-purple-500' : ''
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCopy}
        >
            <Image
                src={image.data}
                alt="stamp"
                fill
                className="object-contain p-2 pointer-events-none"
                unoptimized
                draggable={false}
            />

            {/* コピー成功表示 */}
            {isCopied && (
                <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center pointer-events-none">
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
            {isHovered && !isCopied && !isDragging && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
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
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
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
    );
}

export function ImageGrid({ images, onRemove, onCopy, onReorder }: ImageGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px移動してからドラッグ開始（クリックと区別）
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (over && active.id !== over.id) {
                const oldIndex = images.findIndex((img) => img.id === active.id);
                const newIndex = images.findIndex((img) => img.id === over.id);
                const newImages = arrayMove(images, oldIndex, newIndex);
                onReorder(newImages);
            }
        },
        [images, onReorder]
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
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {images.map((image) => (
                        <SortableItem
                            key={image.id}
                            image={image}
                            onRemove={onRemove}
                            onCopy={onCopy}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
