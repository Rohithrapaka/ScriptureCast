import React, { useState } from 'react';
import { useLyricsStudioStore } from '@/hooks/use-lyrics-studio-store';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormRow } from '@/components/ui/form-row';
import { Badge } from '@/components/ui/badge';
import { Plus, Music, ListMusic, Trash2, Edit3, Layers } from 'lucide-react';
import type { Song, SongSection } from '@/types/lyrics';

interface SongListPanelProps {
  onSongCreated?: (song: Song) => void;
  onSongUpdated?: (song: Song) => void;
  onSongDeleted?: (songId: string) => void;
}

export function SongListPanel({ onSongCreated, onSongUpdated, onSongDeleted }: SongListPanelProps) {
  const {
    songs,
    selectedSongId,
    selectedSlideId,
    slides,
    selectSong,
    selectSlide,
  } = useLyricsStudioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  
  // New song state
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newLyrics, setNewLyrics] = useState('');

  // New section state
  const [newSectionLabel, setNewSectionLabel] = useState('Verse 1');
  const [newSectionType, setNewSectionType] = useState<SongSection['type']>('verse');
  const [newSectionLyrics, setNewSectionLyrics] = useState('');

  const selectedSong = songs.find((s) => s.id === selectedSongId);

  const filteredSongs = songs.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.artistAuthor && s.artistAuthor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newTitle.trim(),
          artistAuthor: newArtist.trim() || undefined,
          sections: [
            {
              type: 'verse',
              label: 'Verse 1',
              lyricsPrimary: newLyrics.trim() || 'First line of lyrics\nSecond line of lyrics',
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.song && onSongCreated) {
          onSongCreated(data.song);
        }
        setNewTitle('');
        setNewArtist('');
        setNewLyrics('');
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create song:', err);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSongId || !newSectionLyrics.trim()) return;

    try {
      const res = await fetch(`/api/songs/${selectedSongId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: newSectionType,
          label: newSectionLabel,
          lyricsPrimary: newSectionLyrics.trim(),
        }),
      });

      if (res.ok) {
        // Refresh song
        const songRes = await fetch(`/api/songs/${selectedSongId}`, { credentials: 'include' });
        if (songRes.ok) {
          const { song } = await songRes.json();
          if (onSongUpdated) onSongUpdated(song);
        }
        setNewSectionLyrics('');
        setIsAddSectionOpen(false);
      }
    } catch (err) {
      console.error('Failed to add section:', err);
    }
  };

  const handleDeleteSong = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this song?')) return;

    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok && onSongDeleted) {
        onSongDeleted(id);
      }
    } catch (err) {
      console.error('Failed to delete song:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 select-none overflow-hidden">
      {/* Top Header & Search */}
      <div className="p-3 border-b border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-500" />
            <Typography variant="h4" className="font-semibold text-neutral-100">
              Song Library
            </Typography>
          </div>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1 bg-amber-600 hover:bg-amber-500 text-white">
            <Plus className="w-4 h-4" />
            Add Song
          </Button>
        </div>

        <SearchInput
          placeholder="Search songs or artist..."
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          onClear={() => setSearchQuery('')}
        />
      </div>

      {/* Song List / Accordion & Slides */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 p-2 space-y-1">
        {filteredSongs.map((song) => {
          const isSelected = song.id === selectedSongId;
          return (
            <div
              key={song.id}
              className={`rounded-lg transition-all border ${
                isSelected
                  ? 'bg-neutral-800/90 border-amber-500/50 shadow-sm'
                  : 'bg-neutral-900/40 border-transparent hover:bg-neutral-800/40 hover:border-neutral-700/50'
              }`}
            >
              {/* Song Item Header */}
              <div
                onClick={() => selectSong(song.id)}
                className="p-3 cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Typography variant="body" className="font-medium text-neutral-100 truncate">
                      {song.title}
                    </Typography>
                    {song.key && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1 border-neutral-700 text-neutral-400">
                        {song.key}
                      </Badge>
                    )}
                  </div>
                  {song.artistAuthor && (
                    <Typography variant="caption" className="text-neutral-400 truncate block">
                      {song.artistAuthor}
                    </Typography>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteSong(song.id, e)}
                    className="p-1 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-700/50"
                    title="Delete Song"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Slides List when Selected */}
              {isSelected && (
                <div className="px-3 pb-3 pt-1 border-t border-neutral-800/50 space-y-1.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Slides ({slides.length})
                    </span>
                    <button
                      onClick={() => setIsAddSectionOpen(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Add Section
                    </button>
                  </div>

                  <div className="space-y-1">
                    {slides.map((slide) => {
                      const isSlideActive = slide.id === selectedSlideId;
                      return (
                        <div
                          key={slide.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectSlide(slide.id);
                          }}
                          className={`p-2 rounded cursor-pointer text-xs transition-all border flex items-start gap-2 ${
                            isSlideActive
                              ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 shadow-sm font-medium'
                              : 'bg-neutral-800/30 border-neutral-800/60 text-neutral-300 hover:bg-neutral-800/60'
                          }`}
                        >
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 uppercase shrink-0 font-mono mt-0.5">
                            {slide.sectionLabel}
                          </Badge>
                          <div className="line-clamp-2 leading-relaxed flex-1">
                            {slide.textPrimary}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredSongs.length === 0 && (
          <div className="p-8 text-center text-neutral-500">
            <ListMusic className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No songs found.</p>
          </div>
        )}
      </div>

      {/* Modal: Create Song */}
      <Modal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Song"
        description="Create a new song with title and initial lyrics."
      >
        <form onSubmit={handleCreateSong} className="space-y-4 pt-2">
          <FormRow label="Song Title" required>
            <Input
              placeholder="e.g. Living Hope"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </FormRow>

          <FormRow label="Artist / Author">
            <Input
              placeholder="e.g. Phil Wickham"
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
            />
          </FormRow>

          <FormRow label="Verse 1 Lyrics" required helpText="Separate slide chunks with a blank line">
            <Textarea
              placeholder="How great the chasm that lay between us&#10;How high the mountain I could not climb"
              rows={5}
              value={newLyrics}
              onChange={(e) => setNewLyrics(e.target.value)}
              required
            />
          </FormRow>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">
              Create Song
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Section */}
      <Modal
        open={isAddSectionOpen}
        onOpenChange={setIsAddSectionOpen}
        title={`Add Section to "${selectedSong?.title || ''}"`}
        description="Add Chorus, Bridge, or additional Verses."
      >
        <form onSubmit={handleAddSection} className="space-y-4 pt-2">
          <FormRow label="Section Label" required>
            <Input
              placeholder="e.g. Chorus, Bridge, Verse 2"
              value={newSectionLabel}
              onChange={(e) => setNewSectionLabel(e.target.value)}
              required
            />
          </FormRow>

          <FormRow label="Section Lyrics" required helpText="Use blank lines to split into multiple slides">
            <Textarea
              placeholder="Hallelujah, praise the One who set me free..."
              rows={6}
              value={newSectionLyrics}
              onChange={(e) => setNewSectionLyrics(e.target.value)}
              required
            />
          </FormRow>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddSectionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">
              Add Section
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
