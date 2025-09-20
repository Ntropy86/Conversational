'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import MainLayout from '../components/MainLayout';
import { typographyClasses } from '../components/Typography';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Button from '../components/Button';
import AIMode from '../components/AIMode';
import SectionTransition from '../components/SectionTransition';
import SkillsRadar from '../components/SkillsRadar';
import { useAIAgent } from '../context/AIAgentContext';
import { motion, AnimatePresence } from 'framer-motion';
import TabManager from '../components/TabManager';
import ContentPage from '../components/ContentPage';
import Publications from '../components/Publications';
import Blog from '../components/Blog';
import { getExperienceContent, getProjectContent, getExperienceList, getProjectList, getBlogContent } from '../services/contentService';

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
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Project Details
          </Button>
          
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
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <h2 className={`text-base md:text-lg mb-2 ${typographyClasses.heading}`}>Hi, my name is</h2>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex items-center justify-between flex-wrap gap-4"
                    >
                      <h1 className={`text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-4 ${typographyClasses.heading} flex-1 min-w-0`}>Nitigya Kargeti</h1>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden shadow-lg flex-shrink-0 ring-2 ring-white/20"
                      >
                        <img 
                          src="/photo.jpeg" 
                          alt="Nitigya Kargeti" 
                          className="w-full h-full object-cover object-center"
                        />
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <h3 className={`text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 ${typographyClasses.heading}`}>I build intelligent systems.</h3>
                    </motion.div>
                    
                    <motion.div 
                      className="mb-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <p className={`mb-4 ${typographyClasses.paragraph}`}>
                        I'm a Data Scientist and ML Engineer specializing in building (and occasionally designing) 
                        exceptional digital experiences. Currently, I'm focused on building accessible, 
                        human-centered AI solutions at UW-Madison.
                      </p>
                      <p className={typographyClasses.paragraph}>
                        With expertise in machine learning, natural language processing, and computer vision, 
                        I develop AI-powered applications that solve real-world problems and enhance user experiences.
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

                {/* Experience Section */}
                <SectionTransition type="slide-up" className="mb-16 md:mb-24">
                  <section id="experience">
                    <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4 ${typographyClasses.heading}`}>Experience</h2>
                    <p className={`mb-8 md:mb-12 text-sm md:text-base ${typographyClasses.body} max-w-2xl`}>
                      Professional journey spanning research institutions, startups, and government organizations, 
                      focusing on scalable systems, machine learning, and innovative technology solutions.
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
                  <section id="projects">
                    <h2 className={`text-3xl md:text-4xl mb-4 ${typographyClasses.heading}`}>Projects</h2>
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

                {/* Publications Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <Publications />
                </SectionTransition>

                {/* Blog Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <Blog onPostClick={(post) => handleOpenContent('blog', post.id)} />
                </SectionTransition>

                {/* Skills Section */}
                <SectionTransition type="slide-up" className="mb-16 md:mb-24">
                  <section id="skills">
                    <h2 className={`text-xl md:text-2xl lg:text-3xl mb-6 md:mb-8 ${typographyClasses.heading}`}>Technical Skills</h2>
                    
                    {/* Radar Chart Visualization */}
                    <SectionTransition delay={0.1}>
                      <div className="mb-8 md:mb-12">
                        <SkillsRadar />
                      </div>
                    </SectionTransition>
                    

                  </section>
                </SectionTransition>

                {/* Contact Section */}
                <SectionTransition type="slide-up" className="mb-16 md:mb-24">
                  <section id="contact">
                    <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4 ${typographyClasses.heading}`}>Get In Touch</h2>
                    <p className={`mb-8 md:mb-12 text-sm md:text-base ${typographyClasses.body} max-w-2xl`}>
                      Always interested in discussing new opportunities, collaborations, or just having a conversation 
                      about technology, AI, and building impactful solutions.
                    </p>
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <div className="space-y-4">
                        {/* Contact Type Badge */}
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Contact
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Open to opportunities
                          </span>
                        </div>

                        {/* Message */}
                        <div>
                          <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading}`}>
                            Let's Connect
                          </h3>
                          <p className={`${typographyClasses.body} text-sm leading-relaxed mb-4`}>
                            I'm currently looking for new opportunities in AI/ML research and development. 
                            Whether you have a question or just want to say hi, I'll do my best to get back to you!
                          </p>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className={`${typographyClasses.body} text-sm`}>kargeti@wisc.edu</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className={`${typographyClasses.body} text-sm`}>+1 (608) 217-8515</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className={`${typographyClasses.body} text-sm`}>Madison, WI</span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex justify-between items-center pt-4">
                          <Button
                            onClick={() => {
                              window.location.href = 'mailto:kargeti@wisc.edu';
                            }}
                          >
                            Say Hello
                          </Button>
                          
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs">Let's chat!</span>
                          </div>
                        </div>
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