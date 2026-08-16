import React, { useEffect, useState } from 'react';
import { useLyricsStudioStore } from '@/hooks/use-lyrics-studio-store';
import { useResizablePanels } from '@/hooks/use-resizable-panels';
import { SongListPanel } from '@/components/lyrics/song-list-panel';
import { VisualCanvasEditor } from '@/components/lyrics/visual-canvas-editor';
import { LyricPropertyInspector } from '@/components/lyrics/lyric-property-inspector';
import { Splitter } from '@/components/ui/splitter';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Music, BookOpen, ExternalLink, Settings2, SlidersHorizontal, List } from 'lucide-react';
import type { Song } from '@/types/lyrics';

interface LyricsStudioViewProps {
  onSwitchToBible?: () => void;
}

export function LyricsStudioView({ onSwitchToBible }: LyricsStudioViewProps) {
  const { setSongs, selectedSongId } = useLyricsStudioStore();
  const [mobileTab, setMobileTab] = useState<'songs' | 'canvas' | 'inspector'>('canvas');
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
        if (data.songs) setSongs(data.songs);
      });
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

  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* ── Top Studio Bar ────────────────────────────────────────────── */}
      <header className="h-12 border-b border-neutral-800 bg-neutral-900 px-4 flex items-center justify-between shrink-0 select-none">
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

        <div className="flex items-center gap-2">
          {/* External Display View Link */}
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-400 font-medium px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
            title="Open Public Output in New Tab"
          >
            <span>/display</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* ── Desktop 3-Column Studio Workspace ─────────────────────────── */}
      <div className={`hidden lg:flex flex-1 min-h-0 overflow-hidden ${isResizing ? 'select-none' : ''}`}>
        {/* Left: Song Library & Slide List */}
        <div style={{ width: `${sizes.leftWidth}px`, minWidth: '250px' }} className="h-full shrink-0 overflow-hidden">
          <SongListPanel
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

        {/* Center: Visual 16:9 Canvas Stage Editor */}
        <main className="flex-1 h-full min-w-0">
          <VisualCanvasEditor />
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
            <SongListPanel
              onSongCreated={handleSongCreated}
              onSongUpdated={handleSongUpdated}
              onSongDeleted={handleSongDeleted}
            />
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
