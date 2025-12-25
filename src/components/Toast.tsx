'use client';

import { useState, useEffect, useCallback } from 'react';

interface ToastState {
    message: string;
    visible: boolean;
}

export function Toast({ message, visible }: ToastState) {
    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-800 text-white rounded-full shadow-lg transition-all duration-300 z-50 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
        >
            {message}
        </div>
    );
}

export function useToast() {
    const [toast, setToast] = useState<ToastState>({ message: '', visible: false });

    const showToast = useCallback((message: string) => {
        setToast({ message, visible: true });
    }, []);

    useEffect(() => {
        if (toast.visible) {
            const timer = setTimeout(() => {
                setToast((prev) => ({ ...prev, visible: false }));
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [toast.visible]);

    return { toast, showToast };
}
