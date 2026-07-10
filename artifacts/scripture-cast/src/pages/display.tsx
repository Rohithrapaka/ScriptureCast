import React, { useEffect } from 'react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
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
// a 1920×1080 container). All layout decisions use vw-relative units so the
// scaling works pixel-perfectly at any viewport or transform size.

export function DisplayPreview() {
  const {
    active, cleared, verse, typography, background, transition,
    language = 'telugu',
    layout   = 'stack',
  } = usePresentationStore();

  // ── Background ──────────────────────────────────────────────────────────

  const bgStyle = (): React.CSSProperties => {
    if (!background) return { backgroundColor: '#000' };
    if (background.type === 'solid')
      return { backgroundColor: background.color || '#000' };
    if (background.type === 'gradient')
      return {
        backgroundImage: `linear-gradient(${background.gradientDirection || 'to bottom'}, ${background.gradientStart || '#000'}, ${background.gradientEnd || '#1a1a1a'})`,
      };
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

  const textShadowStr = (): string => {
    if (!typography) return 'none';
    let s = 'none';
    if (typography.shadow) s = '2px 4px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)';
    if (typography.outline) {
      const w = typography.outlineWidth || 2;
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
      textShadow:  textShadowStr(),
    };
  };

  const refStyle = (scaleMult = 1.0): React.CSSProperties => {
    if (!typography) return {};
    // Use configuredRefSize if set (> 0), otherwise fall back to 52% of main
    const autoBase = (typography.fontSize || 56) * 0.52;
    const refBase  = (typography.refFontSize && typography.refFontSize > 0)
      ? typography.refFontSize
      : autoBase;
    const autoMult = (typography.autoScale && verse)
      ? computeAutoScale(verse.text, verse.textEnglish, language)
      : 1.0;
    // Use refFontWeight if set, otherwise fall back to main fontWeight
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

  const variants = (() => {
    const dur = (transition?.duration || 500) / 1000;
    if (transition?.type === 'slide') return {
      initial: { opacity: 0, y: 60 },
      animate: { opacity: 1, y: 0,  transition: { duration: dur,       ease: 'easeOut' as const } },
      exit:    { opacity: 0, y: -40, transition: { duration: dur * 0.7, ease: 'easeIn'  as const } },
    };
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: dur } },
      exit:    { opacity: 0, transition: { duration: dur * 0.7 } },
    };
  })();

  // ── Content flags ───────────────────────────────────────────────────────

  const showContent   = active && !cleared && verse;
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

  // ── Divider colour (semi-transparent text colour) ───────────────────────

  const dividerColor = `${typography?.textColor || '#ffffff'}33`;

  return (
    <div
      className="w-full h-full overflow-hidden flex flex-col items-center justify-center relative"
      style={{ padding: 'clamp(16px, 4vw, 80px)', ...bgStyle() }}
    >
      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            key={`${verse.bookId}-${verse.chapter}-${verse.verse}-${language}-${layout}`}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-[88%] w-full flex flex-col"
            style={{ gap: 'clamp(10px, 2vw, 36px)' }}
          >
            {/* ── Side-by-side layout ───────────────────────────────────── */}
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

            {/* ── Stack bilingual ───────────────────────────────────────── */}
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

            {/* ── Single language ───────────────────────────────────────── */}
            {!isSideBySide && !isStack && (
              <div className="whitespace-pre-wrap" style={typographyStyle()}>
                {language === 'english' ? (verse.textEnglish ?? verse.text) : verse.text}
              </div>
            )}

            {/* ── Reference ─────────────────────────────────────────────── */}
            {typography?.showReference && refLine && (
              <div className="opacity-70" style={refStyle()}>
                {refLine}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
      <DisplayPreview />
    </div>
  );
}
