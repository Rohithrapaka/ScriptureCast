import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  useListBooks,
  useListChapters,
  useListVerses,
  useUpdatePresentationState
} from '@workspace/api-client-react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ChevronLeft, ArrowRight, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  searchBooksByEnglish,
  parseReference,
  type BookEntry,
  type ReferenceMatch,
} from '@/lib/bible-aliases';

// ── Types ────────────────────────────────────────────────────────────────────

type PendingVerse = 'first' | 'last' | null;

// ── Component ────────────────────────────────────────────────────────────────

export function BibleBrowser() {
  // Navigation state
  const [selectedBookId, setSelectedBookId]         = useState<string>('');
  const [selectedChapter, setSelectedChapter]       = useState<number>(0);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number>(0);
  const [pendingVerse, setPendingVerse]             = useState<PendingVerse>(null);

  // Search / dropdown state
  const [searchQuery, setSearchQuery]               = useState('');
  const [showDropdown, setShowDropdown]             = useState(false);
  const [dropdownActiveIndex, setDropdownActiveIndex] = useState(-1);
  const [isNavigating, setIsNavigating]             = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const verseListRef = useRef<HTMLDivElement>(null);
  const handlerRef   = useRef({ goNext: () => {}, goPrev: () => {} });

  // Store
  const setPresentationState = usePresentationStore((s) => s.setPresentationState);
  const typography           = usePresentationStore((s) => s.typography);
  const background           = usePresentationStore((s) => s.background);
  const transition           = usePresentationStore((s) => s.transition);

  // Data
  const { data: books,   isLoading: booksLoading }   = useListBooks();
  const { data: chapters, isLoading: chaptersLoading } = useListChapters(selectedBookId);
  const { data: verses,   isLoading: versesLoading }   = useListVerses(selectedBookId, selectedChapter);
  const { mutate: updateState } = useUpdatePresentationState();

  // ── Core present helper ──────────────────────────────────────────────────

  function doPresent(
    verseNum: number,
    versesData: typeof verses,
    bookId  = selectedBookId,
    chapter = selectedChapter,
  ) {
    if (!versesData) return;
    const book        = books?.find((b) => b.id === bookId);
    const verseObj    = versesData.find((v) => v.number === verseNum);
    const text        = verseObj?.text ?? '';
    const textEnglish = verseObj?.textEnglish ?? null;
    const englishName = book?.englishName ?? bookId;
    const detail = {
      bookId,
      bookName:        book?.name ?? bookId,
      englishName,
      chapter,
      verse:           verseNum,
      text,
      textEnglish,
      reference:       `${book?.name ?? bookId} ${chapter}:${verseNum}`,
      referenceEnglish: `${englishName} ${chapter}:${verseNum}`,
    };
    const s = usePresentationStore.getState();
    const newState = {
      active: true, cleared: false, verse: detail,
      language: s.language, layout: s.layout,
      typography: s.typography, background: s.background, transition: s.transition,
    };
    setPresentationState(newState);
    updateState({ data: newState });
  }

  // ── Sync stable handler ref after every render ───────────────────────────

  useEffect(() => {
    handlerRef.current.goNext = () => {
      if (!verses?.length || !selectedVerseNumber) return;
      const idx = verses.findIndex((v) => v.number === selectedVerseNumber);
      if (idx < 0) return;
      if (idx < verses.length - 1) {
        const next = verses[idx + 1];
        setSelectedVerseNumber(next.number);
        doPresent(next.number, verses);
      } else if (chapters) {
        const ci = chapters.findIndex((c) => c.number === selectedChapter);
        if (ci < chapters.length - 1) {
          setSelectedChapter(chapters[ci + 1].number);
          setSelectedVerseNumber(0);
          setPendingVerse('first');
        }
      }
    };

    handlerRef.current.goPrev = () => {
      if (!verses?.length || !selectedVerseNumber) return;
      const idx = verses.findIndex((v) => v.number === selectedVerseNumber);
      if (idx < 0) return;
      if (idx > 0) {
        const prev = verses[idx - 1];
        setSelectedVerseNumber(prev.number);
        doPresent(prev.number, verses);
      } else if (chapters) {
        const ci = chapters.findIndex((c) => c.number === selectedChapter);
        if (ci > 0) {
          setSelectedChapter(chapters[ci - 1].number);
          setSelectedVerseNumber(0);
          setPendingVerse('last');
        }
      }
    };
  }); // intentionally no deps — runs after every render

  // ── Global keydown (registered once) ────────────────────────────────────

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target === inputRef.current) return;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (e.shiftKey) handlerRef.current.goPrev(); else handlerRef.current.goNext();
          break;
        case 'ArrowRight': case 'ArrowDown': e.preventDefault(); handlerRef.current.goNext(); break;
        case 'ArrowLeft':  case 'ArrowUp':   e.preventDefault(); handlerRef.current.goPrev(); break;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Auto-scroll active verse ─────────────────────────────────────────────

  useEffect(() => {
    if (!selectedVerseNumber || !verseListRef.current) return;
    verseListRef.current
      .querySelector<HTMLElement>(`[data-verse="${selectedVerseNumber}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedVerseNumber]);

  // ── Pending-verse resolution ─────────────────────────────────────────────

  useEffect(() => {
    if (!pendingVerse || !verses?.length) return;
    const target = pendingVerse === 'first' ? verses[0].number : verses[verses.length - 1].number;
    setSelectedVerseNumber(target);
    doPresent(target, verses);
    setPendingVerse(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses, pendingVerse]);

  // ── Search suggestions ───────────────────────────────────────────────────

  const { referenceMatch, bookMatches } = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return { referenceMatch: null, bookMatches: [] };
    const ref      = parseReference(q);
    const found    = searchBooksByEnglish(q).slice(0, 6);
    const filtered = ref ? found.filter((r) => r.book.id !== ref.book.id).slice(0, 4) : found;
    return { referenceMatch: ref, bookMatches: filtered };
  }, [searchQuery]);

  const totalSuggestions = (referenceMatch ? 1 : 0) + bookMatches.length;
  const hasSuggestions   = totalSuggestions > 0;

  useEffect(() => { setDropdownActiveIndex(-1); }, [searchQuery]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setShowDropdown(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleVerseClick = (verseNum: number) => {
    setSelectedVerseNumber(verseNum);
    doPresent(verseNum, verses);
  };

  const handleBookSelect = (entry: BookEntry) => {
    setSelectedBookId(entry.id);
    setSelectedChapter(0);
    setSelectedVerseNumber(0);
    setSearchQuery('');
    setShowDropdown(false);
    setDropdownActiveIndex(-1);
  };

  const handleReferenceSelect = async (ref: ReferenceMatch) => {
    setShowDropdown(false);
    setSearchQuery('');
    setDropdownActiveIndex(-1);
    setSelectedBookId(ref.book.id);
    setSelectedChapter(ref.chapter);

    if (ref.verse !== undefined) {
      setSelectedVerseNumber(ref.verse);
      setIsNavigating(true);
      try {
        const res = await fetch(
          `/api/bible/books/${encodeURIComponent(ref.book.id)}/chapters/${ref.chapter}/verses/${ref.verse}`
        );
        if (res.ok) {
          const data = await res.json();
          const englishName = ref.book.englishName;
          const detail = {
            bookId:           ref.book.id,
            bookName:         ref.book.teluguName,
            englishName,
            chapter:          ref.chapter,
            verse:            ref.verse,
            text:             data.text ?? '',
            textEnglish:      data.textEnglish ?? null,
            reference:        `${ref.book.teluguName} ${ref.chapter}:${ref.verse}`,
            referenceEnglish: `${englishName} ${ref.chapter}:${ref.verse}`,
          };
          const s = usePresentationStore.getState();
          const newState = {
            active: true, cleared: false, verse: detail,
            language: s.language, layout: s.layout,
            typography: s.typography, background: s.background, transition: s.transition,
          };
          setPresentationState(newState);
          updateState({ data: newState });
        }
      } finally {
        setIsNavigating(false);
      }
    } else {
      setSelectedVerseNumber(0);
    }
  };

  const selectDropdownItem = (index: number) => {
    if (referenceMatch) {
      if (index === 0) { handleReferenceSelect(referenceMatch); return; }
      const book = bookMatches[index - 1]?.book;
      if (book) handleBookSelect(book);
    } else {
      const book = bookMatches[index]?.book;
      if (book) handleBookSelect(book);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false); setSearchQuery(''); setDropdownActiveIndex(-1); return;
    }
    if (showDropdown && hasSuggestions) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setDropdownActiveIndex((i) => Math.min(i + 1, totalSuggestions - 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setDropdownActiveIndex((i) => Math.max(i - 1, 0)); return; }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (dropdownActiveIndex >= 0) selectDropdownItem(dropdownActiveIndex);
      else if (referenceMatch) handleReferenceSelect(referenceMatch);
      else if (bookMatches.length === 1) handleBookSelect(bookMatches[0].book);
    }
  };

  const selectedBook   = books?.find((b) => b.id === selectedBookId);
  const selectedBookName = selectedBook?.name ?? '';

  function suggestionCls(index: number, extra = '') {
    const active = dropdownActiveIndex === index;
    return [
      'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors cursor-pointer',
      active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
      extra,
    ].join(' ');
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-card border-r border-border overflow-hidden">

      {/* ── Fixed header ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 p-4 border-b border-border space-y-3">
        <h2 className="font-semibold text-lg tracking-tight">Scripture</h2>

        {/* Search + live dropdown */}
        <div ref={containerRef} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          {isNavigating && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground z-10" />
          )}
          <Input
            ref={inputRef}
            type="text"
            placeholder="e.g. john 3:16  gen  romans  ps 23"
            className="pl-9 bg-background text-sm"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
          />

          {showDropdown && hasSuggestions && (
            <div
              role="listbox"
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-xl overflow-hidden"
            >
              {referenceMatch && (
                <button
                  role="option"
                  aria-selected={dropdownActiveIndex === 0}
                  className={suggestionCls(0, 'border-b border-border/60')}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => handleReferenceSelect(referenceMatch)}
                >
                  <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="font-semibold text-foreground">
                    {referenceMatch.book.englishName} {referenceMatch.chapter}
                    {referenceMatch.verse !== undefined ? `:${referenceMatch.verse}` : ''}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground font-medium">
                    {referenceMatch.book.teluguName} {referenceMatch.chapter}
                    {referenceMatch.verse !== undefined ? `:${referenceMatch.verse}` : ''}
                  </span>
                </button>
              )}
              {bookMatches.map(({ book }, idx) => {
                const flatIdx = (referenceMatch ? 1 : 0) + idx;
                return (
                  <button
                    role="option"
                    aria-selected={dropdownActiveIndex === flatIdx}
                    key={book.id}
                    className={suggestionCls(flatIdx, 'border-b border-border/40 last:border-b-0')}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => handleBookSelect(book)}
                  >
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-foreground">{book.englishName}</span>
                    <span className="text-muted-foreground mx-1">·</span>
                    <span className="text-muted-foreground">{book.teluguName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Select
          value={selectedBookId}
          onValueChange={(val) => { setSelectedBookId(val); setSelectedChapter(0); setSelectedVerseNumber(0); }}
        >
          <SelectTrigger>
            <SelectValue placeholder={booksLoading ? 'Loading…' : 'Select Book'} />
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-y-auto">
            {books?.map((book) => (
              <SelectItem key={book.id} value={book.id}>
                {book.englishName}
                <span className="ml-1.5 text-muted-foreground text-xs">· {book.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* Chapter grid */}
        {selectedBookId && !selectedChapter && (
          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              {selectedBook?.englishName ?? selectedBookName} — Chapters
            </p>
            {chaptersLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {chapters?.map((ch) => (
                  <Button
                    key={ch.number}
                    variant="outline"
                    size="sm"
                    className="h-9 text-sm font-medium"
                    onClick={() => { setSelectedChapter(ch.number); setSelectedVerseNumber(0); }}
                  >
                    {ch.number}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Verse list */}
        {selectedBookId && selectedChapter > 0 && (
          <div ref={verseListRef}>
            <div className="sticky top-0 z-10 px-4 py-2 border-b border-border bg-card/95 backdrop-blur flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedChapter(0); setSelectedVerseNumber(0); }}
                className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3 w-3" />
                Chapters
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {selectedBook?.englishName ?? selectedBookName} {selectedChapter}
              </span>
              {selectedVerseNumber > 0 && (
                <span className="ml-auto text-xs font-mono text-primary/80 tracking-wide">
                  v.{selectedVerseNumber}
                </span>
              )}
            </div>

            {versesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="flex flex-col">
                {verses?.map((v) => {
                  const isActive = v.number === selectedVerseNumber;
                  return (
                    <button
                      key={v.number}
                      data-verse={v.number}
                      className={[
                        'text-left px-4 py-3 border-b border-border/40 transition-colors flex gap-3 cursor-pointer',
                        isActive
                          ? 'bg-primary/15 text-foreground ring-1 ring-inset ring-primary/30'
                          : 'hover:bg-accent hover:text-accent-foreground',
                      ].join(' ')}
                      onClick={() => handleVerseClick(v.number)}
                    >
                      <span className={['text-xs min-w-[1.75rem] pt-0.5 font-mono font-medium', isActive ? 'text-primary' : 'text-muted-foreground'].join(' ')}>
                        {v.number}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm leading-relaxed">{v.text}</span>
                        {v.textEnglish && (
                          <span className="text-xs leading-relaxed text-muted-foreground">{v.textEnglish}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!selectedBookId && !searchQuery && (
          <div className="p-6 text-center text-muted-foreground text-sm space-y-1">
            <p>Select a book to begin</p>
            <p className="text-xs opacity-70">Or type in English: <span className="font-mono">john 3:16</span></p>
          </div>
        )}
      </div>

      {/* ── Keyboard shortcut hint bar ───────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border px-3 py-1.5 flex flex-wrap gap-x-3 gap-y-0.5 items-center text-[10px] text-muted-foreground/60 bg-card select-none">
        <span><kbd className="font-mono">←→</kbd> verse</span>
        <span className="opacity-40">·</span>
        <span><kbd className="font-mono">Space</kbd> next</span>
        <span className="opacity-40">·</span>
        <span><kbd className="font-mono">⇧Space</kbd> prev</span>
        <span className="opacity-40">·</span>
        <span><kbd className="font-mono">↑↓</kbd> search</span>
      </div>
    </div>
  );
}
