'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Subtitle, Paragraph } from './Typography';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  onClick = () => {},
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Enhanced acrylic effect settings based on mode
  const acrylicStyles = {
    light: {
      background: "rgba(245, 245, 245, 0.11)",
      backdropFilter: "blur(56.8px)",
    },
    dark: {
      background: "rgba(245, 245, 245, 0.05)",
      backdropFilter: "blur(56.8px)",
    },
    lightHover: {
      background: "rgba(245, 245, 245, 0.2)",
      backdropFilter: "blur(56.8px)",
    },
    darkHover: {
      background: "rgba(245, 245, 245, 0.11)",
      backdropFilter: "blur(56.8px)",
    }
  };
  
  const getButtonStyles = () => {
    const baseClasses = "relative font-medium rounded-xl transition-all duration-200 flex items-center justify-center px-4 md:px-6 py-3 md:py-3 min-h-[44px] touch-manipulation";
    
    if (disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed`;
    }
    
    return baseClasses;
  };
  
  const getAcrylicStyle = () => {
    let baseStyle;
    if (isDarkMode) {
      baseStyle = isHovered ? acrylicStyles.darkHover : acrylicStyles.dark;
    } else {
      baseStyle = isHovered ? acrylicStyles.lightHover : acrylicStyles.light;
    }
    
    // Modify for secondary variant
    if (variant === 'secondary') {
      return {
        ...baseStyle,
        background: isDarkMode 
          ? (isHovered ? "rgba(100, 100, 100, 0.2)" : "rgba(100, 100, 100, 0.1)")
          : (isHovered ? "rgba(200, 200, 200, 0.3)" : "rgba(200, 200, 200, 0.2)"),
        border: isDarkMode ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.1)"
      };
    }
    
    return baseStyle;
  };
  
  return (
    <motion.button
      className={`${getButtonStyles()} ${className}`}
      style={getAcrylicStyle()}
      whileHover={{ 
        scale: window?.innerWidth < 640 ? 1.02 : 1.05,
        transition: { type: "spring", stiffness: 400, damping: 10 } 
      }}
      whileTap={{ 
        scale: 0.97,
        transition: { type: "spring", stiffness: 400, damping: 17 } 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={(e) => {
        if (!disabled) {
          setIsPressed(true);
          onClick(e);
          setTimeout(() => setIsPressed(false), 300);
        }
      }}
      disabled={disabled}
      {...props}
    >
      <motion.span
        initial={{ y: 0 }}
        animate={{ y: isHovered ? -2 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isHovered ? (
          <Paragraph>{children}</Paragraph>
        ) : (
          <Subtitle>{children}</Subtitle>
        )}
      </motion.span>
      
      {isPressed && !disabled && (
        <motion.span
          className="absolute inset-0 rounded-xl bg-white/20"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  );
};

export default Button;