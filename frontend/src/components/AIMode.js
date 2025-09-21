'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIAgent } from '../context/AIAgentContext';
import { useTheme } from '../context/ThemeContext';
import useVAD from '../hooks/useVAD';
import Card from './Card';
import ContentPage from './ContentPage';
import DynamicBackground from './DynamicBackground';
import Input from './Input';
import Link from './Link';
import Chip from './Chip';
import Button from './Button';
import { typographyClasses } from './Typography';
import { MonitorIcon, UserIcon, BriefcaseIcon, FolderIcon, CodeIcon, MailIcon, BookOpenIcon, FileTextIcon } from './Icons';
import { loadMarkdownContent } from '../services/contentService';

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
    clearConversation,
    toggleAIMode,
    isBackendConnected,
    audioProcessing,
    processAudioData
  } = useAIAgent();
  
  const { isDarkMode } = useTheme();
  const [inputMessage, setInputMessage] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const [currentView, setCurrentView] = useState('conversation'); // 'conversation' or 'content'
  const [currentContent, setCurrentContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const inputRef = useRef(null);
  const contentRef = useRef(null);
  
  // Use ref to track voice mode intent persistently (survives re-renders)
  const voiceModeIntentRef = useRef(false);
  
  // VAD integration for voice input
  const vad = useVAD({
    positiveSpeechThreshold: 0.8,
    negativeSpeechThreshold: 0.2,
    minSpeechFrames: 3,
    redemptionFrames: 10,
    onSpeechStart: () => {
      console.log('Speech started');
    },
    onSpeechEnd: async (audio) => {
      console.log('Speech ended, samples:', audio.length);
      console.log('🔍 Current state check:', { 
        voiceMode, 
        voiceModeIntent: voiceModeIntentRef.current,
        isBackendConnected, 
        audioProcessing,
        vadIsListening: vad.isListening 
      });
      
      // Use persistent voiceMode intent ref (survives React re-renders)
      const shouldProcessAudio = voiceModeIntentRef.current && isBackendConnected && !audioProcessing;
      console.log('🎯 Should process audio:', shouldProcessAudio, '(based on persistent intent ref)');
      
      if (shouldProcessAudio) {
        try {
          console.log('🎯 Starting audio processing...');
          const result = await processAudioData(audio);
          console.log('✅ Audio processing completed:', result);
          
        } catch (error) {
          console.error('❌ Error in audio processing:', error);
        }
      } else {
        console.log('⏭️ Skipping audio processing - voiceModeIntent:', voiceModeIntentRef.current, 'backend:', isBackendConnected, 'processing:', audioProcessing);
      }
    },
    onVADMisfire: () => {
      console.log('VAD misfire');
    }
  });
  
  // Make dock and input visible when scrolling
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Log voiceMode changes for debugging
  useEffect(() => {
    console.log('🔄 voiceMode state changed to:', voiceMode);
  }, [voiceMode]);
  
  // Handle audioProcessing state changes - pause/resume VAD
  useEffect(() => {
    console.log('🔄 audioProcessing state changed to:', audioProcessing);
    
    // Only manage VAD if we're in voice mode and VAD is loaded
    if (!voiceModeIntentRef.current || !vad.isLoaded) {
      console.log('⏭️ Skipping VAD management - voiceMode:', voiceModeIntentRef.current, 'vadLoaded:', vad.isLoaded);
      return;
    }
    
    if (audioProcessing) {
      // Pause VAD during processing to prevent multiple concurrent requests
      if (vad.isListening) {
        console.log('⏸️ Pausing VAD due to audioProcessing=true...');
        const success = vad.toggle(false);
        console.log('🎯 VAD pause result:', success);
      }
    } else {
      // Resume VAD when processing completes, but only if we're still in voice mode
      if (voiceModeIntentRef.current && !vad.isListening) {
        console.log('▶️ Resuming VAD due to audioProcessing=false...');
        const success = vad.toggle(true);
        console.log('🎯 VAD resume result:', success);
      }
    }
  }, [audioProcessing, vad.isLoaded, vad.isListening, vad.toggle]);
  
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

  // Load content for a specific item
  const loadContent = async (item) => {
    setContentLoading(true);
    try {
      // Determine content type based on item structure
      let contentType = 'projects'; // default
      if (item.company || item.role) {
        contentType = 'experiences';
      }
      
      const content = await loadMarkdownContent(contentType.slice(0, -1), item.id);
      if (content) {
        setCurrentContent({
          title: item.title || item.company,
          content: content.content,
          item: item
        });
        setCurrentView('content');
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  // Go back to conversation view
  const goBackToConversation = () => {
    setCurrentView('conversation');
    setCurrentContent(null);
  };

  // Voice mode controls
  const startVoiceMode = () => {
    console.log('🎤 startVoiceMode called:', { 
      vadLoaded: vad.isLoaded, 
      backendConnected: isBackendConnected, 
      audioProcessing: audioProcessing,
      currentVoiceMode: voiceMode
    });
    
    // Don't start if already processing audio
    if (audioProcessing) {
      console.log('⏸️ Cannot start voice mode - audio is being processed');
      return;
    }
    
    if (vad.isLoaded && isBackendConnected && !audioProcessing) {
      console.log('✅ Setting voiceMode intent to true');
      voiceModeIntentRef.current = true;
      setVoiceMode(true);
      
      console.log('🟢 Starting VAD...');
      const success = vad.toggle(true);
      console.log('🎯 VAD toggle result:', success);
      
      if (!success) {
        console.error('❌ Failed to start VAD, reverting voiceMode intent to false');
        voiceModeIntentRef.current = false;
        setVoiceMode(false);
      }
    } else {
      console.log('⏭️ Cannot start voice mode:', {
        vadLoaded: vad.isLoaded,
        backendConnected: isBackendConnected,
        audioProcessing: audioProcessing
      });
    }
  };

  const stopVoiceMode = () => {
    console.log('🛑 stopVoiceMode called:', { vadListening: vad.isListening });
    
    console.log('✅ Setting voiceMode intent to false');
    voiceModeIntentRef.current = false;
    
    if (vad.isListening) {
      console.log('🔴 Stopping VAD...');
      const success = vad.toggle(false);
      console.log('🎯 VAD toggle stop result:', success);
      if (success) {
        console.log('✅ Setting voiceMode to false');
        setVoiceMode(false);
      } else {
        console.error('❌ Failed to stop VAD');
      }
    } else {
      console.log('ℹ️ VAD not listening, just setting voiceMode to false');
      setVoiceMode(false);
    }
  };

  const toggleVoiceMode = () => {
    console.log('🔄 toggleVoiceMode called - current voiceMode:', voiceMode);
    if (voiceMode) {
      console.log('➡️ Stopping voice mode...');
      stopVoiceMode();
    } else {
      console.log('➡️ Starting voice mode...');
      startVoiceMode();
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
      className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center"
      disabled={inputMessage.trim() === ''}
      style={{
        opacity: inputMessage.trim() === '' ? 0.4 : 1
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </motion.button>
  );

  // Voice mode button
  const VoiceButton = () => {
    // Determine button state and color
    const getButtonState = () => {
      if (audioProcessing) return { color: 'yellow', label: 'Processing' };
      if (voiceMode) return { color: 'red', label: 'Stop' };
      return { color: 'green', label: 'Start' };
    };
    
    const buttonState = getButtonState();
    
    return (
      <motion.button 
        onClick={audioProcessing ? undefined : toggleVoiceMode}
        whileHover={audioProcessing ? {} : { scale: 1.1 }}
        whileTap={audioProcessing ? {} : { scale: 0.95 }}
        disabled={!vad.isLoaded || !isBackendConnected || isAIResponding}
        className={`p-2 rounded-full flex items-center justify-center transition-colors ${
          buttonState.color === 'yellow' 
            ? 'bg-yellow-500 hover:bg-yellow-600' 
            : buttonState.color === 'red'
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        } ${(!vad.isLoaded || !isBackendConnected) ? 'opacity-40' : ''} ${
          audioProcessing ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        title={`${buttonState.label} voice mode`}
      >
        {audioProcessing ? (
          <motion.svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
          </motion.svg>
        ) : voiceMode ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="6" y="6" width="12" height="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19V22" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </motion.button>
    );
  };
  
  return (
    <div className="min-h-screen">
      <DynamicBackground isDarkMode={true} />
      
      {/* Content View - when viewing specific markdown content */}
      {currentView === 'content' && currentContent && (
        <div className="min-h-screen pt-8">
          {/* Header with only back button */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1e1108] to-transparent py-4">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <motion.button
                onClick={goBackToConversation}
                className={`flex items-center ${typographyClasses.subtitle} hover:${typographyClasses.heading} transition-colors`}
                whileHover={{ x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to AI Chat
              </motion.button>
            </div>
          </div>
          
          {/* Content */}
          <div className="pt-20">
            <ContentPage 
              title={currentContent.title}
              content={currentContent.content}
              onBack={goBackToConversation}
            />
          </div>
        </div>
      )}
      
      {/* Welcome screen layout */}
      {currentView === 'conversation' && conversation.length === 0 && (
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
              placeholder={voiceMode ? "Listening... speak now" : "Type your message..."}
              customEndButton={
                <div className="flex items-center space-x-2">
                  <VoiceButton />
                  <InputButton />
                </div>
              }
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

            {/* Status indicators */}
            <motion.div 
              className="text-center mt-6 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span>Backend {isBackendConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${vad.isLoaded ? 'bg-green-400' : vad.isLoading ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  <span>Voice {vad.isLoaded ? 'Ready' : vad.isLoading ? 'Loading...' : 'Error'}</span>
                </div>
              </div>
              {(audioProcessing || isAIResponding) && (
                <div className="mt-2 text-blue-400">
                  {audioProcessing ? 'Processing your voice...' : 'AI is responding...'}
                </div>
              )}
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
      )}
      
      {/* Conversation layout - matches screenshots */}
      {currentView === 'conversation' && conversation.length > 0 && (
        <div className="min-h-screen pt-8" ref={contentRef}>
          {/* Clear conversation button */}
          <div className="fixed top-4 right-4 z-50">
            <motion.button
              onClick={clearConversation}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-red-500 border border-red-500 rounded-lg text-white hover:bg-red-600 hover:border-red-600 transition-colors text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="sm:w-[14px] sm:h-[14px]">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              <span className="hidden sm:inline">Clear Chat</span>
              <span className="sm:hidden">Clear</span>
            </motion.button>
          </div>
          
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pb-32 md:pb-40">
            {/* ALL messages displayed consistently */}
            {conversation.map((message, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 md:mb-8"
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
                    <div className="flex items-start gap-3 mb-8">
                      <p className="text-xl sm:text-2xl text-gray-400 flex-1">
                        {message.content}
                      </p>
                      {message.enhancementPending && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-blue-400">Enhancing...</span>
                        </div>
                      )}
                      {message.enhanced && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-400">Enhanced</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Structured data cards */}
                    {message.structuredData && message.structuredData.items && message.structuredData.items.length > 0 && (
                      <div className="space-y-6">
                        {message.structuredData.items.map((item, idx) => (
                          <Card 
                            key={item.id || idx}
                            title={item.title || item.company}
                            subtitle={item.date || item.dates || item.role}
                            hoverEffect={true}
                            className="cursor-pointer transition-all duration-200"
                            onClick={() => {
                              // Stay in AI mode and load content
                              if (item.id && !contentLoading) {
                                loadContent(item);
                              } else if (item.link) {
                                window.open(item.link, '_blank');
                              }
                            }}
                          >
                            {/* Technologies/Skills chips */}
                            {item.technologies && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                {item.technologies.map((tech, techIdx) => (
                                  <Chip key={techIdx}>{tech}</Chip>
                                ))}
                              </div>
                            )}
                            
                            {/* Description or highlights */}
                            {item.description && (
                              <p className={typographyClasses.paragraph}>{item.description}</p>
                            )}
                            
                            {item.highlights && (
                              <ul className="space-y-2 mt-3">
                                {item.highlights.slice(0, 2).map((highlight, hIdx) => (
                                  <li key={hIdx} className={`text-sm text-gray-300`}>
                                    • {highlight}
                                  </li>
                                ))}
                                {item.highlights.length > 2 && (
                                  <li className="text-sm text-gray-400 italic">
                                    +{item.highlights.length - 2} more achievements...
                                  </li>
                                )}
                              </ul>
                            )}
                            
                            {/* Metrics if available */}
                            {item.metrics && (
                              <div className="mt-3 text-sm text-blue-400">
                                📊 {item.metrics}
                              </div>
                            )}
                            
                            {/* Skills section special handling */}
                            {item.skills && (
                              <div className="flex flex-wrap gap-2">
                                {item.skills.map((skill, skillIdx) => (
                                  <Chip key={skillIdx} className="text-xs">{skill}</Chip>
                                ))}
                              </div>
                            )}
                          </Card>
                        ))}
                        
                        {/* Navigation link based on item type */}
                        <div className="text-center mt-8">
                          <Link 
                            href={`#${message.structuredData.item_type}`}
                            onClick={() => {
                              toggleAIMode();
                              setTimeout(() => {
                                const element = document.getElementById(message.structuredData.item_type);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 100);
                            }}
                            className="text-gray-300 hover:text-white"
                          >
                            View All {message.structuredData.item_type.charAt(0).toUpperCase() + message.structuredData.item_type.slice(1)}
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Special handling for rate limit - show resume button */}
                    {message.structuredData && message.structuredData.item_type === 'rate_limit' && (
                      <div className="text-center mt-8">
                        <Button 
                          onClick={() => {
                            window.open('/resume', '_blank');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
                        >
                          📄 View My Resume
                        </Button>
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
                      className="inline-block mb-3"
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
            
            {/* Content loading indicator */}
            <AnimatePresence>
              {contentLoading && (
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
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                      </svg>
                    </motion.div>
                    <p className={typographyClasses.subtitle}>Loading content...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Fixed background behind input to prevent content showing through */}
      {currentView === 'conversation' && conversation.length > 0 && (
        <div 
          className="fixed bottom-0 left-0 right-0 h-40 z-10"
          style={{
            background: 'linear-gradient(to top, rgba(30, 17, 8, 1) 50%, rgba(30, 17, 8, 0))',
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* Input field - ONLY shown in conversation mode */}
      {currentView === 'conversation' && conversation.length > 0 && (
        <div className={`fixed ${isScrolled ? 'bottom-40' : 'bottom-36'} left-1/2 transform -translate-x-1/2 w-full max-w-[500px] px-4 z-20 transition-all duration-300`}>
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={voiceMode ? "Listening... speak now" : "Type your message..."}
            customEndButton={
              <div className="flex items-center space-x-1">
                <VoiceButton />
                <InputButton />
              </div>
            }
            className="rounded-lg"
          />
        </div>
      )}
      
      {/* Dock element - fixed at bottom with Magic UI style */}
      <div className={`fixed ${isScrolled ? 'bottom-14' : 'bottom-10'} left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 px-4 w-full max-w-screen overflow-visible`}>
        <div className="flex justify-center overflow-visible">
          <motion.div 
            className="magic-ui-dock flex items-center p-1 sm:p-2 bg-transparent rounded-[12px] sm:rounded-[16px] border-2 border-[#3e3630] backdrop-blur-lg overflow-visible"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
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
              color: '#2ECC71', 
              icon: MonitorIcon, 
              tooltip: 'Regular Website', 
              section: 'website-mode',
              isWebsiteToggle: true
            },
            { color: '#3498DB', icon: UserIcon, tooltip: 'About', section: 'about' },
            { color: '#8B5C3C', icon: BriefcaseIcon, tooltip: 'Experience', section: 'experience' },
            { color: '#E67E22', icon: FolderIcon, tooltip: 'Projects', section: 'projects' },
            { color: '#6C63FF', icon: BookOpenIcon, tooltip: 'Publications', section: 'publications' },
            { color: '#FF6B9D', icon: FileTextIcon, tooltip: 'Blog', section: 'blog' },
            { color: '#27AE60', icon: CodeIcon, tooltip: 'Skills', section: 'skills' },
            { color: '#F39C12', icon: MailIcon, tooltip: 'Contact', section: 'contact' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              className="magic-ui-dock-item relative mx-0.5 sm:mx-1 md:mx-2 cursor-pointer group flex-shrink-0"
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
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                <div className="bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.tooltip}
                </div>
              </div>
              
              {/* Button with glow effect */}
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative"
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}40`
                }}
                whileHover={{
                  boxShadow: `0 0 15px ${item.color}80`
                }}
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                
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
    </div>
  );
};

export default AIMode;