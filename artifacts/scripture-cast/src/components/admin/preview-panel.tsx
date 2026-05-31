import React, { useRef, useEffect, useState } from 'react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useClearPresentation, useUpdatePresentationState } from '@workspace/api-client-react';
import { DisplayPreview } from '@/pages/display';
import { Button } from '@/components/ui/button';
import { MonitorX, MonitorPlay } from 'lucide-react';

/**
 * The preview renders DisplayPreview at a fixed 1920×1080 reference size and
 * then scales the whole thing down to fit the preview container.  This ensures
 * the preview is always a pixel-perfect scaled copy of what the display screen
 * shows — both use the identical DisplayPreview component with the same vw-based
 * typography, just at different visual scales.
 */
const DISPLAY_W = 1920;
const DISPLAY_H = 1080;

export function PreviewPanel() {
  const store = usePresentationStore();
  const { mutate: clearScreen } = useClearPresentation();
  const { mutate: updateState } = useUpdatePresentationState();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1 / 3);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / DISPLAY_W);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClear = () => {
    store.clearPresentation();
    clearScreen();
  };

  const handleToggleLive = () => {
    const newActive = !store.active;
    // Read fresh state so we always broadcast up-to-date background/typography
    const s = usePresentationStore.getState();
    const patch = { active: newActive, cleared: !newActive };
    s.setPresentationState(patch);

    updateState({
      data: {
        active: newActive,
        cleared: !newActive,
        verse: s.verse,
        typography: s.typography,
        background: s.background,
        transition: s.transition,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header bar */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-card flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg tracking-tight">Live Output</h2>
          {store.active && !store.cleared ? (
            <div className="px-2 py-0.5 rounded text-xs font-bold bg-destructive/20 text-destructive border border-destructive/30 animate-pulse">
              LIVE
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded text-xs font-bold bg-muted text-muted-foreground border border-border">
              OFF AIR
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={store.cleared}
            className="text-muted-foreground hover:text-foreground"
          >
            <MonitorX className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button
            variant={store.active && !store.cleared ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleLive}
          >
            <MonitorPlay className="w-4 h-4 mr-2" />
            {store.active && !store.cleared ? 'Go Off Air' : 'Go Live'}
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 p-8 flex items-center justify-center bg-black/40">
        {/* Outer box: sets the 16:9 aspect ratio and clips overflow */}
        <div
          ref={containerRef}
          className="w-full rounded-md overflow-hidden ring-1 ring-border shadow-2xl relative bg-black"
          style={{ aspectRatio: '16/9' }}
        >
          {/* Inner canvas: rendered at full 1920×1080 then scaled to fit */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: DISPLAY_W,
              height: DISPLAY_H,
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
            }}
          >
            <DisplayPreview />
          </div>

          {/* OFF AIR overlay — rendered on top, inside the clipping box */}
          {(!store.active || store.cleared) && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm">
              <span className="text-muted-foreground font-medium tracking-widest text-sm uppercase">
                Display Cleared
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
