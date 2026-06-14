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

export function BibleBrowser() {
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setPresentationState = usePresentationStore((state) => state.setPresentationState);
  const typography = usePresentationStore((state) => state.typography);
  const background = usePresentationStore((state) => state.background);
  const transition = usePresentationStore((state) => state.transition);

  const { data: books, isLoading: booksLoading } = useListBooks();
  // The generated hooks already set enabled: !!(bookId) and enabled: !!(bookId && chapterNum)
  // internally, so no extra query options are needed here.
  const { data: chapters, isLoading: chaptersLoading } = useListChapters(selectedBookId);
  const { data: verses, isLoading: versesLoading } = useListVerses(selectedBookId, selectedChapter);
  const { mutate: updateState } = useUpdatePresentationState();

  // ── Search suggestions ───────────────────────────────────────────────────

  const { referenceMatch, bookMatches } = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return { referenceMatch: null, bookMatches: [] };

    const ref = parseReference(q);
    const books = searchBooksByEnglish(q).slice(0, 6);

    // If we have a clean reference, don't show duplicate book entries
    const bookMatchesFiltered = ref
      ? books.filter(r => r.book.id !== ref.book.id).slice(0, 4)
      : books;

    return { referenceMatch: ref, bookMatches: bookMatchesFiltered };
  }, [searchQuery]);

  const hasSuggestions = !!referenceMatch || bookMatches.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleVerseClick = (verseNum: number) => {
    const book = books?.find(b => b.id === selectedBookId);
    const verseText = verses?.find(v => v.number === verseNum)?.text || '';
    const verseDetail = {
      bookId: selectedBookId,
      bookName: book?.name || '',
      chapter: selectedChapter,
      verse: verseNum,
      text: verseText,
      reference: `${book?.name || ''} ${selectedChapter}:${verseNum}`,
    };
    const newState = { active: true, cleared: false, verse: verseDetail, typography, background, transition };
    setPresentationState(newState);
    updateState({ data: newState });
  };

  const handleBookSelect = (entry: BookEntry) => {
    setSelectedBookId(entry.id);
    setSelectedChapter(0);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleReferenceSelect = async (ref: ReferenceMatch) => {
    setShowDropdown(false);
    setSearchQuery('');

    if (ref.verse !== undefined) {
      // Full reference → fetch and present immediately
      setIsNavigating(true);
      try {
        const res = await fetch(
          `/api/bible/books/${encodeURIComponent(ref.book.id)}/chapters/${ref.chapter}/verses/${ref.verse}`
        );
        if (res.ok) {
          const data = await res.json();
          const verseDetail = {
            bookId: ref.book.id,
            bookName: ref.book.teluguName,
            chapter: ref.chapter,
            verse: ref.verse,
            text: data.text || '',
            reference: `${ref.book.teluguName} ${ref.chapter}:${ref.verse}`,
          };
          const newState = { active: true, cleared: false, verse: verseDetail, typography, background, transition };
          setPresentationState(newState);
          updateState({ data: newState });
        }
      } finally {
        setIsNavigating(false);
      }
    } else {
      // Book + chapter only → navigate to that chapter
      setSelectedBookId(ref.book.id);
      setSelectedChapter(ref.chapter);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      setSearchQuery('');
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (referenceMatch) {
        handleReferenceSelect(referenceMatch);
      } else if (bookMatches.length === 1) {
        handleBookSelect(bookMatches[0].book);
      }
    }
  };

  const selectedBookName = books?.find(b => b.id === selectedBookId)?.name ?? '';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-card border-r border-border overflow-hidden">
      {/* Fixed header — never scrolls */}
      <div className="flex-shrink-0 p-4 border-b border-border space-y-3">
        <h2 className="font-semibold text-lg tracking-tight">Scripture</h2>

        {/* Search with live dropdown */}
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          {/* Suggestions dropdown */}
          {showDropdown && hasSuggestions && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-xl overflow-hidden">

              {/* Reference action — shown first when a full reference is detected */}
              {referenceMatch && (
                <button
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border/60"
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

              {/* Matching book entries */}
              {bookMatches.map(({ book }) => (
                <button
                  key={book.id}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border/40 last:border-b-0"
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => handleBookSelect(book)}
                >
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-foreground">{book.englishName}</span>
                  <span className="text-muted-foreground mx-1">→</span>
                  <span className="text-muted-foreground">{book.teluguName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Select
          value={selectedBookId}
          onValueChange={(val) => { setSelectedBookId(val); setSelectedChapter(0); }}
        >
          <SelectTrigger>
            <SelectValue placeholder={booksLoading ? 'Loading…' : 'Select Book'} />
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-y-auto">
            {books?.map((book) => (
              <SelectItem key={book.id} value={book.id}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* Chapter grid */}
        {selectedBookId && !selectedChapter && (
          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              {selectedBookName} — Chapters
            </p>
            {chaptersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {chapters?.map((ch) => (
                  <Button
                    key={ch.number}
                    variant="outline"
                    size="sm"
                    className="h-9 text-sm font-medium"
                    onClick={() => setSelectedChapter(ch.number)}
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
          <div>
            <div className="sticky top-0 z-10 px-4 py-2 border-b border-border bg-card/95 backdrop-blur flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedChapter(0)}
                className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3 w-3" />
                Chapters
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {selectedBookName} {selectedChapter}
              </span>
            </div>

            {versesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col">
                {verses?.map((v) => (
                  <button
                    key={v.number}
                    className="text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground border-b border-border/40 transition-colors flex gap-3 group cursor-pointer"
                    onClick={() => handleVerseClick(v.number)}
                  >
                    <span className="text-muted-foreground text-xs min-w-[1.75rem] pt-0.5 font-mono font-medium">
                      {v.number}
                    </span>
                    <span className="text-sm leading-relaxed">{v.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!selectedBookId && !searchQuery && (
          <div className="p-6 text-center text-muted-foreground text-sm space-y-1">
            <p>Select a book to begin</p>
            <p className="text-xs opacity-70">Or type in English: <span className="font-mono">john 3:16</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
