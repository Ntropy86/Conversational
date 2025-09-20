'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIAgent } from '../context/AIAgentContext';
import { useTheme } from '../context/ThemeContext';
import Card from './Card';
import DynamicBackground from './DynamicBackground';
import Input from './Input';
import Link from './Link';
import Chip from './Chip';
import { typographyClasses } from './Typography';
import { MonitorIcon, UserIcon, BriefcaseIcon, FolderIcon, CodeIcon, MailIcon } from './Icons';

const AIMode = () => {
  const { 
    conversation, 
    isListening, 
    startListening, 
    stopListening, 
    transcript, 
    setTranscript,
    isAIResponding, 
    addUserMessage, 
    generateAIResponse,
    toggleAIMode 
  } = useAIAgent();
  
  const { isDarkMode } = useTheme();
  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef(null);
  const contentRef = useRef(null);
  
  // Make dock and input visible when scrolling
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Lucide icons
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }, [conversation]);
  
  // Handle input submission
  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      addUserMessage(inputMessage);
      generateAIResponse(inputMessage);
      setInputMessage('');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // Ensure content doesn't go under fixed elements
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.paddingBottom = '120px';
    }
  }, [conversation]);
  
  // Custom button for the input
  const InputButton = () => (
    <motion.button 
      onClick={handleSendMessage}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-8 h-8 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
  
  return (
    <div className="min-h-screen">
      <DynamicBackground isDarkMode={true} />
      
      {/* Welcome screen layout */}
      {conversation.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <motion.h2 
            className={`text-white mb-4 text-center ${typographyClasses.heading}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: '48px', fontWeight: 300 }}
          >
            Hi!
          </motion.h2>
          <motion.h3 
            className={`text-white mb-16 text-center ${typographyClasses.heading}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: '36px', fontWeight: 300 }}
          >
            What can I tell about Nitigya?
          </motion.h3>
          
          {/* Single input and chatter text for welcome screen */}
          <div className="w-full max-w-[500px] px-4">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              customEndButton={<InputButton />}
              className="rounded-lg"
            />
            
            <motion.div 
              className={`text-center mt-4 ${typographyClasses.subtitle}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              not a chatter? <Link href="/resume" className={typographyClasses.paragraph}>View Resume</Link>
            </motion.div>
          </div>
          
          {/* Text above dock - only on welcome screen */}
          <motion.div 
            className={`text-center absolute bottom-36 px-4 ${typographyClasses.subtitle}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: '12px' }}
          >
            or you can click elements on the dock as well.
          </motion.div>
        </div>
      ) : (
        /* Conversation layout - matches screenshots */
        <div className="min-h-screen pt-8" ref={contentRef}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-40">
            {/* ALL messages displayed consistently */}
            {conversation.map((message, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                {message.role === 'user' ? (
                  // ALL user messages displayed as right-aligned bubbles
                  <div className="flex justify-end mb-6">
                    <div className="max-w-[85%] sm:max-w-[70%] bg-transparent rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-[#493c3c]">
                      <p className={typographyClasses.paragraph}>{message.content}</p>
                    </div>
                  </div>
                ) : (
                  // Assistant messages
                  <div className="w-full mb-16 text-left">
                    <p className="text-xl sm:text-2xl text-gray-400 mb-8">
                      {message.content}
                    </p>
                    
                    {/* Projects if any */}
                    {message.projects && message.projects.length > 0 && (
                      <div className="space-y-6">
                        {message.projects.map((project, idx) => (
                          <Card 
                            key={idx}
                            title={project.title}
                            subtitle={project.date}
                            hoverEffect={true}
                          >
                            <div className="mb-3 flex flex-wrap gap-2">
                              {project.technologies.map((tech, techIdx) => (
                                <Chip key={techIdx}>{tech}</Chip>
                              ))}
                            </div>
                            <p className={typographyClasses.paragraph}>{project.description}</p>
                          </Card>
                        ))}
                        
                        <div className="text-center mt-8">
                          <Link 
                            href="#projects"
                            onClick={() => toggleAIMode()}
                            className="text-gray-300 hover:text-white"
                          >
                            View All Projects
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Processing indicator */}
            <AnimatePresence>
              {isAIResponding && (
                <motion.div 
                  className="flex justify-center items-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <motion.div 
                      className="inline-block p-4 rounded-full bg-white bg-opacity-5 mb-3"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                      </svg>
                    </motion.div>
                    <p className={typographyClasses.subtitle}>processing. I'm a wittle swoah :3</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Fixed background behind input to prevent content showing through */}
      {conversation.length > 0 && (
        <div 
          className="fixed bottom-0 left-0 right-0 h-40 z-10"
          style={{
            background: 'linear-gradient(to top, rgba(30, 17, 8, 1) 50%, rgba(30, 17, 8, 0))',
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* Input field - ONLY shown in conversation mode */}
      {conversation.length > 0 && (
        <div className={`fixed ${isScrolled ? 'bottom-40' : 'bottom-36'} left-1/2 transform -translate-x-1/2 w-full max-w-[500px] px-4 z-20 transition-all duration-300`}>
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            customEndButton={<InputButton />}
            className="rounded-lg"
          />
        </div>
      )}
      
      {/* Dock element - fixed at bottom with Magic UI style */}
      <div className={`fixed ${isScrolled ? 'bottom-14' : 'bottom-10'} left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300`}>
        <motion.div 
          className="magic-ui-dock flex items-center p-2 bg-transparent rounded-[16px] border-2 border-[#3e3630] backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            background: 'rgba(30, 17, 8, 0.2)'
          }}
        >
          {[
            { 
              color: '#2ECC71', 
              icon: MonitorIcon, 
              tooltip: 'Regular Website', 
              section: 'website-mode',
              isWebsiteToggle: true
            },
            { color: '#3498DB', icon: UserIcon, tooltip: 'About', section: 'about' },
            { color: '#8B5C3C', icon: BriefcaseIcon, tooltip: 'Experience', section: 'experience' },
            { color: '#E67E22', icon: FolderIcon, tooltip: 'Projects', section: 'projects' },
            { color: '#27AE60', icon: CodeIcon, tooltip: 'Skills', section: 'skills' },
            { color: '#F39C12', icon: MailIcon, tooltip: 'Contact', section: 'contact' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              className="magic-ui-dock-item relative mx-2 cursor-pointer group"
              initial={{ scale: 1 }}
              whileHover={{ 
                scale: 1.2,
                y: -8,
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (item.isWebsiteToggle) {
                  // Just toggle AI mode, don't scroll
                  toggleAIMode();
                } else {
                  toggleAIMode();  // Turn off AI mode
                  // Wait a tiny bit for the mode to change, then scroll to section
                  setTimeout(() => {
                    const element = document.getElementById(item.section);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }
              }}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.tooltip}
                </div>
              </div>
              
              {/* Button with glow effect */}
              <motion.div
                className="w-12 h-12 rounded-full flex items-center justify-center relative"
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}40`
                }}
                whileHover={{
                  boxShadow: `0 0 15px ${item.color}80`
                }}
              >
                <item.icon className="w-5 h-5 text-white" />
                
                {/* Subtle inner glow/ring effect */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300" 
                  style={{
                    background: `radial-gradient(circle, ${item.color}00 30%, ${item.color}80 100%)`,
                    mixBlendMode: 'overlay'
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AIMode;