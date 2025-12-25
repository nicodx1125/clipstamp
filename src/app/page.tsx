'use client';

import { useEffect, useCallback, useState } from 'react';
import { useImageStore } from '@/hooks/useImageStore';
import { Toast, useToast } from '@/components/Toast';
import { UploadArea } from '@/components/UploadArea';
import { ImageGrid } from '@/components/ImageGrid';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function Home() {
  const { images, isLoaded, addImage, removeImage, reorderImages } = useImageStore();
  const { toast, showToast } = useToast();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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

  // 削除確認モーダルを開く
  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteTargetId(id);
  }, []);

  // 削除を確定
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTargetId) {
      removeImage(deleteTargetId);
      showToast('🗑️ 画像を削除しました');
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, removeImage, showToast]);

  // 削除をキャンセル
  const handleDeleteCancel = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* ヘッダー（コンパクト版） */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ClipStamp
            </h1>
            <span className="text-sm text-gray-500 hidden sm:inline">📋 クリックでコピー</span>
          </div>
          <div className="flex items-center gap-2">
            <UploadArea onImageAdd={handleImageAdd} />
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="text-xs">or</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-700 border border-gray-600 rounded">Ctrl</kbd>
              <span className="text-xs">+</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-700 border border-gray-600 rounded">V</kbd>
            </div>
          </div>
        </header>

        {/* 画像カウント */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-400">
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
            onRemove={handleDeleteRequest}
            onCopy={copyToClipboard}
            onReorder={reorderImages}
          />
        </section>
      </div>

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="画像を削除"
        message="このスタンプを削除しますか？この操作は取り消せません。"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* トースト通知 */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
