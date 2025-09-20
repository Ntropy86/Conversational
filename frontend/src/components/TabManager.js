'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { typographyClasses } from './Typography';
import { HomeIcon, BriefcaseIcon, FolderIcon, XIcon } from './Icons';

const TabManager = ({ tabs, activeTabId, onTabChange, onTabClose }) => {
  const [hoveredTab, setHoveredTab] = useState(null);

  // Initialize Lucide icons when component updates
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }, [tabs]);

  // Don't render if only overview tab exists
  if (tabs.length <= 1) {
    return null;
  }

  return (
    <div className="border-b border-[#3e3630] bg-transparent backdrop-blur-lg">
      <div className="flex items-center px-6">
        {/* Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto max-w-4xl">
          <AnimatePresence>
            {tabs.map((tab) => (
              <motion.div
                key={tab.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-center px-4 py-3 rounded-t-lg cursor-pointer group relative min-w-0 max-w-xs transition-all duration-200 ${
                  activeTabId === tab.id 
                    ? 'bg-[#3e3630]/30 border-b-2 border-[#8B5C3C]' 
                    : 'hover:bg-[#3e3630]/15'
                }`}
                onClick={() => onTabChange(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                {/* Tab Icon */}
                <div className="flex-shrink-0 mr-2">
                  {tab.type === 'overview' && <HomeIcon className="w-4 h-4" />}
                  {tab.type === 'experience' && <BriefcaseIcon className="w-4 h-4" />}
                  {tab.type === 'project' && <FolderIcon className="w-4 h-4" />}
                </div>

                {/* Tab Title */}
                <div className="flex-1 truncate">
                  <span className={`text-sm ${typographyClasses.paragraph} truncate`}>
                    {tab.title}
                  </span>
                </div>

                {/* Close Button */}
                {tab.closeable && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: hoveredTab === tab.id || activeTabId === tab.id ? 1 : 0.6,
                      scale: hoveredTab === tab.id || activeTabId === tab.id ? 1 : 0.8
                    }}
                    className="flex-shrink-0 ml-2 p-1 rounded hover:bg-[#3e3630]/40 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                  >
                    <XIcon className="w-3 h-3" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TabManager;