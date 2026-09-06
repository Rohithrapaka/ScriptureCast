import React, { useRef, useState, useEffect } from 'react';
import { useLyricsStudioStore } from '@/hooks/use-lyrics-studio-store';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { usePresentationSocket } from '@/hooks/use-presentation-socket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  MonitorPlay, 
  MonitorX, 
  Move, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export function VisualCanvasEditor() {
  usePresentationSocket();

  const {
    slides,
    selectedSlideId,
    activeGlobalSlideIndex,
    activeSlideConfig,
    updateActiveSlideConfig,
    nextSlide,
    prevSlide,
    goToSlideIndex,
    buildLyricPayload,
  } = useLyricsStudioStore();

  const presStore = usePresentationStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const textElementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeEdge, setResizeEdge] = useState<'left' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; initialX: number; initialY: number }>({
    x: 0,
    y: 0,
    initialX: 50,
    initialY: 50,
  });
  const [resizeStart, setResizeStart] = useState<{ x: number; initialWidth: number }>({
    x: 0,
    initialWidth: 85,
  });

  const activeSlide = slides.find((s) => s.id === selectedSlideId) || slides[0];

  // Measure canvas width to dynamically scale font size to match 1920 reference stage
  const [editorScale, setEditorScale] = useState(0.5);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const updateScale = () => {
      setEditorScale((el.clientWidth || 960) / 1920);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Broadcast to presentation engine & socket when active slide or style changes
  const broadcastCurrentSlide = (isLive: boolean = presStore.active && !presStore.cleared, targetSlide?: typeof activeSlide) => {
    const slideToBroadcast = targetSlide || activeSlide;
    if (!slideToBroadcast) return;
    const payload = buildLyricPayload(slideToBroadcast);

    presStore.setPresentationState({
      active: isLive,
      cleared: !isLive,
      contentType: 'song',
      lyric: payload,
    });

    fetch('/api/presentation/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        active: isLive,
        cleared: !isLive,
        contentType: 'song',
        lyric: payload,
      }),
    }).catch(console.error);
  };

  // Dragging handlers with percentage calculations
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-handle]')) return; // Don't drag if clicking resize handle
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialX: activeSlideConfig.x,
      initialY: activeSlideConfig.y,
    });
  };

  // Resize handle handlers
  const handleResizeStart = (e: React.MouseEvent, edge: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeEdge(edge);
    setResizeStart({
      x: e.clientX,
      initialWidth: activeSlideConfig.width,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();

      // Handle dragging
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Convert pixel delta to percentage of canvas dimension
        const deltaPercentX = (deltaX / rect.width) * 100;
        const deltaPercentY = (deltaY / rect.height) * 100;

        const newX = Math.max(10, Math.min(90, Math.round(dragStart.initialX + deltaPercentX)));
        const newY = Math.max(10, Math.min(90, Math.round(dragStart.initialY + deltaPercentY)));

        updateActiveSlideConfig({ x: newX, y: newY });
      }

      // Handle resizing
      if (isResizing && resizeEdge) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaPercentX = (deltaX / rect.width) * 100;
        
        let newWidth: number;
        if (resizeEdge === 'right') {
          // Dragging right edge right increases width
          newWidth = Math.max(40, Math.min(95, Math.round(resizeStart.initialWidth + deltaPercentX)));
        } else {
          // Dragging left edge left increases width
          newWidth = Math.max(40, Math.min(95, Math.round(resizeStart.initialWidth - deltaPercentX)));
        }

        updateActiveSlideConfig({ width: newWidth });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // If live, update presentation display with new position
        if (presStore.active && !presStore.cleared) {
          broadcastCurrentSlide(true);
        }
      }
      if (isResizing) {
        setIsResizing(false);
        // If live, update presentation display with new size
        if (presStore.active && !presStore.cleared) {
          broadcastCurrentSlide(true);
        }
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, resizeEdge, updateActiveSlideConfig, presStore.active, presStore.cleared]);

  const handleToggleLive = () => {
    const isCurrentlyLive = presStore.active && !presStore.cleared;
    broadcastCurrentSlide(!isCurrentlyLive);
  };

  const handleClear = () => {
    presStore.clearPresentation();
    fetch('/api/presentation/clear', { method: 'POST' }).catch(console.error);
  };

  const handleNext = () => {
    const next = nextSlide();
    if (next && presStore.active && !presStore.cleared) {
      broadcastCurrentSlide(true, next);
    }
  };

  const handlePrev = () => {
    const prev = prevSlide();
    if (prev && presStore.active && !presStore.cleared) {
      broadcastCurrentSlide(true, prev);
    }
  };

  // Keyboard shortcut listener for fast live presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, presStore.active, presStore.cleared]);

  const isLive = presStore.active && !presStore.cleared;

  return (
    <div className="flex flex-col h-full bg-neutral-950 select-none overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-100 text-sm">Visual Stage Canvas</span>
            {isLive ? (
              <Badge variant="destructive" className="animate-pulse bg-red-600/20 text-red-400 border-red-500/30 text-[10px] font-bold">
                ON AIR (LIVE)
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-neutral-800 text-neutral-400 text-[10px]">
                PREVIEW
              </Badge>
            )}
          </div>

          {activeSlide && (
            <span className="text-xs text-neutral-400 font-mono hidden md:inline">
              Slide {activeGlobalSlideIndex + 1} of {slides.length} ({activeSlide.sectionLabel})
            </span>
          )}
        </div>

        {/* Live Presentation Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={activeGlobalSlideIndex <= 0}
            className="text-neutral-300 border-neutral-700 hover:bg-neutral-800"
            title="Previous Slide (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={activeGlobalSlideIndex >= slides.length - 1}
            className="text-neutral-300 border-neutral-700 hover:bg-neutral-800"
            title="Next Slide (Right Arrow / Space)"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <div className="h-4 w-px bg-neutral-700 mx-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!isLive}
            className="text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-800"
          >
            <MonitorX className="w-4 h-4 mr-1.5" /> Clear
          </Button>

          <Button
            size="sm"
            onClick={handleToggleLive}
            className={isLive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}
          >
            <MonitorPlay className="w-4 h-4 mr-1.5" />
            {isLive ? 'Take Off Air' : 'Go Live'}
          </Button>
        </div>
      </div>

      {/* 16:9 Realistic Visual Canvas Workspace */}
      <div className="flex-1 p-6 flex items-center justify-center bg-neutral-950 overflow-hidden relative">
        <div
          ref={canvasRef}
          className="w-full max-w-4xl rounded-xl overflow-hidden border border-neutral-800 shadow-2xl relative bg-black aspect-video flex items-center justify-center select-none"
        >
          {/* Subtle Canvas Guidelines / Center Crosshairs */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute inset-8 border border-dashed border-white/30 rounded-lg" />
          </div>

          {activeSlide ? (
            /* Draggable & Selectable Lyric Element */
            <div
              ref={textElementRef}
              onMouseDown={handleMouseDown}
              className={`absolute cursor-move transition-shadow rounded-lg p-4 select-none ${
                isDragging
                  ? 'ring-2 ring-amber-400 shadow-2xl bg-amber-500/5 cursor-grabbing'
                  : isResizing ? 'ring-2 ring-green-400 shadow-2xl bg-green-500/5'
                  : 'hover:ring-1 hover:ring-amber-500/50 group'
              }`}
              style={{
                left: `${activeSlideConfig.x}%`,
                top: `${activeSlideConfig.y}%`,
                width: `${activeSlideConfig.width}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Floating selection indicator handle */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md pointer-events-none">
                <Move className="w-3 h-3" />
                <span>Drag to Position (X: {activeSlideConfig.x}%, Y: {activeSlideConfig.y}%)</span>
              </div>

              {/* Left Resize Handle */}
              <div
                data-handle="left"
                onMouseDown={(e) => handleResizeStart(e, 'left')}
                className="absolute top-0 left-0 -translate-x-1/2 w-3 h-full cursor-col-resize hover:bg-green-500/40 active:bg-green-500/60 group/handle rounded-l-lg transition-colors"
                title="Drag to resize width"
              />

              {/* Right Resize Handle */}
              <div
                data-handle="right"
                onMouseDown={(e) => handleResizeStart(e, 'right')}
                className="absolute top-0 right-0 translate-x-1/2 w-3 h-full cursor-col-resize hover:bg-green-500/40 active:bg-green-500/60 group/handle rounded-r-lg transition-colors"
                title="Drag to resize width"
              />

              {/* Primary Lyrics */}
              <div
                className="whitespace-pre-wrap leading-tight drop-shadow-md text-center"
                style={{
                  fontFamily: `"${activeSlideConfig.fontFamily}", sans-serif`,
                  fontSize: `${Math.max(12, Math.round(activeSlideConfig.fontSize * editorScale))}px`,
                  fontWeight: activeSlideConfig.fontWeight,
                  textAlign: activeSlideConfig.textAlign as React.CSSProperties['textAlign'],
                  color: activeSlideConfig.textColor,
                  lineHeight: activeSlideConfig.lineHeight,
                  letterSpacing: `${activeSlideConfig.letterSpacing * editorScale}px`,
                  textShadow: activeSlideConfig.shadow
                    ? '2px 4px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)'
                    : 'none',
                }}
              >
                {activeSlide.textPrimary}
              </div>

              {/* Secondary Lyrics (Bilingual / Transliteration) */}
              {activeSlide.textSecondary && (
                <div
                  className="whitespace-pre-wrap mt-2 opacity-80 text-center"
                  style={{
                    fontFamily: `"${activeSlideConfig.fontFamily}", sans-serif`,
                    fontSize: `${Math.max(10, Math.round(activeSlideConfig.fontSize * 0.65 * editorScale))}px`,
                    color: activeSlideConfig.textColor,
                    textAlign: activeSlideConfig.textAlign as React.CSSProperties['textAlign'],
                  }}
                >
                  {activeSlide.textSecondary}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-neutral-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
              <p className="text-sm font-medium">Select a song and slide to start presenting</p>
            </div>
          )}

          {/* Quick Reset Coordinates Button */}
          <button
            onClick={() => updateActiveSlideConfig({ x: 50, y: 50 })}
            className="absolute bottom-3 right-3 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white p-1.5 rounded-md text-xs flex items-center gap-1 border border-neutral-800 transition-colors"
            title="Reset to Center"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Center
          </button>
        </div>
      </div>
    </div>
  );
}
