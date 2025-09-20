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
import { useAIAgent } from '../context/AIAgentContext';
import { motion, AnimatePresence } from 'framer-motion';
import TabManager from '../components/TabManager';
import ContentPage from '../components/ContentPage';
import { getExperienceContent, getProjectContent, getExperienceList, getProjectList } from '../services/contentService';

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
    const tabId = `${type}-${id}`;
    
    // Check if tab already exists
    const existingTab = tabs.find(tab => tab.id === tabId);
    if (existingTab) {
      setActiveTabId(tabId);
      return;
    }
    
    // Check tab limit
    if (tabs.length >= 3) {
      setShowTabLimitAlert(true);
      setHighlightAIButton(true);
      return;
    }
    
    // Load content
    try {
      const content = type === 'experience' 
        ? await getExperienceContent(id)
        : await getProjectContent(id);
        
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
        
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(tabId);
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
                <SectionTransition className="mb-24" type="fade-in">
                  <section id="about" className="mb-24">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <h2 className={`text-lg mb-2 ${typographyClasses.heading}`}>Hi, my name is</h2>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex items-center justify-between"
                    >
                      <h1 className={`text-4xl md:text-5xl mb-4 ${typographyClasses.heading}`}>Nitigya Kargeti</h1>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#3498DB] to-[#8B5C3C] flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg"
                      >
                        NK
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <h3 className={`text-2xl md:text-3xl mb-6 ${typographyClasses.heading}`}>I build intelligent systems.</h3>
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

                {/* Quick Experience Preview */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section>
                    <h2 className={`text-2xl mb-8 ${typographyClasses.heading}`}>Recent Experience</h2>
                    <div className="space-y-6">
                      {experiences.slice(0, 2).map((exp) => (
                        <Card 
                          key={exp.id}
                          title={exp.title} 
                          subtitle={exp.subtitle} 
                          hoverEffect={true}
                          className="cursor-pointer"
                          onClick={() => handleOpenContent('experience', exp.id)}
                        >
                          <p className={`mb-4 ${typographyClasses.paragraph}`}>
                            {exp.preview}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {exp.tags.map((tag, idx) => (
                              <Chip key={idx}>{tag}</Chip>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                    {experiences.length > 2 && (
                      <div className="text-center mt-8">
                        <Button 
                          onClick={() => {
                            const element = document.getElementById('all-experience');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          Explore All Experience
                        </Button>
                      </div>
                    )}
                  </section>
                </SectionTransition>

                {/* Quick Projects Preview */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section>
                    <h2 className={`text-2xl mb-8 ${typographyClasses.heading}`}>Featured Projects</h2>
                    <div className="space-y-6">
                      {projects.slice(0, 3).map((project) => (
                        <Card 
                          key={project.id}
                          title={project.title} 
                          subtitle={project.subtitle} 
                          hoverEffect={true}
                          className="cursor-pointer"
                          onClick={() => handleOpenContent('project', project.id)}
                        >
                          <p className={`mb-4 ${typographyClasses.paragraph}`}>
                            {project.preview}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, idx) => (
                              <Chip key={idx}>{tag}</Chip>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                    {projects.length > 3 && (
                      <div className="text-center mt-8">
                        <Button 
                          onClick={() => {
                            const element = document.getElementById('all-projects');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          Explore All Projects
                        </Button>
                      </div>
                    )}
                  </section>
                </SectionTransition>

                {/* All Experience Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section id="all-experience">
                    <h2 className={`text-2xl mb-8 ${typographyClasses.heading}`}>All Experience</h2>
                    <div className="space-y-6">
                      {experiences.map((exp) => (
                        <Card 
                          key={exp.id}
                          title={exp.title} 
                          subtitle={exp.subtitle} 
                          hoverEffect={true}
                          className="cursor-pointer"
                          onClick={() => handleOpenContent('experience', exp.id)}
                        >
                          <p className={`mb-4 ${typographyClasses.paragraph}`}>
                            {exp.preview}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {exp.tags.map((tag, idx) => (
                              <Chip key={idx}>{tag}</Chip>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                </SectionTransition>

                {/* All Projects Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section id="all-projects">
                    <h2 className={`text-2xl mb-8 ${typographyClasses.heading}`}>All Projects</h2>
                    <div className="space-y-6">
                      {projects.map((project) => (
                        <Card 
                          key={project.id}
                          title={project.title} 
                          subtitle={project.subtitle} 
                          hoverEffect={true}
                          className="cursor-pointer"
                          onClick={() => handleOpenContent('project', project.id)}
                        >
                          <p className={`mb-4 ${typographyClasses.paragraph}`}>
                            {project.preview}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, idx) => (
                              <Chip key={idx}>{tag}</Chip>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                </SectionTransition>

                {/* Skills Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section id="skills">
                    <h2 className={`text-2xl mb-8 ${typographyClasses.heading}`}>Technical Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card title="Programming Languages" hoverEffect={true}>
                        <div className="flex flex-wrap gap-2">
                          <Chip>Python</Chip>
                          <Chip>R</Chip>
                          <Chip>Julia</Chip>
                          <Chip>SQL</Chip>
                          <Chip>JavaScript</Chip>
                          <Chip>C++</Chip>
                        </div>
                      </Card>
                      
                      <Card title="ML/AI" hoverEffect={true}>
                        <div className="flex flex-wrap gap-2">
                          <Chip>PyTorch</Chip>
                          <Chip>TensorFlow</Chip>
                          <Chip>scikit-learn</Chip>
                          <Chip>OpenCV</Chip>
                          <Chip>NLTK</Chip>
                          <Chip>XGBoost</Chip>
                        </div>
                      </Card>
                      
                      <Card title="Cloud & Big Data" hoverEffect={true}>
                        <div className="flex flex-wrap gap-2">
                          <Chip>AWS</Chip>
                          <Chip>Docker</Chip>
                          <Chip>PySpark</Chip>
                          <Chip>Kubernetes</Chip>
                          <Chip>MongoDB</Chip>
                        </div>
                      </Card>
                      
                      <Card title="Web Development" hoverEffect={true}>
                        <div className="flex flex-wrap gap-2">
                          <Chip>React</Chip>
                          <Chip>Next.js</Chip>
                          <Chip>Node.js</Chip>
                          <Chip>FastAPI</Chip>
                          <Chip>Express</Chip>
                        </div>
                      </Card>
                    </div>
                  </section>
                </SectionTransition>

                {/* Contact Section */}
                <SectionTransition type="slide-up" className="mb-24">
                  <section id="contact">
                    <h2 className={`text-2xl mb-8 ${typographyClasses.heading}`}>Get In Touch</h2>
                    <Card hoverEffect={true}>
                      <p className={`mb-6 ${typographyClasses.paragraph}`}>
                        I'm currently looking for new opportunities in AI/ML research and development. 
                        Whether you have a question or just want to say hi, I'll do my best to get back to you!
                      </p>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center space-x-3">
                          <span className={typographyClasses.paragraph}>📧 kargeti@wisc.edu</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={typographyClasses.paragraph}>📞 +1 (608) 217-8515</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={typographyClasses.paragraph}>📍 Madison, WI</span>
                        </div>
                      </div>
                      
                      <Button onClick={() => {
                        window.location.href = 'mailto:kargeti@wisc.edu';
                      }}>Say Hello</Button>
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