import React from 'react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useClearPresentation, useUpdatePresentationState } from '@workspace/api-client-react';
import { DisplayPreview } from '@/pages/display';
import { Button } from '@/components/ui/button';
import { MonitorX, MonitorPlay } from 'lucide-react';

export function PreviewPanel() {
  const store = usePresentationStore();
  const { mutate: clearScreen } = useClearPresentation();
  const { mutate: updateState } = useUpdatePresentationState();

  const handleClear = () => {
    store.clearPresentation();
    clearScreen();
  };

  const handleToggleLive = () => {
    const newActive = !store.active;
    store.setPresentationState({ active: newActive, cleared: !newActive });
    
    updateState({ 
      data: {
        active: newActive,
        cleared: !newActive,
        verse: store.verse,
        typography: store.typography,
        background: store.background,
        transition: store.transition
      } 
    });
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div className="p-4 border-b border-border bg-card flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg tracking-tight">Live Output</h2>
          {store.active && !store.cleared ? (
            <div className="px-2 py-0.5 rounded text-xs font-bold bg-destructive/20 text-destructive border border-destructive/30 animate-pulse">LIVE</div>
          ) : (
            <div className="px-2 py-0.5 rounded text-xs font-bold bg-muted text-muted-foreground border border-border">OFF AIR</div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClear}
            disabled={store.cleared}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-clear"
          >
            <MonitorX className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button 
            variant={store.active && !store.cleared ? "destructive" : "default"}
            size="sm" 
            onClick={handleToggleLive}
            data-testid="button-toggle-live"
          >
            <MonitorPlay className="w-4 h-4 mr-2" />
            {store.active && !store.cleared ? "Go Off Air" : "Go Live"}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center bg-black/40 relative pattern-dots pattern-border pattern-size-4 pattern-opacity-5">
        <div className="w-full aspect-video rounded-md overflow-hidden ring-1 ring-border shadow-2xl relative">
          <DisplayPreview />
          
          {(!store.active || store.cleared) && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
              <span className="text-muted-foreground font-medium tracking-widest text-sm uppercase">DISPLAY CLEARED</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
