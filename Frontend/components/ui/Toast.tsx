'use client';

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';

export type ToastType = 'success' | 'error' | 'loading' | 'custom';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showLoading: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((message: string, type: ToastType = 'custom') => {
    const options = {
      style: {
        background: '#172554',
        color: '#F7F8FD',
        border: '1px solid rgba(147, 197, 253, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      duration: 4000,
    };

    switch (type) {
      case 'success':
        toast.success(message, { ...options, icon: '✓' });
        break;
      case 'error':
        toast.error(message, { ...options, icon: '✕' });
        break;
      case 'loading':
        toast.loading(message, options);
        break;
      default:
        toast(message, options);
    }
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showLoading = useCallback((message: string) => {
    showToast(message, 'loading');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showLoading }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
