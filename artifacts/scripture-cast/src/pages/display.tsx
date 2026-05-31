import React, { useEffect } from 'react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { usePresentationSocket } from '@/hooks/use-presentation-socket';
import { motion, AnimatePresence } from 'framer-motion';

export function DisplayPreview() {
  const { active, cleared, verse, typography, background, transition } = usePresentationStore();

  const getBackgroundStyle = () => {
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
      textShadow = '2px 4px 10px rgba(0,0,0,0.8)';
    }
    if (typography.outline) {
      const w = typography.outlineWidth || 2;
      const outlineShadow = `-${w}px -${w}px 0 #000, ${w}px -${w}px 0 #000, -${w}px ${w}px 0 #000, ${w}px ${w}px 0 #000`;
      textShadow = textShadow !== 'none' ? `${outlineShadow}, ${textShadow}` : outlineShadow;
    }

    return {
      fontFamily: typography.fontFamily ? `"${typography.fontFamily}", sans-serif` : 'inherit',
      fontSize: `${typography.fontSize || 56}px`,
      fontWeight: typography.fontWeight || 'bold',
      textAlign: (typography.textAlign as any) || 'center',
      color: typography.textColor || '#fff',
      lineHeight: typography.lineHeight || 1.5,
      textShadow,
    };
  };

  const showContent = active && !cleared && verse;

  // Animation variants
  const getVariants = () => {
    const dur = (transition?.duration || 500) / 1000;
    
    if (transition?.type === 'slide') {
      return {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0, transition: { duration: dur } },
        exit: { opacity: 0, y: -50, transition: { duration: dur } }
      };
    }
    
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: dur } },
      exit: { opacity: 0, transition: { duration: dur } }
    };
  };

  return (
    <div 
      className="w-full h-full overflow-hidden flex flex-col items-center justify-center p-8 relative"
      style={getBackgroundStyle()}
    >
      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            key={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
            variants={getVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-[85%] w-full flex flex-col gap-6"
            style={getTypographyStyle()}
          >
            <div className="whitespace-pre-wrap">{verse.text}</div>
            
            {typography?.showReference && verse.reference && (
              <div 
                className="opacity-70 mt-4" 
                style={{ fontSize: `${Math.max(20, (typography.fontSize || 56) * 0.6)}px` }}
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
    document.body.style.backgroundColor = '#000';
    return () => {
      document.body.style.backgroundColor = '';
    }
  }, []);

  return <DisplayPreview />;
}
