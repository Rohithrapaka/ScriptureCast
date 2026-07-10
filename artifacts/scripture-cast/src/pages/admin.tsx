import React, { useEffect, useRef, useState } from 'react';
import { usePresentationSocket } from '@/hooks/use-presentation-socket';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useUpdatePresentationState } from '@workspace/api-client-react';
import { BibleBrowser } from '@/components/admin/bible-browser';
import { CustomizationPanel } from '@/components/admin/customization-panel';
import { PreviewPanel } from '@/components/admin/preview-panel';
import { BookOpen, Monitor, Settings } from 'lucide-react';

type MobileTab = 'bible' | 'preview' | 'settings';

const MOBILE_TABS: { id: MobileTab; label: string; Icon: typeof BookOpen }[] = [
  { id: 'bible',    label: 'Scripture', Icon: BookOpen },
  { id: 'preview',  label: 'Preview',   Icon: Monitor  },
  { id: 'settings', label: 'Settings',  Icon: Settings },
];

export default function AdminPage() {
  usePresentationSocket();

  const { mutate: updateState } = useUpdatePresentationState();
  const startedRef = useRef(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('bible');

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
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-background text-foreground selection:bg-primary/30">

      {/* ── Desktop layout: 3 columns ─────────────────────────────── */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-1/4 min-w-[300px] h-full flex-shrink-0">
          <BibleBrowser />
        </aside>

        <main className="flex-1 h-full min-w-[400px]">
          <PreviewPanel />
        </main>

        <aside className="w-1/4 min-w-[300px] h-full flex-shrink-0">
          <CustomizationPanel />
        </aside>
      </div>

      {/* ── Mobile layout: single panel + bottom tabs ─────────────── */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0 overflow-hidden">

        {/* Panel area — one visible at a time */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === 'bible'    && <BibleBrowser />}
          {mobileTab === 'preview'  && <MobilePreview />}
          {mobileTab === 'settings' && <MobileSettings />}
        </div>

        {/* Bottom navigation tabs */}
        <nav className="flex-shrink-0 flex items-stretch border-t border-border bg-card safe-area-pb"
             style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {MOBILE_TABS.map(({ id, label, Icon }) => {
            const active = mobileTab === id;
            return (
              <button
                key={id}
                onClick={() => setMobileTab(id)}
                className={[
                  'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                <Icon className={['h-5 w-5 transition-colors', active ? 'text-primary' : ''].join(' ')} />
                <span>{label}</span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ── Mobile wrappers — strip the sidebar chrome, let components scroll ────────

function MobilePreview() {
  return (
    <div className="h-full overflow-hidden">
      <PreviewPanel />
    </div>
  );
}

function MobileSettings() {
  return (
    <div className="h-full overflow-hidden">
      <CustomizationPanel />
    </div>
  );
}
