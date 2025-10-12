// Unified skills data for radar chart visualization (Scale 1-5)
export const skillsData = {
  "Python": 5,
  "JavaScript/TypeScript": 4,
  "SQL": 5,
  "Julia": 4,
  "FastAPI": 5,
  "Node.js/Express": 4,
  "MongoDB": 4,
  "PostgreSQL": 4,
  "AWS": 4,
  "Docker": 4,
  "PyTorch": 5,
  "TensorFlow": 4,
  "LangChain": 4,
  "PySpark": 4,
  "Statistical Modeling": 5,
  "LLM Integration": 5,
  "Kafka": 3,
  "GitHub Actions": 4
};

// Predefined skill categories for highlighting (Scale 1-5)
export const skillCategories = {
  "all": {
    title: "All Skills",
    skills: {
      "ML & AI": 4.8, // weighted average of ML/AI skills
      "Languages": 4.5, // (5+4+5+4)/4 = 4.5
      "Data & Search": 4.2, // weighted average of data/search skills
      "Backend & Cloud": 3.9, // weighted average of backend/cloud skills
      "Frontend": 3.5, // weighted average of frontend skills
      "Tools": 4.0 // weighted average of tools
    },
    color: "#8B5C3C"
  },
  
  "ml_ai": {
    title: "ML & AI",
    skills: {
      "PyTorch": 5,
      "TensorFlow": 4,
      "Transformers (GPT, LLaMA, BERT)": 5,
      "RAG": 4,
      "LangChain": 4,
      "Groq": 4,
      "OpenAI API": 4,
      "Whisper": 4,
      "ElevenLabs": 4,
      "scikit-learn": 4,
      "OpenCV": 3
    },
    color: "#EF4444"
  },
  
  "languages": {
    title: "Languages",
    skills: {
      "Python": 5,
      "TypeScript/JavaScript": 4,
      "SQL": 5,
      "C++": 4
    },
    color: "#3B82F6"
  },
  
  "data_search": {
    title: "Data & Search",
    skills: {
      "BM25": 4,
      "BGE-embeddings": 4,
      "FAISS": 4,
      "Elasticsearch": 3,
      "H3 geospatial": 4,
      "DBSCAN": 4,
      "Pandas": 5,
      "NumPy": 5,
      "PySpark": 4,
      "BigQuery": 4
    },
    color: "#8B5CF6"
  },
  
  "backend_cloud": {
    title: "Backend & Cloud",
    skills: {
      "FastAPI": 5,
      "Node.js": 4,
      "NestJS": 4,
      "Docker": 4,
      "AWS (Lambda, S3, SQS)": 4,
      "GCP": 3,
      "Databricks": 4,
      "BigQuery": 4,
      "MongoDB": 4,
      "PostgreSQL": 5,
      "Redis": 4
    },
    color: "#10B981"
  },
  
  "frontend": {
    title: "Frontend",
    skills: {
      "React": 4,
      "Next.js": 4,
      "Streamlit": 4,
      "D3.js": 3,
      "Plotly": 4,
      "Matplotlib": 4,
      "Seaborn": 4
    },
    color: "#06B6D4"
  },
  
  "tools": {
    title: "Tools",
    skills: {
      "Git": 5,
      "pytest": 4,
      "CI/CD": 4,
      "EEG/signal processing": 4,
      "Statistical modeling": 5,
      "GitHub Actions": 4,
      "Linux": 4
    },
    color: "#F59E0B"
  }
};

// Get skills for a specific category
export const getSkillsForCategory = (category) => {
  return skillCategories[category] || skillCategories.core;
};

// Get all skill names
export const getAllSkills = () => Object.keys(skillsData);

// Get skill value
export const getSkillValue = (skillName) => skillsData[skillName] || 0;

// Technology logos mapping
export const techLogos = {
  // Category-level logos for "All Skills" view (prefer local assets to reduce third-party requests)
  "ML & AI": "/tech-logos/pytorch-original.svg",
  "Languages": "/tech-logos/python-original.svg",
  "Data & Search": "/tech-logos/apache-original.svg",
  "Backend & Cloud": "/tech-logos/nodejs-original.svg",
  "Frontend": "/tech-logos/typescript-original.svg",
  "Tools": "/tech-logos/docker-original.svg",

  // Languages
  "Python": "/tech-logos/python-original.svg",
  "TypeScript/JavaScript": "/tech-logos/typescript-original.svg",
  "SQL": "/tech-logos/mysql-original.svg",
  "C++": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  
  // ML & AI
  "PyTorch": "/tech-logos/pytorch-original.svg",
  "TensorFlow": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
  "Transformers (GPT, LLaMA, BERT)": "/tech-logos/openai-favicon.svg",
  "RAG": "https://www.vectorlogo.zone/logos/pytorch/pytorch-icon.svg",
  "LangChain": "https://python.langchain.com/img/brand/wordmark.png",
  "Groq": "https://groq.com/favicon.ico",
  "OpenAI API": "/tech-logos/openai-favicon.svg",
  "Whisper": "https://openai.com/favicon.ico",
  "ElevenLabs": "https://elevenlabs.io/favicon.ico",
  "scikit-learn": "https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg",
  "OpenCV": "https://opencv.org/wp-content/uploads/2022/05/logo.png",
  
  // Data & Search
  "BM25": "https://www.vectorlogo.zone/logos/elastic/elastic-icon.svg",
  "BGE-embeddings": "https://huggingface.co/favicon.ico",
  "FAISS": "https://faiss.ai/favicon.ico",
  "Elasticsearch": "https://www.vectorlogo.zone/logos/elastic/elastic-icon.svg",
  "H3 geospatial": "https://h3geo.org/favicon.ico",
  "DBSCAN": "https://scikit-learn.org/stable/_static/scikit-learn-logo-small.png",
  "Pandas": "https://pandas.pydata.org/static/img/pandas_white.svg",
  "NumPy": "https://numpy.org/images/logo.svg",
  "PySpark": "/tech-logos/apache-original.svg",
  "BigQuery": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
  
  // Backend & Cloud
  "FastAPI": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
  "Node.js": "/tech-logos/nodejs-original.svg",
  "NestJS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain.svg",
  "Docker": "/tech-logos/docker-original.svg",
  "AWS (Lambda, S3, SQS)": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg",
  "GCP": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
  "Databricks": "https://databricks.com/favicon.ico",
  "BigQuery": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
  "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  "PostgreSQL": "/tech-logos/postgresql-original.svg",
  "Redis": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
  
  // Frontend
  "React": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "Next.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  "Streamlit": "https://streamlit.io/images/brand/streamlit-logo-primary-colormark-darktext.png",
  "D3.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/d3js/d3js-original.svg",
  "Plotly": "/tech-logos/plotly-logomark.png",
  "Matplotlib": "https://matplotlib.org/_static/images/logo2.svg",
  "Seaborn": "https://seaborn.pydata.org/_static/logo-wide-lightbg.svg",
  
  // Tools
  "Git": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  "pytest": "https://docs.pytest.org/en/stable/_static/pytest_logo_curves.svg",
  "CI/CD": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  "EEG/signal processing": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "Statistical modeling": "/tech-logos/r-original.svg",
  "GitHub Actions": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  "Linux": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg"
};