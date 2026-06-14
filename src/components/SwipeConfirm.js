'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';

export default function SwipeConfirm({ onConfirm, isSubmitting, isSuccess }) {
  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const handleWidth = 48; // handle diameter
  const padding = 4; // track internal padding
  
  // Track width on resize/mount
  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.clientWidth);
    }
    const handleResize = () => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxDistance = Math.max(0, trackWidth - handleWidth - padding * 2);

  // Framer Motion Drag values
  const x = useMotionValue(0);
  
  // Transform values for text opacity and color changes during dragging
  const textOpacity = useTransform(x, [0, maxDistance * 0.75], [1, 0]);
  const progressBgWidth = useTransform(x, (value) => `${value + handleWidth / 2}px`);

  const handleDragEnd = (event, info) => {
    if (isSubmitting || isSuccess) return;
    
    // If dragged past 85%, confirm
    if (info.offset.x >= maxDistance * 0.85) {
      onConfirm();
    }
  };

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
      {/* Visual Fill behind the drag handle */}
      <motion.div
        style={{
          ...styles.slideFill,
          width: isSuccess || isSubmitting ? '100%' : progressBgWidth,
          backgroundColor: isSuccess
            ? 'var(--success)'
            : 'rgba(99, 102, 241, 0.15)',
        }}
      />

      {/* Label Text */}
      <motion.span
        style={{
          ...styles.label,
          opacity: isSuccess || isSubmitting ? 0 : textOpacity,
          color: isSubmitting ? 'var(--accent)' : 'var(--text-secondary)',
        }}
      >
        Swipe to Confirm Order
      </motion.span>

      {/* Center status message for loading or success */}
      {(isSubmitting || isSuccess) && (
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...styles.centerLabel,
            color: isSuccess ? '#ffffff' : 'var(--accent)',
          }}
        >
          {isSuccess ? 'Order Submitted!' : 'Placing Order...'}
        </motion.span>
      )}

      {/* Sliding Drag Handle */}
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
            : 'var(--accent)',
          color: isSuccess
            ? 'var(--success)'
            : isSubmitting
            ? 'var(--accent)'
            : '#ffffff',
          boxShadow: isSuccess ? 'none' : '0 3px 10px rgba(99, 102, 241, 0.35)',
        }}
        animate={{
          x: isSuccess || isSubmitting ? maxDistance : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 28,
        }}
        whileDrag={{ scale: 1.05 }}
        whileHover={!isSubmitting && !isSuccess ? { scale: 1.03 } : {}}
      >
        {isSuccess ? (
          <Check size={20} strokeWidth={3} className="success-zoom" />
        ) : isSubmitting ? (
          <div style={styles.spinner} />
        ) : (
          <ChevronRight size={22} strokeWidth={2.5} />
        )}
      </motion.div>
    </div>
  );
}

const styles = {
  track: {
    position: 'relative',
    height: '56px',
    borderRadius: 'var(--radius-full)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '4px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  slideFill: {
    position: 'absolute',
    left: 4,
    height: '48px',
    borderRadius: 'var(--radius-full)',
    pointerEvents: 'none',
  },
  label: {
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '-0.01em',
    pointerEvents: 'none',
    zIndex: 2,
  },
  centerLabel: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '-0.01em',
    pointerEvents: 'none',
    zIndex: 2,
  },
  handle: {
    position: 'absolute',
    left: '4px',
    width: '48px',
    height: '48px',
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
    border: '2.5px solid rgba(99, 102, 241, 0.2)',
    borderTop: '2.5px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
