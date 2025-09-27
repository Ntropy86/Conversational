'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTheme } from '../context/ThemeContext';
import MainLayout from './MainLayout';
import { typographyClasses } from './Typography';
import Card from './Card';
import Chip from './Chip';
import Button from './Button';
import Link from './Link';
import ExternalLink from './ExternalLink';
import dynamic from 'next/dynamic';
import SectionTransition from './SectionTransition';
import { useAIAgent } from '../context/AIAgentContext';
import { motion, AnimatePresence } from 'framer-motion';
import TabManager from './TabManager';
import ContentPage from './ContentPage';
import Publications from './Publications';
import Blog from './Blog';
import { getExperienceContent, getProjectContent, getBlogContent, getPublicationContent, getSkillsContent, getEducationContent, getContactContent } from '../services/contentService';
import { portfolioConfig } from '../services/portfolioConfigService';

// Lazy load heavy components
const AIMode = dynamic(() => import('./AIMode'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  )
});

const SkillsRadar = dynamic(() => import('./SkillsRadar'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
    </div>
  )
});

// Small lazy wrapper that only mounts the heavy SkillsRadar when the section is visible
const SkillsRadarLazy = () => {
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || visible) return;

    if (typeof IntersectionObserver === 'undefined') {
      // If the browser doesn't support IntersectionObserver, fallback to immediate mount
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });

    observer.observe(el);

    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={wrapperRef}>
      {visible ? <SkillsRadar /> : (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
        </div>
      )}
    </div>
  );
};

