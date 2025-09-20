'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAIAgent } from '../context/AIAgentContext';
import { TouchIndicator, touchVariants } from '../utils/touchInteractions';
import { BotIcon, ZapOffIcon, UserIcon, BriefcaseIcon, FolderIcon, CodeIcon, MailIcon, BookOpenIcon, FileTextIcon } from './Icons';

const Dock = ({ onSectionNavigate, highlightAI }) => {
  const { isAIMode, toggleAIMode } = useAIAgent();

  // Initialize Lucide icons when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }, [isAIMode]);

  return (
    <>
      {/* Spotlight backdrop for tutorial */}
      {highlightAI && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            background: 'radial-gradient(circle at 50% 85%, transparent 100px, rgba(0,0,0,0.7) 200px)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      <motion.div
        className={`magic-ui-dock flex items-center p-1 sm:p-2 bg-transparent rounded-[12px] sm:rounded-[16px] border-2 border-[#3e3630] backdrop-blur-lg overflow-x-auto scrollbar-hide ${
          highlightAI ? 'z-50' : ''
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          background: 'rgba(30, 17, 8, 0.2)',
          maxWidth: '100%',
          minWidth: 'fit-content'
        }}
      >
      {[
        { 
          color: isAIMode ? '#E74C3C' : '#9B59B6', 
          icon: isAIMode ? ZapOffIcon : BotIcon, 
          tooltip: isAIMode ? 'Exit AI Mode' : 'AI Assistant', 
          section: 'ai-toggle',
          isActive: isAIMode
        },
        { color: '#3498DB', icon: UserIcon, tooltip: 'About', section: 'about' },
        { color: '#8B5C3C', icon: BriefcaseIcon, tooltip: 'Experience', section: 'experience' },
        { color: '#E67E22', icon: FolderIcon, tooltip: 'Projects', section: 'projects' },
        { color: '#6C63FF', icon: BookOpenIcon, tooltip: 'Publications', section: 'publications' },
        { color: '#FF6B9D', icon: FileTextIcon, tooltip: 'Blog', section: 'blog' },
        { color: '#27AE60', icon: CodeIcon, tooltip: 'Skills', section: 'skills' },
        { color: '#F39C12', icon: MailIcon, tooltip: 'Contact', section: 'contact' }
      ].map((item, idx) => (
        <TouchIndicator
          key={idx}
          variant="dockItem"
          className="magic-ui-dock-item relative mx-0.5 sm:mx-1 md:mx-2 cursor-pointer group flex-shrink-0"
          onClick={() => {
            if (item.section === 'ai-toggle') {
              toggleAIMode();
            } else {
              // If in AI mode, first exit AI mode then navigate
              if (isAIMode) {
                toggleAIMode();
                setTimeout(() => {
                  const element = document.getElementById(item.section);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              } else {
                // Use the navigation handler if provided, otherwise fallback to direct scroll
                if (onSectionNavigate) {
                  onSectionNavigate(item.section);
                } else {
                  const element = document.getElementById(item.section);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }
            }
          }}
        >
          {/* Tooltip */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
            <div className="bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {item.tooltip}
            </div>
          </div>

          {/* Button with glow effect and hover animation */}
          <motion.div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative ${
              highlightAI && idx === 0 ? 'z-50' : ''
            }`}
            style={{
              backgroundColor: item.color,
              boxShadow: highlightAI && idx === 0 
                ? `0 0 25px ${item.color}, 0 0 50px ${item.color}80, 0 0 75px ${item.color}40`
                : `0 0 10px ${item.color}40`
            }}
            initial={{ scale: 1 }}
            whileHover={{ 
              scale: window?.innerWidth < 640 ? 1.1 : 1.2,
              y: window?.innerWidth < 640 ? -4 : -8,
              boxShadow: `0 0 15px ${item.color}80`,
              transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }
            }}
            whileTap={{ scale: 0.95 }}
            animate={highlightAI && idx === 0 ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                `0 0 25px ${item.color}, 0 0 50px ${item.color}80, 0 0 75px ${item.color}40`,
                `0 0 35px ${item.color}, 0 0 70px ${item.color}80, 0 0 100px ${item.color}40`,
                `0 0 25px ${item.color}, 0 0 50px ${item.color}80, 0 0 75px ${item.color}40`
              ]
            } : {}}
            transition={highlightAI && idx === 0 ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : {}}
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            
            {/* Tutorial spotlight overlay for AI button */}
            {highlightAI && idx === 0 && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/50"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0.3, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
            
            {/* Subtle inner glow/ring effect */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle, ${item.color}00 30%, ${item.color}80 100%)`,
                mixBlendMode: 'overlay'
              }}
            />
          </motion.div>
        </TouchIndicator>
      ))}
      </motion.div>
    </>
  );
};

export default Dock;