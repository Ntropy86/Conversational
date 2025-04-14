// Card.js
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { typographyClasses } from './Typography';

const Card = ({ 
  title,
  subtitle,
  children, 
  className = '', 
  hoverEffect = true,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useTheme();
  
  const acrylicStyles = {
    light: {
      background: "rgba(245, 245, 245, 0.11)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(245, 245, 245, 0.2)"
    },
    dark: {
      background: "rgba(245, 245, 245, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(65, 61, 61, 1)"
    },
    lightHover: {
      background: "rgba(245, 245, 245, 0.2)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(245, 245, 245, 0.2)"
    },
    darkHover: {
      background: "rgba(245, 245, 245, 0.11)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(65, 61, 61, 1)"
    }
  };
  
  const getAcrylicStyle = () => {
    if (isDarkMode) {
      return isHovered && hoverEffect ? acrylicStyles.darkHover : acrylicStyles.dark;
    } else {
      return isHovered && hoverEffect ? acrylicStyles.lightHover : acrylicStyles.light;
    }
  };

  // Adding subtle glow effect for borders when not hovering
  const glowVariants = {
    initial: {
      boxShadow: isDarkMode 
        ? '0 0 0px rgba(245, 245, 245, 0.1)' 
        : '0 0 0px rgba(84, 45, 18, 0.1)'
    },
    hover: {
      boxShadow: isDarkMode 
        ? '0 0 10px rgba(245, 245, 245, 0.15)' 
        : '0 0 10px rgba(84, 45, 18, 0.15)'
    }
  };

  return (
    <motion.div
      className={`rounded-xl p-6 ${className}`}
      style={getAcrylicStyle()}
      animate={{
        ...(isHovered && hoverEffect ? glowVariants.hover : glowVariants.initial),
        opacity: 1,
        y: 0
      }}
      variants={glowVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={hoverEffect ? { 
        y: -5,
        transition: { duration: 0.2 }
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      
      transition={{ duration: 0.3 }}
      {...props}
    >
      {title && (
        <h3 className={`mb-1 ${typographyClasses.heading}`}>{title}</h3>
      )}
      
      {subtitle && (
        <p className={`mb-4 ${typographyClasses.subtitle}`}>{subtitle}</p>
      )}
      
      <div className={typographyClasses.paragraph}>{children}</div>
    </motion.div>
  );
};

export default Card;