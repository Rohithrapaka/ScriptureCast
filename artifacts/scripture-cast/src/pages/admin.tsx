import React, { useEffect, useRef, useState } from 'react';
import { usePresentationSocket } from '@/hooks/use-presentation-socket';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useUpdatePresentationState } from '@workspace/api-client-react';
import { BibleBrowser } from '@/components/admin/bible-browser';
import { CustomizationPanel } from '@/components/admin/customization-panel';
import { PreviewPanel } from '@/components/admin/preview-panel';
import { RecentVerses } from '@/components/admin/recent-verses';
import { LyricsStudioView } from '@/components/lyrics/lyrics-studio-view';
import { BookOpen, Monitor, Settings, Music, ExternalLink } from 'lucide-react';
import { Typography } from '@/components/ui/typography';

type AdminViewMode = 'bible' | 'lyrics';
type MobileTab = 'content' | 'preview' | 'settings';

export default function AdminPage() {
  usePresentationSocket();

  const { mutate: updateState } = useUpdatePresentationState();
  const startedRef = useRef(false);
  const [viewMode, setViewMode] = useState<AdminViewMode>('lyrics');
  const [mobileTab, setMobileTab] = useState<MobileTab>('content');

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    usePresentationStore.persist.rehydrate();

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

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // If in Lyrics Studio mode, render the dedicated Lyrics Studio view
  if (viewMode === 'lyrics') {
    return (
      <LyricsStudioView onSwitchToBible={() => setViewMode('bible')} />
    );
  }

  // Scripture / Bible Presentation Mode (100% Preserved)
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* ── Mode Switcher Header ───────────────────────────────────── */}
      <header className="h-12 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 select-none z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <Typography variant="body" className="font-bold text-foreground tracking-tight">
              ScriptureCast <span className="text-primary font-normal">Bible Studio</span>
            </Typography>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setViewMode('bible')}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-primary text-primary-foreground shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Scripture
            </button>
            <button
              onClick={() => setViewMode('lyrics')}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <Music className="w-3.5 h-3.5" />
              Lyrics Studio
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
            title="Open Public Output in New Tab"
          >
            <span>/display</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* ── Desktop layout: 3 columns ─────────────────────────────── */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-1/4 min-w-[300px] h-full flex-shrink-0">
          <BibleBrowser />
        </aside>

        {/* Center column: Preview + Recent Verses stacked */}
        <main className="flex-1 min-h-0 min-w-[400px] flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            <PreviewPanel />
          </div>
          <RecentVerses />
        </main>

        <aside className="w-1/4 min-w-[300px] h-full flex-shrink-0">
          <CustomizationPanel />
        </aside>
      </div>

      {/* ── Mobile layout: single panel + bottom tabs ─────────────── */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0 overflow-hidden">
        {/* Panel area — one visible at a time */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === 'content'  && <BibleBrowser />}
          {mobileTab === 'preview'  && <MobilePreview />}
          {mobileTab === 'settings' && <MobileSettings />}
        </div>

        {/* Bottom navigation tabs */}
        <nav
          className="relative flex-shrink-0 flex items-stretch border-t border-border bg-card"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <button
            onClick={() => setMobileTab('content')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium ${
              mobileTab === 'content' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Scripture</span>
          </button>

          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium ${
              mobileTab === 'preview' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Monitor className="h-5 w-5" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => setMobileTab('settings')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium ${
              mobileTab === 'settings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

// ── Mobile wrappers ───────────────────────────────────────────────────────────

function MobilePreview() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden">
        <PreviewPanel />
      </div>
      <RecentVerses />
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
