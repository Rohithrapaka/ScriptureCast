import React, { useState } from 'react';
import { X, Clock, Loader2 } from 'lucide-react';
import { useRecentVerses, entryId, type RecentVerseEntry } from '@/hooks/use-recent-verses';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useUpdatePresentationState } from '@workspace/api-client-react';

// ── Component ─────────────────────────────────────────────────────────────────

export function RecentVerses() {
  const { entries, removeVerse, clearAll, addVerse } = useRecentVerses();
  const { mutate: updateState } = useUpdatePresentationState();
  const currentVerse = usePresentationStore((s) => s.verse);

  const [loadingId,   setLoadingId]   = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (entries.length === 0) return null;

  const currentId = currentVerse
    ? entryId({ bookId: currentVerse.bookId, chapter: currentVerse.chapter, verse: currentVerse.verse })
    : null;

  // ── Chip click — loads verse, syncs browser, moves entry to front ─────────

  const handleChipClick = async (entry: RecentVerseEntry) => {
    const id = entryId(entry);
    if (loadingId === id) return;
    setLoadingId(id);
    try {
      const res = await fetch(
        `/api/bible/books/${encodeURIComponent(entry.bookId)}/chapters/${entry.chapter}/verses/${entry.verse}`
      );
      if (!res.ok) return;
      const data = await res.json();

      const detail = {
        bookId:           entry.bookId,
        bookName:         entry.bookName,
        englishName:      entry.englishName,
        chapter:          entry.chapter,
        verse:            entry.verse,
        text:             data.text        ?? '',
        textEnglish:      data.textEnglish ?? null,
        reference:        entry.reference,
        referenceEnglish: entry.referenceEnglish,
      };

      const s = usePresentationStore.getState();
      const newState = {
        active: true, cleared: false, verse: detail,
        language:   s.language,
        layout:     s.layout,
        typography: s.typography,
        background: s.background,
        transition: s.transition,
      };
      s.setPresentationState(newState);
      updateState({ data: newState });

      // Move to front (MANUAL_SELECTION from Recent Verses)
      addVerse(entry);

      // Tell BibleBrowser to sync its internal navigation state
      window.dispatchEvent(
        new CustomEvent('scripture-cast:navigate', {
          detail: { bookId: entry.bookId, chapter: entry.chapter, verse: entry.verse },
        })
      );
    } finally {
      setLoadingId(null);
    }
  };

  // ── X remove — does NOT load the verse ───────────────────────────────────

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeVerse(id);
  };

  // ── Clear All — two-step confirmation ────────────────────────────────────

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearAll();
    setConfirmClear(false);
  };

  return (
    <div className="flex-shrink-0 border-t border-border bg-card">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold select-none">
          <Clock className="h-3 w-3 flex-shrink-0" />
          Recent Verses
        </div>

        <button
          onClick={handleClearAll}
          className={[
            'text-xs px-2 py-0.5 rounded transition-all',
            confirmClear
              ? 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          ].join(' ')}
        >
          {confirmClear ? 'Confirm?' : 'Clear All'}
        </button>
      </div>

      {/* ── Chip row (horizontal scroll) ──────────────────────────────────── */}
      <div
        className="flex gap-2 px-4 pb-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {entries.map((entry) => {
          const id       = entryId(entry);
          const isActive  = id === currentId;
          const isLoading = loadingId === id;

          return (
            <div key={id} className="group relative flex-shrink-0">
              {/* Chip button */}
              <button
                onClick={() => handleChipClick(entry)}
                disabled={isLoading}
                title={`${entry.referenceEnglish}  ·  ${entry.reference}`}
                className={[
                  'flex items-center gap-1.5 pl-3 pr-6 py-1.5 rounded-full border',
                  'text-xs font-medium transition-all select-none whitespace-nowrap',
                  isActive
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/60',
                  isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer',
                ].join(' ')}
              >
                {isLoading && <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />}
                {entry.referenceEnglish}
              </button>

              {/* Remove X — subtle always, prominent on chip hover */}
              <button
                onClick={(e) => handleRemove(e, id)}
                title={`Remove ${entry.referenceEnglish}`}
                aria-label={`Remove ${entry.referenceEnglish}`}
                className={[
                  'absolute right-1.5 top-1/2 -translate-y-1/2',
                  'h-3.5 w-3.5 rounded-full flex items-center justify-center',
                  'text-muted-foreground',
                  'hover:text-foreground hover:bg-muted',
                  'transition-all',
                  // Desktop: faint until chip is hovered; mobile: already at 60%
                  'opacity-40 group-hover:opacity-100',
                ].join(' ')}
              >
                <X className="h-2 w-2" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
