"use client";

import { useEffect } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "border-green-900/50 bg-green-950/80 text-green-300",
  error: "border-red-900/50 bg-red-950/80 text-red-300",
  info: "border-dark-200 bg-dark-100 text-gray-200",
};

const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const Toast = ({ id, message, variant, duration, onDismiss }: ToastProps) => {
  useEffect(() => {
    const timeout = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timeout);
  }, [id, duration, onDismiss]);

  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${variantStyles[variant]}`}
    >
      <span aria-hidden="true">{variantIcons[variant]}</span>
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="text-current opacity-60 transition hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
