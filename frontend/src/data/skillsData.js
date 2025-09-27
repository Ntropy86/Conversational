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
      "Languages": 4.5, // (5+4+5+4)/4 = 4.5
      "Backend": 3.9, // weighted average of backend skills
      "Databases": 4.0, // weighted average
      "Big Data": 3.5, // weighted average  
      "DevOps": 3.7, // weighted average
      "ML/AI": 4.0, // weighted average
      "LLMs": 3.8, // weighted average
      "Analytics": 4.25, // weighted average
      "Visualization": 3.5 // weighted average
    },
    color: "#8B5C3C"
  },
  
  "languages": {
    title: "Languages",
    skills: {
      "Python": 5,
      "TypeScript/JavaScript": 4,
      "SQL": 5,
      "Julia": 4
    },
    color: "#3B82F6"
  },
  
  "backend": {
    title: "Backend",
    skills: {
      "FastAPI": 5,
      "Node.js/Express": 4,
      "Flask": 4,
      "REST/WebSockets": 4,
      "Celery": 3,
      "Postman": 4,
      "Sentry": 3
    },
    color: "#10B981"
  },
  
  "databases": {
    title: "Databases",
    skills: {
      "PostgreSQL": 5,
      "MongoDB": 4,
      "Redis": 4,
      "Cassandra": 3
    },
    color: "#06B6D4"
  },
  
  "big_data": {
    title: "Big Data",
    skills: {
      "PySpark": 4,
      "Kafka": 3,
      "PyArrow": 3,
      "Apache Spark": 4,
      "Hadoop": 3,
      "ETL Pipelines": 4
    },
    color: "#8B5CF6"
  },
  
  "devops": {
    title: "DevOps",
    skills: {
      "AWS (Lambda, SQS, S3, EC2, EMR)": 4,
      "GCP BigQuery": 3,
      "Docker": 4,
      "GitHub Actions": 4,
      "Kubernetes": 3,
      "Linux": 4
    },
    color: "#F59E0B"
  },
  
  "ml_ai": {
    title: "ML/AI",
    skills: {
      "PyTorch": 5,
      "TensorFlow": 4,
      "scikit-learn": 4,
      "LangChain": 4,
      "NLTK": 3,
      "OpenCV": 3
    },
    color: "#EF4444"
  },
  
  "llms": {
    title: "LLMs",
    skills: {
      "LLM integration": 5,
      "RAG": 4,
      "prompt design": 4,
      "evals": 3,
      "guardrails": 3
    },
    color: "#8B5CF6"
  },
  
  "analytics": {
    title: "Analytics",
    skills: {
      "Statistical Modeling": 5,
      "Inference": 4,
      "A/B Testing": 4,
      "Hypothesis Testing": 4
    },
    color: "#F97316"
  },
  
  "visualization": {
    title: "Visualization",
    skills: {
      "Plotly": 4,
      "Tableau": 3,
      "Matplotlib": 4,
      "Seaborn": 4,
      "D3.js": 3,
      "Power BI": 3
    },
    color: "#84CC16"
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
  "Languages": "/tech-logos/python-original.svg",
  "Backend": "/tech-logos/nodejs-original.svg",
  "Databases": "/tech-logos/postgresql-original.svg",
  "Big Data": "/tech-logos/apache-original.svg",
  "DevOps": "/tech-logos/docker-original.svg",
  "ML/AI": "/tech-logos/pytorch-original.svg",
  "LLMs": "/tech-logos/openai-favicon.svg",
  "Analytics": "/tech-logos/r-original.svg",
  "Visualization": "/tech-logos/plotly-logomark.png",

  // Languages
  "Python": "/tech-logos/python-original.svg",
  "TypeScript/JavaScript": "/tech-logos/typescript-original.svg",
  "SQL": "/tech-logos/mysql-original.svg",
  "Julia": "/tech-logos/julia-original.svg",
  
  // Backend
  "FastAPI": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
  "Node.js/Express": "/tech-logos/nodejs-original.svg",
  "Flask": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
  "REST/WebSockets": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swagger/swagger-original.svg",
  "Celery": "https://docs.celeryproject.org/en/stable/_static/celery_512.png",
  "Postman": "https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg",
  "Sentry": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sentry/sentry-original.svg",
  
  // Databases
  "PostgreSQL": "/tech-logos/postgresql-original.svg",
  "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  "Redis": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
  "Cassandra": "https://www.vectorlogo.zone/logos/apache_cassandra/apache_cassandra-icon.svg",
  
  // Big Data
  "PySpark": "/tech-logos/apache-original.svg",
  "Kafka": "https://www.vectorlogo.zone/logos/apache_kafka/apache_kafka-icon.svg",
  "PyArrow": "https://arrow.apache.org/img/arrow-logo_horizontal_black-txt_white-bg.png",
  "Apache Spark": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg",
  "Hadoop": "https://www.vectorlogo.zone/logos/apache_hadoop/apache_hadoop-icon.svg",
  "ETL Pipelines": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg",
  
  // DevOps
  "AWS (Lambda, SQS, S3, EC2, EMR)": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg",
  "GCP BigQuery": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
  "Docker": "/tech-logos/docker-original.svg",
  "GitHub Actions": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  "Kubernetes": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  "Linux": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  
  // ML/AI
  "PyTorch": "/tech-logos/pytorch-original.svg",
  "TensorFlow": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
  "scikit-learn": "https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg",
  "LangChain": "https://python.langchain.com/img/brand/wordmark.png",
  "NLTK": "https://www.nltk.org/_static/nltk.png",
  "OpenCV": "https://opencv.org/wp-content/uploads/2022/05/logo.png",
  
  // LLMs
  "LLM integration": "/tech-logos/python-original.svg",
  "RAG": "https://www.vectorlogo.zone/logos/pytorch/pytorch-icon.svg",
  "prompt design": "https://openai.com/favicon.ico",
  "evals": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "guardrails": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  
  // Analytics
  "Statistical Modeling": "/tech-logos/r-original.svg",
  "Inference": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "A/B Testing": "https://www.vectorlogo.zone/logos/google_analytics/google_analytics-icon.svg",
  "Hypothesis Testing": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg",
  
  // Visualization
  "Plotly": "/tech-logos/plotly-logomark.png",
  "Tableau": "https://cdn.worldvectorlogo.com/logos/tableau-software.svg",
  "Matplotlib": "https://matplotlib.org/_static/images/logo2.svg",
  "Seaborn": "https://seaborn.pydata.org/_static/logo-wide-lightbg.svg",
  "D3.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/d3js/d3js-original.svg",
  "Power BI": "https://www.vectorlogo.zone/logos/microsoft_powerbi/microsoft_powerbi-icon.svg",
  
  // Category logos for "All Skills" view
  "Languages": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  "Backend": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "Databases": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  "Big Data": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg",
  "DevOps": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  "ML/AI": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",
  "LLMs": "https://openai.com/favicon.ico",
  "Analytics": "https://www.vectorlogo.zone/logos/google_analytics/google_analytics-icon.svg",
  "Visualization": "https://images.plot.ly/logo/new-branding/plotly-logomark.png"
};