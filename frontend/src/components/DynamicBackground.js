'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DynamicBackground({ isDarkMode = true }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const darkColors = {
    center: '#402B1A', // Lighter part
    outer: '#1E1108'   // Darker part
  };
  

  const lightColors = {
    center: '#edc99a', // Lighter part
    outer: '#d9a787'   // Darker part
  };
  
  const colors = isDarkMode ? darkColors : lightColors;
  
  return (
    <motion.div
      className="fixed inset-0 z-[-1]"
      style={{
        background: `radial-gradient(
          circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          ${colors.center} 20%,
          ${colors.outer} 50%
        )`
      }}
      animate={{
        background: `radial-gradient(
          circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          ${colors.center} 0%,
          ${colors.outer} 50%
        )`
      }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    />
  );
}