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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Music, 
  ListMusic, 
  Trash2, 
  Edit3, 
  Layers, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import type { Song, SongSection } from '@/types/lyrics';

const SECTION_TYPE_LABELS: Record<SongSection['type'], string> = {
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  pre_chorus: 'Pre-Chorus',
  intro: 'Intro',
  ending: 'Outro / Ending',
  tag: 'Tag',
};

const SUPPORTED_LANGUAGES = [
  { label: 'English', value: 'english' },
  { label: 'Telugu', value: 'telugu' },
  { label: 'Hindi', value: 'hindi' },
  { label: 'Tamil', value: 'tamil' },
  { label: 'Malayalam', value: 'malayalam' },
  { label: 'Kannada', value: 'kannada' },
];

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
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditSongOpen, setIsEditSongOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SongSection | null>(null);
  
  // New song state
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newLanguage, setNewLanguage] = useState('english');
  const [newKey, setNewKey] = useState('');
  const [newLyrics, setNewLyrics] = useState('');

  // Edit song state
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editLanguage, setEditLanguage] = useState('english');
  const [editKey, setEditKey] = useState('');

  // New section state
  const [newSectionLabel, setNewSectionLabel] = useState('Verse 1');
  const [newSectionType, setNewSectionType] = useState<SongSection['type']>('verse');
  const [newSectionLyricsPrimary, setNewSectionLyricsPrimary] = useState('');
  const [newSectionLyricsSecondary, setNewSectionLyricsSecondary] = useState('');

  // Edit section state
  const [editSectionLabel, setEditSectionLabel] = useState('');
  const [editSectionType, setEditSectionType] = useState<SongSection['type']>('verse');
  const [editSectionLyricsPrimary, setEditSectionLyricsPrimary] = useState('');
  const [editSectionLyricsSecondary, setEditSectionLyricsSecondary] = useState('');

  const selectedSong = songs.find((s) => s.id === selectedSongId);

  const filteredSongs = songs.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.artistAuthor && s.artistAuthor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Open Edit Song modal with current metadata
  const handleOpenEditSong = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSong) return;
    setEditTitle(selectedSong.title);
    setEditArtist(selectedSong.artistAuthor || '');
    setEditLanguage(selectedSong.language || 'english');
    setEditKey(selectedSong.key || '');
    setIsEditSongOpen(true);
  };

  // Open Edit Section modal with current section data
  const handleOpenEditSection = (sec: SongSection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSection(sec);
    setEditSectionLabel(sec.label);
    setEditSectionType(sec.type);
    setEditSectionLyricsPrimary(sec.lyricsPrimary);
    setEditSectionLyricsSecondary(sec.lyricsSecondary || '');
  };

  // Create Song
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
          language: newLanguage,
          key: newKey.trim() || undefined,
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
        setNewLanguage('english');
        setNewKey('');
        setNewLyrics('');
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create song:', err);
    }
  };

  // Update Song Metadata
  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSongId || !editTitle.trim()) return;

    try {
      const res = await fetch(`/api/songs/${selectedSongId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editTitle.trim(),
          artistAuthor: editArtist.trim() || null,
          language: editLanguage,
          key: editKey.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.song && onSongUpdated) {
          onSongUpdated(data.song);
        }
        setIsEditSongOpen(false);
      }
    } catch (err) {
      console.error('Failed to update song:', err);
    }
  };

  // Delete Song
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

  // Add Section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSongId || !newSectionLyricsPrimary.trim()) return;

    try {
      const res = await fetch(`/api/songs/${selectedSongId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: newSectionType,
          label: newSectionLabel.trim(),
          lyricsPrimary: newSectionLyricsPrimary.trim(),
          lyricsSecondary: newSectionLyricsSecondary.trim() || null,
        }),
      });

      if (res.ok) {
        const songRes = await fetch(`/api/songs/${selectedSongId}`, { credentials: 'include' });
        if (songRes.ok) {
          const { song } = await songRes.json();
          if (onSongUpdated) onSongUpdated(song);
        }
        setNewSectionLabel('Verse 2');
        setNewSectionType('verse');
        setNewSectionLyricsPrimary('');
        setNewSectionLyricsSecondary('');
        setIsAddSectionOpen(false);
      }
    } catch (err) {
      console.error('Failed to add section:', err);
    }
  };

  // Update Section
  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editSectionLyricsPrimary.trim()) return;

    try {
      const res = await fetch(`/api/songs/sections/${editingSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: editSectionType,
          label: editSectionLabel.trim(),
          lyricsPrimary: editSectionLyricsPrimary.trim(),
          lyricsSecondary: editSectionLyricsSecondary.trim() || null,
        }),
      });

      if (res.ok) {
        const songRes = await fetch(`/api/songs/${editingSection.songId}`, { credentials: 'include' });
        if (songRes.ok) {
          const { song } = await songRes.json();
          if (onSongUpdated) onSongUpdated(song);
        }
        setEditingSection(null);
      }
    } catch (err) {
      console.error('Failed to update section:', err);
    }
  };

  // Delete Section
  const handleDeleteSection = async (secId: string, songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      const res = await fetch(`/api/songs/sections/${secId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        const songRes = await fetch(`/api/songs/${songId}`, { credentials: 'include' });
        if (songRes.ok) {
          const { song } = await songRes.json();
          if (onSongUpdated) onSongUpdated(song);
        }
      }
    } catch (err) {
      console.error('Failed to delete section:', err);
    }
  };

  // Reorder Sections
  const handleMoveSection = async (sec: SongSection, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSong || !selectedSong.sections) return;
    const currentIdx = selectedSong.sections.findIndex((s) => s.id === sec.id);
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= selectedSong.sections.length) return;

    const targetSec = selectedSong.sections[targetIdx];
    try {
      await Promise.all([
        fetch(`/api/songs/sections/${sec.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ orderIndex: targetIdx }),
        }),
        fetch(`/api/songs/sections/${targetSec.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ orderIndex: currentIdx }),
        }),
      ]);

      const songRes = await fetch(`/api/songs/${selectedSong.id}`, { credentials: 'include' });
      if (songRes.ok) {
        const { song } = await songRes.json();
        if (onSongUpdated) onSongUpdated(song);
      }
    } catch (err) {
      console.error('Failed to reorder section:', err);
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <Typography variant="body" className="font-medium text-neutral-100 truncate">
                      {song.title}
                    </Typography>
                    {song.key && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1 border-neutral-700 text-neutral-400">
                        {song.key}
                      </Badge>
                    )}
                    {song.language && (
                      <Badge className="text-[10px] py-0 px-1.5 bg-blue-600/30 text-blue-300 border-blue-600/50 border">
                        {song.language}
                      </Badge>
                    )}
                  </div>
                  {song.artistAuthor && (
                    <Typography variant="caption" className="text-neutral-400 truncate block">
                      {song.artistAuthor}
                    </Typography>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {isSelected && (
                    <button
                      onClick={handleOpenEditSong}
                      className="p-1 text-neutral-400 hover:text-amber-300 rounded hover:bg-neutral-700/50"
                      title="Edit Song Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteSong(song.id, e)}
                    className="p-1 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Song"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded Sections & Slides when Selected */}
              {isSelected && (
                <div className="px-3 pb-3 pt-1 border-t border-neutral-800/50 space-y-2">
                  {/* Song Level Toolbar */}
                  <div className="flex items-center justify-between pt-1 pb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Sections & Slides ({slides.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleOpenEditSong}
                        className="text-xs text-neutral-300 hover:text-white font-medium flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-neutral-700/60"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" /> Edit Song
                      </button>
                      <button
                        onClick={() => setIsAddSectionOpen(true)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-amber-500/10"
                      >
                        <Plus className="w-3 h-3" /> Add Section
                      </button>
                    </div>
                  </div>

                  {/* Render Sections Grouped */}
                  {song.sections && song.sections.length > 0 ? (
                    <div className="space-y-2">
                      {song.sections.map((sec, secIdx) => {
                        const sectionSlides = slides.filter((s) => s.sectionId === sec.id);
                        return (
                          <div key={sec.id} className="rounded-md border border-neutral-800/80 bg-neutral-900/60 overflow-hidden">
                            {/* Section Header Bar */}
                            <div className="px-2.5 py-1.5 bg-neutral-800/60 border-b border-neutral-800/70 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-semibold bg-neutral-700 text-amber-300 uppercase">
                                  {sec.label}
                                </Badge>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  ({SECTION_TYPE_LABELS[sec.type] || sec.type})
                                </span>
                              </div>

                              {/* Section Actions: Reorder, Edit, Delete */}
                              <div className="flex items-center gap-0.5">
                                <button
                                  disabled={secIdx === 0}
                                  onClick={(e) => handleMoveSection(sec, 'up', e)}
                                  className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-400 rounded"
                                  title="Move Section Up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  disabled={secIdx === song.sections.length - 1}
                                  onClick={(e) => handleMoveSection(sec, 'down', e)}
                                  className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-400 rounded"
                                  title="Move Section Down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleOpenEditSection(sec, e)}
                                  className="p-1 text-neutral-400 hover:text-amber-300 rounded hover:bg-neutral-700/50"
                                  title="Edit Section Lyrics"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSection(sec.id, song.id, e)}
                                  className="p-1 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-700/50"
                                  title="Delete Section"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Slides belonging to this section */}
                            <div className="p-1.5 space-y-1">
                              {sectionSlides.map((slide) => {
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
                                        ? 'bg-amber-500/20 border-amber-500/70 text-amber-200 shadow-sm font-medium'
                                        : 'bg-neutral-800/20 border-neutral-800/40 text-neutral-300 hover:bg-neutral-800/50'
                                    }`}
                                  >
                                    <span className="text-[10px] text-neutral-400 font-mono shrink-0 mt-0.5">
                                      #{slide.slideIndex + 1}
                                    </span>
                                    <div className="line-clamp-2 leading-relaxed flex-1">
                                      {slide.textPrimary}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-neutral-500 text-xs">
                      No sections yet. Click &ldquo;Add Section&rdquo; to add lyrics.
                    </div>
                  )}
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

          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Artist / Author">
              <Input
                placeholder="e.g. Phil Wickham"
                value={newArtist}
                onChange={(e) => setNewArtist(e.target.value)}
              />
            </FormRow>
            <FormRow label="Key (Optional)">
              <Input
                placeholder="e.g. E, G, Bb"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </FormRow>
          </div>

          <FormRow label="Language">
            <Select value={newLanguage} onValueChange={setNewLanguage}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* Modal: Edit Song Metadata */}
      <Modal
        open={isEditSongOpen}
        onOpenChange={setIsEditSongOpen}
        title="Edit Song Details"
        description="Update title, artist, language, and key."
      >
        <form onSubmit={handleUpdateSong} className="space-y-4 pt-2">
          <FormRow label="Song Title" required>
            <Input
              placeholder="Song title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </FormRow>

          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Artist / Author">
              <Input
                placeholder="e.g. John Newton"
                value={editArtist}
                onChange={(e) => setEditArtist(e.target.value)}
              />
            </FormRow>
            <FormRow label="Key (Optional)">
              <Input
                placeholder="e.g. G"
                value={editKey}
                onChange={(e) => setEditKey(e.target.value)}
              />
            </FormRow>
          </div>

          <FormRow label="Language">
            <Select value={editLanguage} onValueChange={setEditLanguage}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditSongOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Section */}
      <Modal
        open={isAddSectionOpen}
        onOpenChange={setIsAddSectionOpen}
        title={`Add Section to "${selectedSong?.title || ''}"`}
        description="Add Verse, Chorus, Bridge, Intro, or Outro."
      >
        <form onSubmit={handleAddSection} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Section Type" required>
              <Select 
                value={newSectionType} 
                onValueChange={(val: any) => {
                  setNewSectionType(val);
                  setNewSectionLabel(SECTION_TYPE_LABELS[val as SongSection['type']] || val);
                }}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectItem value="verse">Verse</SelectItem>
                  <SelectItem value="chorus">Chorus</SelectItem>
                  <SelectItem value="bridge">Bridge</SelectItem>
                  <SelectItem value="pre_chorus">Pre-Chorus</SelectItem>
                  <SelectItem value="intro">Intro</SelectItem>
                  <SelectItem value="ending">Outro / Ending</SelectItem>
                  <SelectItem value="tag">Tag</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>

            <FormRow label="Section Label" required>
              <Input
                placeholder="e.g. Chorus, Bridge, Verse 2"
                value={newSectionLabel}
                onChange={(e) => setNewSectionLabel(e.target.value)}
                required
              />
            </FormRow>
          </div>

          <FormRow label="Primary Lyrics" required helpText="Separate slide chunks with a blank line">
            <Textarea
              placeholder="Enter section lyrics here...&#10;&#10;Leave a blank line between slides"
              rows={6}
              value={newSectionLyricsPrimary}
              onChange={(e) => setNewSectionLyricsPrimary(e.target.value)}
              required
            />
          </FormRow>

          <FormRow label="Secondary Lyrics (Optional)" helpText="Optional transliteration or bilingual lines">
            <Textarea
              placeholder="Optional secondary or transliterated lyrics..."
              rows={3}
              value={newSectionLyricsSecondary}
              onChange={(e) => setNewSectionLyricsSecondary(e.target.value)}
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

      {/* Modal: Edit Section */}
      <Modal
        open={Boolean(editingSection)}
        onOpenChange={(open) => {
          if (!open) setEditingSection(null);
        }}
        title={`Edit Section: ${editingSection?.label || ''}`}
        description="Modify lyrics, rephrase lines, add/remove lines, or change section type."
      >
        <form onSubmit={handleUpdateSection} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Section Type" required>
              <Select 
                value={editSectionType} 
                onValueChange={(val: any) => setEditSectionType(val)}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectItem value="verse">Verse</SelectItem>
                  <SelectItem value="chorus">Chorus</SelectItem>
                  <SelectItem value="bridge">Bridge</SelectItem>
                  <SelectItem value="pre_chorus">Pre-Chorus</SelectItem>
                  <SelectItem value="intro">Intro</SelectItem>
                  <SelectItem value="ending">Outro / Ending</SelectItem>
                  <SelectItem value="tag">Tag</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>

            <FormRow label="Section Label" required>
              <Input
                placeholder="e.g. Chorus, Bridge, Verse 1"
                value={editSectionLabel}
                onChange={(e) => setEditSectionLabel(e.target.value)}
                required
              />
            </FormRow>
          </div>

          <FormRow label="Primary Lyrics" required helpText="Separate slide chunks with a blank line">
            <Textarea
              placeholder="Edit section lyrics here..."
              rows={7}
              value={editSectionLyricsPrimary}
              onChange={(e) => setEditSectionLyricsPrimary(e.target.value)}
              required
            />
          </FormRow>

          <FormRow label="Secondary Lyrics (Optional)" helpText="Optional transliteration or bilingual lines">
            <Textarea
              placeholder="Optional secondary or transliterated lyrics..."
              rows={3}
              value={editSectionLyricsSecondary}
              onChange={(e) => setEditSectionLyricsSecondary(e.target.value)}
            />
          </FormRow>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">
              Save Section
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
