import React, { useEffect } from 'react';
import { usePresentationSocket } from '@/hooks/use-presentation-socket';
import { BibleBrowser } from '@/components/admin/bible-browser';
import { CustomizationPanel } from '@/components/admin/customization-panel';
import { PreviewPanel } from '@/components/admin/preview-panel';

export default function AdminPage() {
  // Connect to socket to stay in sync with server state
  usePresentationSocket();
  
  // Enforce dark mode for admin panel (it's a control room)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <aside className="w-1/4 min-w-[300px] h-full flex-shrink-0">
        <BibleBrowser />
      </aside>
      
      <main className="flex-1 h-full min-w-[500px]">
        <PreviewPanel />
      </main>
      
      <aside className="w-1/4 min-w-[300px] h-full flex-shrink-0">
        <CustomizationPanel />
      </aside>
    </div>
  );
}
