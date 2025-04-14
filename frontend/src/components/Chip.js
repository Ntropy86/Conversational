'use client';
import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Subtitle, Paragraph } from './Typography';

const Chip = ({ 
  children, 
  color = 'default',
  className = '', 
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Memoize chip styles
  const chipStyles = useMemo(() => ({
    dark: {
      default: {
        idle: {
          background: "rgba(245, 245, 245, 0.05)",
          border: "1px solid rgba(65, 61, 61, 1)"
        },
        hover: {
          background: "rgba(245, 245, 245, 0.24)",
          border: "1px solid rgba(65, 61, 61, 1)"
        }
      },
      primary: {
        idle: {
          background: "rgba(35, 130, 139, 0.24)",
          border: "1px solid rgba(107, 128, 131, 0.31)"
        },
        hover: {
          background: "rgba(35, 130, 139, 0.48)",
          border: "1px solid rgba(107, 128, 131, 0.31)"
        }
      },
      success: {
        idle: {
          background: "rgba(56, 139, 35, 0.24)",
          border: "1px solid rgba(119, 131, 107, 0.31)"
        },
        hover: {
          background: "rgba(56, 139, 35, 0.48)",
          border: "1px solid rgba(119, 131, 107, 0.31)"
        }
      },
      warning: {
        idle: {
          background: "rgba(139, 118, 35, 0.24)",
          border: "1px solid rgba(131, 113, 107, 0.31)"
        },
        hover: {
          background: "rgba(139, 118, 35, 0.48)",
          border: "1px solid rgba(131, 113, 107, 0.31)"
        }
      },
      error: {
        idle: {
          background: "rgba(139, 35, 35, 0.24)",
          border: "1px solid rgba(131, 107, 107, 0.31)"
        },
        hover: {
          background: "rgba(139, 35, 35, 0.48)",
          border: "1px solid rgba(131, 107, 107, 0.31)"
        }
      }
    },
    light: {
      default: {
        idle: {
          background: "rgba(245, 245, 245, 0.11)",
          border: "1px solid rgba(134, 110, 110, 0.08)"
        },
        hover: {
          background: "rgba(245, 245, 245, 0.32)",
          border: "1px solid rgba(65, 61, 61, 0.08)"
        }
      },
      primary: {
        idle: {
          background: "rgba(59, 214, 228, 0.16)",
          border: "1px solid rgba(37, 118, 133, 0.08)"
        },
        hover: {
          background: "rgba(62, 229, 244, 0.32)",
          border: "1px solid rgba(37, 118, 133, 0.08)"
        }
      },
      success: {
        idle: {
          background: "rgba(78, 226, 41, 0.16)",
          border: "1px solid rgba(83, 121, 44, 0.08)"
        },
        hover: {
          background: "rgba(78, 226, 41, 0.32)",
          border: "1px solid rgba(83, 121, 44, 0.09)"
        }
      },
      warning: {
        idle: {
          background: "rgba(254, 216, 65, 0.16)",
          border: "1px solid rgba(85, 83, 28, 0.05)"
        },
        hover: {
          background: "rgba(254, 216, 65, 0.32)",
          border: "1px solid rgba(85, 83, 28, 0.05)"
        }
      },
      error: {
        idle: {
          background: "rgba(238, 54, 54, 0.16)",
          border: "1px solid rgba(113, 50, 50, 0.08)"
        },
        hover: {
          background: "rgba(239, 53, 53, 0.32)",
          border: "1px solid rgba(113, 50, 50, 0.08)"
        }
      }
    }
  }), []);
  
  const currentStyle = useMemo(() => {
    const mode = isDarkMode ? 'dark' : 'light';
    const state = isHovered ? 'hover' : 'idle';
    
    let style;
    // Safely access the styles with fallback
    if (!chipStyles[mode][color]) {
      style = chipStyles[mode].default[state];
    } else {
      style = chipStyles[mode][color][state];
    }
    
    return {
      ...style,
      backdropFilter: "blur(20px)"
    };
  }, [isDarkMode, isHovered, color, chipStyles]);

  // Use simple functions (no useCallback) to reduce overhead
  const handleHoverStart = () => setIsHovered(true);
  const handleHoverEnd = () => setIsHovered(false);

  return (
    <motion.div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${className}`}
      style={currentStyle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      {...props}
    >
      {isHovered ? (
        <Paragraph>{children}</Paragraph>
      ) : (
        <Subtitle>{children}</Subtitle>
      )}
    </motion.div>
  );
};

export default Chip;