"use client";

import { useCallback, useRef, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

/**
 * Usage:
 *   const { confirm, dialog } = useConfirm();
 *   const ok = await confirm({ title: "Delete this?", danger: true });
 *   if (!ok) return;
 *   ...
 *   return <div>{dialog}{...rest of component}</div>;
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleResult = useCallback((result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  const dialog = options ? (
    <ConfirmDialog
      {...options}
      onConfirm={() => handleResult(true)}
      onCancel={() => handleResult(false)}
    />
  ) : null;

  return { confirm, dialog };
}
