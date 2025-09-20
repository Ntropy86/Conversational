'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Touch-first interaction utilities
export const touchConfig = {
  // Minimum touch target sizes (Apple and Material Design guidelines)
  minTouchTarget: 44, // 44px minimum
  recommendedTouchTarget: 48, // 48px recommended
  
  // Touch interaction delays
  tapDelay: 150, // Visual feedback duration
  doubleTapWindow: 300, // Time window for double tap
  longPressDelay: 500, // Long press threshold
  
  // Visual feedback
  tapScale: 0.95, // Scale down on tap
  tapBrightness: 1.1, // Brightness increase on tap
  
  // Gesture thresholds
  swipeThreshold: 50, // Minimum distance for swipe
  swipeVelocity: 0.3, // Minimum velocity for swipe
};

// Touch-friendly component variants
export const touchVariants = {
  // Standard button/card interaction
  touchTarget: {
    idle: {
      scale: 1,
      filter: 'brightness(1)',
      transition: { duration: 0.15 }
    },
    pressed: {
      scale: touchConfig.tapScale,
      filter: `brightness(${touchConfig.tapBrightness})`,
      transition: { duration: 0.1 }
    },
    released: {
      scale: 1,
      filter: 'brightness(1)',
      transition: { duration: 0.15 }
    }
  },
  
  // Dock item interaction (more subtle)
  dockItem: {
    idle: {
      scale: 1,
      y: 0,
      transition: { duration: 0.2 }
    },
    pressed: {
      scale: 0.9,
      y: 2,
      transition: { duration: 0.1 }
    },
    hover: {
      scale: 1.1,
      y: -4,
      transition: { duration: 0.2 }
    }
  },
  
  // Chip interaction
  chip: {
    idle: {
      scale: 1,
      transition: { duration: 0.15 }
    },
    pressed: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }
};

// Custom hook for touch interactions
export const useTouchInteraction = (onTap, options = {}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  
  const handleTouchStart = useCallback((e) => {
    setIsPressed(true);
    setTouchStartTime(Date.now());
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(1); // Very short vibration
    }
  }, []);
  
  const handleTouchEnd = useCallback((e) => {
    const touchDuration = Date.now() - touchStartTime;
    
    setIsPressed(false);
    
    // Execute tap if within normal tap duration
    if (touchDuration < touchConfig.longPressDelay && onTap) {
      onTap(e);
    }
    
    // Handle long press
    if (touchDuration >= touchConfig.longPressDelay && options.onLongPress) {
      options.onLongPress(e);
    }
  }, [touchStartTime, onTap, options.onLongPress]);
  
  const handleTouchCancel = useCallback(() => {
    setIsPressed(false);
  }, []);
  
  return {
    isPressed,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      // Also handle mouse events for desktop
      onMouseDown: handleTouchStart,
      onMouseUp: handleTouchEnd,
      onMouseLeave: handleTouchCancel
    }
  };
};

// Visual indicators for touch states
export const TouchIndicator = ({ children, variant = 'touchTarget', ...props }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <motion.div
      variants={touchVariants[variant]}
      initial="idle"
      animate={isPressed ? "pressed" : "idle"}
      whileHover="hover"
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};