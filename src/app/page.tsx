'use client';

import { useEffect, useCallback } from 'react';
import { useImageStore } from '@/hooks/useImageStore';
import { Toast, useToast } from '@/components/Toast';
import { UploadArea } from '@/components/UploadArea';
import { ImageGrid } from '@/components/ImageGrid';

export default function Home() {
  const { images, isLoaded, addImage, removeImage } = useImageStore();
  const { toast, showToast } = useToast();

  // 画像をクリップボードにコピー
  const copyToClipboard = useCallback(async (base64: string) => {
    try {
      const response = await fetch(base64);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      showToast('✅ クリップボードにコピーしました！');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showToast('❌ コピーに失敗しました');
    }
  }, [showToast]);

  // クリップボードからの貼り付けを監視
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              addImage(reader.result as string);
              showToast('✅ 画像を追加しました！');
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [addImage, showToast]);

  // 画像追加時のハンドラー
  const handleImageAdd = useCallback((base64: string) => {
    addImage(base64);
    showToast('✅ 画像を追加しました！');
  }, [addImage, showToast]);

  // 画像削除時のハンドラー
  const handleImageRemove = useCallback((id: string) => {
    removeImage(id);
    showToast('🗑️ 画像を削除しました');
  }, [removeImage, showToast]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-xl text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ClipStamp
          </h1>
          <p className="mt-2 text-gray-600">
            画像をクリックしてクリップボードにコピー 📋
          </p>
        </header>

        {/* アップロードエリア */}
        <section className="mb-8">
          <UploadArea onImageAdd={handleImageAdd} />
        </section>

        {/* 画像カウント */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            保存済みスタンプ
          </h2>
          <span className="text-sm text-gray-500">
            {images.length} 件
          </span>
        </div>

        {/* 画像グリッド */}
        <section>
          <ImageGrid
            images={images}
            onRemove={handleImageRemove}
            onCopy={copyToClipboard}
          />
        </section>
      </div>

      {/* トースト通知 */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
