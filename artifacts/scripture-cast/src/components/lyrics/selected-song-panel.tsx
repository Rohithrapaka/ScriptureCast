import React, { useEffect, useState } from 'react';
import { useLyricsStudioStore } from '@/hooks/use-lyrics-studio-store';
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
import { ChevronDown, ChevronUp, Edit3, ListMusic, Music, Plus, Trash2 } from 'lucide-react';
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

interface SelectedSongPanelProps {
  onSongUpdated?: (song: Song) => void;
  editingSongId?: string | null;
  onEditClose?: () => void;
  /** Called when a slide is clicked — used by parent to broadcast if currently live */
  onSlideClick?: (slideId: string) => void;
}

export function SelectedSongPanel({ onSongUpdated, editingSongId = null, onEditClose, onSlideClick }: SelectedSongPanelProps) {

  const { songs, selectedSongId, selectedSlideId, slides, selectSlide } = useLyricsStudioStore();
  const selectedSong = songs.find((song) => song.id === selectedSongId);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SongSection | null>(null);
  const [newSectionLabel, setNewSectionLabel] = useState('Verse 2');
  const [newSectionType, setNewSectionType] = useState<SongSection['type']>('verse');
  const [newSectionLyricsPrimary, setNewSectionLyricsPrimary] = useState('');
  const [newSectionLyricsSecondary, setNewSectionLyricsSecondary] = useState('');
  const [editSectionLabel, setEditSectionLabel] = useState('');
  const [editSectionType, setEditSectionType] = useState<SongSection['type']>('verse');
  const [editSectionLyricsPrimary, setEditSectionLyricsPrimary] = useState('');
  const [editSectionLyricsSecondary, setEditSectionLyricsSecondary] = useState('');
  const [editSongTitle, setEditSongTitle] = useState('');
  const [editSongArtist, setEditSongArtist] = useState('');
  const [editSongLanguage, setEditSongLanguage] = useState('english');
  const [editSongKey, setEditSongKey] = useState('');
  const [editSongLyrics, setEditSongLyrics] = useState<Record<string, string>>({});

  const editingSong = songs.find((song) => song.id === editingSongId);

  useEffect(() => {
    if (!editingSong) return;
    setEditSongTitle(editingSong.title);
    setEditSongArtist(editingSong.artistAuthor || '');
    setEditSongLanguage(editingSong.language || 'english');
    setEditSongKey(editingSong.key || '');
    setEditSongLyrics(Object.fromEntries(editingSong.sections.map((section) => [section.id, section.lyricsPrimary])));
  }, [editingSong]);

  const refreshSong = async (songId: string) => {
    const response = await fetch(`/api/songs/${songId}`, { credentials: 'include' });
    if (response.ok) {
      const { song } = await response.json();
      if (onSongUpdated) onSongUpdated(song);
    }
  };

  const openEditSection = (section: SongSection, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingSection(section);
    setEditSectionLabel(section.label);
    setEditSectionType(section.type);
    setEditSectionLyricsPrimary(section.lyricsPrimary);
    setEditSectionLyricsSecondary(section.lyricsSecondary || '');
  };

  const handleAddSection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSong || !newSectionLyricsPrimary.trim()) return;

    try {
      const response = await fetch(`/api/songs/${selectedSong.id}/sections`, {
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
      if (!response.ok) return;
      await refreshSong(selectedSong.id);
      setNewSectionLabel('Verse 2');
      setNewSectionType('verse');
      setNewSectionLyricsPrimary('');
      setNewSectionLyricsSecondary('');
      setIsAddSectionOpen(false);
    } catch (error) {
      console.error('Failed to add section:', error);
    }
  };

  const handleUpdateSection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingSection || !editSectionLyricsPrimary.trim()) return;

    try {
      const response = await fetch(`/api/songs/sections/${editingSection.id}`, {
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
      if (!response.ok) return;
      await refreshSong(editingSection.songId);
      setEditingSection(null);
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const handleDeleteSection = async (section: SongSection, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await fetch(`/api/songs/sections/${section.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) return;
      await refreshSong(section.songId);
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  const handleMoveSection = async (section: SongSection, direction: 'up' | 'down', event: React.MouseEvent) => {
    event.stopPropagation();
    if (!selectedSong) return;
    const currentIndex = selectedSong.sections.findIndex((item) => item.id === section.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= selectedSong.sections.length) return;

    const targetSection = selectedSong.sections[targetIndex];
    try {
      await Promise.all([
        fetch(`/api/songs/sections/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ orderIndex: targetIndex }),
        }),
        fetch(`/api/songs/sections/${targetSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ orderIndex: currentIndex }),
        }),
      ]);
      await refreshSong(selectedSong.id);
    } catch (error) {
      console.error('Failed to reorder section:', error);
    }
  };

  const handleSaveSong = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingSong) return;

    try {
      const requests: Promise<Response>[] = [
        fetch(`/api/songs/${editingSong.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: editSongTitle.trim(),
            artistAuthor: editSongArtist.trim() || null,
            language: editSongLanguage,
            key: editSongKey.trim() || null,
          }),
        }),
        ...editingSong.sections.map((section) => fetch(`/api/songs/sections/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ lyricsPrimary: editSongLyrics[section.id]?.trim() || section.lyricsPrimary }),
        })),
      ];
      const responses = await Promise.all(requests);
      if (responses.every((response) => response.ok)) {
        await refreshSong(editingSong.id);
        onEditClose?.();
      }
    } catch (error) {
      console.error('Failed to save song:', error);
    }
  };

  if (!selectedSong) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950 text-neutral-500">
        <div className="text-center">
          <Music className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Select a song to manage its lyrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-800 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Typography variant="h3" className="text-white font-semibold truncate">{selectedSong.title}</Typography>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-neutral-400">
              {selectedSong.artistAuthor && <span>{selectedSong.artistAuthor}</span>}
              {selectedSong.language && <Badge className="bg-blue-600/30 text-blue-300 border-blue-600/50 border">{selectedSong.language}</Badge>}
              {selectedSong.key && <Badge variant="outline" className="border-neutral-700 text-neutral-400">Key {selectedSong.key}</Badge>}
              {selectedSong.category && <span>{selectedSong.category}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center justify-between mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <span>Lyrics</span>
            <span className="text-[10px] font-normal tracking-normal">Select a lyric group to present</span>
          </div>
        {selectedSong.sections.length > 0 ? (
            <div>
            {selectedSong.sections.map((section, sectionIndex) => {
              const sectionSlides = slides.filter((slide) => slide.sectionId === section.id);
              return (
                  <section key={section.id} className="py-1">
                    <div className="space-y-0.5">
                    {sectionSlides.map((slide) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => {
                          selectSlide(slide.id);
                          onSlideClick?.(slide.id);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-sm border-l-2 transition-colors ${slide.id === selectedSlideId ? 'bg-amber-500/10 border-amber-500/60 text-amber-100' : 'border-transparent text-neutral-300 hover:bg-neutral-900/70'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 whitespace-pre-wrap leading-relaxed">{slide.textPrimary}</div>
                        </div>
                        {slide.textSecondary && <div className="mt-2 ml-5 text-xs text-neutral-500 whitespace-pre-wrap">{slide.textSecondary}</div>}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-neutral-500">
            <ListMusic className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No sections yet. Add a section to begin.</p>
          </div>
        )}
      </div>

      <Modal open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen} title={`Add Section to "${selectedSong.title}"`} description="Add Verse, Chorus, Bridge, Intro, or Outro.">
        <form onSubmit={handleAddSection} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Section Type" required>
              <Select value={newSectionType} onValueChange={(value: SongSection['type']) => { setNewSectionType(value); setNewSectionLabel(SECTION_TYPE_LABELS[value] || value); }}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Section Label" required><Input value={newSectionLabel} onChange={(event) => setNewSectionLabel(event.target.value)} required /></FormRow>
          </div>
          <FormRow label="Primary Lyrics" required><Textarea rows={6} value={newSectionLyricsPrimary} onChange={(event) => setNewSectionLyricsPrimary(event.target.value)} required /></FormRow>
          <FormRow label="Secondary Lyrics (Optional)"><Textarea rows={3} value={newSectionLyricsSecondary} onChange={(event) => setNewSectionLyricsSecondary(event.target.value)} /></FormRow>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsAddSectionOpen(false)}>Cancel</Button><Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">Add Section</Button></div>
        </form>
      </Modal>

      <Modal open={Boolean(editingSection)} onOpenChange={(open) => { if (!open) setEditingSection(null); }} title={`Edit Section: ${editingSection?.label || ''}`} description="Modify lyrics or section details.">
        <form onSubmit={handleUpdateSection} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Section Type" required>
              <Select value={editSectionType} onValueChange={(value: SongSection['type']) => setEditSectionType(value)}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Section Label" required><Input value={editSectionLabel} onChange={(event) => setEditSectionLabel(event.target.value)} required /></FormRow>
          </div>
          <FormRow label="Primary Lyrics" required><Textarea rows={7} value={editSectionLyricsPrimary} onChange={(event) => setEditSectionLyricsPrimary(event.target.value)} required /></FormRow>
          <FormRow label="Secondary Lyrics (Optional)"><Textarea rows={3} value={editSectionLyricsSecondary} onChange={(event) => setEditSectionLyricsSecondary(event.target.value)} /></FormRow>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button><Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">Save Section</Button></div>
        </form>
      </Modal>

      <Modal open={Boolean(editingSong)} onOpenChange={(open) => { if (!open) onEditClose?.(); }} title={`Edit Song: ${editingSong?.title || ''}`} description="Update song details and complete lyrics.">
        <form onSubmit={handleSaveSong} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Title" required><Input value={editSongTitle} onChange={(event) => setEditSongTitle(event.target.value)} required /></FormRow>
            <FormRow label="Artist"><Input value={editSongArtist} onChange={(event) => setEditSongArtist(event.target.value)} /></FormRow>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Language"><Input value={editSongLanguage} onChange={(event) => setEditSongLanguage(event.target.value)} /></FormRow>
            <FormRow label="Key"><Input value={editSongKey} onChange={(event) => setEditSongKey(event.target.value)} /></FormRow>
          </div>
          <div className="max-h-[52vh] overflow-y-auto space-y-3 pr-1">
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={() => setIsAddSectionOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Add Section
              </Button>
            </div>
            {editingSong?.sections.map((section) => (
              <div key={section.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{section.label}</span>
                  <div className="flex gap-1">
                    <button type="button" disabled={editingSong.sections.indexOf(section) === 0} onClick={(event) => handleMoveSection(section, 'up', event)} className="p-1 disabled:opacity-20" title="Move section up"><ChevronUp className="w-3 h-3" /></button>
                    <button type="button" disabled={editingSong.sections.indexOf(section) === editingSong.sections.length - 1} onClick={(event) => handleMoveSection(section, 'down', event)} className="p-1 disabled:opacity-20" title="Move section down"><ChevronDown className="w-3 h-3" /></button>
                    <button type="button" onClick={(event) => openEditSection(section, event)} className="p-1" title="Edit section details"><Edit3 className="w-3 h-3" /></button>
                    <button type="button" onClick={(event) => handleDeleteSection(section, event)} className="p-1 text-red-400" title="Delete section"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <Textarea rows={4} value={editSongLyrics[section.id] || ''} onChange={(event) => setEditSongLyrics((current) => ({ ...current, [section.id]: event.target.value }))} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onEditClose?.()}>Cancel</Button><Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">Save Changes</Button></div>
        </form>
      </Modal>
    </div>
  );
}
