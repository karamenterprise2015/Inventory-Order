'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight, Check, ArrowRight } from 'lucide-react';

export default function SwipeConfirm({ onConfirm, isSubmitting, isSuccess }) {
  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const handleWidth = 52;
  const padding = 4;

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1025);
    checkDesktop();

    if (trackRef.current) {
      setTrackWidth(trackRef.current.clientWidth);
    }

    const handleResize = () => {
      checkDesktop();
      if (trackRef.current) {
        setTrackWidth(trackRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxDistance = Math.max(0, trackWidth - handleWidth - padding * 2);
  const x = useMotionValue(0);
  const textOpacity = useTransform(x, [0, maxDistance * 0.6], [1, 0]);
  const progressBgWidth = useTransform(x, (value) => `${value + handleWidth / 2}px`);

  const handleDragEnd = (event, info) => {
    if (isSubmitting || isSuccess) return;
    if (info.offset.x >= maxDistance * 0.8) {
      onConfirm();
    }
  };

  // Desktop: Click button
  if (isDesktop) {
    return (
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(230, 126, 34, 0.35)' }}
        whileTap={{ scale: 0.98 }}
        onClick={!isSubmitting && !isSuccess ? onConfirm : undefined}
        disabled={isSubmitting || isSuccess}
        style={{
          ...styles.desktopButton,
          background: isSuccess
            ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
            : isSubmitting
            ? 'linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%)'
            : 'var(--accent-gradient)',
          cursor: isSubmitting ? 'wait' : 'pointer',
        }}
      >
        {isSuccess ? (
          <>
            <Check size={22} strokeWidth={3} />
            <span>Order Placed!</span>
          </>
        ) : isSubmitting ? (
          <>
            <div style={styles.spinner} />
            <span>Placing Order...</span>
          </>
        ) : (
          <>
            <span>Place Order</span>
            <ArrowRight size={20} strokeWidth={2.5} />
          </>
        )}
      </motion.button>
    );
  }

  // Mobile: Swipe track
  return (
    <div
      ref={trackRef}
      style={{
        ...styles.track,
        backgroundColor: isSuccess
          ? 'var(--success)'
          : isSubmitting
          ? 'var(--accent-light)'
          : 'var(--surface-secondary)',
        borderColor: isSuccess ? 'var(--success)' : 'var(--border)',
      }}
    >
      {/* Fill behind handle */}
      <motion.div
        style={{
          ...styles.slideFill,
          width: isSuccess || isSubmitting ? '100%' : progressBgWidth,
          backgroundColor: isSuccess
            ? 'var(--success)'
            : 'rgba(230, 126, 34, 0.15)',
        }}
      />

      {/* Label */}
      <motion.span
        style={{
          ...styles.label,
          opacity: isSuccess || isSubmitting ? 0 : textOpacity,
          color: 'var(--text-secondary)',
        }}
      >
        Swipe to Place Order →
      </motion.span>

      {/* Center status */}
      {(isSubmitting || isSuccess) && (
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...styles.centerLabel,
            color: isSuccess ? '#ffffff' : 'var(--accent)',
          }}
        >
          {isSuccess ? 'Order Placed! ✓' : 'Placing Order...'}
        </motion.span>
      )}

      {/* Drag Handle */}
      <motion.div
        drag={!isSubmitting && !isSuccess ? 'x' : false}
        dragConstraints={{ left: 0, right: maxDistance }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{
          ...styles.handle,
          x: isSuccess || isSubmitting ? maxDistance : x,
          backgroundColor: isSuccess
            ? '#ffffff'
            : isSubmitting
            ? 'transparent'
            : undefined,
          background: !isSuccess && !isSubmitting ? 'var(--accent-gradient)' : undefined,
          color: isSuccess
            ? 'var(--success)'
            : isSubmitting
            ? 'var(--accent)'
            : '#ffffff',
          boxShadow: isSuccess ? 'none' : '0 4px 16px rgba(230, 126, 34, 0.3)',
        }}
        animate={{
          x: isSuccess || isSubmitting ? maxDistance : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 28,
        }}
        whileDrag={{ scale: 1.08 }}
        whileHover={!isSubmitting && !isSuccess ? { scale: 1.05 } : {}}
      >
        {isSuccess ? (
          <Check size={22} strokeWidth={3} className="success-zoom" />
        ) : isSubmitting ? (
          <div style={styles.spinnerSmall} />
        ) : (
          <ChevronRight size={24} strokeWidth={2.5} />
        )}
      </motion.div>
    </div>
  );
}

const styles = {
  /* Desktop button */
  desktopButton: {
    width: '100%',
    height: '56px',
    borderRadius: 'var(--radius-md)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.01em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    border: 'none',
    boxShadow: '0 4px 20px rgba(230, 126, 34, 0.25)',
    transition: 'all 0.2s ease',
  },

  /* Mobile swipe track */
  track: {
    position: 'relative',
    height: '60px',
    borderRadius: 'var(--radius-full)',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '4px',
    userSelect: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  slideFill: {
    position: 'absolute',
    left: 4,
    height: '52px',
    borderRadius: 'var(--radius-full)',
    pointerEvents: 'none',
  },
  label: {
    fontSize: '15px',
    fontWeight: '700',
    letterSpacing: '-0.01em',
    pointerEvents: 'none',
    zIndex: 2,
  },
  centerLabel: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '15px',
    fontWeight: '700',
    pointerEvents: 'none',
    zIndex: 2,
  },
  handle: {
    position: 'absolute',
    left: '4px',
    width: '52px',
    height: '52px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    zIndex: 10,
    touchAction: 'none',
  },
  spinner: {
    width: '22px',
    height: '22px',
    border: '2.5px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2.5px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  spinnerSmall: {
    width: '22px',
    height: '22px',
    border: '2.5px solid rgba(230, 126, 34, 0.2)',
    borderTop: '2.5px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
