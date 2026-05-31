import React, { useEffect, useState } from 'react';
import { 
  useListBooks, 
  useListChapters, 
  useListVerses, 
  useGetVerse, 
  useSearchBible,
  getListChaptersQueryKey,
  getListVersesQueryKey,
  getGetVerseQueryKey,
  useUpdatePresentationState
} from '@workspace/api-client-react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
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
    query: {
      enabled: !!selectedBookId,
      queryKey: getListChaptersQueryKey(selectedBookId)
    }
  });

  const { data: verses, isLoading: versesLoading } = useListVerses(selectedBookId, selectedChapter, {
    query: {
      enabled: !!selectedBookId && !!selectedChapter,
      queryKey: getListVersesQueryKey(selectedBookId, selectedChapter)
    }
  });

  const { mutate: updateState } = useUpdatePresentationState();

  const handleVerseClick = async (verseNum: number) => {
    // We could fetch the verse detail here or construct it
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

  const { data: searchResult, isLoading: searchLoading, refetch: performSearch } = useSearchBible(
    { q: searchQuery },
    { query: { enabled: false } }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = await performSearch();
    if (res.data?.result) {
      const result = res.data.result;
      
      const verseDetail = {
        bookId: result.bookId || '',
        bookName: result.bookName || '',
        chapter: result.chapter || 0,
        verse: result.verse || 0,
        text: result.text || '',
        reference: result.reference || ''
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
      setSearchQuery('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border space-y-4">
        <h2 className="font-semibold text-lg tracking-tight">Scripture</h2>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search reference..." 
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </form>
        
        <Select value={selectedBookId} onValueChange={(val) => { setSelectedBookId(val); setSelectedChapter(0); }}>
          <SelectTrigger data-testid="select-book">
            <SelectValue placeholder="Select Book" />
          </SelectTrigger>
          <SelectContent>
            {books?.map((book) => (
              <SelectItem key={book.id} value={book.id} data-testid={`select-book-${book.id}`}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        {selectedBookId && !selectedChapter && (
          <div className="p-4">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Chapters</h3>
            <div className="grid grid-cols-5 gap-2">
              {chapters?.map((ch) => (
                <Button 
                  key={ch.number} 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedChapter(ch.number)}
                  data-testid={`button-chapter-${ch.number}`}
                >
                  {ch.number}
                </Button>
              ))}
            </div>
          </div>
        )}

        {selectedBookId && selectedChapter > 0 && (
          <div className="p-0">
            <div className="p-3 border-b border-border bg-muted/30 sticky top-0 backdrop-blur z-10 flex items-center justify-between">
              <h3 className="text-sm font-medium">Chapter {selectedChapter}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedChapter(0)} className="h-7 text-xs">
                Back to Chapters
              </Button>
            </div>
            <div className="flex flex-col">
              {versesLoading ? (
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
              ) : (
                verses?.map((v) => (
                  <button
                    key={v.number}
                    className="text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground border-b border-border/50 transition-colors flex gap-3 group"
                    onClick={() => handleVerseClick(v.number)}
                    data-testid={`button-verse-${v.number}`}
                  >
                    <span className="text-muted-foreground text-sm min-w-[1.5rem] font-medium">{v.number}</span>
                    <span className="text-sm">{v.text}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
