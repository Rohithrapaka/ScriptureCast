import React, { useEffect, useRef } from 'react';
import { usePresentationSocket } from '@/hooks/use-presentation-socket';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useUpdatePresentationState } from '@workspace/api-client-react';
import { BibleBrowser } from '@/components/admin/bible-browser';
import { CustomizationPanel } from '@/components/admin/customization-panel';
import { PreviewPanel } from '@/components/admin/preview-panel';

export default function AdminPage() {
  usePresentationSocket();

  const { mutate: updateState } = useUpdatePresentationState();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // 1. Rehydrate persisted settings (typography, background, transition) from
    //    localStorage.  skipHydration: true in the store means this ONLY runs
    //    when explicitly called — the Display page never touches this data.
    usePresentationStore.persist.rehydrate();

    // 2. After hydration is synchronous, push the restored settings to the
    //    server so the display screen picks them up immediately on connect.
    //    Use a short timeout to let the rehydrated state settle in React.
    setTimeout(() => {
      const s = usePresentationStore.getState();
      updateState({
        data: {
          active: false,
          cleared: true,
          verse: null,
          typography: s.typography,
          background: s.background,
          transition: s.transition,
        },
      });
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enforce dark mode — admin is a broadcast control room
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
