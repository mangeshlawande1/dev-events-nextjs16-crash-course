"use client";

import { useMemo } from "react";
import { useToastContext } from "@/components/ui/ToastProvider";

export function useToast() {
  const { showToast } = useToastContext();

  return useMemo(
    () => ({
      success: (message: string, duration?: number) =>
        showToast(message, "success", duration),
      error: (message: string, duration?: number) =>
        showToast(message, "error", duration),
      info: (message: string, duration?: number) =>
        showToast(message, "info", duration),
    }),
    [showToast]
  );
}
