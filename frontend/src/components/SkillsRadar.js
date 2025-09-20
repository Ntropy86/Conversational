'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import RadarChart from './RadarChart';
import { skillCategories, skillsData } from '../data/skillsData';

const SkillsRadar = ({ className = "" }) => {
  const { isDarkMode } = useTheme();
  const [highlightCategory, setHighlightCategory] = useState('all');
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [chartSize, setChartSize] = useState(600); // Reasonable default size
  const cycleTimeoutRef = useRef(null);
  
  const categories = Object.keys(skillCategories);
  
  // Update chart size after hydration to avoid SSR mismatch
  useEffect(() => {
    const updateSize = () => {
      const viewportWidth = window.innerWidth;
      let size;
      
      if (viewportWidth < 400) {
        size = Math.max(350, viewportWidth - 20); // iPhone SE and smaller - bigger chart
      } else if (viewportWidth < 640) {
        size = Math.max(380, viewportWidth - 40); // Small mobile - bigger chart
      } else if (viewportWidth < 768) {
        size = 450; // Standard mobile
      } else if (viewportWidth < 1024) {
        size = 500; // Tablet
      } else {
        size = Math.min(600, viewportWidth - 200); // Desktop
      }
      
      setChartSize(size);
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Auto-cycling functionality
  useEffect(() => {
    if (!isUserInteracting) {
      const startCycling = () => {
        let currentIndex = 0; // Start with first category ('all')
        
        const cycle = () => {
          setHighlightCategory(categories[currentIndex]);
          currentIndex = (currentIndex + 1) % categories.length;
          
          cycleTimeoutRef.current = setTimeout(cycle, 3000);
        };
        
        cycleTimeoutRef.current = setTimeout(cycle, 3000);
      };
      
      startCycling();
    }
    
    return () => {
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
      }
    };
  }, [isUserInteracting, categories]);
  
  const handleCategoryClick = (category) => {
    setIsUserInteracting(true);
    setHighlightCategory(category);
    
    // Reset to auto-cycling after 10 seconds of no interaction
    if (cycleTimeoutRef.current) {
      clearTimeout(cycleTimeoutRef.current);
    }
    
    cycleTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 10000);
  };
  
  return (
    <div className={`w-full mx-auto ${className}`}>
      {/* Category Tabs */}
      <div className="flex justify-center mb-4 md:mb-6 px-2">
        <div className="relative w-full max-w-4xl">
          <div className="flex flex-wrap justify-center gap-1 md:gap-2 bg-opacity-20 backdrop-blur-sm rounded-xl p-2 border border-opacity-20" 
               style={{ 
                 backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                 borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
               }}>
            {/* Category Tabs - including 'all' as first category */}
            {categories.map((category) => {
              const categoryData = skillCategories[category];
              const isActive = highlightCategory === category;
              
              return (
                <motion.button
                  key={category}
                  className={`
                    relative px-2 py-2 md:px-3 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-300 z-10 whitespace-nowrap min-h-[36px] touch-manipulation
                    ${isActive ? 'text-white' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                  `}
                  onClick={() => handleCategoryClick(category)}
                  whileHover={{ scale: window?.innerWidth < 640 ? 1.02 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: categoryData.color }}
                      layoutId="activeTab"
                      initial={false}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{categoryData.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Description */}
      <motion.div 
        className="mb-4 md:mb-6 text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs md:text-sm opacity-75 max-w-2xl mx-auto leading-relaxed" style={{ color: isDarkMode ? '#CBB09D' : '#542D12' }}>
          {getSkillDescription(highlightCategory)}
        </p>
      </motion.div>

      {/* Unified Radar Chart */}
      <div className="w-full flex justify-center">
        <motion.div
          className="w-full mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <RadarChart
            title=""
            size={chartSize}
            animated={true}
            highlightCategory={highlightCategory}
            categories={skillCategories}
            className="w-full"
          />
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to get descriptions for each category
const getSkillDescription = (category) => {
  const descriptions = {
    all: "Click on a category above to focus on specific skill areas. Comprehensive overview of all technical capabilities across different domains.",
    languages: "Core programming languages including Python, TypeScript/JavaScript, SQL, and Julia used across different domains and applications.",
    backend: "Server-side technologies, APIs, web frameworks, and system components for building robust, scalable backend systems.",
    databases: "Database technologies including relational, document, and in-memory databases for data storage and retrieval.",
    big_data: "Big data processing tools and frameworks for handling large-scale data pipelines and analytics.",
    devops: "DevOps tools, cloud platforms, containerization, and orchestration for scalable infrastructure management.",
    ml_ai: "Machine learning and artificial intelligence frameworks for building intelligent systems and data-driven applications.",
    llms: "Large Language Model technologies including integration, retrieval-augmented generation, and prompt engineering.",
    analytics: "Statistical analysis, experimentation, and inference techniques for data-driven decision making.",
    visualization: "Data visualization and business intelligence tools for creating insights and dashboards."
  };
  
  return descriptions[category] || "Click on a category above to focus on specific skill areas.";
};

export default SkillsRadar;