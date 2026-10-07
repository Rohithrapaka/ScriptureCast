import React, { useEffect } from 'react';
import { usePresentationStore, type LyricSlide } from '@/hooks/use-presentation-store';
import { usePresentationSocket } from '@/hooks/use-presentation-socket';
import { motion, AnimatePresence } from 'framer-motion';


// ── Font weight string → CSS numeric value ───────────────────────────────────

const FONT_WEIGHT_MAP: Record<string, string> = {
  light:   '300',
  regular: '400',
  medium:  '500',
  bold:    '700',
};

// ── Auto-scale: returns a font multiplier based on combined text length ──────

function computeAutoScale(
  text: string,
  textEnglish: string | null | undefined,
  language: string,
): number {
  let n = 0;
  if (language === 'telugu' || language === 'both') n += text.length;
  if ((language === 'english' || language === 'both') && textEnglish) {
    n += Math.round(textEnglish.length * 0.75); // English chars are narrower
  }
  if (n < 60)  return 1.40;
  if (n < 120) return 1.20;
  if (n < 200) return 1.00;
  if (n < 320) return 0.85;
  if (n < 480) return 0.70;
  return 0.58;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clampSize(base: number) {
  const vw  = (base / 14).toFixed(2);
  const min = Math.round(base * 0.45);
  const max = Math.round(base * 1.8);
  return `clamp(${min}px, ${vw}vw, ${max}px)`;
}

// ── Shared DisplayPreview ─────────────────────────────────────────────────────
// Used by both the full Display page and the admin PreviewPanel (scaled inside
// a 1920×1080 container). All layout decisions use 16:9 stage scaling so the
// scaling works pixel-perfectly at any viewport or transform size.

export function DisplayPreview({ interactive = false }: { interactive?: boolean }) {
  const {
    active, cleared, contentType = 'bible', verse, lyric, typography, background, transition,
    language = 'telugu',
    layout   = 'stack',
    setPresentationState,
  } = usePresentationStore();

  // ── Stage scaling: 16:9 aspect-fit container ──────────────────────────────
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = React.useState({ width: 1920, height: 1080, scale: 1 });

  // ── Invisible interactive drag & resize state with auto-scaling ───────────
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeEdge, setResizeEdge] = React.useState<'left' | 'right' | null>(null);

  const [dragStart, setDragStart] = React.useState({
    clientX: 0,
    clientY: 0,
    initialX: 50,
    initialY: 50,
  });

  const [resizeStart, setResizeStart] = React.useState({
    clientX: 0,
    initialWidth: 85,
    initialFontSize: 56,
  });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = el.clientWidth || window.innerWidth || 1920;
      const h = el.clientHeight || window.innerHeight || 1080;
      const targetRatio = 16 / 9;
      const currentRatio = w / h;

      let stageW: number;
      let stageH: number;

      if (currentRatio > targetRatio) {
        stageH = h;
        stageW = h * targetRatio;
      } else {
        stageW = w;
        stageH = w / targetRatio;
      }

      setStageSize({
        width: Math.round(stageW),
        height: Math.round(stageH),
        scale: stageW / 1920,
      });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    window.addEventListener('resize', updateSize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // ── Broadcast position & styling update to server & store ──────────────────
  const broadcastLyricPatch = React.useCallback((patch: Partial<LyricSlide>) => {
    if (!lyric) return;
    const updatedLyric: LyricSlide = {
      ...lyric,
      ...patch,
    };

    setPresentationState({
      active: true,
      cleared: false,
      contentType: 'song',
      lyric: updatedLyric,
    });

    fetch('/api/presentation/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        active: true,
        cleared: false,
        contentType: 'song',
        lyric: updatedLyric,
      }),
    }).catch(console.error);
  }, [lyric, setPresentationState]);

  // ── Mouse Drag & Resize Listeners (Direct Auto Font-Scaling) ───────────────
  const handleMouseDownLyric = (e: React.MouseEvent) => {
    if (!interactive || !lyric) return;
    if ((e.target as HTMLElement).closest('[data-handle]')) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      initialX: lyric.x ?? 50,
      initialY: lyric.y ?? 50,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, edge: 'left' | 'right') => {
    if (!interactive || !lyric) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeEdge(edge);
    setResizeStart({
      clientX: e.clientX,
      initialWidth: lyric.width ?? 85,
      initialFontSize: lyric.fontSize ?? 56,
    });
  };

  React.useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const stageEl = stageRef.current;
      if (!stageEl || !lyric) return;
      const rect = stageEl.getBoundingClientRect();

      if (isDragging) {
        const deltaX = e.clientX - dragStart.clientX;
        const deltaY = e.clientY - dragStart.clientY;
        const deltaPercentX = (deltaX / rect.width) * 100;
        const deltaPercentY = (deltaY / rect.height) * 100;

        const newX = Math.max(5, Math.min(95, Math.round(dragStart.initialX + deltaPercentX)));
        const newY = Math.max(5, Math.min(95, Math.round(dragStart.initialY + deltaPercentY)));

        broadcastLyricPatch({ x: newX, y: newY });
      }

      // Auto scale font proportionally as box width expands or contracts
      if (isResizing && resizeEdge) {
        const deltaX = e.clientX - resizeStart.clientX;
        const deltaPercentX = (deltaX / rect.width) * 100;

        let newWidth: number;
        if (resizeEdge === 'right') {
          newWidth = Math.max(30, Math.min(98, Math.round(resizeStart.initialWidth + deltaPercentX)));
        } else {
          newWidth = Math.max(30, Math.min(98, Math.round(resizeStart.initialWidth - deltaPercentX)));
        }

        const widthRatio = newWidth / (resizeStart.initialWidth || 1);
        const startFontSize = resizeStart.initialFontSize || 56;
        const newFontSize = Math.max(20, Math.min(120, Math.round(startFontSize * widthRatio)));

        broadcastLyricPatch({ width: newWidth, fontSize: newFontSize });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeEdge(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeEdge, dragStart, resizeStart, lyric, broadcastLyricPatch]);

  // ── Keyboard Corrections on /display ──────────────────────────────────────
  React.useEffect(() => {
    if (!interactive || !lyric) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const step = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        broadcastLyricPatch({ y: Math.max(5, (lyric.y ?? 50) - step) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        broadcastLyricPatch({ y: Math.min(95, (lyric.y ?? 50) + step) });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        broadcastLyricPatch({ x: Math.max(5, (lyric.x ?? 50) - step) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        broadcastLyricPatch({ x: Math.min(95, (lyric.x ?? 50) + step) });
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        broadcastLyricPatch({ x: 50, y: 50 });
      } else if (e.key === ']' || e.key === '=' || e.key === '+') {
        e.preventDefault();
        const currentW = lyric.width ?? 85;
        const currentF = lyric.fontSize ?? 56;
        broadcastLyricPatch({
          width: Math.min(98, currentW + 2),
          fontSize: Math.min(120, currentF + 2),
        });
      } else if (e.key === '[' || e.key === '-' || e.key === '_') {
        e.preventDefault();
        const currentW = lyric.width ?? 85;
        const currentF = lyric.fontSize ?? 56;
        broadcastLyricPatch({
          width: Math.max(30, currentW - 2),
          fontSize: Math.max(20, currentF - 2),
        });
      } else if (e.key === '0') {
        e.preventDefault();
        broadcastLyricPatch({ x: 50, y: 50, width: 85, fontSize: 56 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactive, lyric, broadcastLyricPatch]);

  // ── Background ──────────────────────────────────────────────────────────

  const bgStyle = (): React.CSSProperties => {
    if (!background) return { backgroundColor: '#000' };
    if (background.type === 'solid')
      return { backgroundColor: background.color || '#000' };
    if (background.type === 'gradient')
      return {
        backgroundImage: `linear-gradient(${background.gradientDirection || 'to bottom'}, ${background.gradientStart || '#000'}, ${background.gradientEnd || '#1a1a1a'})`,
      };
    if (background.type === 'transparent')
      return { backgroundColor: 'transparent', backgroundImage: 'none' };
    if (background.type === 'image' && background.imageUrl)
      return {
        backgroundImage:    `url(${background.imageUrl})`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundRepeat:   'no-repeat',
      };
    return { backgroundColor: '#000' };
  };

  // ── Typography ──────────────────────────────────────────────────────────

  const textShadowStr = (shadow?: boolean, outline?: boolean, outlineWidth?: number): string => {
    const hasShadow = shadow !== undefined ? shadow : typography?.shadow;
    const hasOutline = outline !== undefined ? outline : typography?.outline;
    const w = outlineWidth || typography?.outlineWidth || 2;

    let s = 'none';
    if (hasShadow) s = '2px 4px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)';
    if (hasOutline) {
      const out = `-${w}px -${w}px 0 #000, ${w}px -${w}px 0 #000, -${w}px ${w}px 0 #000, ${w}px ${w}px 0 #000`;
      s = s !== 'none' ? `${out}, ${s}` : out;
    }
    return s;
  };

  const typographyStyle = (scaleMult = 1.0): React.CSSProperties => {
    if (!typography) return {};
    const base      = typography.fontSize || 56;
    const autoMult  = (typography.autoScale && verse)
      ? computeAutoScale(verse.text, verse.textEnglish, language)
      : 1.0;
    const scaled = base * autoMult * scaleMult;
    const cssWeight = FONT_WEIGHT_MAP[typography.fontWeight ?? 'bold'] ?? typography.fontWeight ?? '700';
    return {
      fontFamily:  typography.fontFamily ? `"${typography.fontFamily}", sans-serif` : 'inherit',
      fontSize:    clampSize(scaled),
      fontWeight:  cssWeight,
      textAlign:   (typography.textAlign as React.CSSProperties['textAlign']) || 'center',
      color:       typography.textColor || '#fff',
      lineHeight:  typography.lineHeight || 1.4,
      letterSpacing: typography.letterSpacing ? `${typography.letterSpacing}px` : undefined,
      textShadow:  textShadowStr(),
    };
  };

  const lyricTypographyStyle = (item: LyricSlide): React.CSSProperties => {
    const font = item.fontFamily || typography?.fontFamily || 'Noto Sans Telugu';
    const baseSize = item.fontSize || typography?.fontSize || 56;
    const scaledSize = Math.max(14, Math.round(baseSize * stageSize.scale));
    const weightKey = item.fontWeight || typography?.fontWeight || 'bold';
    const cssWeight = FONT_WEIGHT_MAP[weightKey] ?? weightKey ?? '700';
    const align = (item.textAlign || typography?.textAlign || 'center') as React.CSSProperties['textAlign'];
    const color = item.textColor || typography?.textColor || '#ffffff';
    const lh = item.lineHeight || typography?.lineHeight || 1.4;
    const ls = item.letterSpacing !== undefined ? item.letterSpacing : (typography?.letterSpacing || 0);

    return {
      fontFamily: `"${font}", sans-serif`,
      fontSize: `${scaledSize}px`,
      fontWeight: cssWeight,
      textAlign: align,
      color: color,
      lineHeight: lh,
      letterSpacing: ls ? `${ls * stageSize.scale}px` : undefined,
      textShadow: textShadowStr(item.shadow, item.outline, item.outlineWidth),
    };
  };

  const refStyle = (scaleMult = 1.0): React.CSSProperties => {
    if (!typography) return {};
    const autoBase = (typography.fontSize || 56) * 0.52;
    const refBase  = (typography.refFontSize && typography.refFontSize > 0)
      ? typography.refFontSize
      : autoBase;
    const autoMult = (typography.autoScale && verse)
      ? computeAutoScale(verse.text, verse.textEnglish, language)
      : 1.0;
    const weightKey = typography.refFontWeight || typography.fontWeight || 'bold';
    const cssWeight = FONT_WEIGHT_MAP[weightKey] ?? weightKey;
    return {
      fontSize:   clampSize(refBase * autoMult * scaleMult),
      color:      typography.textColor || '#fff',
      fontFamily: typography.fontFamily ? `"${typography.fontFamily}", sans-serif` : 'inherit',
      textAlign:  (typography.textAlign as React.CSSProperties['textAlign']) || 'center',
      fontWeight: cssWeight,
    };
  };

  // ── Transition variants ─────────────────────────────────────────────────

  const getVariants = (type?: string, durMs?: number) => {
    const dur = (durMs ?? transition?.duration ?? 500) / 1000;
    const t = type ?? transition?.type ?? 'fade';

    if (t === 'none') {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1, transition: { duration: 0 } },
        exit:    { opacity: 1, transition: { duration: 0 } },
      };
    }
    if (t === 'slide' || t === 'slide-up') {
      return {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0,  transition: { duration: dur, ease: [0.16, 1, 0.3, 1] as const } },
        exit:    { opacity: 0, y: -40, transition: { duration: dur * 0.75, ease: [0.7, 0, 0.84, 0] as const } },
      };
    }
    if (t === 'slide-down') {
      return {
        initial: { opacity: 0, y: -50 },
        animate: { opacity: 1, y: 0,  transition: { duration: dur, ease: [0.16, 1, 0.3, 1] as const } },
        exit:    { opacity: 0, y: 40,  transition: { duration: dur * 0.75, ease: [0.7, 0, 0.84, 0] as const } },
      };
    }
    if (t === 'slide-left') {
      return {
        initial: { opacity: 0, x: 70 },
        animate: { opacity: 1, x: 0,  transition: { duration: dur, ease: [0.16, 1, 0.3, 1] as const } },
        exit:    { opacity: 0, x: -60, transition: { duration: dur * 0.75, ease: [0.7, 0, 0.84, 0] as const } },
      };
    }
    if (t === 'slide-right') {
      return {
        initial: { opacity: 0, x: -70 },
        animate: { opacity: 1, x: 0,  transition: { duration: dur, ease: [0.16, 1, 0.3, 1] as const } },
        exit:    { opacity: 0, x: 60,  transition: { duration: dur * 0.75, ease: [0.7, 0, 0.84, 0] as const } },
      };
    }
    // Default fade / crossfade
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: dur, ease: 'easeInOut' as const } },
      exit:    { opacity: 0, transition: { duration: dur * 0.75, ease: 'easeInOut' as const } },
    };
  };

  // ── Content flags ───────────────────────────────────────────────────────

  const isSongMode = contentType === 'song';
  const showBibleContent = !isSongMode && active && !cleared && verse;
  const showSongContent  = isSongMode && active && !cleared && lyric;

  const showTelugu    = language === 'telugu' || language === 'both';
  const showEnglish   = language === 'english' || language === 'both';
  const isBoth        = language === 'both';
  const isSideBySide  = isBoth && layout === 'side-by-side';
  const isStack       = isBoth && layout === 'stack';

  // ── Reference line ──────────────────────────────────────────────────────

  const refLine = (() => {
    if (!verse) return '';
    const tel = verse.reference;
    const eng = verse.referenceEnglish
      ?? `${(verse as { englishName?: string }).englishName || verse.bookName} ${verse.chapter}:${verse.verse}`;
    if (language === 'telugu')  return tel;
    if (language === 'english') return eng;
    return `${eng}  ·  ${tel}`;
  })();

  const dividerColor = `${typography?.textColor || '#ffffff'}33`;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden flex items-center justify-center relative select-none"
      style={bgStyle()}
    >
      {/* ── 16:9 Logical Presentation Stage (Guarantees 1:1 preview match) ── */}
      <div
        ref={stageRef}
        className="relative overflow-hidden flex items-center justify-center select-none"
        style={{
          width: `${stageSize.width}px`,
          height: `${stageSize.height}px`,
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: '16/9',
          padding: isSongMode ? 0 : 'clamp(16px, 4vw, 80px)',
        }}
      >
        {/* ── BIBLE PRESENTATION MODE ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {showBibleContent && (
            <motion.div
              key={`bible-${verse.bookId}-${verse.chapter}-${verse.verse}-${language}-${layout}`}
              variants={getVariants(transition?.type, transition?.duration)}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-[88%] w-full flex flex-col pointer-events-none select-none"
              style={{ gap: 'clamp(10px, 2vw, 36px)' }}
            >
              {/* Side-by-side layout */}
              {isSideBySide && (
                <div className="flex gap-[4%] items-start w-full">
                  {showTelugu && (
                    <div
                      className="flex-1 whitespace-pre-wrap"
                      style={typographyStyle(0.9)}
                    >
                      {verse.text}
                    </div>
                  )}
                  <div style={{
                    width: '1px',
                    alignSelf: 'stretch',
                    background: dividerColor,
                    flexShrink: 0,
                    marginTop: '0.2em',
                  }} />
                  {showEnglish && (
                    <div
                      className="flex-1 whitespace-pre-wrap"
                      style={{ ...typographyStyle(0.9), opacity: 0.92 }}
                    >
                      {verse.textEnglish ?? '—'}
                    </div>
                  )}
                </div>
              )}

              {/* Stack bilingual */}
              {isStack && (
                <>
                  {showTelugu && (
                    <div className="whitespace-pre-wrap" style={typographyStyle()}>
                      {verse.text}
                    </div>
                  )}
                  {showEnglish && verse.textEnglish && (
                    <div
                      className="whitespace-pre-wrap"
                      style={{
                        ...typographyStyle(0.75),
                        opacity: 0.80,
                        fontWeight: 'normal',
                      }}
                    >
                      {verse.textEnglish}
                    </div>
                  )}
                </>
              )}

              {/* Single language */}
              {!isSideBySide && !isStack && (
                <div className="whitespace-pre-wrap" style={typographyStyle()}>
                  {language === 'english' ? (verse.textEnglish ?? verse.text) : verse.text}
                </div>
              )}

              {/* Reference */}
              {typography?.showReference && refLine && (
                <div className="opacity-70" style={refStyle()}>
                  {refLine}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SONG LYRIC PRESENTATION MODE (Direct Position & Sizing Control — NO HUD, NO BOXES) ── */}
        {showSongContent && lyric && (
          <div
            className={`absolute select-none group ${interactive ? (isDragging ? 'cursor-grabbing ring-1 ring-amber-400/40 rounded-lg' : isResizing ? 'cursor-col-resize ring-1 ring-amber-400/40 rounded-lg' : 'cursor-grab hover:ring-1 hover:ring-white/20 rounded-lg') : 'pointer-events-none'}`}
            style={{
              left: `${lyric.x ?? 50}%`,
              top: `${lyric.y ?? 50}%`,
              width: `${lyric.width ?? 85}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: interactive ? 'auto' : 'none',
              transition: isDragging || isResizing ? 'none' : 'box-shadow 0.15s ease',
            }}
            onMouseDown={handleMouseDownLyric}
          >
            {/* Edge resize handles with clear visual indicator on hover */}
            {interactive && (
              <>
                {/* Left Edge Handle */}
                <div
                  data-handle="left"
                  onMouseDown={(e) => handleResizeStart(e, 'left')}
                  className="absolute top-0 left-0 -translate-x-1/2 w-8 h-full cursor-col-resize z-20 flex items-center justify-center group/edge"
                  title="Drag edge to resize box width & font size"
                >
                  <div className="w-1 h-14 rounded-full bg-amber-400/50 group-hover/edge:bg-amber-400 group-hover:opacity-100 opacity-0 transition-all shadow-md group-hover/edge:scale-y-125" />
                </div>

                {/* Right Edge Handle */}
                <div
                  data-handle="right"
                  onMouseDown={(e) => handleResizeStart(e, 'right')}
                  className="absolute top-0 right-0 translate-x-1/2 w-8 h-full cursor-col-resize z-20 flex items-center justify-center group/edge"
                  title="Drag edge to resize box width & font size"
                >
                  <div className="w-1 h-14 rounded-full bg-amber-400/50 group-hover/edge:bg-amber-400 group-hover:opacity-100 opacity-0 transition-all shadow-md group-hover/edge:scale-y-125" />
                </div>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={`lyric-${lyric.id}-${lyric.sectionId}`}
                variants={getVariants(lyric.transitionType, lyric.transitionDuration)}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex flex-col justify-center pointer-events-none select-none"
              >
                {/* Primary lyrics */}
                <div
                  className="whitespace-pre-wrap leading-tight drop-shadow-md"
                  style={lyricTypographyStyle(lyric)}
                >
                  {lyric.textPrimary}
                </div>

                {/* Secondary lyrics (transliteration / second language) */}
                {lyric.textSecondary && (
                  <div
                    className="whitespace-pre-wrap mt-3 opacity-80"
                    style={{
                      ...lyricTypographyStyle(lyric),
                      fontSize: `${Math.max(11, Math.round((lyric.fontSize || 56) * 0.65 * stageSize.scale))}px`,
                      fontWeight: 'normal',
                    }}
                  >
                    {lyric.textSecondary}
                  </div>
                )}

                {/* Subtle section label at bottom */}
                {lyric.sectionLabel && (
                  <div
                    className="mt-4 text-xs tracking-wider uppercase opacity-40 font-mono"
                    style={{ textAlign: (lyric.textAlign as any) || 'center' }}
                  >
                    {lyric.songTitle ? `${lyric.songTitle} · ` : ''}{lyric.sectionLabel}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Display() {
  usePresentationSocket();

  useEffect(() => {
    const prev = {
      bg:       document.body.style.backgroundColor,
      overflow: document.body.style.overflow,
      margin:   document.body.style.margin,
    };
    document.body.style.backgroundColor = '#000';
    document.body.style.overflow        = 'hidden';
    document.body.style.margin          = '0';
    return () => {
      document.body.style.backgroundColor = prev.bg;
      document.body.style.overflow        = prev.overflow;
      document.body.style.margin          = prev.margin;
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}>
      <DisplayPreview interactive={true} />
    </div>
  );
}



