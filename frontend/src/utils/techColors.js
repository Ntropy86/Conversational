// Technology color mapping and icons
export const techColorMap = {
  // Frontend
  'React': { color: '#61DAFB', category: 'frontend', darkColor: '#4FC3F7' },
  'Next.js': { color: '#000000', category: 'frontend', darkColor: '#333333' },
  'JavaScript': { color: '#F7DF1E', category: 'frontend', darkColor: '#FDD835' },
  'TypeScript': { color: '#3178C6', category: 'frontend', darkColor: '#1976D2' },
  'HTML': { color: '#E34F26', category: 'frontend', darkColor: '#D32F2F' },
  'CSS': { color: '#1572B6', category: 'frontend', darkColor: '#1565C0' },
  'SCSS': { color: '#CF649A', category: 'frontend', darkColor: '#C2185B' },
  'Vue.js': { color: '#4FC08D', category: 'frontend', darkColor: '#388E3C' },
  'Angular': { color: '#DD0031', category: 'frontend', darkColor: '#C62828' },
  'Svelte': { color: '#FF3E00', category: 'frontend', darkColor: '#E64A19' },
  'Tailwind CSS': { color: '#06B6D4', category: 'frontend', darkColor: '#0097A7' },

  // Backend & Databases
  'Node.js': { color: '#339933', category: 'backend', darkColor: '#2E7D32' },
  'Express': { color: '#000000', category: 'backend', darkColor: '#424242' },
  'Python': { color: '#3776AB', category: 'backend', darkColor: '#1565C0' },
  'FastAPI': { color: '#009688', category: 'backend', darkColor: '#00695C' },
  'Flask': { color: '#000000', category: 'backend', darkColor: '#424242' },
  'Django': { color: '#092E20', category: 'backend', darkColor: '#1B5E20' },
  'MongoDB': { color: '#47A248', category: 'database', darkColor: '#388E3C' },
  'PostgreSQL': { color: '#336791', category: 'database', darkColor: '#1565C0' },
  'Redis': { color: '#DC382D', category: 'database', darkColor: '#C62828' },
  'MySQL': { color: '#4479A1', category: 'database', darkColor: '#1976D2' },
  'Cassandra': { color: '#1287B1', category: 'database', darkColor: '#0277BD' },
  'SQL': { color: '#CC6600', category: 'database', darkColor: '#EF6C00' },

  // AI/ML
  'PyTorch': { color: '#EE4C2C', category: 'ai-ml', darkColor: '#D84315' },
  'TensorFlow': { color: '#FF6F00', category: 'ai-ml', darkColor: '#FF8F00' },
  'scikit-learn': { color: '#F7931E', category: 'ai-ml', darkColor: '#FF8F00' },
  'OpenCV': { color: '#5C3EE8', category: 'ai-ml', darkColor: '#512DA8' },
  'Pandas': { color: '#150458', category: 'ai-ml', darkColor: '#3F51B5' },
  'NumPy': { color: '#013243', category: 'ai-ml', darkColor: '#1565C0' },
  'OpenAI-API': { color: '#412991', category: 'ai-ml', darkColor: '#512DA8' },
  'LangChain': { color: '#00A884', category: 'ai-ml', darkColor: '#00695C' },
  'NLTK': { color: '#154F3C', category: 'ai-ml', darkColor: '#2E7D32' },
  'XGBoost': { color: '#FF6B6B', category: 'ai-ml', darkColor: '#E57373' },
  'LightGBM': { color: '#FFB74D', category: 'ai-ml', darkColor: '#FFB74D' },
  'ARIMA': { color: '#9C27B0', category: 'ai-ml', darkColor: '#8E24AA' },
  'LSTM': { color: '#673AB7', category: 'ai-ml', darkColor: '#5E35B1' },
  'DBSCAN': { color: '#E91E63', category: 'ai-ml', darkColor: '#C2185B' },
  'SMOTE': { color: '#FF5722', category: 'ai-ml', darkColor: '#D84315' },
  'CCS': { color: '#795548', category: 'ai-ml', darkColor: '#6D4C41' },
  'CNN': { color: '#607D8B', category: 'ai-ml', darkColor: '#546E7A' },

  // Cloud & DevOps
  'AWS': { color: '#FF9900', category: 'cloud', darkColor: '#FF8F00' },
  'AWS EMR': { color: '#FF9900', category: 'cloud', darkColor: '#FF8F00' },
  'GCP': { color: '#4285F4', category: 'cloud', darkColor: '#1976D2' },
  'Docker': { color: '#2496ED', category: 'cloud', darkColor: '#1976D2' },
  'Kubernetes': { color: '#326CE5', category: 'cloud', darkColor: '#1565C0' },
  'Heroku': { color: '#430098', category: 'cloud', darkColor: '#512DA8' },
  'Netlify': { color: '#00C7B7', category: 'cloud', darkColor: '#00ACC1' },
  'Vercel': { color: '#000000', category: 'cloud', darkColor: '#424242' },

  // Data & Analytics
  'PySpark': { color: '#E25A1C', category: 'data', darkColor: '#D84315' },
  'Spark': { color: '#E25A1C', category: 'data', darkColor: '#D84315' },
  'Kafka': { color: '#000000', category: 'data', darkColor: '#424242' },
  'PyArrow': { color: '#4FC3F7', category: 'data', darkColor: '#29B6F6' },
  'Tableau': { color: '#E97627', category: 'data', darkColor: '#F57500' },
  'Plotly': { color: '#3F4F75', category: 'data', darkColor: '#3F51B5' },
  'Folium': { color: '#77B829', category: 'data', darkColor: '#689F38' },
  'R': { color: '#276DC3', category: 'data', darkColor: '#1976D2' },
  'Julia': { color: '#9558B2', category: 'data', darkColor: '#8E24AA' },

  // Other Languages & Tools
  'C++': { color: '#00599C', category: 'language', darkColor: '#0277BD' },
  'Java': { color: '#ED8B00', category: 'language', darkColor: '#FF8F00' },
  'Go': { color: '#00ADD8', category: 'language', darkColor: '#0097A7' },
  'Rust': { color: '#000000', category: 'language', darkColor: '#424242' },
  'Git': { color: '#F05032', category: 'tool', darkColor: '#D84315' },
  'GitHub': { color: '#181717', category: 'tool', darkColor: '#424242' },
  'VS Code': { color: '#007ACC', category: 'tool', darkColor: '#0277BD' },
  'Figma': { color: '#F24E1E', category: 'tool', darkColor: '#D84315' },

  // Specialized
  'Alpha Vantage API': { color: '#1E88E5', category: 'api', darkColor: '#1976D2' },
  'Stripe API': { color: '#635BFF', category: 'api', darkColor: '#5E35B1' },
  'Nest.js': { color: '#E0234E', category: 'backend', darkColor: '#C2185B' },
  'MusicKit.js': { color: '#000000', category: 'api', darkColor: '#424242' },
  'Spotify API': { color: '#1DB954', category: 'api', darkColor: '#388E3C' },
  'Representation Engineering': { color: '#9C27B0', category: 'ai-ml', darkColor: '#8E24AA' },
  'Adversarial Testing': { color: '#FF5722', category: 'ai-ml', darkColor: '#D84315' },
  'VLMs': { color: '#673AB7', category: 'ai-ml', darkColor: '#5E35B1' },
  'ECG Signal Processing': { color: '#00BCD4', category: 'ai-ml', darkColor: '#00ACC1' },
  'Ensemble': { color: '#795548', category: 'ai-ml', darkColor: '#6D4C41' },
  'ExtraTrees': { color: '#4CAF50', category: 'ai-ml', darkColor: '#388E3C' }
};

// Get color for a technology
export const getTechColor = (tech, isDarkMode = true) => {
  const techData = techColorMap[tech];
  if (!techData) {
    // Default colors for unknown technologies
    return isDarkMode ? '#64748B' : '#94A3B8';
  }
  return isDarkMode ? (techData.darkColor || techData.color) : techData.color;
};

// Get category for a technology
export const getTechCategory = (tech) => {
  const techData = techColorMap[tech];
  return techData?.category || 'other';
};

// Get all technologies by category
export const getTechsByCategory = () => {
  const categories = {};
  Object.entries(techColorMap).forEach(([tech, data]) => {
    if (!categories[data.category]) {
      categories[data.category] = [];
    }
    categories[data.category].push(tech);
  });
  return categories;
};

// Category colors for grouping
export const categoryColors = {
  'frontend': '#61DAFB',
  'backend': '#339933', 
  'database': '#336791',
  'ai-ml': '#EE4C2C',
  'cloud': '#FF9900',
  'data': '#E25A1C',
  'language': '#00599C',
  'tool': '#F05032',
  'api': '#1E88E5',
  'other': '#64748B'
};