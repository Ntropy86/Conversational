'use client';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { techLogos } from '../data/skillsData';

const RadarChart = ({ 
  data = {}, 
  title = "Skills",
  size = 400,
  color = "#8B5C3C",
  className = "",
  animated = true,
  highlightCategory = null,
  categories = {}
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [skillPositions, setSkillPositions] = useState([]);
  const [loadedLogos, setLoadedLogos] = useState(new Map());
  const { isDarkMode } = useTheme();
  
  const maxValue = 5;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(centerX, centerY) - (size < 500 ? 140 : 170);
  
  // Animation state
  const [animationProgress, setAnimationProgress] = useState(animated ? 0 : 1);

  // Helper function to load logo images
  const loadLogoImage = (skillName) => {
    return new Promise((resolve) => {
      if (loadedLogos.has(skillName)) {
        resolve(loadedLogos.get(skillName));
        return;
      }

      const logoUrl = techLogos[skillName];
      if (!logoUrl) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setLoadedLogos(prev => new Map(prev.set(skillName, img)));
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = logoUrl;
    });
  };
  
  useEffect(() => {
    if (!canvasRef.current || !categories || Object.keys(categories).length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Theme-based colors
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const labelColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    
    // Show only the highlighted category or the "all" comprehensive view
    const activeCategories = highlightCategory 
      ? { [highlightCategory]: categories[highlightCategory] }
      : { "all": categories["all"] };
    
    // Draw background grid circles for reference
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const circleRadius = (radius * i) / 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Store skill positions for logo rendering
    const positions = [];
    
    // Draw the active categories around a single center point
    Object.entries(activeCategories).forEach(([categoryKey, categoryData]) => {
      const categorySkills = Object.entries(categoryData.skills);
      const numSkills = categorySkills.length;
      const angleStep = (2 * Math.PI) / numSkills;
      
      // Calculate opacity - if highlighting, show highlighted at full opacity, others dimmed
      let opacity = 1;
      if (highlightCategory && Object.keys(activeCategories).length > 1) {
        opacity = highlightCategory === categoryKey ? 1 : 0.3;
      } else if (!highlightCategory && Object.keys(activeCategories).length > 1) {
        opacity = 0.8; // Slightly transparent for "All" view
      }
      
      // Draw grid lines from center
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      categorySkills.forEach((skill, index) => {
        const angle = angleStep * index - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      });
      
      // Draw skill labels with text and logos
      ctx.fillStyle = labelColor;
      ctx.font = `${size < 500 ? '10' : '11'}px Inter, system-ui, sans-serif`;
      ctx.fontWeight = '500';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      categorySkills.forEach((skill, index) => {
        const angle = angleStep * index - Math.PI / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        // Better text positioning with more space for long labels
        const labelDistance = radius + (size < 400 ? 35 : size < 600 ? 50 : 65);
        let labelX = centerX + cos * labelDistance;
        let labelY = centerY + sin * labelDistance;
        
        // Adjust for text alignment
        let textAlign = 'center';
        if (Math.abs(cos) < 0.1) {
          textAlign = 'center';
        } else if (cos > 0.1) {
          textAlign = 'left';
          labelX += 10;
        } else {
          textAlign = 'right';
          labelX -= 10;
        }
        
        // Vertical alignment
        let textBaseline = 'middle';
        if (sin < -0.5) {
          textBaseline = 'bottom';
          labelY -= 5;
        } else if (sin > 0.5) {
          textBaseline = 'top';  
          labelY += 5;
        }
        
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        ctx.globalAlpha = opacity;
        
        // Enhanced logo + text rendering with better text wrapping
        const skillName = skill[0];
        const logoImg = loadedLogos.get(skillName);
        const logoSize = size < 400 ? 14 : 16;
        const logoTextGap = 6;
        
        // Handle long text with smart wrapping
        const maxTextWidth = size < 400 ? 80 : size < 600 ? 100 : 120;
        let displayText = skillName;
        let isWrapped = false;
        let line1 = skillName;
        let line2 = '';
        
        // Check if text needs wrapping
        if (ctx.measureText(skillName).width > maxTextWidth) {
          // Try to split on common separators
          const separators = ['/', ' ', '(', ')'];
          let bestSplit = -1;
          let bestSeparator = '';
          
          for (const sep of separators) {
            const index = skillName.indexOf(sep);
            if (index > 0 && index < skillName.length - 1) {
              const part1 = skillName.substring(0, index);
              const part2 = skillName.substring(index + 1);
              if (ctx.measureText(part1).width <= maxTextWidth && 
                  ctx.measureText(part2).width <= maxTextWidth) {
                line1 = part1;
                line2 = part2;
                isWrapped = true;
                break;
              }
            }
          }
        }
        
        const line1Width = ctx.measureText(line1).width;
        const line2Width = isWrapped ? ctx.measureText(line2).width : 0;
        const maxLineWidth = Math.max(line1Width, line2Width);
        const totalWidth = logoImg ? logoSize + logoTextGap + maxLineWidth : maxLineWidth;
        
        // Simple positioning: logo first, then text
        let startX = labelX;
        if (textAlign === 'center') {
          startX = labelX - totalWidth / 2;
        } else if (textAlign === 'right') {
          startX = labelX - totalWidth;
        }
        
        // Draw logo if available
        if (logoImg) {
          const logoY = isWrapped ? labelY - 6 : labelY - logoSize / 2;
          ctx.drawImage(logoImg, startX, logoY, logoSize, logoSize);
          startX += logoSize + logoTextGap;
        }
        
        // Draw text
        ctx.textAlign = 'left'; // Always left align after positioning
        if (isWrapped) {
          const lineHeight = 12;
          ctx.fillText(line1, startX, labelY - lineHeight / 2);
          ctx.fillText(line2, startX, labelY + lineHeight / 2);
        } else {
          ctx.fillText(skillName, startX, labelY);
        }
        
        ctx.globalAlpha = 1;
        
        // Store position for potential logo overlay (future enhancement)
        positions.push({
          name: skill[0],
          x: labelX,
          y: labelY,
          angle: angle,
          opacity: opacity,
          categoryColor: categoryData.color,
          textAlign: textAlign,
          textBaseline: textBaseline
        });
      });
    
      // Draw the polygon for this category
      if (animationProgress > 0) {
        ctx.beginPath();
        categorySkills.forEach((skill, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const skillValue = skill[1];
          const value = (skillValue / maxValue) * radius * animationProgress;
          const x = centerX + Math.cos(angle) * value;
          const y = centerY + Math.sin(angle) * value;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();
        
        // Fill with category color
        const fillOpacity = Math.round(opacity * 0.25 * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = categoryData.color + fillOpacity;
        ctx.fill();
        
        // Stroke with category color
        const strokeOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
        ctx.strokeStyle = categoryData.color + strokeOpacity;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw skill points
        categorySkills.forEach((skill, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const skillValue = skill[1];
          const value = (skillValue / maxValue) * radius * animationProgress;
          const x = centerX + Math.cos(angle) * value;
          const y = centerY + Math.sin(angle) * value;
          
          ctx.fillStyle = categoryData.color + strokeOpacity;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.globalAlpha = opacity;
          ctx.fillStyle = isDarkMode ? '#2A1810' : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }
    });
    
    setSkillPositions(positions);
    
  }, [size, color, isDarkMode, animationProgress, centerX, centerY, radius, maxValue, highlightCategory, categories, loadedLogos]);
  
  // Preload logos
  useEffect(() => {
    if (!categories || Object.keys(categories).length === 0) return;
    
    const activeCategories = highlightCategory 
      ? { [highlightCategory]: categories[highlightCategory] }
      : { "all": categories["all"] };
    
    // Collect all skill names that need logos
    const skillNames = [];
    Object.values(activeCategories).forEach(categoryData => {
      Object.keys(categoryData.skills).forEach(skillName => {
        if (techLogos[skillName] && !loadedLogos.has(skillName)) {
          skillNames.push(skillName);
        }
      });
    });
    
    // Load all logos
    Promise.all(skillNames.map(skillName => loadLogoImage(skillName)));
  }, [highlightCategory, categories, loadedLogos]);

  // Animation effect
  useEffect(() => {
    if (!animated) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          
          let start = 0;
          const duration = 1500;
          
          const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            setAnimationProgress(easeOutCubic);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    
    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }
    
    return () => observer.disconnect();
  }, [animated, isVisible]);
  
  if (!categories || Object.keys(categories).length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <p className="text-gray-500">No skills data available</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className={`relative w-full flex flex-col items-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4" style={{ color: isDarkMode ? '#CBB09D' : '#542D12' }}>
          {title}
        </h3>
      )}
      
      {/* Scale indicator at top */}
      {highlightCategory && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
               style={{ 
                 backgroundColor: isDarkMode ? 'rgba(40, 24, 16, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                 border: `1px solid ${categories[highlightCategory]?.color}40`,
                 color: isDarkMode ? '#CBB09D' : '#542D12'
               }}>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: categories[highlightCategory]?.color }}
            />
            <span className="font-medium">
              {categories[highlightCategory]?.title} Skills (1-5)
            </span>
          </div>
        </div>
      )}
      
      <div className="w-full flex justify-center relative overflow-hidden" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="drop-shadow-lg max-w-full h-auto"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            maxWidth: '100%',
            maxHeight: '100vw'
          }}
        />

      </div>

    </motion.div>
  );
};

export default RadarChart;