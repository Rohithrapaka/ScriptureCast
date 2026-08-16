import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  PresentationState as ApiPresentationState, 
  Typography as ApiTypography, 
  Background as ApiBackground, 
  Transition as ApiTransition,
  PresentationVerse
} from '@workspace/api-client-react';

export type ContentType = 'bible' | 'song';

export interface LyricSlide {
  id: string;
  sectionId?: string;
  sectionLabel?: string;
  songTitle?: string;
  songArtist?: string;
  textPrimary: string;
  textSecondary?: string | null;
  // Normalized percentage coordinates (0 - 100)
  x?: number;
  y?: number;
  width?: number;
  // Typography overrides
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  textColor?: string;
  lineHeight?: number;
  letterSpacing?: number;
  shadow?: boolean;
  outline?: boolean;
  outlineWidth?: number;
  transitionType?: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
  transitionDuration?: number;
}

export type Typography = ApiTypography & {
  letterSpacing?: number;
};

export type Background = ApiBackground & {
  type?: 'solid' | 'gradient' | 'image' | 'transparent';
};

export type Transition = ApiTransition & {
  type?: any;
};

export type VerseDetail = PresentationVerse;

export interface PresentationState extends Omit<ApiPresentationState, 'typography' | 'background' | 'transition' | 'verse'> {
  contentType?: ContentType;
  verse?: VerseDetail | null;
  lyric?: LyricSlide | null;
  typography: Typography;
  background: Background;
  transition: Transition;
}

export const defaultTypography: Typography = {
  fontFamily: 'Noto Sans Telugu',
  fontSize: 56,
  fontWeight: 'bold',
  textAlign: 'center',
  textColor: '#ffffff',
  lineHeight: 1.4,
  shadow: true,
  outline: false,
  outlineWidth: 2,
  showReference: true,
  autoScale: true,
  refFontSize: 0,
  refFontWeight: 'regular',
  letterSpacing: 0,
};

export const defaultBackground: Background = {
  type: 'solid',
  color: '#000000',
  gradientStart: '#000000',
  gradientEnd: '#1a1a1a',
  gradientDirection: 'to bottom',
  imageUrl: null,
};

export const defaultTransition: Transition = {
  type: 'fade',
  duration: 500,
};

interface PresentationStore extends PresentationState {
  setPresentationState: (state: Partial<PresentationState>) => void;
  clearPresentation: () => void;
}

export const usePresentationStore = create<PresentationStore>()(
  persist(
    (set) => ({
      active: false,
      cleared: true,
      contentType: 'bible',
      verse: null,
      lyric: null,
      language: 'telugu' as const,
      layout: 'stack' as const,
      typography: defaultTypography,
      background: defaultBackground,
      transition: defaultTransition,
      setPresentationState: (newState) => set((state) => ({ ...state, ...newState })),
      clearPresentation: () => set({ cleared: true, active: false }),
    }),
    {
      name: 'scripture-cast-admin-settings',
      skipHydration: true,
      partialize: (state) => ({
        typography: state.typography,
        background: state.background,
        transition: state.transition,
        language: state.language,
        layout: state.layout,
      }),
    }
  )
);
