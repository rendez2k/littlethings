'use client';

import { useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SwipeAction {
  icon: ReactNode;
  label: string;
  tone: 'edit' | 'delete';
  onAction: () => void;
}

const ACTION_WIDTH = 84; // px revealed per action
const OPEN_AT = 44; // drag past this (px) snaps open
const SPRING = 'cubic-bezier(0.34, 1.3, 0.5, 1)'; // gentle overshoot

/**
 * A row you can swipe sideways to reveal an action, iOS-style: swipe left to
 * reveal `rightAction` (e.g. Delete), swipe right to reveal `leftAction`
 * (e.g. Edit). Tap the revealed button to run it. Snaps back with a soft
 * spring. Purely an enhancement — always pair it with an accessible control
 * (e.g. the actions menu) for keyboard users.
 */
export function SwipeableRow({
  children,
  leftAction,
  rightAction,
  reducedMotion = false,
  className,
}: {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  reducedMotion?: boolean;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; base: number } | null>(null);
  const axis = useRef<'none' | 'x' | 'y'>('none');
  const moved = useRef(false);

  const clamp = (dx: number) => {
    const max = leftAction ? ACTION_WIDTH : 0;
    const min = rightAction ? -ACTION_WIDTH : 0;
    if (dx > max) return max + (dx - max) * 0.18; // rubber-band past the edge
    if (dx < min) return min + (dx - min) * 0.18;
    return dx;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, base: offset };
    axis.current = 'none';
    moved.current = false;
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (axis.current === 'none') {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis.current === 'x') e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (axis.current !== 'x') return; // vertical → let the list scroll
    moved.current = true;
    setOffset(clamp(start.current.base + dx));
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    start.current = null;
    axis.current = 'none';
    setDragging(false);
    setOffset((o) => {
      if (o > OPEN_AT && leftAction) return ACTION_WIDTH;
      if (o < -OPEN_AT && rightAction) return -ACTION_WIDTH;
      return 0;
    });
  };

  const runAction = (action: SwipeAction) => {
    setOffset(0);
    action.onAction();
  };

  // Swallow the tap that ends a swipe, or a tap while open (which just closes).
  const onClickCapture = (e: MouseEvent) => {
    if (moved.current || offset !== 0) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
      if (offset !== 0) setOffset(0);
    }
  };

  const transition = dragging ? 'none' : `transform 260ms ${reducedMotion ? 'ease' : SPRING}`;

  return (
    <div className={cn('relative overflow-hidden rounded-card shadow-card', className)}>
      {leftAction ? <Panel side="left" action={leftAction} onRun={runAction} /> : null}
      {rightAction ? <Panel side="right" action={rightAction} onRun={runAction} /> : null}
      <div
        className="relative z-10"
        style={{ transform: `translate3d(${offset}px,0,0)`, transition, touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </div>
  );
}

function Panel({
  side,
  action,
  onRun,
}: {
  side: 'left' | 'right';
  action: SwipeAction;
  onRun: (action: SwipeAction) => void;
}) {
  return (
    <div
      className={cn(
        'absolute inset-y-0 flex items-stretch',
        side === 'left' ? 'left-0' : 'right-0',
        action.tone === 'delete'
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-primary text-primary-foreground',
      )}
      style={{ width: ACTION_WIDTH }}
    >
      <button
        type="button"
        aria-label={action.label}
        onClick={() => onRun(action)}
        className="flex w-full flex-col items-center justify-center gap-1 text-xs font-semibold active:scale-95"
      >
        {action.icon}
        <span>{action.label}</span>
      </button>
    </div>
  );
}
