export interface SongSection {
  id: string;
  songId: string;
  type: "verse" | "chorus" | "bridge" | "pre_chorus" | "ending" | "tag" | "intro";
  sectionNumber: number;
  label: string;
  hotkey: string | null;
  lyricsPrimary: string;
  lyricsSecondary: string | null;
  orderIndex: number;
}

export interface Song {
  id: string;
  title: string;
  originalTitle: string | null;
  artistAuthor: string | null;
  key: string | null;
  bpm: number | null;
  category: string;
  tags: string[];
  defaultThemeId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  sections: SongSection[];
}

export interface SlideItem {
  id: string;
  sectionId: string;
  sectionLabel: string;
  sectionType: string;
  songId: string;
  songTitle: string;
  songArtist?: string;
  slideIndex: number; // Within section
  globalIndex: number; // Across song
  textPrimary: string;
  textSecondary?: string | null;
}

export const SUPPORTED_FONTS = [
  { label: 'Noto Sans Telugu (Telugu/English)', value: 'Noto Sans Telugu' },
  { label: 'Inter (Clean Sans)', value: 'Inter' },
  { label: 'Montserrat (Modern Geometric)', value: 'Montserrat' },
  { label: 'Poppins (Friendly Sans)', value: 'Poppins' },
  { label: 'Merriweather (Classic Serif)', value: 'Merriweather' },
  { label: 'Roboto (Neutral Sans)', value: 'Roboto' },
];

export const TRANSITION_TYPES = [
  { label: 'Fade (Smooth)', value: 'fade' },
  { label: 'Slide Up', value: 'slide-up' },
  { label: 'Slide Down', value: 'slide-down' },
  { label: 'Slide Left', value: 'slide-left' },
  { label: 'Slide Right', value: 'slide-right' },
  { label: 'None (Instant)', value: 'none' },
] as const;
