import React, { useEffect } from 'react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { usePresentationSocket } from '@/hooks/use-presentation-socket';
import { motion, AnimatePresence } from 'framer-motion';

export function DisplayPreview() {
  const { active, cleared, verse, typography, background, transition } = usePresentationStore();

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) return { backgroundColor: '#000' };
    if (background.type === 'solid') {
      return { backgroundColor: background.color || '#000' };
    }
    if (background.type === 'gradient') {
      return {
        backgroundImage: `linear-gradient(${background.gradientDirection || 'to bottom'}, ${background.gradientStart || '#000'}, ${background.gradientEnd || '#1a1a1a'})`
      };
    }
    if (background.type === 'image' && background.imageUrl) {
      return {
        backgroundImage: `url(${background.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return { backgroundColor: '#000' };
  };

  const getTypographyStyle = (): React.CSSProperties => {
    if (!typography) return {};

    let textShadow = 'none';
    if (typography.shadow) {
      textShadow = '2px 4px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)';
    }
    if (typography.outline) {
      const w = typography.outlineWidth || 2;
      const outlineShadow = `-${w}px -${w}px 0 #000, ${w}px -${w}px 0 #000, -${w}px ${w}px 0 #000, ${w}px ${w}px 0 #000`;
      textShadow = textShadow !== 'none' ? `${outlineShadow}, ${textShadow}` : outlineShadow;
    }

    // Viewport-responsive font sizing using clamp()
    // The fontSize slider (20–120) acts as a scaling factor:
    //   min = fontSize * 0.45 (px baseline for small screens)
    //   vw  = fontSize / 14   (4vw at default 56, scales proportionally)
    //   max = fontSize * 1.8  (px ceiling for very large displays)
    const base = typography.fontSize || 56;
    const vwVal = (base / 14).toFixed(2);
    const minPx = Math.round(base * 0.45);
    const maxPx = Math.round(base * 1.8);
    const fontSizeCss = `clamp(${minPx}px, ${vwVal}vw, ${maxPx}px)`;

    return {
      fontFamily: typography.fontFamily ? `"${typography.fontFamily}", sans-serif` : 'inherit',
      fontSize: fontSizeCss,
      fontWeight: typography.fontWeight || 'bold',
      textAlign: (typography.textAlign as React.CSSProperties['textAlign']) || 'center',
      color: typography.textColor || '#fff',
      lineHeight: typography.lineHeight || 1.4,
      textShadow,
    };
  };

  const getReferenceSizeStyle = (): React.CSSProperties => {
    const base = typography?.fontSize || 56;
    const refBase = base * 0.55;
    const vwVal = (refBase / 14).toFixed(2);
    const minPx = Math.round(refBase * 0.45);
    const maxPx = Math.round(refBase * 1.8);
    return { fontSize: `clamp(${minPx}px, ${vwVal}vw, ${maxPx}px)` };
  };

  const showContent = active && !cleared && verse;

  const getVariants = () => {
    const dur = (transition?.duration || 500) / 1000;
    if (transition?.type === 'slide') {
      return {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0, transition: { duration: dur, ease: 'easeOut' as const } },
        exit: { opacity: 0, y: -40, transition: { duration: dur * 0.7, ease: 'easeIn' as const } }
      };
    }
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: dur } },
      exit: { opacity: 0, transition: { duration: dur * 0.7 } }
    };
  };

  return (
    <div
      className="w-full h-full overflow-hidden flex flex-col items-center justify-center relative"
      style={{ padding: 'clamp(16px, 4vw, 80px)', ...getBackgroundStyle() }}
    >
      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            key={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
            variants={getVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-[88%] w-full flex flex-col"
            style={{ gap: 'clamp(12px, 2vw, 40px)' }}
          >
            <div
              className="whitespace-pre-wrap leading-relaxed"
              style={getTypographyStyle()}
            >
              {verse.text}
            </div>

            {typography?.showReference && verse.reference && (
              <div
                className="opacity-75"
                style={{
                  ...getReferenceSizeStyle(),
                  color: typography?.textColor || '#fff',
                  fontFamily: typography?.fontFamily ? `"${typography.fontFamily}", sans-serif` : 'inherit',
                  textAlign: (typography?.textAlign as React.CSSProperties['textAlign']) || 'center',
                }}
              >
                {verse.reference}
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
    // Fill entire viewport — no scroll, no bars
    const prev = {
      bgColor: document.body.style.backgroundColor,
      overflow: document.body.style.overflow,
      margin: document.body.style.margin,
    };
    document.body.style.backgroundColor = '#000';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    return () => {
      document.body.style.backgroundColor = prev.bgColor;
      document.body.style.overflow = prev.overflow;
      document.body.style.margin = prev.margin;
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}>
      <DisplayPreview />
    </div>
  );
}