// Experience Card Component - EXACT original design with JSON data mapping
const ExperienceCard = ({ experience, onClick }) => {
  // Map resume_data.json fields to original component structure
  const mappedExperience = {
    title: experience.role,
    subtitle: `${experience.company} • ${experience.location}`,
    preview: experience.highlights && experience.highlights[0] ? experience.highlights[0] : 'Professional experience in building scalable systems.',
    tags: experience.technologies || []
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={onClick}>
      <div className="space-y-4">
        {/* Company and Date */}
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {experience.category || 'Experience'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {experience.dates}
          </span>
        </div>

        {/* Title and Company */}
        <div>
          <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
            {mappedExperience.title}
          </h3>
          <p className={`text-sm mb-2 ${typographyClasses.subtitle}`}>
            {mappedExperience.subtitle}
          </p>
        </div>

        {/* Preview */}
        <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
          {mappedExperience.preview}
        </p>

        {/* Tags */}
        {mappedExperience.tags && mappedExperience.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mappedExperience.tags.map((tag, index) => (
              <Chip key={index} color="auto">{tag}</Chip>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="flex justify-between items-center pt-4">
          <Button
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

// Education Card Component - EXACT original design with JSON data mapping
const EducationCard = ({ education, onClick }) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={onClick}>
      <div className="space-y-4">
        {/* Education Type and Date */}
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {education.category || 'Education'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {education.dates}
          </span>
        </div>

        {/* Degree and Institution */}
        <div>
          <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
            {education.degree}
          </h3>
          <p className={`text-sm mb-2 ${typographyClasses.subtitle}`}>
            {education.institution}
          </p>
        </div>

        {/* GPA */}
        {education.gpa && (
          <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
            GPA: {education.gpa}
          </p>
        )}

        {/* Coursework Chips */}
        {education.coursework && education.coursework.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {education.coursework.slice(0, 5).map((course, index) => (
              <Chip key={index} color="auto">{course}</Chip>
            ))}
            {education.coursework.length > 5 && (
              <Chip color="auto">+{education.coursework.length - 5} more</Chip>
            )}
          </div>
        )}

        {/* Achievements Chips */}
        {education.achievements && education.achievements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {education.achievements.map((achievement, index) => (
              <Chip key={index} color="auto">{achievement}</Chip>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Read More Details
          </Button>
          
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs">Academic Achievement</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Skills Card Component - Individual skill category cards
const SkillCard = ({ category, skills, icon }) => {
  
  // Icon mapping for different skill categories
  const iconComponents = {
    languages: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    backend: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    databases: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    big_data: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    devops: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };

  const categoryNames = {
    languages: "Programming Languages",
    backend: "Backend & APIs",
    databases: "Databases",
    big_data: "Big Data & Analytics",
    devops: "DevOps & Cloud"
  };

  const categoryColors = {
    languages: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    backend: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    databases: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    big_data: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    devops: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <div className="space-y-4">
        {/* Category Header */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${categoryColors[category]}`}>
            {iconComponents[category]}
          </div>
          <h3 className={`text-lg font-semibold ${typographyClasses.heading}`}>
            {categoryNames[category]}
          </h3>
        </div>

        {/* Skills List */}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Chip key={index} color="auto">
              {skill}
            </Chip>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Project Card Component - EXACT original design with JSON data mapping
const ProjectCard = ({ project, onClick }) => {
  // Map resume_data.json fields to original component structure - use keywords instead of technologies for chips
  const mappedProject = {
    title: project.title,
    subtitle: `Personal Project • ${project.date || 'Recent'}`,
    preview: project.description || 'Innovative project showcasing technical skills and problem-solving.',
    tags: project.keywords || project.technologies || []
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={onClick}>
      <div className="space-y-4">
        {/* Project Type and Date */}
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {project.category || 'Project'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {project.dates}
          </span>
        </div>

        {/* Title and Subtitle */}
        <div>
          <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
            {mappedProject.title}
          </h3>
          <p className={`text-sm mb-2 ${typographyClasses.subtitle}`}>
            {mappedProject.subtitle}
          </p>
        </div>

        {/* Preview */}
        <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
          {mappedProject.preview}
        </p>

        {/* Tags */}
        {mappedProject.tags && mappedProject.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mappedProject.tags.map((tag, index) => (
              <Chip key={index} color="auto">{tag}</Chip>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-3">
            {project.link && (
              <Link 
                href={project.link} 
                external 
              >
                View Details
              </Link>
            )}
            {project.links?.demo && (
              <Link 
                href={project.links.demo} 
                external 
              >
                Live Demo
              </Link>
            )}
            {project.link && (
              <Link 
                href={project.link} 
                external 
              >
                <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                GitHub
              </Link>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs">Project</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function HomeClient({ resumeData, experiences, projects, education }) {
  const { isAIMode, toggleAIMode } = useAIAgent();
  const { isDarkMode } = useTheme();
  
  // Tab system state
  const [tabs, setTabs] = useState([
    { id: 'overview', title: 'Overview', type: 'overview', closeable: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('overview');
  
  // Content data - passed from server component (no more useState for data!)
  const [loadedContent, setLoadedContent] = useState({});
  const [showTabLimitAlert, setShowTabLimitAlert] = useState(false);
  const [highlightAIButton, setHighlightAIButton] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const DISMISS_KEY = 'ai_onboarding_dismissed_v1';
  const SHOWN_KEY = 'ai_onboarding_shown_v1';
  
  // Show more/less states
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Scroll to top when opening content tabs
  useEffect(() => {
    if (activeTabId !== 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTabId]);

  // Initialize Lucide icons
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }, []);

  // Tab management functions
  const openTab = async (type, item) => {
    const MAX_TABS = 5;
    
    // If already have 4+ tabs and trying to open a new one, show AI popup instead
    if (tabs.length >= 4 && !tabs.find(tab => tab.id === item.id)) {
      setHighlightAIButton(true);
      setShowAIPopup(true);
      const highlightTimer = setTimeout(() => {
        setHighlightAIButton(false);
      }, 5000);
      return () => {
        clearTimeout(highlightTimer);
      };
    }
    
    if (tabs.length >= MAX_TABS && !tabs.find(tab => tab.id === item.id)) {
      setShowTabLimitAlert(true);
      setTimeout(() => setShowTabLimitAlert(false), 3000);
      return;
    }

    const existingTab = tabs.find(tab => tab.id === item.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    let content;
    try {
      switch (type) {
        case 'experience':
          content = await getExperienceContent(item.id);
          break;
        case 'project':
          content = await getProjectContent(item.id);
          break;
        case 'education':
          content = await getEducationContent(item.id);
          break;
        default:
          content = null;
      }
    } catch (error) {
      console.error('Error loading content:', error);
      content = null;
    }

    const newTab = {
      id: item.id,
      title: item.role || item.title || item.institution || 'Content',
      type: type,
      closeable: true
    };

    setTabs(prev => [...prev, newTab]);
    setLoadedContent(prev => ({
      ...prev,
      [item.id]: content
    }));
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId) => {
    if (tabId === 'overview') return;
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    setLoadedContent(prev => {
      const newContent = { ...prev };
      delete newContent[tabId];
      return newContent;
    });
    
    if (activeTabId === tabId) {
      setActiveTabId('overview');
    }
  };

  const handleSectionNavigate = (section) => {
    setActiveTabId('overview');
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Early return for AI Mode
  if (isAIMode) {
    return <AIMode />;
  }

  // Main portfolio content
  return (
    <MainLayout onSectionNavigate={handleSectionNavigate} highlightAI={highlightAIButton}>
      {/* Tab Limit Alert */}
      <AnimatePresence>
        {showTabLimitAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Maximum 5 tabs allowed. Close some tabs to open new content.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Mode Suggestion - Using your Card design system */}
      <AnimatePresence>
      {showAIPopup && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 max-w-sm"
          >
            <Card className="relative border border-gray-200 dark:border-gray-700">
              {/* Close Button */}
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="pr-6">
                {/* Icon */}
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className={`font-semibold ${typographyClasses.heading}`}>
                    Try AI Mode
                  </span>
                </div>

                {/* Content */}
                <p className={`${typographyClasses.body} text-sm mb-4 opacity-80`}> 
                  You&apos;ve opened several tabs! To keep things organized, please close some tabs first. Or try AI Mode to search through my resume instead.
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="text-gray-700 dark:text-gray-200"
                    onClick={() => {
                      toggleAIMode();
                      setShowAIPopup(false);
                    }}
                  >
                    Try AI Mode
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                    onClick={() => {
                      setShowAIPopup(false);
                    }}
                  >
                    Later
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Manager */}
      <TabManager 
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onTabClose={closeTab}
      />

      {/* Content based on active tab */}
      {activeTabId === 'overview' ? (
        <div className="space-y-16 pb-20">
          {/* About Section */}
          <SectionTransition id="about">
            <section id="about" className="space-y-8">
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-32 h-32 mx-auto rounded-full overflow-hidden"
                >
                  <Image
                    src="/photo.jpeg"
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`text-4xl md:text-6xl ${typographyClasses.heading}`}
                >
                  {resumeData.name || 'Nitigya Kargeti'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`text-xl md:text-2xl ${typographyClasses.subtitle}`}
                >
                  {resumeData.headline || 'System Builder — Data-Intensive Backend & Applied ML'}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={`max-w-2xl mx-auto ${typographyClasses.body}`}
                >
                  {resumeData.profile || 'Engineer focused on scalable, low-latency data systems, AWS/GCP pipelines, and LLM-integrated applications.'}
                </motion.p>
              </div>
            </section>
          </SectionTransition>

          {/* Experience Section - Dynamic from resume_data.json */}
          <SectionTransition id="experience">
            <section id="experience" className="space-y-8">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-3xl md:text-4xl ${typographyClasses.heading}`}
              >
                Experience
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`${typographyClasses.subtitle} mb-8`}
              >
                Professional journey spanning research institutions, startups, and government organizations, focusing on scalable systems, machine learning, and innovative technology solutions.
              </motion.p>
              <div className="grid gap-6 md:gap-8">
                {experiences.slice(0, showAllExperience ? experiences.length : 3).map((experience, index) => (
                  <motion.div
                    key={experience.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ExperienceCard 
                      experience={experience} 
                      onClick={() => openTab('experience', experience)}
                    />
                  </motion.div>
                ))}
              </div>
              {experiences.length > 3 && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllExperience(!showAllExperience)}
                  >
                    {showAllExperience ? 'Show Less' : `Show All ${experiences.length} Experiences`}
                  </Button>
                </div>
              )}
            </section>
          </SectionTransition>

          {/* Projects Section - Dynamic from resume_data.json */}
          <SectionTransition id="projects">
            <section id="projects" className="space-y-8">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-3xl md:text-4xl ${typographyClasses.heading}`}
              >
                Projects
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`${typographyClasses.subtitle} mb-8`}
              >
                A collection of impactful projects spanning web development, machine learning, systems programming, and AI applications, each solving real-world problems with innovative approaches.
              </motion.p>
              <div className="grid gap-6 md:gap-8">
                {projects.slice(0, showAllProjects ? projects.length : 3).map((project, index) => (
                  <motion.div
                    key={project.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProjectCard 
                      project={project} 
                      onClick={() => openTab('project', project)}
                    />
                  </motion.div>
                ))}
              </div>
              {projects.length > 3 && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllProjects(!showAllProjects)}
                  >
                    {showAllProjects ? 'Show Less' : `Show All ${projects.length} Projects`}
                  </Button>
                </div>
              )}
            </section>
          </SectionTransition>

          {/* Education Section - Dynamic from resume_data.json */}
          <SectionTransition id="education">
            <section id="education" className="space-y-8">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-3xl md:text-4xl ${typographyClasses.heading}`}
              >
                Education
              </motion.h2>
              <div className="grid gap-6 md:gap-8">
                {education.map((edu, index) => (
                  <motion.div
                    key={edu.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <EducationCard education={edu} onClick={() => openTab('education', edu)} />
                  </motion.div>
                ))}
              </div>
            </section>
          </SectionTransition>

          {/* Skills Section */}
          <SectionTransition id="skills">
            <section id="skills" className="space-y-8">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-3xl md:text-4xl ${typographyClasses.heading}`}
              >
                Skills & Technologies
              </motion.h2>
              
              {/* Individual Skill Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumeData.skills && Object.entries(resumeData.skills).map(([category, skills], index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <SkillCard category={category} skills={skills} />
                  </motion.div>
                ))}
              </div>
              
              {/* Skills Radar Chart (deferred) */}
              <div className="mt-6">
                <SkillsRadarLazy />
              </div>
            </section>
          </SectionTransition>

          {/* Publications Section */}
          <Publications />

          {/* Blog Section */}
          <Blog />

          {/* Contact Section */}
          <SectionTransition id="contact">
            <section id="contact" className="space-y-8">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-3xl md:text-4xl ${typographyClasses.heading}`}
              >
                Get In Touch
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center space-y-8"
              >
                <p className={`text-lg ${typographyClasses.body} max-w-2xl mx-auto`}>
                  I&apos;m always interested in hearing about new opportunities, especially those involving challenging technical problems.
                </p>
                
                {/* Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {/* Email Card */}
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => window.open(`mailto:${resumeData.contact?.email}`)}>
                    <div className="text-center space-y-4 p-2">
                      <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${typographyClasses.heading}`}>Email</h3>
                        <p className={`text-sm ${typographyClasses.subtitle} opacity-80`}>{resumeData.contact?.email}</p>
                      </div>
                    </div>
                  </Card>

                  {/* LinkedIn Card */}
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => window.open(resumeData.contact?.linkedin)}>
                    <div className="text-center space-y-4 p-2">
                      <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${typographyClasses.heading}`}>LinkedIn</h3>
                        <p className={`text-sm ${typographyClasses.subtitle} opacity-80`}>Connect professionally</p>
                      </div>
                    </div>
                  </Card>

                  {/* GitHub Card */}
                  <ExternalLink href={resumeData.contact?.github}>
                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300">
                      <div className="text-center space-y-4 p-2">
                        <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className={`font-semibold ${typographyClasses.heading}`}>GitHub</h3>
                          <p className={`text-sm ${typographyClasses.subtitle} opacity-80`}>View my code</p>
                        </div>
                      </div>
                    </Card>
                  </ExternalLink>
                </div>

                {/* Location */}
                <div className="pt-4">
                  <p className={`text-sm ${typographyClasses.subtitle} opacity-80`}>
                    📍 Currently in {resumeData.contact?.location || 'Palo Alto, CA'}
                  </p>
                </div>
              </motion.div>
            </section>
          </SectionTransition>
        </div>
      ) : (
        /* Tab Content */
        <ContentPage
          title={loadedContent[activeTabId]?.title || tabs.find(t => t.id === activeTabId)?.title || 'Content'}
          content={loadedContent[activeTabId]?.content || 'Loading...'}
          onBack={() => setActiveTabId('overview')}
        />
      )}
    </MainLayout>
  );
}