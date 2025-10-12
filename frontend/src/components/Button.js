'use client';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Subtitle } from './Typography';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  onClick = () => {},
  onCard = false, // New prop to indicate button is on a card
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
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
    const baseClasses = "relative font-medium rounded-xl transition-all duration-200 flex items-center justify-center px-4 md:px-6 py-3 md:py-3 min-h-[44px] touch-manipulation cursor-pointer";
    
    if (disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed`;
    }
    
    return baseClasses;
  };
  
  const getAcrylicStyle = () => {
    // ALL BUTTONS - Minimalistic ultra-glassy design
    return {
      background: isDarkMode 
        ? (isHovered ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.04)")
        : (isHovered ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.04)"),
      backdropFilter: `blur(${isHovered ? '20px' : '16px'})`,
      border: isDarkMode 
        ? `1px solid rgba(255, 255, 255, ${isHovered ? '0.20' : '0.10'})` 
        : `1px solid rgba(0, 0, 0, ${isHovered ? '0.15' : '0.08'})`,
      transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };
  
  return (
    <button
      className={`${getButtonStyles()} ${className}`}
      style={getAcrylicStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (!disabled) {
          onClick(e);
        }
      }}
      disabled={disabled}
      {...props}
    >
      <span 
        style={{
          color: isDarkMode ? '#e8e8e8' : '#2a2a2a',
          fontWeight: '400',
          transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {children}
      </span>
    </button>
  );
};

export default Button;