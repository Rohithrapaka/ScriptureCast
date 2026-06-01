import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PresentationState, Typography, Background, Transition } from '@workspace/api-client-react';

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

/**
 * Shared presentation store.
 *
 * Persistence is intentionally disabled by default (skipHydration: true).
 * Only the Admin page rehydrates from localStorage by calling
 * `usePresentationStore.persist.rehydrate()` on mount.
 *
 * This prevents the Display page from reading or writing the admin's saved
 * settings — the Display gets all its state purely from Socket.IO events.
 */
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
      name: 'scripture-cast-admin-settings',
      // Don't auto-hydrate — the admin page explicitly calls rehydrate() on
      // mount so the display page never touches the admin's persisted state.
      skipHydration: true,
      partialize: (state) => ({
        typography: state.typography,
        background: state.background,
        transition: state.transition,
      }),
    }
  )
);
