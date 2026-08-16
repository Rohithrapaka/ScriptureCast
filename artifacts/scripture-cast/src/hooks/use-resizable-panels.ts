import { useState, useEffect, useCallback } from 'react';

interface PanelSizes {
  leftWidth: number;  // pixels or percentage
  rightWidth: number; // pixels or percentage
}

const DEFAULT_SIZES: PanelSizes = {
  leftWidth: 320,  // w-80 = 320px
  rightWidth: 320, // w-80 = 320px
};

const STORAGE_KEY = 'scripture-cast-panel-sizes';
const MIN_PANEL_WIDTH = 250;
const MAX_TOTAL_WIDTH = 2000;

export function useResizablePanels() {
  const [sizes, setSizes] = useState<PanelSizes>(DEFAULT_SIZES);
  const [isResizing, setIsResizing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSizes({
          leftWidth: Math.max(MIN_PANEL_WIDTH, parsed.leftWidth || DEFAULT_SIZES.leftWidth),
          rightWidth: Math.max(MIN_PANEL_WIDTH, parsed.rightWidth || DEFAULT_SIZES.rightWidth),
        });
      }
    } catch (err) {
      console.error('Failed to load panel sizes:', err);
    }
  }, []);

  // Save to localStorage when sizes change
  const saveSizes = useCallback((newSizes: PanelSizes) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSizes));
      setSizes(newSizes);
    } catch (err) {
      console.error('Failed to save panel sizes:', err);
    }
  }, []);

  const handleLeftDragStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleLeftDragEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleLeftDrag = useCallback(
    (deltaX: number) => {
      setSizes((prev) => {
        const newLeftWidth = Math.max(MIN_PANEL_WIDTH, prev.leftWidth + deltaX);
        return { ...prev, leftWidth: newLeftWidth };
      });
    },
    []
  );

  const handleRightDragStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleRightDragEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleRightDrag = useCallback(
    (deltaX: number) => {
      setSizes((prev) => {
        // Dragging right edge from right to left decreases width (negative delta)
        const newRightWidth = Math.max(MIN_PANEL_WIDTH, prev.rightWidth - deltaX);
        return { ...prev, rightWidth: newRightWidth };
      });
    },
    []
  );

  // Persist sizes after they stabilize
  useEffect(() => {
    if (!isResizing) {
      saveSizes(sizes);
    }
  }, [isResizing, sizes, saveSizes]);

  return {
    sizes,
    isResizing,
    handleLeftDragStart,
    handleLeftDragEnd,
    handleLeftDrag,
    handleRightDragStart,
    handleRightDragEnd,
    handleRightDrag,
  };
}
