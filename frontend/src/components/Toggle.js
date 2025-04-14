// Toggle.js - Updated with typography classes
'use client';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { typographyClasses } from './Typography';

const Toggle = ({ 
  checked = false, 
  onChange = () => {}, 
  label = '',
  className = '',
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Track for animations
  const containerStyle = {
    background: isDarkMode 
      ? (isHovered ? "rgba(245, 245, 245, 0.11)" : "rgba(245, 245, 245, 0.05)")
      : (isHovered ? "rgba(245, 245, 245, 0.32)" : "rgba(245, 245, 245, 0.11)"),
    backdropFilter: "blur(20px)",
    border: isDarkMode
      ? "1px solid rgba(65, 61, 61, 1)"
      : "1px solid rgba(134, 110, 110, 0.08)",
    transition: "all 0.2s ease",
    borderRadius: "9999px",
    width: "48px",
    height: "24px",
    position: "relative",
    cursor: "pointer"
  };
  
  // Handle for the toggle
  const handleStyle = {
    position: "absolute",
    top: "3px",
    left: checked ? "27px" : "3px",
    width: "18px",
    height: "18px",
    background: isDarkMode ? "#F5F5F5" : "#542D12",
    borderRadius: "50%",
    transition: "left 0.2s ease, transform 0.1s ease"
  };

  const handleClick = () => {
    onChange(!checked);
  };

  return (
    <div 
      className={`inline-flex items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label && (
        <span className={`mr-3 ${isHovered ? typographyClasses.paragraph : typographyClasses.subtitle}`}>
          {label}
        </span>
      )}
      
      <div 
        style={containerStyle}
        onClick={handleClick}
        {...props}
      >
        <div 
          style={handleStyle}
          className="transform hover:scale-110 active:scale-95"
        />
      </div>
    </div>
  );
};

export default Toggle;