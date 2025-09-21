'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { typographyClasses } from './Typography';

const SafariVoiceWarning = ({ isVisible, onDismiss }) => {
  const { isDarkMode } = useTheme();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm sm:max-w-md mx-3 sm:mx-4"
        >
          <div 
            className="relative bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg border border-orange-400/30 rounded-xl p-3 sm:p-4 shadow-2xl"
            style={{
              boxShadow: '0 8px 32px rgba(255, 165, 0, 0.2), 0 0 0 1px rgba(255, 165, 0, 0.1)'
            }}
          >
            {/* Safari icon and warning */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#f97316" 
                    strokeWidth="2"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-orange-400 font-medium mb-1 ${typographyClasses.subtitle}`}>
                  Voice Not Available in Safari
                </h3>
                <p className={`text-gray-300 text-xs sm:text-sm leading-relaxed ${typographyClasses.paragraph}`}>
                  Voice features have some compatibility issues with Safari. 
                  For the best experience, please try <span className="text-orange-300 font-medium">Chrome</span> or <span className="text-orange-300 font-medium">Firefox</span>.
                </p>
                
                {/* Suggested browsers */}
                <div className="flex items-center space-x-3 mt-3">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                    <span>Chrome</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded bg-orange-500/20 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#f97316">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                    <span>Firefox</span>
                  </div>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={onDismiss}
                className="flex-shrink-0 p-1 rounded-full hover:bg-orange-500/20 transition-colors"
                aria-label="Dismiss warning"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#f97316" 
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            {/* Optional "Fix coming soon" message */}
            <div className="mt-3 pt-3 border-t border-orange-400/20">
              <p className="text-xs text-gray-400 text-center">
                🔧 Working on Safari compatibility - thanks for your patience!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SafariVoiceWarning;