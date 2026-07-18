'use client';

import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/cn';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Header actions (e.g. Cancel on the left, Save on the right). */
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  children: ReactNode;
}

/**
 * A native-feeling, full-height modal sheet built on Radix Dialog (focus trap,
 * Escape to close, aria-modal and labelling handled for us). Centred within the
 * app max-width on larger screens.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  leftSlot,
  rightSlot,
  children,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed inset-0 z-50 mx-auto flex max-w-app flex-col bg-background',
            'data-[state=open]:animate-sheet-in',
          )}
        >
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 pb-3 pt-safe-top backdrop-blur">
            <div className="flex min-w-[4rem] justify-start">{leftSlot}</div>
            <div className="min-w-0 flex-1 text-center">
              <Dialog.Title className="truncate text-base font-semibold text-text">
                {title}
              </Dialog.Title>
            </div>
            <div className="flex min-w-[4rem] justify-end">{rightSlot}</div>
          </header>
          <Dialog.Description className="sr-only">{description ?? title}</Dialog.Description>
          <div className="flex-1 overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
