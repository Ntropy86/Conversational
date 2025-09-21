// Update the Input component to have less border radius and maintain the hover behavior
'use client';
import { useState, forwardRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { typographyClasses } from './Typography';

const Input = forwardRef(({ 
  label,
  placeholder = '',
  type = 'text',
  value = '',
  onChange = () => {},
  onKeyPress = () => {},
  error = '',
  className = '',
  customEndButton = null,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Generate a unique ID for label-input connection
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const currentStyle = {
    background: isDarkMode 
      ? (isFocused ? "rgba(245, 245, 245, 0.11)" : "rgba(245, 245, 245, 0.05)")
      : (isFocused ? "rgba(245, 245, 245, 0.2)" : "rgba(245, 245, 245, 0.11)"),
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(73, 60, 60, 1)",
    transition: "all 0.2s ease",
    boxShadow: isFocused 
      ? (isDarkMode ? "0 0 10px rgba(245, 245, 245, 0.1)" : "0 0 10px rgba(84, 45, 18, 0.1)")
      : "none",
    borderRadius: "16px" // Less border radius for boxier look
  };
  
  if (error) {
    currentStyle.border = isDarkMode 
      ? '1px solid rgba(239, 68, 68, 0.5)' 
      : '1px solid rgba(239, 68, 68, 0.7)';
  }

  // Define input classes with better mobile touch targets
  const inputClasses = `w-full px-3 md:px-4 py-3 md:py-2 rounded-lg focus:outline-none transition-all text-base ${typographyClasses.paragraph}`;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block mb-1">
          <span className={typographyClasses.subtitle}>{label}</span>
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`${inputClasses} ${customEndButton ? 'pr-32' : ''}`}
          style={currentStyle}
          {...props}
        />
        
        {customEndButton && (
          <div className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2">
            {customEndButton}
          </div>
        )}
      </div>
      
      {error && (
        <p className={`mt-1 text-xs text-red-400 ${typographyClasses.paragraph}`}>{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;