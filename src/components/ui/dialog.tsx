import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onOpenChange]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-card p-4 shadow-xl border">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="pb-2 text-lg font-semibold">{children}</div>;
}
export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="pt-4 flex items-center justify-end gap-2">{children}</div>;
}


