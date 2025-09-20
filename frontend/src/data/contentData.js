// Content data for individual pages
export const experienceData = {
  'graduate-researcher': {
    title: 'Graduate Student Researcher - People and Robots Lab',
    content: `# Graduate Student Researcher
## People and Robots Lab, NSF-Funded | Mar 2024 - Jan 2025

### Overview
Working on cutting-edge AI-assisted educational robot systems as part of a National Science Foundation funded research project.

### Key Achievements

- **AI-Assisted Educational Robot System**: Engineered a comprehensive system using GPT-4o, specialized knowledge bases, and triadic interaction model
- **Research Publication**: Resulting publication accepted at ACM CHI 2025 ('SET-PAIRED')
- **Learning Impact**: Demonstrated 15% improvement in learning retention among 20 child-parent pairs (ages 3-4)
- **Statistical Analysis**: Performed advanced statistical analysis using Wilcoxon Signed-Rank tests
- **Key Findings**: Revealed significant underestimation of children's capabilities in advanced math (p < .01) and phonological awareness (p < .05)

### Technologies Used
tech:Python,GPT-4o,PyTorch,Statistical Analysis,Child-Robot Interaction,NLP

### Research Impact
This research provides accurate developmental insights to parents and contributes to the growing field of educational robotics and AI-assisted learning systems.

### Publications
- SET-PAIRED: Triadic Interaction Model for Child-Parent-Robot Educational Systems (ACM CHI 2025)

[View Lab Website](https://peopleandrobots.wisc.edu/)
`
  },
  
  'cdac-intern': {
    title: 'Research & Development Intern - CDAC',
    content: `# Research & Development Intern
## Centre for Development of Advanced Computing (CDAC) | Sep 2022 - Mar 2023

### Project Overview
Worked on Brain-Computer Interface (BCI) systems, specifically the P-300 Keyspeller system for assistive technology applications.

### Technical Achievements

#### System Performance Optimization
- **30% Latency Reduction**: Re-engineered the signal processing pipeline with optimized implementations
- **Advanced Signal Processing**: Implemented ICA (Independent Component Analysis) and DB6 Wavelet Template matching
- **Real-time Performance**: Enabled reliable real-time BCI performance through optimized epoching and buffering techniques
- **Classification Accuracy**: Achieved 10% increase in keyspeller classification accuracy

#### Technical Implementation
- Developed real-time P300-Keyspeller using Python ecosystem
- Implemented ensemble methods for improved signal classification
- Optimized data stream processing for minimal latency

### Technologies Used
tech:Python,NumPy,Pandas,PyTorch,ICA,Signal Processing,scikit-learn,Real-time Systems

### Impact
This work directly contributes to assistive technology solutions for individuals with motor disabilities, enabling better communication through BCI interfaces.

### Technical Details
The P-300 Keyspeller system relies on detecting P300 event-related potentials in EEG signals when users focus on specific characters. The optimization work focused on:

- **Signal Preprocessing**: Enhanced filtering and artifact removal
- **Feature Extraction**: Improved P300 detection algorithms  
- **Real-time Processing**: Optimized buffer management and epoching
- **Classification**: Ensemble methods for robust character prediction

[Learn more about CDAC](https://www.cdac.in)
`
  }
};

