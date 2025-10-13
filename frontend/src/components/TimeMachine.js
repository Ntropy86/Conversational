'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { typographyClasses } from './Typography';
import Card from './Card';
import Button from './Button';

const TimeMachine = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? window.innerWidth >= 640 && window.innerWidth < 1024 : false);

  // Detect screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Listen for custom event to open Time Machine from mobile dock
    const handleOpenTimeMachine = () => {
      setIsOpen(true);
    };
    window.addEventListener('openTimeMachine', handleOpenTimeMachine);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('openTimeMachine', handleOpenTimeMachine);
    };
  }, []);

  const versions = [
    {
      id: 'v1',
      name: 'Portfolio v1.0',
      year: '2023',
      description: 'My first portfolio website built with React and vanilla CSS. Featured a clean, minimalist design with basic project showcases.',
      features: [
        'React with Create React App',
        'Vanilla CSS with custom animations',
        'Basic project grid layout',
        'Contact form integration',
        'Responsive design'
      ],
      url: 'https://portfolio-4ec456dt5-neatstacks-projects.vercel.app/',
      status: 'Archived',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      id: 'v2',
      name: 'Portfolio v2.0',
      year: '2024',
      description: 'Enhanced version with Next.js, improved animations, and better project organization. Added dark mode and more interactive elements.',
      features: [
        'Next.js with App Router',
        'Tailwind CSS for styling',
        'Framer Motion animations',
        'Dark mode toggle',
        'Enhanced project details',
        'Better mobile experience'
      ],
      url: 'https://portfolio-aq0wb652f-neatstacks-projects.vercel.app/',
      status: 'Archived',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      id: 'v3',
      name: 'Portfolio v3.0 (Current)',
      year: '2025',
      description: 'The current version with AI-powered features, voice interaction, and advanced animations. Built with modern web technologies and focused on user engagement.',
      features: [
        'Next.js 15 with latest features',
        'AI-powered chat interface',
        'Voice interaction capabilities',
        'Advanced skill visualizations',
        'Dynamic content loading',
        'Comprehensive project showcase',
        'Real-time AI responses'
      ],
      url: 'https://ntropy.dev',
      status: 'Live',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
  ];

  return (
    <>
      {/* Desktop/Tablet Button - hidden on mobile */}
      <div 
        className="fixed z-50"
        style={{
          display: isMobile ? 'none' : 'block',
          bottom: isTablet ? '140px' : '1.5rem',
          right: '1.5rem'
        }}
      >
      {/* Time Machine Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:bg-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg 
          className="w-6 h-6 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Time Machine
          </div>
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-gray-900"></div>
        </div>
      </motion.button>

      {/* Time Machine Panel */}
      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-16 right-0 w-80 max-h-96 overflow-y-auto"
        >
            <Card className="p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/20 shadow-2xl">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${typographyClasses.heading}`}>
                    Portfolio Evolution
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Version List */}
                <div className="space-y-3">
                  {versions.map((version, index) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className={`font-semibold ${typographyClasses.heading}`}>
                            {version.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {version.year}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${version.color}`}>
                          {version.status}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${typographyClasses.body} mb-3`}>
                        {version.description}
                      </p>

                      {/* Features */}
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Key Features:
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {version.features.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {version.features.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{version.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        size="sm"
                        onClick={() => window.open(version.url, '_blank')}
                        className="w-full"
                      >
                        {version.status === 'Live' ? 'Visit Current' : 'View Archive'}
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Click on any version to explore the evolution of this portfolio
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Mobile Panel - shows when opened via dock */}
      {isMobile && isOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-4 top-20 z-50 max-h-[70vh] overflow-y-auto"
          >
            <Card className="p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/20 shadow-2xl">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${typographyClasses.heading}`}>
                    Portfolio Evolution
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Version List */}
                <div className="space-y-3">
                  {versions.map((version, index) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className={`font-semibold ${typographyClasses.heading}`}>
                            {version.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {version.year}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${version.color}`}>
                          {version.status}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${typographyClasses.body} mb-3`}>
                        {version.description}
                      </p>

                      <Button
                        size="sm"
                        onClick={() => window.open(version.url, '_blank')}
                        className="w-full"
                      >
                        {version.status === 'Live' ? 'Visit Current' : 'View Archive'}
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default TimeMachine;
