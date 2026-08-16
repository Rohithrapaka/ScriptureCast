/**
 * Splitter.tsx — Draggable panel divider component
 *
 * Renders a vertical or horizontal splitter with visual feedback during drag.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SplitterProps {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrag?: (delta: number) => void;
  orientation?: 'horizontal' | 'vertical';
  isDragging?: boolean;
  className?: string;
}

export function Splitter({
  onDragStart,
  onDragEnd,
  onDrag,
  orientation = 'vertical',
  isDragging = false,
  className,
}: SplitterProps) {
  const startPos = React.useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startPos.current = { x: e.clientX, y: e.clientY };
    onDragStart?.();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (orientation === 'vertical') {
        const delta = moveEvent.clientX - startPos.current.x;
        onDrag?.(delta);
        startPos.current.x = moveEvent.clientX;
      } else {
        const delta = moveEvent.clientY - startPos.current.y;
        onDrag?.(delta);
        startPos.current.y = moveEvent.clientY;
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      onDragEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'group relative shrink-0 select-none bg-neutral-800 hover:bg-amber-500/20 transition-colors active:bg-amber-500/30',
        orientation === 'vertical'
          ? 'w-1 hover:w-1.5 cursor-col-resize'
          : 'h-1 hover:h-1.5 cursor-row-resize',
        isDragging && 'bg-amber-500/40',
        className
      )}
      title={orientation === 'vertical' ? 'Drag to resize panels' : 'Drag to resize panels'}
    >
      {/* Optional visual indicator */}
      <div
        className={cn(
          'absolute hidden group-hover:block bg-amber-500 rounded-full transition-all',
          orientation === 'vertical'
            ? 'top-1/4 left-1/2 -translate-x-1/2 w-1 h-8'
            : 'left-1/4 top-1/2 -translate-y-1/2 w-8 h-1'
        )}
      />
    </div>
  );
}
