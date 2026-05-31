import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePresentationStore } from './use-presentation-store';
import type { PresentationState } from '@workspace/api-client-react';

export function usePresentationSocket() {
  const socketRef = useRef<Socket | null>(null);
  const setPresentationState = usePresentationStore((state) => state.setPresentationState);
  const clearPresentation = usePresentationStore((state) => state.clearPresentation);

  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to presentation socket');
    });

    socket.on('presentation:update', (state: PresentationState) => {
      setPresentationState(state);
    });

    socket.on('presentation:clear', () => {
      clearPresentation();
    });

    socket.on('presentation:sync', (state: PresentationState) => {
      setPresentationState(state);
    });

    return () => {
      socket.disconnect();
    };
  }, [setPresentationState, clearPresentation]);

  return socketRef.current;
}
