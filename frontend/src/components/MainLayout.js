'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAIAgent } from '../context/AIAgentContext';
import DynamicBackground from './DynamicBackground';
import Link from './Link';
import Button from './Button';
import Dock from './Dock';
import ContactPopup from './ContactPopup';
import { typographyClasses } from './Typography';
import { getMasterData } from '../services/contentService';

const MainLayout = ({ children, onSectionNavigate, highlightAI }) => {
  const { isDarkMode } = useTheme();
  const { isAIMode, toggleAIMode, showContactPopup, setShowContactPopup } = useAIAgent();
  const [activeSection, setActiveSection] = useState('about');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navLinks, setNavLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Update active section based on scroll position with improved viewport detection
  useEffect(() => {
    const handleScroll = () => {
      // Set scrolled state for styling
      setScrolled(window.scrollY > 50);
      
      // Get all sections
      const sections = document.querySelectorAll('section[id]');
      
      // Get the vertical middle of the viewport
      const viewportMiddle = window.innerHeight / 2;
      
      // Find which section is most visible in the viewport
      let maxVisibleSection = null;
      let maxVisiblePercentage = 0;
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        
        // Calculate how much of the section is visible in the viewport
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(window.innerHeight, rect.bottom);
        
        if (visibleBottom > visibleTop) {
          // Section is at least partially visible
          const visibleHeight = visibleBottom - visibleTop;
          const sectionHeight = rect.height;
          const visiblePercentage = visibleHeight / sectionHeight;
          
          // Check if this section is more visible than the previous max
          if (visiblePercentage > maxVisiblePercentage) {
            maxVisiblePercentage = visiblePercentage;
            maxVisibleSection = section.getAttribute('id');
          }
          
          // Give priority to sections near the middle of the viewport
          const sectionMiddle = (rect.top + rect.bottom) / 2;
          const distanceFromViewportMiddle = Math.abs(sectionMiddle - viewportMiddle);
          
          // If the section is near the center of the viewport and reasonably visible (>20%),
          // prioritize it regardless of visible percentage
          if (distanceFromViewportMiddle < 150 && visiblePercentage > 0.2) {
            maxVisibleSection = section.getAttribute('id');
          }
        }
      });
      
      // Default to first section if nothing is visible
      const newActiveSection = maxVisibleSection || 'about';
      
      if (newActiveSection !== activeSection) {
        setActiveSection(newActiveSection);
      }
    };
    
    // Throttle the scroll event to improve performance
    let scrollTimeout;
    const throttledScrollHandler = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          handleScroll();
          scrollTimeout = null;
        }, 150);
      }
    };
    
    window.addEventListener('scroll', throttledScrollHandler);
    // Initial call to set correct section on load
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      clearTimeout(scrollTimeout);
    };
  }, [activeSection]);

  // Load master data for navigation and social links
  useEffect(() => {
    const loadMasterData = async () => {
      const data = await getMasterData();
      setNavLinks(data.navigation || []);
      const links = (data.socialLinks || []).map(link => ({
        ...link,
        icon: getIcon(link.icon)
      }));
      setSocialLinks(links);
    };
    loadMasterData();
  }, []);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'github':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        );
      case 'linkedin':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        );
      case 'scholar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  // Custom animations for sidebar elements
  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DynamicBackground isDarkMode={isDarkMode} />
      
      {/* Mobile menu toggle */}
      <div className={`fixed top-4 right-4 z-50 md:hidden ${isAIMode ? 'hidden' : ''}`}>
        <Button
          onClick={toggleMenu}
          className="p-2 bg-amber-900 bg-opacity-80 backdrop-blur-sm"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </Button>
      </div>

      <div className="fixed top-4 right-4 z-50 hidden md:block">
        {/* <Toggle 
          checked={isDarkMode} 
          onChange={toggleTheme} 
          label={isDarkMode ? 'Dark' : 'Light'} 
        /> */}
      </div>

      {/* Fixed Sidebar */}
      <AnimatePresence>
      <motion.aside 
        className={`fixed left-0 top-0 h-screen w-full md:w-64 flex flex-col justify-between py-6 md:py-8 px-4 md:px-6 z-40 transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isAIMode ? 'hidden' : ''}`}
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        style={{
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)"
        }}
        >
          <div className="flex flex-col h-full">
            <motion.div className="mb-6 md:mb-8" variants={itemVariants}>
              <motion.h1 
                className={`text-xl md:text-2xl lg:text-3xl ${typographyClasses.heading}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Nitigya Kargeti
              </motion.h1>
              <motion.p 
                className={`mt-1 text-sm md:text-base ${typographyClasses.subtitle}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                I build intelligent systems :)
              </motion.p>
            </motion.div>

            {/* AI Mode toggle */}
            <motion.div 
              className="mb-6 md:mb-8"
              variants={itemVariants}
            >
              <Button 
                className="text-xs md:text-sm w-full py-2 md:py-3"
                onClick={toggleAIMode}
              >
                {isAIMode ? 'Switch to Text Mode' : 'Switch to AI Mode'}
              </Button>
            </motion.div> 
            
            {/* Mobile theme toggle */}
            <motion.div 
              className="md:hidden mb-8"
              variants={itemVariants}
            >
              {/* <Toggle 
                checked={isDarkMode} 
                onChange={toggleTheme} 
                label={isDarkMode ? 'Dark' : 'Light'} 
              /> */}
            </motion.div>
            
            {/* Navigation with enhanced animations */}
            <motion.nav 
              className="mb-auto"
              variants={itemVariants}
            >
              <ul className="space-y-3 md:space-y-5">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.href.substring(1);
                  return (
                    <motion.li 
                      key={link.name}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                      variants={itemVariants}
                    >
                      <Link 
                        href={link.href} 
                        className={`nav-link text-base md:text-lg ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setIsMenuOpen(false);
                          const element = document.querySelector(link.href);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.nav>
            
            {/* Social links */}
            <motion.div 
              className="mt-auto"
              variants={itemVariants}
            >
              <motion.div 
                className="flex space-x-5 mb-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {socialLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (index * 0.1), duration: 0.3, type: "spring", stiffness: 300 }}
                    className="relative z-[100]"
                  >
                    <Link href={link.href} external className="hover:opacity-80" aria-label={link.name}>
                      {link.icon}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
       {/* Main content */}
       <motion.main
         className="flex-1 py-6 md:py-12 px-4 md:px-6 lg:px-20 pb-20 md:pb-24 overflow-y-auto md:ml-64"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.5 }}
       >
         <div className="max-w-3xl mx-auto pt-8 md:pt-16 lg:pt-10">
           {children}
         </div>
       </motion.main>       {/* Dock */}
       <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-40 overflow-visible">
         <Dock onSectionNavigate={onSectionNavigate} highlightAI={highlightAI} />
       </div>

       {/* Contact Popup */}
       <ContactPopup 
         isOpen={showContactPopup} 
         onClose={() => setShowContactPopup(false)} 
       />
     </div>
   );
 };

export default MainLayout;