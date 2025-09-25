'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '../context/ThemeContext';
import MainLayout from '../components/MainLayout';
import { typographyClasses } from '../components/Typography';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Button from '../components/Button';
import Link from '../components/Link';
import dynamic from 'next/dynamic';
import SectionTransition from '../components/SectionTransition';

// Lazy load heavy components
const AIMode = dynamic(() => import('../components/AIMode'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  )
});

const SkillsRadar = dynamic(() => import('../components/SkillsRadar'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
    </div>
  )
});
import { useAIAgent } from '../context/AIAgentContext';
import { motion, AnimatePresence } from 'framer-motion';
import TabManager from '../components/TabManager';
import ContentPage from '../components/ContentPage';
import Publications from '../components/Publications';
import Blog from '../components/Blog';
import { getExperienceContent, getProjectContent, getExperienceList, getProjectList, getBlogContent, getPublicationContent, getSkillsContent, getPublicationList, getSkillsList, getEducationContent, getEducationList, getContactContent, getContactList } from '../services/contentService';
import { portfolioConfig } from '../services/portfolioConfigService';

// Experience Card Component
const ExperienceCard = ({ experience, onClick }) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={onClick}>
      <div className="space-y-4">
        {/* Company and Date */}
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Experience
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {experience.subtitle.split('•').pop()?.trim() || ''}
          </span>
        </div>

        {/* Title and Company */}
        <div>
          <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
            {experience.title}
          </h3>
          <p className={`text-sm mb-2 ${typographyClasses.subtitle}`}>
            {experience.subtitle}
          </p>
        </div>

        {/* Preview */}
        <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
          {experience.preview}
        </p>

        {/* Tags */}
        {experience.tags && experience.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {experience.tags.map((tag, index) => (
              <Chip key={index} color="auto">{tag}</Chip>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onCard={true}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Read More Details
          </Button>
          
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs">Professional Experience</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Project Card Component  
const ProjectCard = ({ project, onClick }) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={onClick}>
      <div className="space-y-4">
        {/* Project Type and Year */}
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Project
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {project.subtitle.includes('•') ? project.subtitle.split('•')[1]?.trim() : new Date().getFullYear()}
          </span>
        </div>

        {/* Title and Subtitle */}
        <div>
          <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
            {project.title}
          </h3>
          <p className={`text-sm mb-2 ${typographyClasses.subtitle}`}>
            {project.subtitle}
          </p>
        </div>

        {/* Preview */}
        <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
          {project.preview}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <Chip key={index} color="auto">{tag}</Chip>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onCard={true}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              View Details
            </Button>
            {project.links?.demo && (
              <Button
                size="sm"
                onCard={true}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.links.demo, '_blank');
                }}
              >
                Live Demo
              </Button>
            )}
            {project.links?.github && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.links.github, '_blank');
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs">Personal Project</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function Home() {
  const { isAIMode, toggleAIMode } = useAIAgent();
  const { isDarkMode } = useTheme();
  
  // Tab system state
  const [tabs, setTabs] = useState([
    { id: 'overview', title: 'Overview', type: 'overview', closeable: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('overview');
  
  // Content data
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadedContent, setLoadedContent] = useState({});
  const [showTabLimitAlert, setShowTabLimitAlert] = useState(false);
  const [highlightAIButton, setHighlightAIButton] = useState(false);
  
  // Show more/less states
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Scroll to top when opening content tabs
  useEffect(() => {
    if (activeTabId !== 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTabId]);

  // Load content metadata on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [expList, projList] = await Promise.all([
          getExperienceList(),
          getProjectList()
        ]);
        setExperiences(expList);
        setProjects(projList);
      } catch (error) {
        console.error('Error loading content lists:', error);
      }
    }
    loadData();
  }, []);

  // Initialize Lucide icons
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }, [tabs, activeTabId]);
  
  // Handle opening content in new tab
  const handleOpenContent = async (type, id) => {
    console.log(`Attempting to open ${type} content with id: ${id}`);
    const tabId = `${type}-${id}`;
    
    // Check if tab already exists
    const existingTab = tabs.find(tab => tab.id === tabId);
    if (existingTab) {
      console.log(`Tab ${tabId} already exists, switching to it`);
      setActiveTabId(tabId);
      return;
    }
    
    // Check tab limit
    if (tabs.length >= 3) {
      console.log(`Tab limit reached (${tabs.length}/3)`);
      setShowTabLimitAlert(true);
      setHighlightAIButton(true);
      return;
    }
    
    // Load content
    try {
      console.log(`Loading ${type} content for id: ${id}`);
      let content;
      if (type === 'experience') {
        content = await getExperienceContent(id);
      } else if (type === 'project') {
        content = await getProjectContent(id);
      } else if (type === 'blog') {
        content = await getBlogContent(id);
      } else if (type === 'publication') {
        content = await getPublicationContent(id);
      } else if (type === 'skills') {
        content = await getSkillsContent(id);
      } else if (type === 'education') {
        content = await getEducationContent(id);
      } else if (type === 'contact') {
        content = await getContactContent(id);
      }
      
      console.log(`Content loaded:`, content ? 'success' : 'failed', content?.title);
        
      if (content) {
        // Add content to loaded content
        setLoadedContent(prev => ({
          ...prev,
          [tabId]: content
        }));
        
        // Add new tab
        const newTab = {
          id: tabId,
          title: content.title,
          type: type,
          closeable: true,
          contentId: id
        };
        
        console.log(`Creating new tab:`, newTab);
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(tabId);
      } else {
        console.error(`No content returned for ${type}/${id}`);
      }
    } catch (error) {
      console.error(`Error loading ${type} content:`, error);
    }
  };

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTabId(tabId);
  };

  // Handle tab close
  const handleTabClose = (tabId) => {
    if (tabId === 'overview') return; // Can't close overview tab
    
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      
      // If closing active tab, switch to overview or previous tab
      if (activeTabId === tabId) {
        const activeIndex = prev.findIndex(tab => tab.id === tabId);
        const newActiveTab = activeIndex > 0 ? prev[activeIndex - 1] : prev[0];
        setActiveTabId(newActiveTab.id);
      }
      
      return newTabs;
    });
    
    // Remove loaded content
    setLoadedContent(prev => {
      const newContent = { ...prev };
      delete newContent[tabId];
      return newContent;
    });
  };

  // Reset tabs to overview only
  const resetTabs = () => {
    setTabs([{ id: 'overview', title: 'Overview', type: 'overview', closeable: false }]);
    setActiveTabId('overview');
    setLoadedContent({});
  };



  // Get current tab and content
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const activeContent = activeTab ? loadedContent[activeTab.id] : null;

  // Handle section navigation from dock
  const handleSectionNavigate = (sectionId) => {
    // Check if the section exists in the current view first
    const element = document.getElementById(sectionId);
    
    if (element) {
      // Section exists in current view, just scroll to it
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTabId !== 'overview') {
      // Section doesn't exist in current tab, switch to overview
      setActiveTabId('overview');
      setTimeout(() => {
        const overviewElement = document.getElementById(sectionId);
        if (overviewElement) {
          overviewElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <>
      {isAIMode ? (
        <div className="h-screen w-screen">
          <AIMode />  
        </div>
      ) : (
        <MainLayout onSectionNavigate={handleSectionNavigate} highlightAI={highlightAIButton}>
          <TabManager 
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
          />
          
          <AnimatePresence mode="wait">
            {activeTabId === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="pt-8"
              >
                {/* About Section */}
                <SectionTransition className="mb-16 md:mb-24" type="fade-in">
                  <section id="about" className="mb-16 md:mb-24">
                    {/* Grid Layout: Text on left, Image on right */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
                      {/* Left Column - Text Content */}
                      <div className="lg:col-span-2">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="space-y-2 md:space-y-3"
                        >
                          <h2 className={`text-base md:text-lg ${typographyClasses.heading}`}>Hi, I'm</h2>
                          <h1 className={`text-3xl md:text-4xl lg:text-5xl ${typographyClasses.heading}`}>{portfolioConfig.getTitle()}</h1>
                          <h3 className={`text-xl md:text-2xl lg:text-3xl ${typographyClasses.heading}`}>{portfolioConfig.getSubtitle()}</h3>
                          <h4 className={`text-lg md:text-xl ${typographyClasses.subtitle}`}>{portfolioConfig.getTagline()}</h4>
                        </motion.div>
                      </div>

                      {/* Right Column - Image */}
                      <div className="flex justify-center lg:justify-end">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10 flex-shrink-0"
                          style={{ aspectRatio: '1/1' }}
                        >
                          <Image 
                            src="/photo.jpeg" 
                            alt="Nitigya Kargeti" 
                            width={144}
                            height={144}
                            sizes="(max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
                            priority={true}
                            className="w-full h-full object-cover object-center"
                          />
                        </motion.div>
                      </div>
                    </div>
                    
                    <motion.div 
                      className="mb-8 mt-6 md:mt-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <p className={typographyClasses.paragraph}>
                        {portfolioConfig.getDescription()}
                      </p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <Button onClick={() => {
                        window.location.href = '/resume';
                      }}>View my Resume</Button>
                    </motion.div>
                  </section>
                </SectionTransition>

                {/* Work Section - Combined Experience and Current Projects */}
                <SectionTransition type="slide-up" className="mb-16 md:mb-24">
                  <section id="experience" className="relative">
                    <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4 ${typographyClasses.heading} flex items-center gap-3`}>
                      <span className="text-2xl md:text-3xl">💼</span>
                      Work
                    </h2>
                    <p className={`mb-8 md:mb-12 text-sm md:text-base ${typographyClasses.body} max-w-2xl`}>
                      My professional journey includes graduate research at UW‑Madison, startup engineering at a B2B SaaS company, 
                      and research contributions at India's premier computing and defense institutes. Plus my current projects 
                      that are shaping the future of AI systems.
                    </p>
                    <div className="grid gap-6 md:gap-8 lg:gap-12">
                      {experiences.slice(0, showAllExperience ? experiences.length : 2).map((exp, index) => (
                        <motion.div
                          key={exp.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                          <ExperienceCard 
                            experience={exp}
                            onClick={() => handleOpenContent('experience', exp.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                    {!showAllExperience && experiences.length > 2 && (
                      <div className="text-center mt-8">
                        <Button onClick={() => setShowAllExperience(true)}>
                          Show More Experience
                        </Button>
                      </div>
                    )}
                    {showAllExperience && experiences.length > 2 && (
                      <div className="text-center mt-8">
                        <Button 
                          variant="secondary"
                          onClick={() => setShowAllExperience(false)}
                        >
                          Show Less
                        </Button>
                      </div>
                    )}
                  </section>
                </SectionTransition>

                {/* Projects Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section id="projects" className="relative">
                    <h2 className={`text-3xl md:text-4xl mb-4 ${typographyClasses.heading} flex items-center gap-3`}>
                      <span className="text-2xl md:text-3xl">🚀</span>
                      Projects
                    </h2>
                    <p className={`mb-12 ${typographyClasses.body} max-w-2xl`}>
                      A collection of impactful projects spanning web development, machine learning, systems programming, 
                      and AI applications, each solving real-world problems with innovative approaches.
                    </p>
                    <div className="grid gap-8 md:gap-12">
                      {projects.slice(0, showAllProjects ? projects.length : 2).map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                          <ProjectCard 
                            project={project}
                            onClick={() => handleOpenContent('project', project.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                    {!showAllProjects && projects.length > 2 && (
                      <div className="text-center mt-8">
                        <Button onClick={() => setShowAllProjects(true)}>
                          Show More Projects
                        </Button>
                      </div>
                    )}
                    {showAllProjects && projects.length > 2 && (
                      <div className="text-center mt-8">
                        <Button 
                          variant="secondary"
                          onClick={() => setShowAllProjects(false)}
                        >
                          Show Less
                        </Button>
                      </div>
                    )}
                  </section>
                </SectionTransition>

                {/* Current Projects Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section id="current-projects" className="relative">
                    <h2 className={`text-3xl md:text-4xl mb-4 ${typographyClasses.heading} flex items-center gap-3`}>
                      <span className="text-2xl md:text-3xl">⚡</span>
                      Current Projects
                    </h2>
                    <p className={`mb-12 ${typographyClasses.body} max-w-2xl`}>
                      What I'm building right now—works in progress, experiments, and explorations 
                      that showcase my current learning and development focus.
                    </p>
                    
                    <div className="space-y-8">
                      {/* Conversational AI Portfolio */}
                      <Card className="hover:shadow-lg transition-all duration-300">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              🚧 In Progress
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Dec 2024 – Present</span>
                          </div>
                          
                          <div>
                            <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
                              AI-Powered Interactive Portfolio
                            </h3>
                            <p className={`text-sm mb-2 ${typographyClasses.subtitle}`}>
                              Next.js + FastAPI + Qwen-7B • Voice-enabled AI assistant
                            </p>
                          </div>
                          
                          <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
                            <strong>You're looking at it right now!</strong> This portfolio website features a conversational AI assistant 
                            that can answer questions about my experience, projects, and skills using RAG-lite architecture. 
                            Built with Next.js frontend and FastAPI backend, it includes real-time voice interaction, 
                            streaming responses, and professional guardrails for meaningful conversations.
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <Chip color="auto">Next.js 14</Chip>
                            <Chip color="auto">FastAPI</Chip>
                            <Chip color="auto">Qwen-7B</Chip>
                            <Chip color="auto">Voice AI</Chip>
                            <Chip color="auto">RAG</Chip>
                          </div>
                          
                          <div className="pt-2">
                            <p className={`${typographyClasses.body} text-xs text-gray-500`}>
                              <strong>Current focus:</strong> Optimizing response quality, improving voice recognition accuracy, 
                              and adding conversation memory across sessions.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      {/* Agent Framework Exploration */}
                      <Card className="hover:shadow-lg transition-all duration-300">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              🔬 Exploring
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Jan 2025</span>
                          </div>
                          
                          <div>
                            <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
                              Multi-Agent Search & Research Assistant
                            </h3>
                            <p className={`text-sm mb-2 ${typographyClasses.subtitle}`}>
                              LangGraph + CrewAI • Distributed research automation
                            </p>
                          </div>
                          
                          <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
                            Experimenting with multi-agent systems for automated research and information synthesis. 
                            Agents specialize in web search, document analysis, fact-checking, and report generation. 
                            Learning about agent orchestration, tool usage, and quality control in AI workflows.
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <Chip color="auto">LangGraph</Chip>
                            <Chip color="auto">CrewAI</Chip>
                            <Chip color="auto">Multi-Agent</Chip>
                            <Chip color="auto">Research Automation</Chip>
                          </div>
                          
                          <div className="pt-2">
                            <p className={`${typographyClasses.body} text-xs text-gray-500`}>
                              <strong>Learning goals:</strong> Agent coordination patterns, tool integration strategies, 
                              and balancing automation with human oversight.
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </section>
                </SectionTransition>

                {/* Education Section */}
                <SectionTransition type="slide-up" className="mb-16 md:mb-24">
                  <section id="education" className="relative">
                    <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4 ${typographyClasses.heading} flex items-center gap-3`}>
                      <span className="text-2xl md:text-3xl">🎓</span>
                      Education
                    </h2>
                    <p className={`mb-8 md:mb-12 text-sm md:text-base ${typographyClasses.body} max-w-2xl`}>
                      Academic foundation in computer science and specialized training in machine learning, 
                      systems programming, and research methodologies.
                    </p>
                    
                    <div className="space-y-6">
                      {/* Master's Degree */}
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleOpenContent('education', 'masters-computer-science')}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              Master's Degree
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">2023 – 2025</span>
                          </div>
                          
                          <div>
                            <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
                              Master of Science in Computer Science
                            </h3>
                            <p className={`text-sm mb-2 ${typographyClasses.subtitle}`}>
                              University of Wisconsin–Madison • GPA: 3.8/4.0
                            </p>
                          </div>
                          
                          <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
                            Specialized in Machine Learning, Human-Computer Interaction, and Systems Programming. 
                            Graduate research in educational robotics, multi-agent systems, and conversational AI 
                            at the People & Robots Lab under NSF funding.
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <Chip color="auto">Machine Learning</Chip>
                            <Chip color="auto">HCI Research</Chip>
                            <Chip color="auto">Systems Programming</Chip>
                            <Chip color="auto">Educational Robotics</Chip>
                          </div>
                        </div>
                      </Card>
                      
                      {/* Bachelor's Degree */}
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleOpenContent('education', 'bachelors-computer-science')}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Bachelor's Degree
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">2019 – 2023</span>
                          </div>
                          
                          <div>
                            <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
                              Bachelor of Technology in Computer Science & Engineering
                            </h3>
                            <p className={`text-sm mb-2 ${typographyClasses.subtitle}`}>
                              Graphic Era Hill University, Dehradun, India • GPA: 8.7/10.0
                            </p>
                          </div>
                          
                          <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
                            Foundation in computer science fundamentals, algorithms, data structures, and software engineering. 
                            Undergraduate research in brain-computer interfaces, signal processing, and biomedical applications. 
                            Published research on sleep apnea detection using deep learning.
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <Chip color="auto">Computer Science</Chip>
                            <Chip color="auto">Algorithms & Data Structures</Chip>
                            <Chip color="auto">BCI Research</Chip>
                            <Chip color="auto">Signal Processing</Chip>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </section>
                </SectionTransition>

                {/* Publications Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section id="publications" className="relative">
                    <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6 ${typographyClasses.heading} flex items-center gap-3`}>
                      <span className="text-2xl md:text-3xl">📚</span>
                      Publications
                    </h2>
                    <Publications />
                  </section>
                </SectionTransition>

                {/* Blog Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section id="blog" className="relative">
                    <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6 ${typographyClasses.heading} flex items-center gap-3`}>
                      <span className="text-2xl md:text-3xl">✍️</span>
                      Blog
                    </h2>
                    <Blog onPostClick={(post) => handleOpenContent('blog', post.id)} />
                  </section>
                </SectionTransition>

                {/* Skills Section */}
                <SectionTransition type="slide-up" className="mb-16 md:mb-24">
                  <section id="skills" className="relative">
                    <h2 className={`text-xl md:text-2xl lg:text-3xl mb-6 md:mb-8 ${typographyClasses.heading} flex items-center gap-3`}>
                      <span className="text-xl md:text-2xl">⚙️</span>
                      Technical Skills
                    </h2>
                    <p className={`mb-8 md:mb-12 text-sm md:text-base ${typographyClasses.body} max-w-2xl`}>
                      Core technologies I use for production work, organized by domain expertise. 
                      ⭐ indicates primary skills I'm most confident deploying in production environments.
                    </p>
                    
                    {/* Grouped Skills by Domain */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      {/* Backend & Infrastructure */}
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleOpenContent('skills', 'backend-apis')}>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg ${typographyClasses.heading} flex items-center gap-2`}>
                              <span className="text-xl">🔧</span>
                              Backend & APIs
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Chip color="auto">⭐ FastAPI</Chip>
                              <Chip color="auto">⭐ Python</Chip>
                              <Chip color="auto">⭐ PostgreSQL</Chip>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Chip color="secondary">MongoDB</Chip>
                              <Chip color="secondary">Node.js</Chip>
                              <Chip color="secondary">Redis</Chip>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* ML & AI Systems */}
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleOpenContent('skills', 'ml-ai')}>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg ${typographyClasses.heading} flex items-center gap-2`}>
                              <span className="text-xl">🤖</span>
                              ML & AI
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Chip color="auto">⭐ PyTorch</Chip>
                              <Chip color="auto">⭐ LLM Integration</Chip>
                              <Chip color="auto">⭐ RAG</Chip>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Chip color="secondary">TensorFlow</Chip>
                              <Chip color="secondary">LangChain</Chip>
                              <Chip color="secondary">OpenCV</Chip>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Data & Analytics - Map to ML & AI content */}
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleOpenContent('skills', 'ml-ai')}>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg ${typographyClasses.heading} flex items-center gap-2`}>
                              <span className="text-xl">📊</span>
                              Data & Analytics
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Chip color="auto">⭐ SQL</Chip>
                              <Chip color="auto">⭐ Statistical Modeling</Chip>
                              <Chip color="auto">⭐ PySpark</Chip>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Chip color="secondary">ETL Pipelines</Chip>
                              <Chip color="secondary">A/B Testing</Chip>
                              <Chip color="secondary">Plotly</Chip>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Frontend & UI */}
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleOpenContent('skills', 'frontend-ui')}>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg ${typographyClasses.heading} flex items-center gap-2`}>
                              <span className="text-xl">💻</span>
                              Frontend & UI
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Chip color="auto">⭐ Next.js</Chip>
                              <Chip color="auto">⭐ React</Chip>
                              <Chip color="auto">⭐ TypeScript</Chip>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Chip color="secondary">Tailwind CSS</Chip>
                              <Chip color="secondary">Framer Motion</Chip>
                              <Chip color="secondary">Chrome Extensions</Chip>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Cloud & DevOps */}
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleOpenContent('skills', 'devops-infrastructure')}>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg ${typographyClasses.heading} flex items-center gap-2`}>
                              <span className="text-xl">☁️</span>
                              Cloud & DevOps
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Chip color="auto">⭐ AWS</Chip>
                              <Chip color="auto">⭐ Docker</Chip>
                              <Chip color="auto">⭐ GitHub Actions</Chip>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Chip color="secondary">Kubernetes</Chip>
                              <Chip color="secondary">Linux</Chip>
                              <Chip color="secondary">GCP</Chip>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Research & Tools */}
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleOpenContent('skills', 'research-specialized')}>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg ${typographyClasses.heading} flex items-center gap-2`}>
                              <span className="text-xl">🔬</span>
                              Research & Specialized
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Chip color="auto">⭐ Signal Processing</Chip>
                              <Chip color="auto">⭐ BCI Systems</Chip>
                              <Chip color="auto">⭐ Julia</Chip>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Chip color="secondary">MATLAB</Chip>
                              <Chip color="secondary">R</Chip>
                              <Chip color="secondary">C++</Chip>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                    
                    {/* Interactive Radar Chart */}
                    <SectionTransition delay={0.1}>
                      <div className="mb-8">
                        <h3 className={`text-lg mb-4 ${typographyClasses.heading}`}>Interactive Skills Overview</h3>
                        <SkillsRadar />
                      </div>
                    </SectionTransition>

                  </section>
                </SectionTransition>

                {/* Contact Section */}
                <SectionTransition type="slide-up" className="mb-16 md:mb-24">
                  <section id="contact" className="relative">
                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleOpenContent('contact', 'professional-profile')}>
                      <div className="space-y-6 md:space-y-8">
                        {/* Header */}
                        <div>
                          <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4 ${typographyClasses.heading} flex items-center gap-3`}>
                            <span className="text-2xl md:text-3xl">📧</span>
                            Get In Touch
                          </h2>
                          <p className={`mb-4 md:mb-6 text-sm md:text-base ${typographyClasses.body}`}>
                            Always interested in discussing new opportunities, collaborations, or just having a conversation 
                            about technology, AI, and building impactful solutions.
                          </p>
                          <p className={`mb-6 md:mb-8 text-sm md:text-base ${typographyClasses.body}`}>
                            I'm actively seeking Full‑Stack & ML Developer roles building intelligent search, 
                            agent systems, and conversational AI applications. Open to remote, hybrid, or 
                            on-site opportunities (H1B visa sponsorship welcome).
                          </p>
                        </div>
                        
                        {/* Contact Information */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <Link href="mailto:kargeti@wisc.edu" external className={`${typographyClasses.body}`}>kargeti@wisc.edu</Link>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <Link href="tel:+16082178515" external className={`${typographyClasses.body}`}>+1 (608) 217-8515</Link>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className={`${typographyClasses.body}`}>Palo Alto, CA</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <Link href="https://github.com/Ntropy86" external className={`${typographyClasses.body}`}>GitHub</Link>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => {
                            window.location.href = 'mailto:kargeti@wisc.edu';
                          }}
                        >
                          Say Hello
                        </Button>
                      </div>
                    </Card>
                  </section>
                </SectionTransition>
              </motion.div>
            )}

            {/* Individual content pages */}
            {activeTab && activeTab.type !== 'overview' && activeContent && (
              <motion.div
                key={activeTabId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ContentPage 
                  title={activeContent.title}
                  content={activeContent.content}
                  onBack={() => setActiveTabId('overview')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </MainLayout>
      )}
      
      {/* macOS-style Tab Limit Alert */}
      <AnimatePresence>
        {showTabLimitAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => {
              setShowTabLimitAlert(false);
              setHighlightAIButton(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-[#2a2a2a] rounded-xl p-6 max-w-md mx-4 border border-[#3e3e3e] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#3498DB] to-[#8B5C3C] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-xl mb-3 ${typographyClasses.heading}`}>
                  Wow, you wanna know a lot about me! 🤯
                </h3>
                <p className={`mb-6 ${typographyClasses.paragraph} text-gray-300`}>
                  You're Really looking for soemthing aren't you? Why not try the AI Assistant instead? 
                  It can answer all your questions about my work and experience!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setShowTabLimitAlert(false);
                      setHighlightAIButton(false);
                      if (!isAIMode) {
                        toggleAIMode();
                      }
                    }}
                    className="bg-gradient-to-r from-[#3498DB] to-[#8B5C3C]"
                  >
                    Try AI Assistant
                  </Button>
                  <Button
                    onClick={() => {
                      setShowTabLimitAlert(false);
                      setHighlightAIButton(false);
                      resetTabs(); // Reset tabs when closing the popup
                    }}
                    className="bg-transparent border border-gray-600 hover:bg-gray-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}