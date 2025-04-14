'use client';
import { useTheme } from '../context/ThemeContext';
import MainLayout from '../components/MainLayout';
import { typographyClasses } from '../components/Typography';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Button from '../components/Button';
import Link from '../components/Link';
import AIMode from '../components/AIMode';
import SectionTransition from '../components/SectionTransition';
import { useAIAgent } from '../context/AIAgentContext';
import { motion } from 'framer-motion';

export default function Home() {
  const { isAIMode } = useAIAgent();
  const { isDarkMode } = useTheme();
  
  return (
   <>
      {isAIMode ? (
        <div className="h-screen w-screen">
        <AIMode />
      </div>
      ) : (
        <MainLayout>
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
            >
              <h1 className={`text-4xl md:text-5xl mb-4 ${typographyClasses.heading}`}>Nitigya Kargeti</h1>
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
                // document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                window.location.href = '/resume';
              }}>View my Resume</Button>
            </motion.div>
          </section>
        </SectionTransition>
        
        {/* Experience Section */}
        <SectionTransition type="slide-up" className="mb-24">
          <section id="experience">
            <h2 className={`text-2xl mb-8 ${typographyClasses.heading}`}>Where I've Worked</h2>
            
            <div className="space-y-8 stagger-animation">
            <SectionTransition delay={0.1}>
        <Card title="Graduate Student Researcher" subtitle="People and Robots Lab, NSF-Funded | Mar 2024 - Jan 2025" hoverEffect={true}>
          <ul className="list-disc list-inside space-y-3">
            <li>
              <span>
                Engineered an AI-assisted educational robot system (GPT-4o, specialized knowledge bases, triadic interaction model)
                resulting in a publication at ACM CHI 2025 ('SET-PAIRED') and demonstrating a 15% improvement in learning
                retention among 20 child-parent pairs (ages 3-4).
              </span>
            </li>
            <li>
              <span>
                Performed advanced statistical analysis using Wilcoxon Signed-Rank tests, revealing significant underestimation of
                children's capabilities in advanced math (p {`<`} .01) and phonological awareness (p {`<`} .05), providing accurate
                developmental insights to the parents.
              </span>
            </li>
          </ul>
        </Card>
      </SectionTransition>
      
      <SectionTransition delay={0.2}>
        <Card title="Research & Development Intern" subtitle="Centre for Development of Advanced Computing (CDAC) | Sep 2022 - Mar 2023" hoverEffect={true}>
          <ul className="list-disc list-inside space-y-3">
            <li>
              <span>
                Achieved a 30% reduction in system latency for the P-300 Keyspeller BCI system by re-engineering the signal processing
                pipeline with optimized implementations of ICA and DB6 Wavelet Template matching.
              </span>
            </li>
            <li>
              <span>
                Enabled reliable real-time BCI performance by implementing optimized epoching and buffering techniques for data
                stream processing, contributing to a 10% increase in keyspeller classification accuracy.
              </span>
            </li>
          </ul>
        </Card>
      </SectionTransition>
              
              <SectionTransition delay={0.2}>
                <Card title="Software Development Intern" subtitle="Spenza Inc | Remote, Bengaluru, India | Jan 2023 - Aug 2023" hoverEffect={true}>
                  <ul className="list-disc list-inside space-y-3">
                    <li>
                      <span>
                        Constructed a parallel PDF parser on AWS Lambda (AWS, Docker), processing 400K pages 
                        in 10s (80% faster) and reducing server costs by 30%
                      </span>
                    </li>
                    <li>
                      <span>
                        Integrated Automation of Connected Accounts (Stripe API, Nest.js) to support both B2B 
                        and B2C models, boosting revenue by 18%
                      </span>
                    </li>
                    <li>
                      <span>
                        Optimized 30% of payment logic (TypeScript) with multi-currency support and real-time 
                        conversion; enhanced error monitoring (Sentry) to cut resolution time by 40%
                      </span>
                    </li>
                  </ul>
                </Card>
              </SectionTransition>
              
              <SectionTransition delay={0.3}>
                <Card title="Research & Development Intern" subtitle="CDAC | New Delhi, India | Sep 2022 - Mar 2023" hoverEffect={true}>
                  <ul className="list-disc list-inside space-y-3">
                    <li>
                      <span>
                        Implemented a real-time P300-Keyspeller (Python, NumPy, Pandas) with ICA (PyTorch) and 
                        DB6 wavelet matching, slashing latency by 30% and increasing alphabet classification 
                        accuracy by 10%
                      </span>
                    </li>
                    <li>
                      <span>
                        Leveraged ensemble methods and epoching techniques (scikit-learn) for real-time 
                        processing, reducing latency by 35%
                      </span>
                    </li>
                  </ul>
                </Card>
              </SectionTransition>
              
              <SectionTransition delay={0.4}>
                <Card title="Summer Vocational Intern" subtitle="DRDO | Dehradun, India | Jun 2022 - Jul 2022" hoverEffect={true}>
                  <ul className="list-disc list-inside space-y-3">
                    <li>
                      <span>
                        Analyzed hyperspectral satellite imagery (88% accuracy) using Linear Mixture Modeling 
                        and End-member analysis for terrain classification
                      </span>
                    </li>
                    <li>
                      <span>
                        Streamlined Spectral Angular Mapper, cutting processing time by 10% and accelerating 
                        image workflows
                      </span>
                    </li>
                  </ul>
                </Card>
              </SectionTransition>
            </div>
          </section>
        </SectionTransition>
        
        {/* Projects Section */}
<SectionTransition type="slide-up" className="mb-24">
  <section id="projects">
    <h2 className={`text-2xl mb-8 ${typographyClasses.heading}`}>Some Things I've Built</h2>
    
    <div className="space-y-12">
      <SectionTransition delay={0.1}>
        <Card
          title="Chicago Crime Data Forecasting & Hotspot Analysis"
          subtitle="Feb 2025"
          hoverEffect={true}
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Chip>ARIMA</Chip>
            <Chip>LSTM</Chip>
            <Chip>DBSCAN</Chip>
            <Chip>PySpark</Chip>
            <Chip>AWS EMR</Chip>
            <Chip>Plotly</Chip>
          </div>
          <p className="mb-4">
            Engineered a hybrid ARIMA-LSTM predictive model that improved crime pattern forecasting accuracy to 85%, enabling
            law-enforcement to optimize patrol resource allocation and reduce response times. Deployed spatial clustering using DBSCAN
            to identify crime hotspots across 12 crime categories totaling 10M reports.
          </p>
          <div>
            <Link href="https://github.com/ntropy86" external>View Project</Link>
          </div>
        </Card>
      </SectionTransition>
      
      <SectionTransition delay={0.2}>
        <Card
          title="Quantitative Finance Risk Modeling"
          subtitle="Jan 2025"
          hoverEffect={true}
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Chip>Python</Chip>
            <Chip>Spark</Chip>
            <Chip>XGBoost</Chip>
            <Chip>Alpha Vantage API</Chip>
          </div>
          <p className="mb-4">
            Devised a multi-factor market volatility prediction framework that achieved 92% correlation with actual market
            movements. Developed a fully automated trading strategy with an integrated pipeline that ingests real-time data from Alpha Vantage
            API, reducing drawdowns by 40% in backtesting.
          </p>
          <div>
            <Link href="https://github.com/ntropy86" external>View Project</Link>
          </div>
        </Card>
      </SectionTransition>
      
      <SectionTransition delay={0.3}>
        <Card
          title="Hallucination Detection in Vision-Language Models"
          subtitle="Dec 2024"
          hoverEffect={true}
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Chip>Representation Engineering</Chip>
            <Chip>CCS</Chip>
            <Chip>Adversarial Testing</Chip>
            <Chip>VLMs</Chip>
          </div>
          <p className="mb-4">
            Proposed an approach to identify hallucination sources in Large Vision-Language Models using Contrast-Consistent
            Search (CCS) across model components, detecting hallucinations with 86.7% accuracy compared to 53.8% baseline.
            Demonstrated hallucination prevention relies primarily on language modules, maintaining 75.2% accuracy under visual perturbation.
          </p>
          <div>
            <Link href="https://github.com/ntropy86" external>View Project</Link>
          </div>
        </Card>
      </SectionTransition>
      
      <SectionTransition delay={0.4}>
        <Card
          title="Sleep Apnea Detection"
          subtitle="Mar 2023"
          hoverEffect={true}
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Chip>CNN</Chip>
            <Chip>PyTorch</Chip>
            <Chip>ECG Signal Processing</Chip>
          </div>
          <p className="mb-4">
            Designed ApneaNet, a specialized CNN architecture, analyzing ECG signals to detect Obstructive Sleep Apnea (OSA),
            addressing a critical need for accessible screening methods beyond expensive sleep lab studies. Published findings in
            Biomedical Signal Processing and Control (IF: 5.7), receiving 19 citations to date.
          </p>
          <div>
            <Link href="https://github.com/ntropy86" external>View Project</Link>
          </div>
        </Card>
      </SectionTransition>
    </div>
  </section>
</SectionTransition>
        
        {/* Skills Section */}
        <SectionTransition type="slide-up" className="mb-24">
          <section id="skills">
            <h2 className={`text-2xl mb-8 ${typographyClasses.heading}`}>What I Know</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionTransition delay={0.1}>
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
              </SectionTransition>
              
              <SectionTransition delay={0.2}>
                <Card title="ML/AI" hoverEffect={true}>
                  <div className="flex flex-wrap gap-2">
                    <Chip>OpenAI-API</Chip>
                    <Chip>LangChain</Chip>
                    <Chip>TensorFlow</Chip>
                    <Chip>PyTorch</Chip>
                    <Chip>scikit-learn</Chip>
                    <Chip>NLTK</Chip>
                    <Chip>OpenCV</Chip>
                    <Chip>XGBoost</Chip>
                    <Chip>LightGBM</Chip>
                  </div>
                </Card>
              </SectionTransition>
              
              <SectionTransition delay={0.3}>
                <Card title="Big Data/Cloud" hoverEffect={true}>
                  <div className="flex flex-wrap gap-2">
                    <Chip>PySpark</Chip>
                    <Chip>Cassandra</Chip>
                    <Chip>Kafka</Chip>
                    <Chip>PyArrow</Chip>
                    <Chip>AWS</Chip>
                    <Chip>GCP</Chip>
                    <Chip>Docker</Chip>
                    <Chip>Kubernetes</Chip>
                    <Chip>Tableau</Chip>
                    <Chip>Folium</Chip>
                  </div>
                </Card>
              </SectionTransition>
              
              <SectionTransition delay={0.4}>
                <Card title="Web Development" hoverEffect={true}>
                  <div className="flex flex-wrap gap-2">
                    <Chip>Node.js</Chip>
                    <Chip>React</Chip>
                    <Chip>Next.js</Chip>
                    <Chip>FastAPI</Chip>
                    <Chip>Express</Chip>
                    <Chip>Flask</Chip>
                    <Chip>MongoDB</Chip>
                    <Chip>Redis</Chip>
                  </div>
                </Card>
              </SectionTransition>
            </div>
          </section>
        </SectionTransition>
        
        {/* Contact Section */}
        <SectionTransition type="slide-up" className="mb-16">
          <section id="contact">
            <h2 className={`text-2xl mb-6 ${typographyClasses.heading}`}>Get In Touch</h2>
            
            <Card hoverEffect={true}>
              <p className="mb-6">
                I'm currently looking for new opportunities in AI/ML research and development. 
                Whether you have a question or just want to say hi, I'll do my best to get back to you!
              </p>
              
              <div className="space-y-4 mb-6">
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: isDarkMode ? "rgba(139, 92, 60, 0.3)" : "rgba(217, 167, 135, 0.3)"
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                    </svg>
                  </div>
                  <span className={typographyClasses.paragraph}>+1 (608) 217-8515</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: isDarkMode ? "rgba(139, 92, 60, 0.3)" : "rgba(217, 167, 135, 0.3)"
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <span className={typographyClasses.paragraph}>kargeti@wisc.edu</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: isDarkMode ? "rgba(139, 92, 60, 0.3)" : "rgba(217, 167, 135, 0.3)"
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <span className={typographyClasses.paragraph}>Madison, WI</span>
                </motion.div>
              </div>
              
              <Button onClick={() => {
                window.location.href = 'mailto:kargeti@wisc.edu';
              }}>Say Hello</Button>
            </Card>
          </section>
        </SectionTransition>
        </MainLayout>
      )}
      </>
  );
}