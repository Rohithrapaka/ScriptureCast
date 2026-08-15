import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song, SongSection, SlideItem } from '@/types/lyrics';
import type { LyricSlide } from '@/hooks/use-presentation-store';

interface LyricsStudioState {
  songs: Song[];
  selectedSongId: string | null;
  selectedSlideId: string | null;
  slides: SlideItem[];
  activeGlobalSlideIndex: number;
  
  // Active slide styling & position configuration
  activeSlideConfig: {
    x: number; // 0 - 100 percentage
    y: number; // 0 - 100 percentage
    width: number; // 0 - 100 percentage
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    textAlign: string;
    textColor: string;
    lineHeight: number;
    letterSpacing: number;
    shadow: boolean;
    outline: boolean;
    outlineWidth: number;
    transitionType: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
    transitionDuration: number;
  };

  // Actions
  setSongs: (songs: Song[]) => void;
  selectSong: (songId: string | null) => void;
  selectSlide: (slideId: string | null) => void;
  updateActiveSlideConfig: (patch: Partial<LyricsStudioState['activeSlideConfig']>) => void;
  nextSlide: () => SlideItem | null;
  prevSlide: () => SlideItem | null;
  goToSlideIndex: (index: number) => SlideItem | null;
  buildLyricPayload: (slide: SlideItem) => LyricSlide;
}

export const defaultSlideConfig: LyricsStudioState['activeSlideConfig'] = {
  x: 50,
  y: 50,
  width: 85,
  fontFamily: 'Noto Sans Telugu',
  fontSize: 56,
  fontWeight: 'bold',
  textAlign: 'center',
  textColor: '#ffffff',
  lineHeight: 1.4,
  letterSpacing: 0,
  shadow: true,
  outline: false,
  outlineWidth: 2,
  transitionType: 'fade',
  transitionDuration: 500,
};

function generateSlidesFromSong(song: Song | undefined): SlideItem[] {
  if (!song || !song.sections) return [];
  const items: SlideItem[] = [];
  let globalCount = 0;

  // Split section lyrics into chunks (by double line break or 4 lines max)
  song.sections.forEach((sec) => {
    const rawChunks = sec.lyricsPrimary.split(/\n\s*\n/).filter((c) => c.trim().length > 0);
    const secSecondaryChunks = sec.lyricsSecondary 
      ? sec.lyricsSecondary.split(/\n\s*\n/).filter((c) => c.trim().length > 0)
      : [];

    rawChunks.forEach((chunk, chunkIdx) => {
      items.push({
        id: `${sec.id}-slide-${chunkIdx}`,
        sectionId: sec.id,
        sectionLabel: sec.label,
        sectionType: sec.type,
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artistAuthor || undefined,
        slideIndex: chunkIdx,
        globalIndex: globalCount++,
        textPrimary: chunk.trim(),
        textSecondary: secSecondaryChunks[chunkIdx]?.trim() || null,
      });
    });
  });

  return items;
}

export const useLyricsStudioStore = create<LyricsStudioState>()(
  persist(
    (set, get) => ({
      songs: [],
      selectedSongId: null,
      selectedSlideId: null,
      slides: [],
      activeGlobalSlideIndex: 0,
      activeSlideConfig: defaultSlideConfig,

      setSongs: (songs) => {
        const currentSelected = get().selectedSongId;
        const targetSong = songs.find((s) => s.id === currentSelected) || songs[0];
        const newSlides = generateSlidesFromSong(targetSong);
        set({
          songs,
          selectedSongId: targetSong?.id || null,
          slides: newSlides,
          selectedSlideId: newSlides[0]?.id || null,
          activeGlobalSlideIndex: 0,
        });
      },

      selectSong: (songId) => {
        const song = get().songs.find((s) => s.id === songId);
        const newSlides = generateSlidesFromSong(song);
        set({
          selectedSongId: songId,
          slides: newSlides,
          selectedSlideId: newSlides[0]?.id || null,
          activeGlobalSlideIndex: 0,
        });
      },

      selectSlide: (slideId) => {
        const idx = get().slides.findIndex((s) => s.id === slideId);
        set({
          selectedSlideId: slideId,
          activeGlobalSlideIndex: idx !== -1 ? idx : 0,
        });
      },

      updateActiveSlideConfig: (patch) => {
        set((state) => ({
          activeSlideConfig: { ...state.activeSlideConfig, ...patch },
        }));
      },

      nextSlide: () => {
        const { slides, activeGlobalSlideIndex } = get();
        if (slides.length === 0) return null;
        const nextIdx = Math.min(activeGlobalSlideIndex + 1, slides.length - 1);
        const target = slides[nextIdx];
        if (target) {
          set({
            activeGlobalSlideIndex: nextIdx,
            selectedSlideId: target.id,
          });
        }
        return target || null;
      },

      prevSlide: () => {
        const { slides, activeGlobalSlideIndex } = get();
        if (slides.length === 0) return null;
        const prevIdx = Math.max(activeGlobalSlideIndex - 1, 0);
        const target = slides[prevIdx];
        if (target) {
          set({
            activeGlobalSlideIndex: prevIdx,
            selectedSlideId: target.id,
          });
        }
        return target || null;
      },

      goToSlideIndex: (index) => {
        const { slides } = get();
        if (index < 0 || index >= slides.length) return null;
        const target = slides[index];
        if (target) {
          set({
            activeGlobalSlideIndex: index,
            selectedSlideId: target.id,
          });
        }
        return target || null;
      },

      buildLyricPayload: (slide) => {
        const cfg = get().activeSlideConfig;
        return {
          id: slide.id,
          sectionId: slide.sectionId,
          sectionLabel: slide.sectionLabel,
          songTitle: slide.songTitle,
          songArtist: slide.songArtist,
          textPrimary: slide.textPrimary,
          textSecondary: slide.textSecondary,
          x: cfg.x,
          y: cfg.y,
          width: cfg.width,
          fontFamily: cfg.fontFamily,
          fontSize: cfg.fontSize,
          fontWeight: cfg.fontWeight,
          textAlign: cfg.textAlign,
          textColor: cfg.textColor,
          lineHeight: cfg.lineHeight,
          letterSpacing: cfg.letterSpacing,
          shadow: cfg.shadow,
          outline: cfg.outline,
          outlineWidth: cfg.outlineWidth,
          transitionType: cfg.transitionType,
          transitionDuration: cfg.transitionDuration,
        };
      },
    }),
    {
      name: 'lyrics-studio-settings',
      partialize: (state) => ({
        activeSlideConfig: state.activeSlideConfig,
        selectedSongId: state.selectedSongId,
      }),
    }
  )
);
