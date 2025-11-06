"use client";

import { useState, useEffect, type ReactNode } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

function Toast({ message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex justify-center w-full px-4">
      <div className="bg-gray-900/90 text-white px-6 py-4 rounded-lg shadow-lg text-sm max-w-md text-center backdrop-blur-sm">
        {message}
      </div>
    </div>
  );
}

interface UseToastReturn {
  showToast: (message: string, duration?: number) => void;
  ToastComponent: ReactNode | null;
}

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<{
    message: string;
    duration?: number;
  } | null>(null);

  const showToast = (message: string, duration?: number) => {
    setToast({ message, duration });
  };

  const ToastComponent: ReactNode | null = toast ? (
    <Toast
      message={toast.message}
      duration={toast.duration}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, ToastComponent };
}