export const projectData = {
  'chicago-crime-forecasting': {
    title: 'Chicago Crime Data Forecasting & Hotspot Analysis',
    content: `# Chicago Crime Data Forecasting & Hotspot Analysis
## Feb 2025

### Project Overview
Developed a comprehensive crime analytics system combining predictive modeling with spatial analysis to help law enforcement optimize resource allocation.

### Technical Achievement
Built a hybrid ARIMA-LSTM predictive model that achieved **85% accuracy** in crime pattern forecasting, enabling law enforcement to optimize patrol resource allocation and reduce response times.

### Key Features

#### Predictive Modeling
- **Hybrid ARIMA-LSTM Model**: Combined traditional statistical methods with deep learning
- **85% Forecasting Accuracy**: Achieved high accuracy in crime pattern prediction
- **Multi-Category Analysis**: Analyzed 12 different crime categories
- **Large Scale Data**: Processed 10M+ crime reports

#### Spatial Analysis
- **Hotspot Identification**: Used DBSCAN clustering to identify crime hotspots
- **Geographic Visualization**: Interactive maps showing crime patterns
- **Resource Optimization**: Recommendations for patrol resource allocation

### Technologies Used
tech:ARIMA,LSTM,DBSCAN,PySpark,AWS EMR,Plotly,Python,Machine Learning,Big Data

### Data Processing
- **Volume**: 10+ million crime reports
- **Time Range**: Multi-year historical data
- **Categories**: 12 distinct crime types
- **Geographic Scope**: City of Chicago with neighborhood-level granularity

### Business Impact
- **Resource Optimization**: Enabled smarter patrol allocation
- **Response Time Reduction**: Helped reduce emergency response times
- **Predictive Policing**: Contributed to proactive law enforcement strategies
- **Public Safety**: Enhanced overall community safety through data-driven insights

### Technical Architecture
- **Data Pipeline**: PySpark on AWS EMR for large-scale processing
- **Model Training**: Hybrid ARIMA-LSTM architecture
- **Clustering**: DBSCAN for spatial hotspot analysis
- **Visualization**: Interactive Plotly dashboards
- **Deployment**: Cloud-based scalable architecture

[View Project on GitHub](https://github.com/ntropy86)
`
  },

  'hallucination-detection': {
    title: 'Hallucination Detection in Vision-Language Models',
    content: `# Hallucination Detection in Vision-Language Models
## Dec 2024

### Research Overview
Proposed a novel approach to identify hallucination sources in Large Vision-Language Models using advanced representation engineering techniques.

### Key Innovation
Developed a method using **Contrast-Consistent Search (CCS)** across model components to detect hallucinations with **86.7% accuracy** compared to 53.8% baseline.

### Research Findings

#### Hallucination Detection
- **86.7% Detection Accuracy**: Significant improvement over baseline methods
- **Component Analysis**: Systematic analysis of where hallucinations originate
- **Cross-Modal Understanding**: Investigated vision-language interaction patterns

#### Key Insights
- **Language Module Primacy**: Demonstrated that hallucination prevention relies primarily on language modules
- **Visual Perturbation Robustness**: Maintained 75.2% accuracy under visual perturbation
- **Architectural Understanding**: Provided insights into VLM internal representations

### Technologies Used
tech:Representation Engineering,CCS,Adversarial Testing,VLMs,PyTorch,Computer Vision,NLP

### Methodology

#### Representation Engineering
- Applied cutting-edge representation engineering techniques
- Analyzed internal model representations across different components
- Developed novel probing methods for hallucination detection

#### Contrast-Consistent Search (CCS)
- Implemented CCS methodology for consistent representation analysis
- Applied across multiple model components simultaneously
- Achieved superior detection performance through consistency checking

#### Experimental Design
- **Controlled Testing**: Rigorous experimental protocols
- **Baseline Comparison**: Systematic comparison with existing methods
- **Robustness Testing**: Evaluation under various perturbation conditions

### Research Contributions
1. **Novel Detection Method**: First application of CCS to hallucination detection in VLMs
2. **Component-Level Analysis**: Detailed understanding of where hallucinations originate
3. **Robustness Insights**: Understanding of model behavior under visual perturbations
4. **Performance Improvement**: Significant advancement over existing detection methods

### Technical Details
The research involved deep analysis of transformer-based vision-language models, focusing on:
- **Attention Mechanisms**: How visual and textual attention interact
- **Hidden Representations**: Internal model states during hallucination
- **Cross-Modal Alignment**: Vision-language representation consistency
- **Error Propagation**: How hallucinations emerge and propagate through model layers

[View Research Paper](https://github.com/ntropy86)
`
  }
};

// Function to get content by ID
export const getExperienceContent = (id) => experienceData[id] || null;
export const getProjectContent = (id) => projectData[id] || null;

// Function to get all items for listing
export const getAllExperiences = () => Object.keys(experienceData);
export const getAllProjects = () => Object.keys(projectData);