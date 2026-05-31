import React, { useState } from 'react';
import {
  useListBooks,
  useListChapters,
  useListVerses,
  useUpdatePresentationState
} from '@workspace/api-client-react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ChevronLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BibleBrowser() {
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const setPresentationState = usePresentationStore((state) => state.setPresentationState);
  const typography = usePresentationStore((state) => state.typography);
  const background = usePresentationStore((state) => state.background);
  const transition = usePresentationStore((state) => state.transition);

  const { data: books, isLoading: booksLoading } = useListBooks();

  const { data: chapters, isLoading: chaptersLoading } = useListChapters(selectedBookId, {
    query: { enabled: !!selectedBookId }
  });

  const { data: verses, isLoading: versesLoading } = useListVerses(selectedBookId, selectedChapter, {
    query: { enabled: !!selectedBookId && !!selectedChapter }
  });

  const { mutate: updateState } = useUpdatePresentationState();

  const handleVerseClick = (verseNum: number) => {
    const book = books?.find(b => b.id === selectedBookId);
    const verseText = verses?.find(v => v.number === verseNum)?.text || '';

    const verseDetail = {
      bookId: selectedBookId,
      bookName: book?.name || '',
      chapter: selectedChapter,
      verse: verseNum,
      text: verseText,
      reference: `${book?.name || ''} ${selectedChapter}:${verseNum}`
    };

    const newState = {
      active: true,
      cleared: false,
      verse: verseDetail,
      typography,
      background,
      transition
    };

    setPresentationState(newState);
    updateState({ data: newState });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // Delegate to the API search endpoint via the store
    try {
      const res = await fetch(`/api/bible/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data?.result) {
        const result = data.result;
        const newState = {
          active: true,
          cleared: false,
          verse: {
            bookId: result.bookId || '',
            bookName: result.bookName || '',
            chapter: result.chapter || 0,
            verse: result.verse || 0,
            text: result.text || '',
            reference: result.reference || ''
          },
          typography,
          background,
          transition
        };
        setPresentationState(newState);
        updateState({ data: newState });
        setSearchQuery('');
      }
    } catch {
      // silently ignore
    }
  };

  const selectedBookName = books?.find(b => b.id === selectedBookId)?.name ?? '';

  return (
    <div className="flex flex-col h-full bg-card border-r border-border overflow-hidden">
      {/* Fixed header — never scrolls */}
      <div className="flex-shrink-0 p-4 border-b border-border space-y-3">
        <h2 className="font-semibold text-lg tracking-tight">Scripture</h2>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search reference… e.g. యోహాను 3:16"
            className="pl-9 bg-background text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

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

      {/* Scrollable content — fills remaining height */}
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
            {/* Sticky sub-header */}
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
        {!selectedBookId && (
          <div className="p-6 text-center text-muted-foreground text-sm">
            <p>Select a book to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
