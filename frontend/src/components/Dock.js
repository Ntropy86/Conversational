'use client';
import { useEffect, memo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAIAgent } from '../context/AIAgentContext';
import { TouchIndicator, touchVariants } from '../utils/touchInteractions';
import { BotIcon, ZapOffIcon, ZapIcon, GraduationCapIcon, RocketIcon, StarIcon, UserIcon, BriefcaseIcon, FolderIcon, CodeIcon, MailIcon, BookOpenIcon, FileTextIcon, PenIcon, HomeIcon, ClockIcon } from './Icons';
import DockBottomSheet from './DockBottomSheet';

const Dock = ({ onSectionNavigate, highlightAI }) => {
  const { isAIMode, toggleAIMode } = useAIAgent();
  const router = useRouter();
  const pathname = usePathname();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize Lucide icons when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }, [isAIMode]);

  // Dock items configuration
  const dockItems = [
    // Home button (first when not on home page)
    ...(pathname !== '/' ? [{ color: '#34C759', icon: HomeIcon, tooltip: 'Home', section: 'home' }] : []),
    // AI Mode toggle
    { 
      color: isAIMode ? '#E74C3C' : '#9B59B6', 
      icon: isAIMode ? ZapOffIcon : BotIcon, 
      tooltip: isAIMode ? 'Exit AI Mode' : 'AI Assistant', 
      section: 'ai-toggle',
      isActive: isAIMode
    },
    // Guestbook (second in AI mode, not shown when on guestbook page)
    ...(pathname !== '/guestbook' ? [{ color: '#FF6B9D', icon: PenIcon, tooltip: 'Guestbook', section: 'guestbook' }] : []),
    // Time Machine (only on mobile, not shown when on home page)
    ...(isMobile ? [{ color: '#6C63FF', icon: ClockIcon, tooltip: 'Time Machine', section: 'time-machine' }] : []),
    { color: '#3498DB', icon: UserIcon, tooltip: 'About', section: 'about' },
    { color: '#8B5C3C', icon: BriefcaseIcon, tooltip: 'Work', section: 'experience' },
    { color: '#E67E22', icon: FolderIcon, tooltip: 'Projects', section: 'projects' },
    { color: '#AF52DE', icon: GraduationCapIcon, tooltip: 'Education', section: 'education' },
    { color: '#6C63FF', icon: BookOpenIcon, tooltip: 'Publications', section: 'publications' },
    { color: '#FF6B9D', icon: FileTextIcon, tooltip: 'Blog', section: 'blog' },
    { color: '#27AE60', icon: CodeIcon, tooltip: 'Skills', section: 'skills' },
    { color: '#F39C12', icon: MailIcon, tooltip: 'Contact', section: 'contact' }
  ];

  // Handle item click (used by both dock and bottom sheet)
  const handleItemClick = (item) => {
    if (item.section === 'ai-toggle') {
      const isOnHomePage = pathname === '/';
      if (!isOnHomePage) {
        router.push('/?ai=true');
      } else {
        toggleAIMode();
      }
    } else if (item.section === 'home') {
      router.push('/');
    } else if (item.section === 'guestbook') {
      router.push('/guestbook');
    } else if (item.section === 'time-machine') {
      // Dispatch custom event to open Time Machine
      window.dispatchEvent(new Event('openTimeMachine'));
    } else {
      const isOnHomePage = pathname === '/';
      if (!isOnHomePage) {
        router.push(`/#${item.section}`);
      } else {
        if (isAIMode) {
          toggleAIMode();
          setTimeout(() => {
            const element = document.getElementById(item.section);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } else {
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
    }
  };

  // Long press handlers for tablets
  const handleTouchStart = (e, index) => {
    if (isMobile) return; // Mobile uses bottom sheet instead
    
    const timer = setTimeout(() => {
      setActiveTooltip(index);
    }, 500); // 500ms long press
    
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <>
      {/* highlight overlay removed - user preference: only show popup notification */}
      
      <motion.div
        className={`magic-ui-dock flex items-center p-1 sm:p-2 bg-transparent rounded-[10px] sm:rounded-[16px] border-2 border-[#3e3630] backdrop-blur-lg overflow-visible`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          background: 'rgba(30, 17, 8, 0.2)',
          maxWidth: '95vw',
          minWidth: 'fit-content',
          gap: '0.125rem',
          overflow: 'visible'
        }}
        onClick={() => {
          if (isMobile) {
            setIsBottomSheetOpen(true);
          }
        }}
      >
      {dockItems.map((item, idx) => (
        <TouchIndicator
          key={idx}
          variant="dockItem"
          className="magic-ui-dock-item relative mx-0 sm:mx-1 md:mx-2 cursor-pointer group flex-shrink-0"
          style={{
            minWidth: isMobile ? '44px' : '48px',
            minHeight: isMobile ? '44px' : '48px',
          }}
          onClick={(e) => {
            if (!isMobile) {
              e.stopPropagation();
              handleItemClick(item);
            }
          }}
          onTouchStart={(e) => {
            if (!isMobile) {
              handleTouchStart(e, idx);
            }
          }}
          onTouchEnd={(e) => {
            if (!isMobile) {
              handleTouchEnd();
            }
          }}
          onTouchMove={handleTouchMove}
        >
          {/* Tooltip - glassmorphic style matching design system, show on hover for desktop/tablet, hidden on mobile */}
          <div 
            className={`absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] ${
              isMobile ? 'hidden' : ''
            }`}
          >
            <div 
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg border border-purple-400/20"
              style={{
                background: 'rgba(52, 40, 32, 0.75)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                color: '#ffffff',
              }}
            >
              {item.tooltip}
            </div>
          </div>

          {/* Button with glow effect and hover animation */}
          <motion.div
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center relative ${
              highlightAI && idx === 0 ? 'z-50' : ''
            }`}
            style={{
              backgroundColor: item.color,
              boxShadow: `0 0 10px ${item.color}40`
            }}
            initial={{ scale: 1 }}
            whileHover={{ 
              scale: 1.2,
              y: -8,
              boxShadow: `0 0 15px ${item.color}80`,
              transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }
            }}
            whileTap={{ scale: 0.95 }}
            animate={{}}
            transition={{}}
          >
            <item.icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
            {/* highlight removed */}
            
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
      
      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <DockBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          items={dockItems}
          onItemClick={(item) => {
            handleItemClick(item);
            setIsBottomSheetOpen(false);
          }}
        />
      )}
    </>
  );
};

export default memo(Dock);