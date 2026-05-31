import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PresentationState, Typography, Background, Transition } from '@workspace/api-client-react';

export const defaultTypography: Typography = {
  fontFamily: 'Noto Sans Telugu',
  fontSize: 56,
  fontWeight: 'bold',
  textAlign: 'center',
  textColor: '#ffffff',
  lineHeight: 1.5,
  shadow: true,
  outline: false,
  outlineWidth: 2,
  showReference: true,
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
      verse: null,
      typography: defaultTypography,
      background: defaultBackground,
      transition: defaultTransition,
      setPresentationState: (newState) => set((state) => ({ ...state, ...newState })),
      clearPresentation: () => set({ cleared: true, active: false }),
    }),
    {
      name: 'scripture-cast-presentation-storage',
      partialize: (state) => ({
        typography: state.typography,
        background: state.background,
        transition: state.transition,
      }),
    }
  )
);
