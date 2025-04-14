'use client';
import { useState } from 'react';
import NextLink from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Subtitle, Paragraph } from './Typography';

const Link = ({ 
  href, 
  children, 
  className = '', 
  external = false,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useTheme();
  
  const baseClasses = "relative inline-flex items-center focus:outline-none rounded";
  
  // Variants for text animation
  const textVariants = {
    initial: { y: 0 },
    hover: { y: -2 }
  };
  
  // Variants for underline animation
  const underlineVariants = {
    initial: { 
      width: className.includes('active') ? '100%' : '0%',
      left: className.includes('active') ? '0%' : '50%',
      opacity: className.includes('active') ? 0.6 : 0
    },
    hover: { 
      width: '100%', 
      left: '0%', 
      opacity: 0.8
    }
  };

  // External link arrow icon
  const ExternalArrowIcon = () => (
    <motion.svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="14" 
      height="14" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={isDarkMode ? "#CBB09D" : "#542D12"}
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="ml-1"
      initial={{ opacity: 0, x: -5, y: 5 }}
      animate={isHovered || className.includes('active') ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -5, y: 5 }}
      transition={{ duration: 0.2 }}
    >
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </motion.svg>
  );

  // Internal link arrow icon
  const InternalArrowIcon = () => (
    <motion.svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="14" 
      height="14" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={isDarkMode ? "#CBB09D" : "#542D12"}
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="ml-1"
      initial={{ opacity: 0, x: -5 }}
      animate={isHovered || className.includes('active') ? { opacity: 1, x: 0 } : { opacity: 0, x: -5 }}
      transition={{ duration: 0.2 }}
    >
      <path d="M5 12h14"></path>
      <path d="M12 5l7 7-7 7"></path>
    </motion.svg>
  );

  if (external) {
    return (
      <motion.a
        href={href}
        className={`${baseClasses} ${className}`}
        initial="initial"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        <motion.span variants={textVariants}>
          {isHovered || className.includes('active') ? (
            <Paragraph>{children}</Paragraph>
          ) : (
            <Subtitle>{children}</Subtitle>
          )}
        </motion.span>
        <ExternalArrowIcon />
        <motion.span
          className={`absolute bottom-0 h-[1px] ${isDarkMode ? 'bg-[#CBB09D]' : 'bg-[#542D12]'}`}
          variants={underlineVariants}
          transition={{ duration: 0.2 }}
        />
      </motion.a>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      initial="initial"
      whileHover="hover"
      animate={className.includes('active') ? "hover" : "initial"}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <NextLink href={href} {...props} className="inline-flex items-center">
        <motion.span variants={textVariants}>
          {isHovered || className.includes('active') ? (
            <Paragraph>{children}</Paragraph>
          ) : (
            <Subtitle>{children}</Subtitle>
          )}
        </motion.span>
        <InternalArrowIcon />
      </NextLink>
      <motion.span
        className={`absolute bottom-0 h-[1px] ${isDarkMode ? 'bg-[#CBB09D]' : 'bg-[#542D12]'}`}
        variants={underlineVariants}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export default Link;