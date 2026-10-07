import React, { useEffect, useState } from 'react';
import { useLyricsStudioStore } from '@/hooks/use-lyrics-studio-store';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useResizablePanels } from '@/hooks/use-resizable-panels';
import { SongListPanel } from '@/components/lyrics/song-list-panel';
import { SelectedSongPanel } from '@/components/lyrics/selected-song-panel';
import { VisualCanvasEditor } from '@/components/lyrics/visual-canvas-editor';
import { LyricPropertyInspector } from '@/components/lyrics/lyric-property-inspector';
import { Splitter } from '@/components/ui/splitter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import { Music, BookOpen, ExternalLink, Eye, EyeOff, SlidersHorizontal, List, MonitorPlay, MonitorX, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Song } from '@/types/lyrics';



interface LyricsStudioViewProps {
  onSwitchToBible?: () => void;
}

export function LyricsStudioView({ onSwitchToBible }: LyricsStudioViewProps) {
  const {
    setSongs, selectedSongId, selectSong,
    slides, selectedSlideId, activeGlobalSlideIndex,
    buildLyricPayload, nextSlide, prevSlide,
  } = useLyricsStudioStore();
  const presStore = usePresentationStore();
  const [mobileTab, setMobileTab] = useState<'songs' | 'canvas' | 'inspector'>('canvas');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const {
    sizes,
    isResizing,
    handleLeftDragStart,
    handleLeftDragEnd,
    handleLeftDrag,
    handleRightDragStart,
    handleRightDragEnd,
    handleRightDrag,
  } = useResizablePanels();

  const isLive = presStore.active && !presStore.cleared;

  // ── Broadcast current slide to /display ─────────────────────────────────
  const broadcastCurrentSlide = React.useCallback((goLive: boolean) => {
    const activeSlide = slides.find((s) => s.id === selectedSlideId) || slides[0];
    if (!activeSlide) return;
    const payload = buildLyricPayload(activeSlide);
    presStore.setPresentationState({
      active: goLive,
      cleared: !goLive,
      contentType: 'song',
      lyric: payload,
    });
    fetch('/api/presentation/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        active: goLive,
        cleared: !goLive,
        contentType: 'song',
        lyric: payload,
      }),
    }).catch(console.error);
  }, [slides, selectedSlideId, buildLyricPayload, presStore]);

  const handleToggleLive = () => broadcastCurrentSlide(!isLive);

  const handleClear = () => {
    presStore.clearPresentation();
    fetch('/api/presentation/clear', { method: 'POST' }).catch(console.error);
  };

  const handleNext = () => {
    const next = nextSlide();
    if (next && isLive) {
      const payload = buildLyricPayload(next);
      presStore.setPresentationState({ active: true, cleared: false, contentType: 'song', lyric: payload });
      fetch('/api/presentation/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true, cleared: false, contentType: 'song', lyric: payload }),
      }).catch(console.error);
    }
  };

  const handlePrev = () => {
    const prev = prevSlide();
    if (prev && isLive) {
      const payload = buildLyricPayload(prev);
      presStore.setPresentationState({ active: true, cleared: false, contentType: 'song', lyric: payload });
      fetch('/api/presentation/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true, cleared: false, contentType: 'song', lyric: payload }),
      }).catch(console.error);
    }
  };

  // When a slide is clicked in SelectedSongPanel while live, broadcast immediately
  const handleSlideClick = React.useCallback((slideId: string) => {
    const clickedSlide = slides.find((s) => s.id === slideId);
    if (!clickedSlide) return;
    if (isLive) {
      const payload = buildLyricPayload(clickedSlide);
      presStore.setPresentationState({ active: true, cleared: false, contentType: 'song', lyric: payload });
      fetch('/api/presentation/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true, cleared: false, contentType: 'song', lyric: payload }),
      }).catch(console.error);
    }
  }, [slides, isLive, buildLyricPayload, presStore]);

  // Load songs on mount
  useEffect(() => {
    fetch('/api/songs', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.songs) {
          setSongs(data.songs);
        }
      })
      .catch((err) => console.error('Failed to load songs:', err));
  }, [setSongs]);

  const handleSongCreated = (newSong: Song) => {
    fetch('/api/songs', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.songs) {
          setSongs(data.songs);
          // Auto-select the newly created song so it appears active
          selectSong(newSong.id);
        }
      })
      .catch((err) => console.error('Failed to reload songs after creation:', err));
  };

  const handleSongUpdated = (_updatedSong: Song) => {
    fetch('/api/songs', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.songs) setSongs(data.songs);
      });
  };

  const handleSongDeleted = (_deletedId: string) => {
    fetch('/api/songs', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.songs) setSongs(data.songs);
      });
  };

  const handleEditSong = (songId: string) => {
    setEditingSongId(songId);
    selectSong(songId);
  };


  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* ── Top Studio Bar ────────────────────────────────────────────── */}
      <header className="h-16 border-b border-neutral-800 bg-neutral-900 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Music className="w-4 h-4 text-amber-500" />
            </div>
            <Typography variant="body" className="font-bold text-white tracking-tight">
              ScriptureCast <span className="text-amber-500 font-normal">Lyrics Studio</span>
            </Typography>
          </div>

          <div className="h-4 w-px bg-neutral-800 hidden sm:block" />

          {/* Mode Switcher Tabs */}
          <div className="hidden sm:flex items-center bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700/60">
            {onSwitchToBible && (
              <button
                onClick={onSwitchToBible}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md text-neutral-400 hover:text-white transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Scripture
              </button>
            )}
            <button
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-amber-500 text-black font-semibold shadow-sm"
            >
              <Music className="w-3.5 h-3.5" />
              Lyrics Studio
            </button>
          </div>
        </div>

        {/* ── Live Presentation Controls ─────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Live status badge */}
          {isLive ? (
            <Badge variant="destructive" className="animate-pulse bg-red-600/20 text-red-400 border-red-500/30 text-[10px] font-bold hidden sm:inline-flex">
              ON AIR (LIVE)
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-neutral-800 text-neutral-500 text-[10px] hidden sm:inline-flex">
              OFF AIR
            </Badge>
          )}

          {/* Prev / Next slide */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={activeGlobalSlideIndex <= 0}
            className="text-neutral-300 border-neutral-700 hover:bg-neutral-800 hidden sm:flex"
            title="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={activeGlobalSlideIndex >= slides.length - 1}
            className="text-neutral-300 border-neutral-700 hover:bg-neutral-800 hidden sm:flex"
            title="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-neutral-700 hidden sm:block" />

          {/* Clear */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!isLive}
            className="text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-800"
            title="Clear display"
          >
            <MonitorX className="w-4 h-4 mr-1 sm:mr-1.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>

          {/* Go Live / Take Off Air */}
          <Button
            size="sm"
            onClick={handleToggleLive}
            disabled={slides.length === 0}
            className={isLive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}
          >
            <MonitorPlay className="w-4 h-4 mr-1.5" />
            {isLive ? 'Off Air' : 'Go Live'}
          </Button>

          <div className="h-4 w-px bg-neutral-700" />

          {/* Preview toggle */}
          <Button
            size="sm"
            variant={isPreviewOpen ? 'secondary' : 'outline'}
            onClick={() => setIsPreviewOpen((open) => !open)}
            className="gap-1 text-neutral-300 border-neutral-700 hover:bg-neutral-800"
            title="Toggle Visual Canvas Preview"
          >
            {isPreviewOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPreviewOpen ? 'Close Preview' : 'Preview'}</span>
          </Button>

          {/* External Display View Link */}
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-400 font-medium px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
            title="Open Public Output in New Tab"
          >
            <span className="hidden sm:inline">/display</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>


      {/* ── Desktop 3-Column Studio Workspace ─────────────────────────── */}
      <div className={`hidden lg:flex flex-1 min-h-0 overflow-hidden ${isResizing ? 'select-none' : ''}`}>
        {/* Left: Song Library & Slide List */}
        <div style={{ width: `${sizes.leftWidth}px`, minWidth: '250px' }} className="h-full shrink-0 overflow-hidden">
          <SongListPanel
            showSections={false}
            onEditSong={handleEditSong}
            onSongCreated={handleSongCreated}
            onSongUpdated={handleSongUpdated}
            onSongDeleted={handleSongDeleted}
          />
        </div>

        {/* Left Splitter */}
        <Splitter
          onDragStart={handleLeftDragStart}
          onDragEnd={handleLeftDragEnd}
          onDrag={handleLeftDrag}
          orientation="vertical"
          isDragging={isResizing}
        />

        {/* Center: Selected song workflow or the existing visual preview */}
        <main className="flex-1 h-full min-w-0">
          {isPreviewOpen ? (
            <VisualCanvasEditor />
          ) : (
            <>
              <SelectedSongPanel
                onSongUpdated={handleSongUpdated}
                editingSongId={editingSongId}
                onEditClose={() => setEditingSongId(null)}
                onSlideClick={handleSlideClick}
              />
              <div className="hidden" aria-hidden="true">
                <VisualCanvasEditor />
              </div>
            </>
          )}
        </main>

        {/* Right Splitter */}
        <Splitter
          onDragStart={handleRightDragStart}
          onDragEnd={handleRightDragEnd}
          onDrag={handleRightDrag}
          orientation="vertical"
          isDragging={isResizing}
        />

        {/* Right: Typography & Property Inspector */}
        <div style={{ width: `${sizes.rightWidth}px`, minWidth: '250px' }} className="h-full shrink-0 overflow-hidden">
          <LyricPropertyInspector />
        </div>
      </div>

      {/* ── Mobile Layout with Tab Switching ──────────────────────────── */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === 'songs' && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="h-2/5 min-h-0 overflow-hidden">
                <SongListPanel
                  showSections={false}
                  onEditSong={handleEditSong}
                  onSongCreated={handleSongCreated}
                  onSongUpdated={handleSongUpdated}
                  onSongDeleted={handleSongDeleted}
                />
              </div>
              <div className="h-3/5 min-h-0 overflow-hidden border-t border-neutral-800">
                <SelectedSongPanel
                  onSongUpdated={handleSongUpdated}
                  editingSongId={editingSongId}
                  onEditClose={() => setEditingSongId(null)}
                  onSlideClick={handleSlideClick}
                />
              </div>
            </div>
          )}
          {mobileTab === 'canvas' && <VisualCanvasEditor />}
          {mobileTab === 'inspector' && <LyricPropertyInspector />}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="flex items-stretch border-t border-neutral-800 bg-neutral-900 shrink-0">
          <button
            onClick={() => setMobileTab('songs')}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-medium ${
              mobileTab === 'songs' ? 'text-amber-500' : 'text-neutral-400'
            }`}
          >
            <List className="w-4 h-4" />
            Songs
          </button>

          <button
            onClick={() => setMobileTab('canvas')}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-medium ${
              mobileTab === 'canvas' ? 'text-amber-500' : 'text-neutral-400'
            }`}
          >
            <Music className="w-4 h-4" />
            Stage
          </button>

          <button
            onClick={() => setMobileTab('inspector')}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-medium ${
              mobileTab === 'inspector' ? 'text-amber-500' : 'text-neutral-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Properties
          </button>
        </nav>
      </div>
    </div>
  );
}
