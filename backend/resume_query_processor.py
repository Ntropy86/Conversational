"""
Resume Query Processor - Intelligent querying and structured response generation
"""
import json
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class QueryResult:
    """Structured result for resume queries"""
    response_text: str
    items: List[Dict[str, Any]]
    item_type: str  # "projects", "experiences", "publications", "skills"
    metadata: Dict[str, Any] = None

class ResumeQueryProcessor:
    def __init__(self, resume_data_path: str = "resume_data.json"):
        """Initialize with resume data"""
        with open(resume_data_path, 'r') as f:
            self.resume_data = json.load(f)
        
        # Initialize semantic similarity (optional - only if sentence-transformers available)
        self.semantic_model = None
        try:
            from sentence_transformers import SentenceTransformer
            self.semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
        except ImportError:
            print("💡 Install sentence-transformers for semantic similarity: pip install sentence-transformers")
            pass
        
        # Intent patterns for different query types
        self.intent_patterns = {
            "projects": [
                r"(?i)projects?", r"(?i)built", r"(?i)created", r"(?i)developed",
                r"(?i)what.*made", r"(?i)what.*worked on", r"(?i)portfolio",
                r"(?i)build", r"(?i)builds?"
            ],
            "experience": [
                r"(?i)experience", r"(?i)worked at", r"(?i)companies?", r"(?i)jobs?",
                r"(?i)internships?", r"(?i)roles?", r"(?i)positions?", r"(?i)where.*work",
                r"(?i)work.*at", r"(?i)employment", r"(?i)career", r"(?i)employers?"
            ],
            "skills": [
                r"(?i)skills?", r"(?i)technologies?", r"(?i)tools?", r"(?i)languages?",
                r"(?i)frameworks?", r"(?i)what.*know", r"(?i)expertise"
            ],
            "education": [
                r"(?i)education", r"(?i)degree", r"(?i)university", r"(?i)college",
                r"(?i)studied", r"(?i)school"
            ],
            "publications": [
                r"(?i)publications?", r"(?i)papers?", r"(?i)research", r"(?i)published"
            ],
            "blog": [
                r"(?i)blog", r"(?i)articles?", r"(?i)posts?", r"(?i)writing", r"(?i)insights"
            ]
        }
        
        # Superlative patterns for ranking queries
        self.superlative_patterns = [
            r"(?i)best", r"(?i)most.*impressive", r"(?i)crown.*jewel", r"(?i)standout",
            r"(?i)favorite", r"(?i)top", r"(?i)greatest", r"(?i)coolest", r"(?i)amazing",
            r"(?i)remarkable", r"(?i)outstanding", r"(?i)flagship"
        ]
        
        # Highlights patterns for mixed content queries
        self.highlights_patterns = [
            r"(?i)highlights?", r"(?i)recap", r"(?i)summary", r"(?i)overview",
            r"(?i)key.*achievements?", r"(?i)main.*points", r"(?i)standout",
            r"(?i)best.*work", r"(?i)top.*projects", r"(?i)career.*highlights",
            r"(?i)what.*stands.*out", r"(?i)most.*impressive"
        ]
        
        # COMPREHENSIVE Technology mappings auto-generated from resume data
        self.tech_mappings = {
            # DEEP LEARNING & NEURAL NETWORKS (CNN, DCNN, etc.)
            "cnn": ["CNN", "CNNs", "DCNN", "convolutional neural networks", "deep learning", "computer vision"],
            "deep_learning": ["Deep Learning", "CNN", "DCNN", "neural networks", "TensorFlow", "PyTorch"],
            "neural_networks": ["neural networks", "CNN", "DCNN", "deep learning", "neural engineering"],
            "tensorflow": ["TensorFlow", "deep learning", "CNN", "neural networks", "machine learning"],
            "pytorch": ["PyTorch", "deep learning", "neural networks", "machine learning", "AI"],
            
            # AI & MACHINE LEARNING
            "ai": ["AI", "artificial intelligence", "machine learning", "LLM", "conversational AI", "voice AI"],
            "machine_learning": ["Machine Learning", "ML", "AI", "data science", "SMOTE", "ensemble learning"],
            "llm": ["LLM", "LLMs", "large language models", "AI", "conversational AI", "Qwen-7B", "language models"],
            "rag": ["RAG", "retrieval augmented generation", "LLM", "vector search", "knowledge retrieval"],
            "conversational_ai": ["Conversational AI", "chatbot", "dialogue systems", "LLM", "voice AI"],
            "voice_ai": ["Voice AI", "speech recognition", "TTS", "voice processing", "conversational AI"],
            "qwen_7b": ["Qwen-7B", "Qwen", "large language model", "LLM", "Chinese model"],
            "ai_engineering": ["AI Engineering", "MLOps", "AI systems", "production AI", "AI infrastructure"],
            "mlops": ["MLOps", "ML operations", "model deployment", "ML pipeline", "AI engineering"],
            "ai_assisted_learning": ["AI-Assisted Learning", "educational AI", "intelligent tutoring", "adaptive learning"],
            
            # PROGRAMMING LANGUAGES
            "python": ["Python", "FastAPI", "machine learning", "AI", "data science", "backend", "scripting"],
            "javascript": ["JavaScript", "JS", "React", "Next.js", "Node.js", "web development", "frontend"],
            "cpp": ["C++", "cpp", "CPP", "systems programming", "algorithms", "performance", "low-level", "embedded"],
            "matlab": ["MATLAB", "signal processing", "research", "numerical computing", "engineering"],
            
            # WEB FRAMEWORKS & LIBRARIES
            "fastapi": ["FastAPI", "Python", "API", "backend", "web framework", "REST API"],
            "react": ["React", "JavaScript", "frontend", "web development", "Next.js", "UI framework"],
            "nextjs": ["Next.js", "React", "web development", "SSR", "frontend framework", "Vercel"],
            "web_development": ["Web Development", "frontend", "backend", "full-stack", "web applications"],
            "api_integration": ["API Integration", "REST API", "web services", "API development", "microservices"],
            
            # DATABASES & STORAGE
            "mongodb": ["MongoDB", "database", "NoSQL", "document database", "cloud database"],
            
            # CLOUD & INFRASTRUCTURE
            "aws": ["AWS", "Amazon Web Services", "cloud", "Lambda", "SQS", "serverless"],
            "serverless": ["Serverless", "AWS Lambda", "cloud functions", "FaaS", "event-driven"],
            "lambda": ["Lambda", "AWS Lambda", "serverless", "cloud functions", "event processing"],
            "sqs": ["SQS", "Simple Queue Service", "AWS", "message queue", "async processing"],
            
            # BIOMEDICAL & SIGNAL PROCESSING
            "bci": ["BCI", "brain-computer interface", "EEG", "neural interface", "biomedical"],
            "eeg": ["EEG", "electroencephalography", "brain signals", "BCI", "neural engineering"],
            "ecg": ["ECG", "electrocardiography", "heart signals", "biomedical", "medical signals"],
            "ecg_signals": ["ECG Signals", "electrocardiography", "heart monitoring", "cardiac signals", "biomedical"],
            "signal_processing": ["Signal Processing", "EEG", "ECG", "biomedical signals", "DSP"],
            "biomedical": ["Biomedical Signal Processing", "medical", "healthcare", "ECG", "EEG", "sleep apnea"],
            "p300": ["P300", "ERP", "event-related potential", "BCI", "brain signals", "EEG"],
            "sleep_apnea_detection": ["Sleep Apnea", "OSA", "sleep disorders", "medical diagnosis", "ECG"],
            "emotion_recognition": ["Emotion Recognition", "affective computing", "sentiment analysis", "EEG emotions", "BCI"],
            
            # ROBOTICS & HCI
            "robotics": ["Robotics", "robot systems", "autonomous systems", "multi-agent systems"],
            "multi_agent_systems": ["Multi-Agent Systems", "distributed systems", "robotics", "coordination"],
            "educational_robotics": ["Educational Robotics", "learning robots", "pedagogical robotics", "STEM education"],
            "child_robot_interaction": ["Child-Robot Interaction", "educational robotics", "HCI", "social robotics"],
            "parental_involvement": ["Parental Involvement", "family engagement", "educational psychology", "learning support"],
            "hci": ["HCI", "human-computer interaction", "user experience", "interface design"],
            
            # DATA SCIENCE & ANALYTICS
            "data_science": ["Data Science", "analytics", "machine learning", "statistics", "data analysis"],
            "big_data": ["Big Data", "large datasets", "data processing", "ETL", "data engineering"],
            "etl": ["ETL", "data pipeline", "data processing", "data engineering", "batch processing"],
            "smote": ["SMOTE", "synthetic minority oversampling", "imbalanced data", "machine learning"],
            
            # COMPUTER VISION & IMAGE PROCESSING
            "computer_vision": ["Computer Vision", "OpenCV", "image processing", "CNN", "visual recognition"],
            "opencv": ["OpenCV", "computer vision", "image processing", "Python", "C++"],
            "hyperspectral_imaging": ["Hyperspectral Imaging", "remote sensing", "spectral analysis", "defense"],
            "remote_sensing": ["Remote Sensing", "satellite imagery", "geospatial analysis", "earth observation"],
            "linear_mixture_modeling": ["Linear Mixture Modeling", "spectral unmixing", "remote sensing", "hyperspectral analysis"],
            
            # DEVELOPMENT & DEVOPS
            "cicd": ["CI/CD", "continuous integration", "GitHub Actions", "deployment", "automation"],
            "github_actions": ["GitHub Actions", "CI/CD", "automation", "workflows", "deployment"],
            "chrome_extension": ["Chrome Extension", "browser extension", "JavaScript", "web development"],
            
            # SYSTEMS & PERFORMANCE
            "systems_programming": ["Systems Programming", "low-level", "performance", "C++", "memory management"],
            "algorithms": ["Algorithms", "data structures", "computational complexity", "optimization"],
            "performance_optimization": ["Performance Optimization", "optimization", "efficiency", "scalability"],
            "performance": ["Performance", "optimization", "efficiency", "speed", "benchmarking"],
            "real_time_processing": ["Real-time Processing", "streaming", "live processing", "low latency", "real-time systems"],
            "streaming": ["Streaming", "real-time", "live data", "websockets", "event streaming"],
            
            # RESEARCH & SPECIALIZED DOMAINS
            "research": ["Research", "academic research", "scientific research", "R&D", "experimental"],
            "defense_research": ["Defense Research", "military applications", "security research", "government research"],
            "architecture": ["Architecture", "system design", "software architecture", "design patterns", "scalability"],
            "best_practices": ["Best Practices", "coding standards", "software engineering", "quality assurance", "methodology"],
            
            # BUSINESS & FINTECH
            "stripe": ["Stripe", "payment processing", "fintech", "API", "e-commerce"],
            
            # PRODUCTION & DEPLOYMENT
            "production_systems": ["Production Systems", "scalable systems", "reliability", "monitoring"],
        }
        
        # Get all technologies from resume for semantic comparison
        self._resume_technologies = self._extract_all_resume_technologies()
        
        # COMPREHENSIVE Technology similarity matrix for fallback suggestions
        self.tech_similarity = {
            # NEURAL NETWORKS & DEEP LEARNING (THE MISSING PIECE!)
            "cnn": ["deep_learning", "neural_networks", "tensorflow", "machine_learning"],
            "convolutional": ["cnn", "deep_learning", "neural_networks"],
            "dcnn": ["cnn", "deep_learning", "neural_networks", "tensorflow"],
            "neural": ["neural_networks", "deep_learning", "cnn", "machine_learning"],
            "alexnet": ["cnn", "deep_learning", "neural_networks", "tensorflow"],
            "1dcnn": ["cnn", "deep_learning", "neural_networks", "signal_processing"],
            
            # ML/AI frameworks & techniques
            "tensorflow": ["deep_learning", "cnn", "neural_networks", "machine_learning"],
            "pytorch": ["deep_learning", "cnn", "neural_networks", "machine_learning"],
            "keras": ["tensorflow", "deep_learning", "neural_networks"],
            "scikit-learn": ["machine_learning", "classification", "ensemble_learning"],
            "xgboost": ["machine_learning", "ensemble_learning", "classification"],
            "random_forest": ["machine_learning", "ensemble_learning", "classification"],
            
            # Signal Processing & Biomedical
            "signal_processing": ["eeg", "ecg", "biomedical", "neural_networks"],
            "biomedical": ["ecg", "eeg", "signal_processing", "healthcare"],
            "medical": ["biomedical", "healthcare", "ecg", "signal_processing"],
            "sleep_apnea": ["ecg", "biomedical", "healthcare", "deep_learning"],
            
            # NoSQL databases
            "cassandra": ["mongodb", "database"],
            "redis": ["mongodb", "database"],
            "dynamodb": ["mongodb", "database"],
            "couchdb": ["mongodb", "database"],
            
            # SQL databases  
            "mysql": ["postgresql", "database"],
            "postgresql": ["mysql", "database"],
            "sqlite": ["database"],
            
            # Programming languages
            "java": ["python", "backend"],
            "php": ["python", "backend"],
            "ruby": ["python", "backend"],
            "go": ["python", "backend"],
            "rust": ["systems", "backend"],
            "c": ["systems", "cpp"],
            "cpp": ["systems", "algorithms"],
            
            # Frontend frameworks
            "react": ["javascript", "web_development", "nextjs"],
            "vue": ["javascript", "web_development"],
            "angular": ["javascript", "web_development"],
            "svelte": ["javascript", "web_development"],
            "nextjs": ["react", "javascript", "web_development"],
            
            # Backend frameworks
            "django": ["python", "backend", "fastapi"],
            "flask": ["python", "backend", "fastapi"],
            "express": ["javascript", "backend"],
            "spring": ["backend"],
            "fastapi": ["python", "backend", "api"],
            
            # Cloud platforms
            "gcp": ["aws", "cloud"],
            "azure": ["aws", "cloud"],
            "digitalocean": ["aws", "cloud"],
            
            # DevOps/Infrastructure
            "docker": ["kubernetes", "devops", "systems"],
            "kubernetes": ["docker", "devops", "systems"],
            "jenkins": ["cicd", "devops"],
            "ansible": ["devops", "systems"],
            
            # Data Engineering
            "spark": ["big_data", "etl", "python"],
            "kafka": ["streaming", "big_data", "etl"],
            "airflow": ["etl", "data_science", "pipeline"],
            
            # Computer Vision
            "yolo": ["computer_vision", "opencv", "deep_learning"],
            "object_detection": ["computer_vision", "opencv", "cnn"],
            "image_processing": ["computer_vision", "opencv", "signal_processing"]
        }

    def _extract_all_resume_technologies(self) -> List[str]:
        """Extract all unique technologies mentioned in the resume"""
        all_techs = set()
        
        # Extract from all content types
        for content_type in ["projects", "experience", "publications"]:
            items = self.resume_data.get(content_type, [])
            for item in items:
                # Add technologies
                techs = item.get("technologies", [])
                all_techs.update([tech.lower() for tech in techs])
                
                # Add keywords  
                keywords = item.get("keywords", [])
                all_techs.update([kw.lower() for kw in keywords])
        
        return list(all_techs)

    def get_semantic_similarities(self, tech: str, top_k: int = 3) -> List[str]:
        """Get semantically similar technologies using embeddings (fallback method)"""
        if not self.semantic_model or not self._resume_technologies:
            return []
        
        try:
            # Get embedding for requested technology
            tech_embedding = self.semantic_model.encode([tech])
            
            # Get embeddings for all resume technologies
            resume_embeddings = self.semantic_model.encode(self._resume_technologies)
            
            # Calculate cosine similarities
            from sklearn.metrics.pairwise import cosine_similarity
            similarities = cosine_similarity(tech_embedding, resume_embeddings)[0]
            
            # Get top-k most similar technologies
            similar_indices = similarities.argsort()[-top_k:][::-1]
            similar_techs = [self._resume_technologies[i] for i in similar_indices if similarities[i] > 0.3]  # 0.3 threshold
            
            return similar_techs
            
        except Exception as e:
            print(f"Semantic similarity error: {e}")
            return []

    def get_similar_technologies_hybrid(self, tech: str) -> List[str]:
        """Hybrid approach: hard-coded mappings + semantic similarity fallback"""
        # 1. Try hard-coded mappings first (most reliable)
        if tech.lower() in self.tech_similarity:
            return self.tech_similarity[tech.lower()]
        
        # 2. Try semantic similarity as fallback (for unknown technologies)
        semantic_similar = self.get_semantic_similarities(tech, top_k=3)
        if semantic_similar:
            print(f"🤖 Using semantic similarity for '{tech}': {semantic_similar}")
            return semantic_similar
        
        # 3. Last resort: try broad category matching
        broad_categories = {
            "database": ["database", "mongodb"],
            "frontend": ["javascript", "web_development"], 
            "backend": ["python", "backend"],
            "ml": ["machine_learning"]
        }
        
        for category, fallback_techs in broad_categories.items():
            if category in tech.lower() or any(word in tech.lower() for word in ["db", "front", "back", "ai"]):
                return fallback_techs
        
        return []

    def extract_intent(self, query: str) -> str:
        """Extract the main intent from the query - be more conservative"""
        query_lower = query.lower()
        
        # Check for simple greetings or casual conversation first
        greeting_patterns = [
            r"^(hi|hello|hey|yo|sup|what's up)$",
            r"^how are you",
            r"^good morning",
            r"^good afternoon", 
            r"^good evening"
        ]
        
        # Check for casual conversational queries that don't need cards
        casual_patterns = [
            r"what does that even mean",
            r"what do you mean",
            r"i don't understand",
            r"that doesn't make sense",
            r"what are you talking about",
            r"huh\?",
            r"what\?",
            r"^are you there",
            r"^test",
            r"^testing",
            r"one.*two.*three",
            r"can you hear me"
        ]
        
        if any(re.search(pattern, query_lower.strip()) for pattern in greeting_patterns):
            return "greeting"
            
        if any(re.search(pattern, query_lower.strip()) for pattern in casual_patterns):
            return "general"
        
        intent_scores = {}
        for intent, patterns in self.intent_patterns.items():
            score = sum(1 for pattern in patterns if re.search(pattern, query))
            if score > 0:
                intent_scores[intent] = score
        
        if intent_scores:
            return max(intent_scores, key=intent_scores.get)
        
        # Check if it's a general conversational query that doesn't need cards
        general_patterns = [
            r"tell me about yourself",
            r"who are you",
            r"what do you do",
            r"introduce yourself"
        ]
        
        if any(re.search(pattern, query_lower) for pattern in general_patterns):
            return "general"
        
        # Default fallback only if there's clear intent for content
        return "projects"

    def is_highlights_query(self, query: str) -> bool:
        """Check if query is asking for highlights or career recap"""
        return any(re.search(pattern, query) for pattern in self.highlights_patterns)

    def sort_projects_by_date(self, projects: List[Dict]) -> List[Dict]:
        """Sort projects by date (most recent first) as default ordering"""
        return sorted(projects, key=lambda x: x.get("date", "2020"), reverse=True)

    def extract_technologies(self, query: str) -> List[str]:
        """Extract mentioned technologies/keywords from the query (conservative approach with fuzzy matching)"""
        query_lower = query.lower()
        found_techs = []
        
        # First pass: exact matching with word boundaries
        for tech, keywords in self.tech_mappings.items():
            for keyword in keywords:
                if re.search(r'\b' + re.escape(keyword.lower()) + r'\b', query_lower):
                    found_techs.append(tech)
                    break
        
        # Second pass: fuzzy matching for potential misspellings (only if no exact matches found)
        if not found_techs:
            try:
                from fuzzywuzzy import fuzz
                from fuzzywuzzy.process import extractOne
                
                # Get all unique keywords from tech mappings for fuzzy matching
                all_keywords = []
                keyword_to_tech = {}
                for tech, keywords in self.tech_mappings.items():
                    for keyword in keywords:
                        keyword_lower = keyword.lower()
                        # Skip very common words that might cause false matches
                        if keyword_lower in ['experience', 'user experience', 'work', 'project', 'projects']:
                            continue
                        if keyword_lower not in all_keywords:  # Avoid duplicates
                            all_keywords.append(keyword_lower)
                            keyword_to_tech[keyword_lower] = tech
                
                # Split query into words and find fuzzy matches
                query_words = re.findall(r'\b\w+\b', query_lower)
                
                # Also try matching 2-word combinations for multi-word tech terms
                two_word_combinations = []
                for i in range(len(query_words) - 1):
                    two_word_combinations.append(f"{query_words[i]} {query_words[i+1]}")
                
                # Check single words first
                for word in query_words:
                    if len(word) >= 4:  # Only check words of reasonable length (increased from 3)
                        # Find best fuzzy match
                        best_match, score = extractOne(word, all_keywords, scorer=fuzz.ratio)
                        
                        # Accept matches with score >= 82 (balanced threshold for accuracy vs coverage)
                        if score >= 82:
                            matched_tech = keyword_to_tech[best_match]
                            if matched_tech not in found_techs:
                                found_techs.append(matched_tech)
                                print(f"🎯 Fuzzy match: '{word}' -> '{best_match}' (tech: {matched_tech}, score: {score})")
                
                # Check two-word combinations
                for two_word in two_word_combinations:
                    if len(two_word.replace(' ', '')) >= 6:  # Reasonable length for two-word term
                        best_match, score = extractOne(two_word, all_keywords, scorer=fuzz.ratio)
                        
                        # Slightly lower threshold for two-word matches since they're more specific
                        if score >= 80:
                            matched_tech = keyword_to_tech[best_match]
                            if matched_tech not in found_techs:
                                found_techs.append(matched_tech)
                                print(f"🎯 Fuzzy 2-word match: '{two_word}' -> '{best_match}' (tech: {matched_tech}, score: {score})")
            
            except ImportError:
                # Fuzzy matching not available, continue with exact matching only
                pass
        
        return list(set(found_techs))

    def extract_date_filters(self, query: str) -> Dict[str, Any]:
        """Extract date/year filters from the query"""
        date_filters = {
            "years": [],
            "date_range": None,
            "date_modifier": None  # "from", "in", "during", "after", "before"
        }
        
        # Extract specific years (4-digit numbers and 2-digit shorthand)
        year_matches = re.findall(r'\b(20[0-9]{2})\b', query)
        
        # Handle 2-digit year shorthand like "23" for "2023"
        short_year_patterns = [
            r'\bfrom\s+(\d{2})\b',
            r'\bin\s+(\d{2})\b', 
            r'\bduring\s+(\d{2})\b',
            r'\bof\s+(\d{2})\b',
            r'\s(\d{2})\?',  # "from 23?"
        ]
        
        for pattern in short_year_patterns:
            matches = re.findall(pattern, query.lower())
            for short_year in matches:
                short_year_int = int(short_year)
                if 20 <= short_year_int <= 30:  # Years 2020-2030
                    full_year = f"20{short_year}"
                    year_matches.append(full_year)
        
        date_filters["years"] = list(set(year_matches))
        
        # Extract date modifiers and relative time references
        query_lower = query.lower()
        if re.search(r'\bfrom\s+(\d{4})\s+only\b', query_lower):
            date_filters["date_modifier"] = "from_only"
        elif re.search(r'\bin\s+(\d{4})\s+only\b', query_lower):
            date_filters["date_modifier"] = "in_only"
        elif re.search(r'\bduring\s+(\d{4})\b', query_lower):
            date_filters["date_modifier"] = "during"
        elif re.search(r'\bafter\s+(\d{4})\b', query_lower):
            date_filters["date_modifier"] = "after"
        elif re.search(r'\bbefore\s+(\d{4})\b', query_lower):
            date_filters["date_modifier"] = "before"
        elif re.search(r'\bfrom\s+(\d{4})\b', query_lower):
            date_filters["date_modifier"] = "from"
        elif re.search(r'\bin\s+(\d{4})\b', query_lower):
            date_filters["date_modifier"] = "in"
        elif re.search(r'\blast\s+two\s+years?\b', query_lower):
            # Handle "last two years" - calculate from current year
            current_year = 2025  # Since we're in 2025
            date_filters["years"] = [str(current_year - 1), str(current_year)]
            date_filters["date_modifier"] = "last_two_years"
        elif re.search(r'\blast\s+year\b', query_lower):
            # Handle "last year"
            date_filters["years"] = ["2024"]
            date_filters["date_modifier"] = "last_year"
        elif re.search(r'\bpast\s+(\d+)\s+years?\b', query_lower):
            # Handle "past X year(s)" - calculate from current year
            match = re.search(r'\bpast\s+(\d+)\s+years?\b', query_lower)
            if match:
                years_back = int(match.group(1))
                current_year = 2025  # Since we're in 2025
                date_filters["years"] = [str(current_year - i) for i in range(years_back)]
                date_filters["date_modifier"] = f"past_{years_back}_years"
        
        return date_filters

    def filter_by_date(self, items: List[Dict], date_filters: Dict[str, Any]) -> List[Dict]:
        """Filter items by date criteria"""
        if not date_filters["years"]:
            return items

        filtered_items = []
        target_years = [int(year) for year in date_filters["years"]]
        date_modifier = date_filters["date_modifier"]

        for item in items:
            # Get date information from item
            dates_field = item.get("dates", item.get("date", ""))
            if not dates_field:
                continue

            # Parse date ranges (e.g., "Mar. 2024 – Jan. 2025" or "Feb 2025")
            if "–" in dates_field or "-" in dates_field:
                # Date range
                separator = "–" if "–" in dates_field else "-"
                parts = dates_field.split(separator)
                if len(parts) == 2:
                    start_part = parts[0].strip()
                    end_part = parts[1].strip()

                    # Extract years from start and end
                    start_year_match = re.search(r'(20[0-9]{2})', start_part)
                    end_year_match = re.search(r'(20[0-9]{2})', end_part)

                    if start_year_match and end_year_match:
                        start_year = int(start_year_match.group(1))
                        end_year = int(end_year_match.group(1))

                        # Apply date filtering logic
                        if date_modifier == "from_only":
                            # Only items that START in one of the target years
                            if start_year in target_years:
                                filtered_items.append(item)
                        elif date_modifier == "in_only":
                            # Only items that are ENTIRELY within target years
                            if start_year in target_years and end_year in target_years:
                                filtered_items.append(item)
                        elif date_modifier == "last_two_years":
                            # Items that overlap with the last two years
                            if any(start_year <= target_year <= end_year for target_year in target_years):
                                filtered_items.append(item)
                        elif date_modifier == "during" or date_modifier == "in":
                            # Items that overlap with any target year
                            if any(start_year <= target_year <= end_year for target_year in target_years):
                                filtered_items.append(item)
                        elif date_modifier == "from":
                            # Items that START in target year or END in target year (inclusive)
                            if start_year in target_years or end_year in target_years:
                                filtered_items.append(item)
                        elif date_modifier == "after":
                            # Items that start after target year
                            if start_year > max(target_years):
                                filtered_items.append(item)
                        elif date_modifier == "before":
                            # Items that end before target year
                            if end_year < min(target_years):
                                filtered_items.append(item)
                        else:
                            # Default: items that overlap with any target year
                            if any(start_year <= target_year <= end_year for target_year in target_years):
                                filtered_items.append(item)
            else:
                # Single date (e.g., "Feb 2025")
                year_match = re.search(r'(20[0-9]{2})', dates_field)
                if year_match:
                    item_year = int(year_match.group(1))

                    if item_year in target_years:
                        filtered_items.append(item)

        return filtered_items

    def filter_by_technology(self, items: List[Dict], tech_filters: List[str]) -> List[Dict]:
        """Filter items by technology keywords with precise matching"""
        if not tech_filters:
            return items
        
        filtered_items = []
        for item in items:
            item_techs = item.get("technologies", [])
            item_keywords = item.get("keywords", [])
            item_text = " ".join([
                item.get("title", ""),
                item.get("company", ""),
                item.get("description", ""),
                " ".join(item.get("highlights", []))
            ]).lower()
            
            # Check if any filter matches
            match_found = False
            for tech_filter in tech_filters:
                # Direct technology match (exact or substring)
                if any(tech_filter.lower() in tech.lower() for tech in item_techs):
                    match_found = True
                    break
                # Keyword match (exact or substring)
                if any(tech_filter.lower() in keyword.lower() for keyword in item_keywords):
                    match_found = True
                    break
                # Text content match using tech mappings - BUT ONLY if specific tech found
                if tech_filter in self.tech_mappings:
                    mapped_keywords = self.tech_mappings[tech_filter]
                    # For database category, require SPECIFIC database tech match
                    if tech_filter == "database":
                        # Only match if specific database tech is found in item
                        specific_db_match = False
                        for keyword in mapped_keywords:
                            if keyword.lower() in item_text or any(keyword.lower() in tech.lower() for tech in item_techs):
                                specific_db_match = True
                                break
                        if specific_db_match:
                            match_found = True
                            break
                    else:
                        # For other categories, use general matching
                        if any(keyword.lower() in item_text for keyword in mapped_keywords):
                            match_found = True
                            break
                # Direct text match (for specific tech names)
                if tech_filter.lower() in item_text:
                    match_found = True
                    break
            
            if match_found:
                filtered_items.append(item)
        
        return filtered_items

    def _is_followup_query(self, question: str) -> bool:
        """Detect if this is a follow-up query that needs context"""
        print(f"🔍 FOLLOWUP DEBUG - Testing patterns for: '{question}'")
        followup_patterns = [
            r'(?i)\btell me more\b',
            r'(?i)\bmore about (that|those|them|it)\b',
            r'(?i)\bwhat about (that|those|them)\b',
            r'(?i)\bexpand on (that|those|them)\b',
            r'(?i)\bshow me more\b',
            r'(?i)\bgive me details\b',
            r'(?i)\b(that|those|them|it)\b.*\b(sounds?|looks?|seems?)\b',
            # CONTEXTUAL REFERENCE PATTERNS - the key missing piece!
            r'(?i)\bin (this|that)\b',
            r'(?i)\bat (this|that)\b',  
            r'(?i)\bfor (this|that)\b',
            r'(?i)\bwith (this|that)\b',
            r'(?i)\bdid.*you.*do.*\bin (this|that|there)\b',
            r'(?i)\bwhat.*did.*he.*do.*\bin (this|that|there)\b',
            r'(?i)\bany.*\bin (this|that|there)\b',
            r'(?i)\bwas there.*\bin (this|that)\b',
            r'(?i)\bdid.*involve.*\bin (this|that)\b',
            r'(?i)\b(here|there)\b.*\?',
            r'(?i)\bin (that|this) (project|experience|work|role|position)\b',
            # CLARIFICATION PATTERNS
            r'(?i)^no,?\s*i\s*meant\b',
            r'(?i)^actually,?\s*i\s*meant\b',
            r'(?i)^sorry,?\s*i\s*meant\b',
            r'(?i)\bwhat.*did.*he.*do.*\b(at|in)\s+\w+\s+(experience|company|job|role)\b',
            r'(?i)\bin\s+\w+\s+(experience|company|job|role)\b',
            # MORE FLEXIBLE PATTERNS
            r'(?i)\bshow me more\b.*\b(details?|information|info)\b',
            r'(?i)\bgive me more\b.*\b(details?|information|info)\b',
            r'(?i)\btell me more\b.*\b(details?|information|info)\b',
            # SHOW ALL PATTERNS
            r'(?i)\bshow all\b',
            r'(?i)\bshow me all\b',
            r'(?i)\bgive me all\b',
            r'(?i)\ball of them\b',
            r'(?i)\beverything\b',
            r'(?i)\ball results\b',
            r'(?i)\ball available\b'
        ]
        
        is_followup = any(re.search(pattern, question) for pattern in followup_patterns)
        print(f"🔍 FOLLOWUP DEBUG - Is followup query: {is_followup}")
        if is_followup:
            for pattern in followup_patterns:
                if re.search(pattern, question):
                    print(f"🔍 FOLLOWUP DEBUG - MATCHED pattern: {pattern}")
                    break
        return is_followup
    
    def _detect_specific_entity(self, question: str) -> Optional[Dict]:
        """Detect if the user is asking about a specific company, project, or item"""
        question_lower = question.lower()
        
        # Company/Organization patterns
        company_patterns = [
            r'(?i)what.*did.*he.*do.*(?:at|in|for)\s+(.+?)(?:\?|$)',
            r'(?i)what.*specifically.*(?:at|in|for)\s+(.+?)(?:\?|$)',
            r'(?i)tell me about.*(?:his work|experience).*(?:at|in|for)\s+(.+?)(?:\?|$)',
            r'(?i)(?:at|in|for)\s+(.+?)(?:\?|$)',
            r'(?i)about.*(.+?)\s+(?:lab|company|inc|corp|llc|organization)(?:\?|$)',
            r'(?i)tell me about\s+(.+?)(?:\?|$)',  # General "tell me about X" pattern
            r'(?i)\bin\s+(.+?)\s+(experience|company|job|role)\b',  # "in Quinnis experience"
            r'(?i)\bat\s+(.+?)\s+(experience|company|job|role)\b',  # "at Quinnis experience"
            r'(?i)(?:no,?\s*i\s*meant\s*)?what.*did.*he.*do.*(?:at|in)\s+(.+?)(?:\?|$)'  # Clarification patterns
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, question)
            if match:
                entity_name = match.group(1).strip()
                # Clean up common speech recognition errors and variations
                entity_name = re.sub(r'\b(slap|lab)\b', 'lab', entity_name, flags=re.IGNORECASE)
                entity_name = re.sub(r'\b(robot|robots)\b', 'robots', entity_name, flags=re.IGNORECASE)
                
                # Search for matching items across all content types
                matched_items = []
                for content_type in ["experience", "projects", "publications"]:
                    items = self.resume_data.get(content_type, [])
                    for item in items:
                        # Check company name, title, or description
                        searchable_text = " ".join([
                            item.get("company", ""),
                            item.get("title", ""),
                            item.get("description", "")
                        ]).lower()
                        
                        # Flexible matching - check if key words from entity_name appear
                        entity_words = entity_name.lower().split()
                        if len(entity_words) >= 2:  # Multi-word entities
                            word_matches = sum(1 for word in entity_words if word in searchable_text and len(word) > 2)
                            if word_matches >= 2:  # At least 2 significant words match
                                item["content_source"] = content_type
                                matched_items.append(item)
                        elif len(entity_words) == 1 and len(entity_words[0]) > 3:  # Single significant word
                            if entity_words[0] in searchable_text:
                                item["content_source"] = content_type
                                matched_items.append(item)
                
                if matched_items:
                    return {
                        "entity_name": entity_name,
                        "entity_type": "company_or_project",
                        "matched_items": matched_items,
                        "query_type": "specific_entity"
                    }
        
        return None
    
    def _handle_followup_query(self, question: str, conversation_history: list) -> QueryResult:
        """Handle follow-up queries using conversation context"""
        print(f"🔍 DEBUG - _handle_followup_query called with: '{question}'")
        print(f"🔍 DEBUG - Conversation history length: {len(conversation_history) if conversation_history else 0}")
        
        if not conversation_history:
            print("🔍 DEBUG - No conversation history, returning None")
            return None
            
        # Find the most recent query that had results
        # Handle both internal QueryResult format and API response format
        last_query_with_results = None
        for entry in reversed(conversation_history):
            print(f"🔍 DEBUG - Checking entry: {type(entry)}")
            
            # Handle API response format (from frontend conversation history)
            if isinstance(entry, dict) and 'structuredData' in entry:
                structured_data = entry['structuredData']
                if isinstance(structured_data, dict) and 'items' in structured_data:
                    items = structured_data.get('items', [])
                    metadata = structured_data.get('metadata', {})
                    total_results = metadata.get('total_results', len(items))
                    print(f"🔍 DEBUG - Found structuredData entry with {total_results} results")
                    if total_results > 0:
                        last_query_with_results = entry
                        break
            
            # Handle QueryResult objects (internal format)
            elif hasattr(entry, 'metadata') and hasattr(entry, 'items'):
                metadata = entry.metadata
                items = entry.items
                total_results = metadata.get('total_results', len(items))
                print(f"🔍 DEBUG - Found QueryResult entry with {total_results} results")
                if total_results > 0:
                    last_query_with_results = entry
                    break
                    
            # Handle dictionary format (API response format)
            elif isinstance(entry, dict):
                metadata = entry.get('metadata', {})
                items = entry.get('items', [])
                total_results = metadata.get('total_results', len(items))
                print(f"🔍 DEBUG - Found dict entry with {total_results} results")
                if total_results > 0:
                    last_query_with_results = entry
                    break
            else:
                print(f"🔍 DEBUG - Skipping entry of type {type(entry)}")
                continue
                
        if not last_query_with_results:
            print("🔍 DEBUG - No previous query with results found, returning None")
            return None
        
        # Extract metadata and items based on the format
        if isinstance(last_query_with_results, dict) and 'structuredData' in last_query_with_results:
            # API response format from frontend
            structured_data = last_query_with_results['structuredData']
            metadata = structured_data.get('metadata', {})
            items = structured_data.get('items', [])
        elif hasattr(last_query_with_results, 'metadata'):
            # QueryResult object format
            metadata = last_query_with_results.metadata
            items = last_query_with_results.items
        else:
            # Direct dictionary format
            metadata = last_query_with_results.get('metadata', {})
            items = last_query_with_results.get('items', [])
        
        print(f"🔍 DEBUG - Found previous query: {metadata.get('original_query', 'N/A')}")
        print(f"🔍 DEBUG - Previous entity: {metadata.get('entity_name', 'N/A')}")
        print(f"🔍 DEBUG - Previous metadata keys: {list(metadata.keys())}")
        print(f"🔍 DEBUG - Previous items count: {len(items)}")
            
        # Store previous metadata for use throughout the method
        prev_metadata = metadata
            
        # CLARIFICATION HANDLING: Check if this is a clarifying query mentioning a specific entity
        clarification_patterns = [
            r'(?i)^no,?\s*i\s*meant\b',
            r'(?i)^actually,?\s*i\s*meant\b',
            r'(?i)^sorry,?\s*i\s*meant\b'
        ]
        
        is_clarification = any(re.search(pattern, question) for pattern in clarification_patterns)
        
        if is_clarification:
            # Try to detect the specific entity mentioned in the clarification
            entity_result = self._detect_specific_entity(question)
            if entity_result:
                # Found a specific entity, return its results
                matched_items = entity_result["matched_items"]
                entity_name = entity_result["entity_name"]
                
                # Determine primary content type
                content_sources = [item["content_source"] for item in matched_items]
                primary_type = "mixed" if len(set(content_sources)) > 1 else (content_sources[0] if content_sources else "experience")
                
                return QueryResult(
                    response_text=f"Here's what he did at {entity_name}",
                    items=matched_items,
                    item_type=primary_type,
                    metadata={
                        "entity_name": entity_name,
                        "entity_type": entity_result["entity_type"],
                        "original_query": question,
                        "total_results": len(matched_items),
                        "needs_cards": len(matched_items) > 0,
                        "is_followup": True,
                        "clarification_query": True,
                        "query_type": "clarification_entity"
                    }
                )
            else:
                # No entity found - this might be asking about something that doesn't exist
                # Extract company name from the query for a "not found" response
                company_match = re.search(r'(?i)\bin\s+(\w+)\s+experience\b', question)
                if company_match:
                    company_name = company_match.group(1)
                    return QueryResult(
                        response_text=f"I don't see any experience at {company_name} in the resume",
                        items=[],
                        item_type="none",
                        metadata={
                            "original_query": question,
                            "total_results": 0,
                            "needs_cards": False,
                            "is_followup": True,
                            "clarification_query": True,
                            "entity_not_found": True,
                            "mentioned_entity": company_name,
                            "query_type": "clarification_not_found"
                        }
                    )
            
        # SHOW ALL HANDLING: Check if this is specifically asking for "show all" (return all remaining items)
        show_all_patterns = [
            r'(?i)\bshow all\b',
            r'(?i)\bshow me all\b',
            r'(?i)\bgive me all\b',
            r'(?i)\ball of them\b',
            r'(?i)\beverything\b',
            r'(?i)\ball results\b',
            r'(?i)\ball available\b'
        ]
        
        is_show_all = any(re.search(pattern, question) for pattern in show_all_patterns)
        
        if is_show_all:
            # Fallback: return ALL items of the same type as the previous query
            prev_item_type = prev_metadata.get('item_type', 'projects')
            prev_tech_filters = prev_metadata.get('tech_filters', [])
            prev_date_filters = prev_metadata.get('date_filters', {})
            
            print(f"🔍 DEBUG - User asking to show all {prev_item_type}")
            
            # Get ALL items of the same type
            if prev_item_type == "projects":
                all_items_of_type = self.resume_data.get("projects", [])
            elif prev_item_type == "experience":
                all_items_of_type = self.resume_data.get("experience", [])
            elif prev_item_type == "publications":
                all_items_of_type = self.resume_data.get("publications", [])
            elif prev_item_type == "mixed":
                # For mixed, get all projects (most common)
                all_items_of_type = self.resume_data.get("projects", [])
            else:
                all_items_of_type = self.resume_data.get("projects", [])
            
            # Apply the same filters as the original query
            if prev_tech_filters:
                all_items_of_type = self.filter_by_technology(all_items_of_type, prev_tech_filters)
            if prev_date_filters.get("years"):
                all_items_of_type = self.filter_by_date(all_items_of_type, prev_date_filters)
            
            # Sort items (same as original)
            if prev_item_type == "projects":
                all_items_of_type = self.sort_projects_by_date(all_items_of_type)
            
            # Tag with content source
            for item in all_items_of_type:
                item["content_source"] = prev_item_type if prev_item_type != "mixed" else "projects"
            
            return QueryResult(
                response_text=f"Here are all the {prev_item_type} I have:",
                items=all_items_of_type,
                item_type=prev_item_type,
                metadata={
                    "original_query": question,
                    "context_query": prev_metadata.get('original_query', ''),
                    "total_results": len(all_items_of_type),
                    "needs_cards": len(all_items_of_type) > 0,
                    "is_followup": True,
                    "contextual_followup": True,
                    "show_all_query": True,
                    "query_type": "show_all"
                }
            )
            
        # ENHANCED CONTEXT HANDLING: Check if this is asking about something within the previous context
        contextual_patterns = [
            r'(?i)\bin (this|that)\b',
            r'(?i)\bat (this|that)\b',
            r'(?i)\bfor (this|that)\b', 
            r'(?i)\bwith (this|that)\b',
            r'(?i)\bin (there|here)\b',
            r'(?i)\bat (there|here)\b',
            r'(?i)\b(there|here)\b',  # Match "there" or "here" anywhere in the query
            r'(?i)\btell me more\b',   # Match "tell me more" as contextual
            r'(?i)\bshow me more\b',   # Match "show me more" as contextual
            r'(?i)\bmore details\b',   # Match "more details" as contextual
            r'(?i)\bgive me more\b',   # Match "give me more" as contextual
            r'(?i)\bwhat.*did.*do.*there\b',  # Match "what did he do there" patterns
            r'(?i)\bmore.*about\b'     # Match "more about" patterns
        ]
        
        is_contextual_query = any(re.search(pattern, question) for pattern in contextual_patterns)
        print(f"🔍 DEBUG - Contextual query check: {is_contextual_query}")
        for pattern in contextual_patterns:
            if re.search(pattern, question):
                print(f"🔍 DEBUG - Matched pattern: {pattern}")
        
        if is_contextual_query:
            # This is asking about something specific within the previous context
            # Get items from the already extracted items
            prev_items = items
            
            print(f"🔍 DEBUG - Found {len(prev_items)} previous items")
            
            # Extract the new topic/technology from the question
            new_tech_filters = self.extract_technologies(question)
            
            # Check if this is specifically asking for "more" items (not all, just additional)
            more_patterns = [
                r'(?i)\bshow me more\b',
                r'(?i)\bgive me more\b', 
                r'(?i)\btell me more\b',
                r'(?i)\bmore\b.*\bplease\b',
                r'(?i)\bcan.*see.*more\b'
            ]
            
            is_asking_for_more = any(re.search(pattern, question) for pattern in more_patterns)
            
            if is_asking_for_more:
                # User wants MORE items of the same type, not the same items again
                prev_item_type = prev_metadata.get('item_type', 'projects')
                prev_tech_filters = prev_metadata.get('tech_filters', [])
                prev_date_filters = prev_metadata.get('date_filters', {})
                
                print(f"🔍 DEBUG - User asking for more {prev_item_type}, getting additional items")
                
                # Get ALL items of the same type
                if prev_item_type == "projects":
                    all_items_of_type = self.resume_data.get("projects", [])
                elif prev_item_type == "experience":
                    all_items_of_type = self.resume_data.get("experience", [])
                elif prev_item_type == "publications":
                    all_items_of_type = self.resume_data.get("publications", [])
                elif prev_item_type == "mixed":
                    # For mixed, get all projects (most common)
                    all_items_of_type = self.resume_data.get("projects", [])
                else:
                    all_items_of_type = self.resume_data.get("projects", [])
                
                # Apply the same filters as the original query
                if prev_tech_filters:
                    all_items_of_type = self.filter_by_technology(all_items_of_type, prev_tech_filters)
                if prev_date_filters.get("years"):
                    all_items_of_type = self.filter_by_date(all_items_of_type, prev_date_filters)
                
                # Sort items (same as original)
                if prev_item_type == "projects":
                    all_items_of_type = self.sort_projects_by_date(all_items_of_type)
                
                # Get IDs of already shown items
                shown_item_ids = set()
                for item in prev_items:
                    if item.get('id'):
                        shown_item_ids.add(item.get('id'))
                
                # Filter out already shown items
                remaining_items = []
                for item in all_items_of_type:
                    if item.get('id') and item.get('id') not in shown_item_ids:
                        remaining_items.append(item)
                
                print(f"🔍 DEBUG - Found {len(remaining_items)} additional items (out of {len(all_items_of_type)} total)")
                
                if remaining_items:
                    # Take next batch (same size as original or remaining, whichever is smaller)
                    batch_size = min(len(prev_items), len(remaining_items))
                    next_batch = remaining_items[:batch_size]
                    
                    # Tag with content source
                    for item in next_batch:
                        item["content_source"] = prev_item_type if prev_item_type != "mixed" else "projects"
                    
                    return QueryResult(
                        response_text=f"Here are {len(next_batch)} more {prev_item_type}:",
                        items=next_batch,
                        item_type=prev_item_type,
                        metadata={
                            "original_query": question,
                            "context_query": prev_metadata.get('original_query', ''),
                            "total_results": len(next_batch),
                            "needs_cards": len(next_batch) > 0,
                            "is_followup": True,
                            "contextual_followup": True,
                            "showing_more": True,
                            "previously_shown": len(prev_items),
                            "query_type": "show_more"
                        }
                    )
                else:
                    # No more items available
                    return QueryResult(
                        response_text=f"That's all the {prev_item_type} I have! You've seen them all.",
                        items=[],
                        item_type="none",
                        metadata={
                            "original_query": question,
                            "context_query": prev_metadata.get('original_query', ''),
                            "total_results": 0,
                            "needs_cards": False,
                            "is_followup": True,
                            "contextual_followup": True,
                            "no_more_items": True,
                            "query_type": "no_more_available"
                        }
                    )
            
            # If we have new tech filters, search within the previous context items
            if new_tech_filters:
                # Filter the previous items by the new technology requirement
                contextual_items = []
                
                for item in prev_items:
                    # Check if this item contains the new technology
                    item_text = " ".join([
                        item.get("title", ""),
                        item.get("company", ""),
                        item.get("description", ""),
                        " ".join(item.get("highlights", [])),
                        " ".join(item.get("technologies", [])),
                        " ".join(item.get("keywords", []))
                    ]).lower()
                    
                    # Check if any of the new tech filters match this item
                    tech_match = False
                    for tech_filter in new_tech_filters:
                        if tech_filter in self.tech_mappings:
                            mapped_keywords = self.tech_mappings[tech_filter]
                            if any(keyword.lower() in item_text for keyword in mapped_keywords):
                                tech_match = True
                                break
                        elif tech_filter.lower() in item_text:
                            tech_match = True
                            break
                    
                    if tech_match:
                        contextual_items.append(item)
                
                if contextual_items:
                    # Found items within the previous context that match the new criteria
                    prev_entity_name = prev_metadata.get('entity_name', '')
                    context_description = f"his work with {', '.join(new_tech_filters)}"
                    if prev_entity_name:
                        context_description += f" at {prev_entity_name}"
                    
                    return QueryResult(
                        response_text=f"Here's {context_description}",
                        items=contextual_items,
                        item_type=contextual_items[0].get("content_source", "mixed") if len(contextual_items) == 1 else "mixed",
                        metadata={
                            "tech_filters": new_tech_filters,
                            "original_query": question,
                            "context_query": prev_metadata.get('original_query', ''),
                            "total_results": len(contextual_items),
                            "needs_cards": True,
                            "is_followup": True,
                            "contextual_followup": True,
                            "parent_entity": prev_entity_name,
                            "query_type": "contextual_followup"
                        }
                    )
                else:
                    # No items in the previous context match the new criteria
                    prev_entity_name = prev_metadata.get('entity_name', 'that context')
                    return QueryResult(
                        response_text=f"No {', '.join(new_tech_filters)} work found in {prev_entity_name}",
                        items=[],
                        item_type="none",
                        metadata={
                            "tech_filters": new_tech_filters,
                            "original_query": question,
                            "context_query": prev_metadata.get('original_query', ''),
                            "total_results": 0,
                            "needs_cards": False,
                            "is_followup": True,
                            "contextual_followup": True,
                            "no_match_in_context": True,
                            "parent_entity": prev_entity_name
                        }
                    )
            
        # Extract previous context from API response format
        prev_tech_filters = prev_metadata.get('tech_filters', [])
        prev_query = prev_metadata.get('original_query', '')
        
        # Rerun the previous query logic to get the same results
        if prev_tech_filters:
            # Reuse previous technology filters for context
            all_items = []
            content_type_counts = {}
            content_types_to_search = ["projects", "experience", "publications"]
            
            for content_type in content_types_to_search:
                items = self.resume_data.get(content_type, [])
                items = self.filter_by_technology(items, prev_tech_filters)
                
                for item in items:
                    item["content_source"] = content_type
                
                all_items.extend(items)
                content_type_counts[content_type] = len(items)
            
            if all_items:
                # Sort like the original query
                sorted_items = []
                if "publications" in content_type_counts:
                    pub_items = [item for item in all_items if item["content_source"] == "publications"]
                    pub_items = sorted(pub_items, key=lambda x: x.get("date", "2020"), reverse=True)
                    sorted_items.extend(pub_items)
                if "projects" in content_type_counts:
                    project_items = [item for item in all_items if item["content_source"] == "projects"]
                    sorted_items.extend(self.sort_projects_by_date(project_items))
                if "experience" in content_type_counts:
                    exp_items = [item for item in all_items if item["content_source"] == "experience"]
                    sorted_items.extend(exp_items)
                
                primary_type = "mixed" if len(content_type_counts) > 1 else list(content_type_counts.keys())[0]
                
                return QueryResult(
                    response_text=f"Here are more details about the {', '.join(prev_tech_filters)} results from your previous query",
                    items=sorted_items,
                    item_type=primary_type,
                    metadata={
                        "tech_filters": prev_tech_filters,
                        "original_query": question,
                        "context_query": prev_query,
                        "total_results": len(sorted_items),
                        "needs_cards": True,
                        "is_followup": True,
                        "cross_content_search": True,
                        "content_types_searched": content_types_to_search,
                        "content_type_counts": content_type_counts,
                        "multi_keyword_extraction": True
                    }
                )
        
        return None

    def generate_response_text(self, intent: str, items: List[Dict], tech_filters: List[str], is_superlative: bool = False) -> str:
        """Generate natural language response based on results"""
        if not items:
            return "Hmm, I couldn't find anything specific about that. Maybe ask me about his projects, experience, or skills?"
        
        count = len(items)
        
        if intent == "projects":
            if is_superlative:
                if count == 1:
                    return "You want to know the crown jewel? Here's his most impressive build:"
                else:
                    return f"Here are his top {count} most impressive builds:"
            elif tech_filters:
                tech_str = ", ".join(tech_filters)
                return f"Found {count} project{'s' if count != 1 else ''} involving {tech_str}. Here's what he's built:"
            else:
                return f"Here are {count} standout project{'s' if count != 1 else ''} from his portfolio:"
        
        elif intent == "experience":
            if tech_filters:
                tech_str = ", ".join(tech_filters)
                return f"Here's his {count} experience{'s' if count != 1 else ''} working with {tech_str}:"
            else:
                return f"His professional journey includes {count} key experience{'s' if count != 1 else ''}:"
        
        elif intent == "skills":
            return f"Here's a breakdown of his technical expertise:"
        
        elif intent == "education":
            return f"His educational background:"
        
        elif intent == "publications":
            return f"His research contributions include {count} publication{'s' if count != 1 else ''}:"
        
        elif intent == "blog":
            return f"Here are {count} insightful blog post{'s' if count != 1 else ''} he's written:"
        
        return f"Here's what I found about {intent}:"

    def query(self, question: str, conversation_history: list = None) -> QueryResult:
        """Process a natural language query and return structured results"""
        print(f"🔍 FOLLOWUP DEBUG - Query: '{question}', History: {bool(conversation_history)}")
        
        # GUARDRAILS: Detect off-topic or malicious queries
        if self._is_off_topic_query(question):
            return QueryResult(
                response_text="Whoa there! 🚀 I'm all about Nitigya's epic tech journey, projects, and skills. For random questions like that, ChatGPT's your best bet! 🤖✨",
                items=[],
                item_type="off_topic",
                metadata={
                    "original_query": question,
                    "total_results": 0,
                    "needs_cards": False,
                    "off_topic": True,
                    "guardrail_triggered": True
                }
            )
        
        # CONTEXT-AWARE PROCESSING: Handle follow-up queries
        if conversation_history and self._is_followup_query(question):
            print(f"🔍 FOLLOWUP DEBUG - Detected as followup query!")
            context_result = self._handle_followup_query(question, conversation_history)
            if context_result:
                print(f"🔍 FOLLOWUP DEBUG - Returning followup result: {context_result.response_text[:50]}...")
                return context_result
            else:
                print("🔍 FOLLOWUP DEBUG - Followup handler returned None, continuing...")
        
        # ENTITY-SPECIFIC PROCESSING: Handle questions about specific companies/projects
        entity_result = self._detect_specific_entity(question)
        if entity_result:
            matched_items = entity_result["matched_items"]
            entity_name = entity_result["entity_name"]
            
            # Determine primary content type
            content_sources = [item["content_source"] for item in matched_items]
            if len(set(content_sources)) > 1:
                primary_type = "mixed"
            else:
                primary_type = content_sources[0] if content_sources else "experience"
            
            return QueryResult(
                response_text=f"Here's what he did at {entity_name}",
                items=matched_items,
                item_type=primary_type,
                metadata={
                    "entity_name": entity_name,
                    "entity_type": entity_result["entity_type"],
                    "original_query": question,
                    "total_results": len(matched_items),
                    "needs_cards": len(matched_items) > 0,
                    "specific_entity_query": True,
                    "query_type": "specific_entity"
                }
            )
        
        # Extract intent, technology filters, and date filters
        intent = self.extract_intent(question)
        tech_filters = self.extract_technologies(question)
        date_filters = self.extract_date_filters(question)
        
        # SPECIAL HANDLING: If this is a highlights/recap query, force mixed content search
        is_highlights = self.is_highlights_query(question)
        if is_highlights:
            print(f"🎯 Detected highlights query: '{question}' - forcing mixed content search")
            # Override intent to mixed and ensure we search across all content types
            intent = "mixed"
            # For highlights, we want a mix regardless of specific tech filters
            # But still apply tech filters if specified
            content_types_to_search = ["projects", "experience", "publications"]
        else:
            content_types_to_search = None  # Will be determined below
        
        # For greetings or general conversation, return empty results
        if intent in ["greeting", "general"]:
            return QueryResult(
                response_text="Casual conversation - no cards needed",
                items=[],
                item_type="none",
                metadata={
                    "intent": intent,
                    "original_query": question,
                    "needs_cards": False
                }
            )
        
        # INDUSTRY-STANDARD MULTI-KEYWORD EXTRACTION: Search across ALL relevant content types
        if tech_filters or date_filters["years"] or intent in ["publications", "blog"] or is_highlights:
            all_items = []
            content_type_counts = {}
            
            # Determine which content types to search based on intent + tech filters + date filters + highlights
            if content_types_to_search is None:
                content_types_to_search = []
                
                # Always search projects, experience, AND publications for tech filters
                if tech_filters:
                    content_types_to_search.extend(["projects", "experience", "publications"])
                
                # Add content types for date filters
                if date_filters["years"]:
                    content_types_to_search.extend(["projects", "experience", "publications"])
                
                # Add specific intent-based content types
                if intent == "publications" or "research" in question.lower():
                    content_types_to_search.append("publications")
                if intent == "blog":
                    content_types_to_search.append("blog")
                
                # Remove duplicates while preserving order
                content_types_to_search = list(dict.fromkeys(content_types_to_search))
            
            # For highlights queries, ensure we have at least 2-3 items from each major category
            if is_highlights and not tech_filters:
                # Get diverse items from each content type
                for content_type in content_types_to_search:
                    items = self.resume_data.get(content_type, [])
                    
                    # Apply date filters if we have them (even for highlights)
                    if date_filters["years"]:
                        items = self.filter_by_date(items, date_filters)
                    
                    # Take top 2-3 items from each category for highlights
                    limited_items = items[:3] if content_type == "projects" else items[:2]
                    for item in limited_items:
                        item["content_source"] = content_type
                    all_items.extend(limited_items)
                    content_type_counts[content_type] = len(limited_items)
            else:
                # Search across all relevant content types
                for content_type in content_types_to_search:
                    items = self.resume_data.get(content_type, [])
                    
                    # Apply technology filters if we have them
                    if tech_filters and content_type not in ["education"]:  # Don't filter education by tech
                        items = self.filter_by_technology(items, tech_filters)
                    
                    # Apply date filters if we have them
                    if date_filters["years"]:
                        items = self.filter_by_date(items, date_filters)
                    
                    # Tag items with their source
                    for item in items:
                        item["content_source"] = content_type
                    
                    all_items.extend(items)
                    content_type_counts[content_type] = len(items)
            
            # If we found items across multiple types, return them
            if all_items:
                # Determine the primary type based on what we found
                total_counts = sum(content_type_counts.values())
                if len(content_type_counts) > 1:
                    primary_type = "mixed"  # Multiple content types
                else:
                    primary_type = list(content_type_counts.keys())[0]
                
                # Sort by relevance and recency
                sorted_items = []
                
                # Add publications first (most relevant for research queries)
                if "publications" in content_type_counts:
                    pub_items = [item for item in all_items if item["content_source"] == "publications"]
                    # Sort publications by date (newer first)
                    pub_items = sorted(pub_items, key=lambda x: x.get("date", "2020"), reverse=True)
                    sorted_items.extend(pub_items)
                
                # Add projects second
                if "projects" in content_type_counts:
                    project_items = [item for item in all_items if item["content_source"] == "projects"]
                    sorted_items.extend(self.sort_projects_by_date(project_items))
                
                # Add experience third with ETL-specific ordering
                if "experience" in content_type_counts:
                    exp_items = [item for item in all_items if item["content_source"] == "experience"]
                    
                    # Special ordering for ETL queries - prioritize Spenza
                    is_etl_query = any(tech_filter.lower() in ["etl", "data pipeline", "pipeline"] for tech_filter in tech_filters) if tech_filters else False
                    if is_etl_query:
                        # Separate Spenza and other experience items
                        spenza_items = [item for item in exp_items if "spenza" in item.get("company", "").lower()]
                        other_items = [item for item in exp_items if "spenza" not in item.get("company", "").lower()]
                        
                        # Sort each group by date
                        spenza_items = sorted(spenza_items, key=lambda x: x.get("dates", "2020"), reverse=True)
                        other_items = sorted(other_items, key=lambda x: x.get("dates", "2020"), reverse=True)
                        
                        # Add Spenza first, then others
                        sorted_items.extend(spenza_items)
                        sorted_items.extend(other_items)
                    else:
                        # Normal date-based sorting for non-ETL queries
                        exp_items = sorted(exp_items, key=lambda x: x.get("dates", "2020"), reverse=True)
                        sorted_items.extend(exp_items)
                
                # Add blog posts last
                if "blog" in content_type_counts:
                    blog_items = [item for item in all_items if item["content_source"] == "blog"]
                    sorted_items.extend(blog_items)
                
                response_text = f"Found {len(sorted_items)} items across {len(content_type_counts)} content types"
                if tech_filters:
                    response_text += f" with {', '.join(tech_filters)} experience"
                if is_highlights:
                    response_text += " - here's a career highlights recap"
                
                return QueryResult(
                    response_text=response_text,
                    items=sorted_items,
                    item_type=primary_type,
                    metadata={
                        "tech_filters": tech_filters,
                        "date_filters": date_filters,
                        "original_query": question,
                        "total_results": len(sorted_items),
                        "needs_cards": len(sorted_items) > 0,
                        "cross_content_search": True,
                        "content_types_searched": content_types_to_search,
                        "content_type_counts": content_type_counts,
                        "multi_keyword_extraction": True,
                        "is_highlights_query": is_highlights
                    }
                )
            
            # FALLBACK STRATEGY: If no exact tech matches, try similar technologies
            elif tech_filters:
                fallback_items = []
                similar_techs = []
                original_tech_filters = tech_filters.copy()
                
                for tech_filter in tech_filters:
                    # Use hybrid approach: hard-coded + semantic similarity
                    similar_tech_categories = self.get_similar_technologies_hybrid(tech_filter)
                    similar_techs.extend(similar_tech_categories)
                
                # Remove duplicates and search with similar technologies
                similar_techs = list(set(similar_techs))
                
                if similar_techs:
                    # Search again with similar technologies
                    for content_type in content_types_to_search:
                        items = self.resume_data.get(content_type, [])
                        
                        # Filter by similar technologies
                        filtered_items = self.filter_by_technology(items, similar_techs)
                        
                        # Tag items with their source
                        for item in filtered_items:
                            item["content_source"] = content_type
                        
                        fallback_items.extend(filtered_items)
                
                if fallback_items:
                    # Sort fallback items
                    sorted_fallback = []
                    for content_type in ["publications", "projects", "experience", "blog"]:
                        type_items = [item for item in fallback_items if item["content_source"] == content_type]
                        if content_type == "projects":
                            type_items = self.sort_projects_by_date(type_items)
                        elif content_type in ["experience", "publications"]:
                            type_items = sorted(type_items, key=lambda x: x.get("dates", x.get("date", "2020")), reverse=True)
                        sorted_fallback.extend(type_items)
                    
                    # Create helpful response explaining the fallback
                    asked_techs = ", ".join(original_tech_filters)
                    found_similar = ", ".join(similar_techs)
                    response_text = f"No direct experience with {asked_techs}, but found related work with {found_similar}"
                    
                    primary_type = "mixed" if len(set(item["content_source"] for item in sorted_fallback)) > 1 else sorted_fallback[0]["content_source"]
                    
                    return QueryResult(
                        response_text=response_text,
                        items=sorted_fallback,
                        item_type=primary_type,
                        metadata={
                            "tech_filters": original_tech_filters,
                            "original_query": question,
                            "total_results": len(sorted_fallback),
                            "needs_cards": len(sorted_fallback) > 0,
                            "fallback_search": True,
                            "requested_technologies": original_tech_filters,
                            "similar_technologies_found": similar_techs,
                            "content_types_searched": content_types_to_search,
                            "fallback_explanation": f"Showing similar technologies since {asked_techs} not found"
                        }
                    )
        
        # FALLBACK: Original single-type logic for non-technology queries
        if intent == "projects":
            items = self.resume_data.get("projects", [])
        elif intent == "experience":
            items = self.resume_data.get("experience", [])
        elif intent == "education":
            items = self.resume_data.get("education", [])
        elif intent == "publications":
            items = self.resume_data.get("publications", [])
        elif intent == "blog":
            items = self.resume_data.get("blog", [])
        elif intent == "skills":
            # For skills, return structured skill data with proper IDs
            skills_data = self.resume_data.get("skills", {})
            items = [
                {
                    "id": category,  # Use the original key as ID
                    "title": category.replace("_", " ").title(), 
                    "skills": skill_list,
                    "type": "skill"
                } 
                for category, skill_list in skills_data.items()
            ]
        else:
            # INTELLIGENT DEFAULT: Return a MIX of content types with rotation to avoid repetition
            import random
            import time
            
            # Get all available content
            projects = self.resume_data.get("projects", [])
            experiences = self.resume_data.get("experience", [])
            publications = self.resume_data.get("publications", [])
            blog = self.resume_data.get("blog", [])
            
            # Create a balanced mix based on query context
            items = []
            
            # Use time-based seed to ensure variety across sessions but consistency within sessions
            # This creates a rotating selection that changes over time
            time_seed = int(time.time() // 3600)  # Changes every hour
            random.seed(time_seed + hash(question.lower()) % 100)
            
            # For general queries, show variety to make it interesting
            if any(word in question.lower() for word in ["what", "tell me", "show me", "who", "hello", "hi"]):
                # GUARANTEED variety: rotate through different combinations
                all_content_pools = [
                    ("projects", projects),
                    ("experience", experiences), 
                    ("publications", publications),
                    ("blog", blog)
                ]
                
                # Filter out empty pools
                available_pools = [(name, pool) for name, pool in all_content_pools if pool]
                
                # Ensure we get at least one item from each major category
                selected_items = []
                for pool_name, pool in available_pools[:3]:  # Take first 3 non-empty pools
                    if pool:
                        item = random.choice(pool).copy()  # Copy to avoid modifying original
                        item["content_source"] = pool_name
                        selected_items.append(item)
                
                # Add one more random item from any remaining pool
                if len(available_pools) > 3:
                    extra_pool_name, extra_pool = random.choice(available_pools[3:])
                    if extra_pool:
                        item = random.choice(extra_pool).copy()
                        item["content_source"] = extra_pool_name  
                        selected_items.append(item)
                
                items = selected_items
                random.shuffle(items)  # Final shuffle for order variety
                intent = "mixed"  # Override intent to mixed
            elif is_highlights:
                # For highlights queries that fell through to fallback, ensure mixed content
                selected_items = []
                if projects:
                    selected_items.append(random.choice(projects).copy())
                    selected_items[-1]["content_source"] = "projects"
                if experiences:
                    selected_items.append(random.choice(experiences).copy())
                    selected_items[-1]["content_source"] = "experience"
                if publications:
                    selected_items.append(random.choice(publications).copy())
                    selected_items[-1]["content_source"] = "publications"
                
                items = selected_items
                intent = "mixed"
            else:
                # For ambiguous queries, still provide variety but lean towards projects
                # Rotate between different project selections
                if len(projects) >= 3:
                    # Use different starting points to rotate through projects
                    start_idx = (time_seed + hash(question)) % len(projects)
                    selected_projects = []
                    for i in range(3):
                        idx = (start_idx + i) % len(projects)
                        item = projects[idx].copy()
                        item["content_source"] = "projects"
                        selected_projects.append(item)
                    items = selected_projects
                else:
                    # If fewer than 3 projects, mix with other content
                    items = []
                    for project in projects:
                        item = project.copy()
                        item["content_source"] = "projects"
                        items.append(item)
                    
                    # Fill remaining slots with experiences
                    remaining_slots = 3 - len(items)
                    if remaining_slots > 0 and experiences:
                        for i in range(min(remaining_slots, len(experiences))):
                            item = experiences[i].copy()
                            item["content_source"] = "experience"
                            items.append(item)
            
            # Reset random seed to avoid affecting other operations
            random.seed()
        
        # Apply technology filters for single-type queries
        if tech_filters and intent not in ["skills", "education", "publications", "blog"]:
            items = self.filter_by_technology(items, tech_filters)
        
        # Apply date filters for single-type queries
        if date_filters["years"] and intent not in ["skills", "education"]:
            items = self.filter_by_date(items, date_filters)
        
        # Sort projects by date as default (LLM will do context-based selection)
        if intent == "projects":
            items = self.sort_projects_by_date(items)
            
        # Generate basic response text (LLM will create the final response)
        response_text = f"Found {len(items)} {intent} matching your query"
        
        return QueryResult(
            response_text=response_text,
            items=items,
            item_type=intent,
            metadata={
                "tech_filters": tech_filters,
                "date_filters": date_filters,
                "original_query": question,
                "total_results": len(items),
                "needs_cards": len(items) > 0,
                "is_highlights_query": is_highlights

            }
        )

    def _is_off_topic_query(self, question: str) -> bool:
        """Detect if a query is off-topic (not about resume/experience)"""
        question_lower = question.lower().strip()
        
        # More specific resume-related keywords (avoid generic words)
        resume_keywords = [
            # Work/Career specific
            "experience", "work", "job", "career", "background", "professional",
            "worked", "working", "employed", "employment", "role", "position",
            "company", "companies", "organization", "employer", "startup",
            
            # Technical/Project specific
            "project", "projects", "built", "created", "developed", "made",
            "code", "coding", "programming", "software", "tech", "technology",
            "python", "javascript", "react", "fastapi", "ai", "machine learning",
            "ml", "data", "web", "app", "application", "system", "platform",
            
            # Education/Research specific
            "education", "study", "studied", "degree", "university", "college",
            "school", "research", "paper", "publication", "published", "phd",
            "master", "bachelor", "graduate", "academic",
            
            # Skills specific
            "skill", "skills", "expertise", "knowledge", "proficient", "experienced",
            "specialize", "focus",
            
            # Content types specific
            "portfolio", "resume", "cv", "bio", "biography", "profile",
            "achievement", "accomplishment", "highlight", "highlights",
            "blog", "article", "post", "writing",
            
            # Time-related career questions
            "recent", "latest", "current", "past", "2023", "2024", "2025",
            
            # Follow-ups (more specific)
            "more", "detail", "expand"
        ]
        
        # Check if query contains resume-related keywords (more sophisticated check)
        resume_keyword_matches = [keyword for keyword in resume_keywords if keyword in question_lower]
        has_resume_keywords = len(resume_keyword_matches) >= 2  # Require at least 2 meaningful keywords

        # Also check for clear resume intent patterns (very specific to avoid false positives)
        resume_intent_patterns = [
            r'\b(your|his|he|she)\b.*\b(work|worked|working|job|career|experience|background|professional)\b',
            r'\b(your|his|he|she)\b.*\b(project|projects|built|created|developed|made|code|programming)\b',
            r'\b(your|his|he|she)\b.*\b(skill|skills|expertise|knowledge|proficient|experienced)\b',
            r'\b(your|his|he|she)\b.*\b(education|study|studied|degree|university|college|school)\b',
            r'\b(your|his|he|she)\b.*\b(research|paper|publication|published|phd|master|bachelor)\b',
            r'\bwhat\b.*\b(experience|work|projects?|skills?|education|research)\b.*\b(do|have|did)\b',
            r'\btell\b.*\babout\b.*\b(work|experience|projects?|skills?|education|research)\b',
            r'\bshow\b.*\b(work|experience|projects?|skills?|education|research)\b'
        ]

        has_resume_intent = any(re.search(pattern, question_lower) for pattern in resume_intent_patterns)

        # Query is on-topic if it has resume keywords OR clear resume intent
        is_resume_related = has_resume_keywords or has_resume_intent
        
        # Malicious/injection patterns (expanded)
        malicious_patterns = [
            r'\bdrop\s+table\b',
            r'\bselect\s+.*\bfrom\b',
            r'\binsert\s+into\b',
            r'\bupdate\s+.*\bset\b',
            r'\bdelete\s+from\b',
            r'\bscript\b.*\balert\b',
            r'\bforget\s+.*\binstruction',
            r'\bignore\s+.*\bprompt',
            r'\breveal\s+.*\b(source|code|key)',
            r'\bshow\s+.*\b(source|code|key)',
            r'\bapi\s+key',
            r'\bhack',
            r'\bexplosive',
            r'\bbomb',
            r'\bweapon',
            r'\billegal',
            r'\bcrime',
            r'\bdrug',
            r'\bsource\s+code',
            r'\bbypass\s+security',
            r'\bsecurity\s+bypass'
        ]
        
        has_malicious_patterns = any(re.search(pattern, question_lower) for pattern in malicious_patterns)
        
        # Philosophical/life questions
        philosophical_questions = [
            "meaning of life", "purpose", "why are we here", "universe",
            "god", "religion", "philosophy", "existential", "soul",
            "afterlife", "heaven", "hell", "karma", "fate", "destiny"
        ]
        
        has_philosophical = any(phrase in question_lower for phrase in philosophical_questions)
        
        # Personal questions not related to career
        personal_off_topic = [
            "favorite color", "favorite food", "hobby", "hobbies",
            "pet", "animal", "music", "movie", "film", "book",
            "sport", "game", "vacation", "travel", "weather",
            "joke", "funny", "laugh", "marry", "relationship",
            "family", "parent", "child", "kid", "age", "old",
            "birthday", "zodiac", "horoscope", "dream"
        ]
        
        has_personal_off_topic = any(topic in question_lower for topic in personal_off_topic)
        
        # Academic subjects not related to his field
        academic_off_topic = [
            "math homework", "calculus", "algebra", "geometry",
            "physics problem", "chemistry", "biology", "photosynthesis", "respiration",
            "history", "geography", "literature", "poetry", "grammar",
            "language learning", "foreign language"
        ]
        
        has_academic_off_topic = any(subject in question_lower for subject in academic_off_topic)
        
        # Cooking/food questions
        cooking_questions = [
            "recipe", "cook", "bake", "cake", "pie", "bread",
            "meal", "dinner", "lunch", "breakfast", "ingredient"
        ]
        
        has_cooking = any(cook in question_lower for cook in cooking_questions)
        
        # GENERAL KNOWLEDGE/FACTUAL QUESTIONS (new category for queries that are clearly not about resume)
        general_knowledge_questions = [
            # Geography
            "capital", "country", "city", "continent", "ocean", "mountain", "river",
            "population", "area", "timezone", "currency", "language", "flag",
            
            # Politics/Current Events
            "election", "president", "government", "politics", "political", "vote",
            "democrat", "republican", "party", "campaign", "candidate", "ballot",
            
            # Science (general, not his research)
            "gravity", "atom", "molecule", "element", "periodic table", "solar system",
            "planet", "star", "galaxy", "universe", "evolution", "dna", "cell",
            
            # Math (general questions)
            "calculate", "equation", "formula", "theorem", "proof", "integral",
            "derivative", "algebra", "geometry", "trigonometry", "statistics",
            
            # General factual questions about non-technical topics
            "weather", "temperature", "forecast", "rain", "snow", "sunny", "cloudy"
        ]
        
        # Check for general knowledge question patterns (but exclude technology questions)
        has_general_knowledge = any(phrase in question_lower for phrase in general_knowledge_questions)
        
        # Check for question words that indicate factual/general knowledge queries
        # BUT exclude if it contains technology keywords (those should be on-topic)
        technology_keywords = [
            "machine learning", "ai", "artificial intelligence", "python", "javascript", 
            "react", "fastapi", "tensorflow", "pytorch", "computer vision", "deep learning",
            "neural network", "cnn", "llm", "data science", "blockchain", "web development",
            "mobile app", "database", "api", "cloud", "aws", "docker", "kubernetes"
        ]
        
        contains_technology = any(tech in question_lower for tech in technology_keywords)
        
        question_words = ["what is", "who is", "when did", "where is", "why does", "how does", "how much", "how many", "how long", "how far", "how old"]
        starts_with_question_word = any(question_lower.startswith(word) for word in question_words)
        
        # If it's a general knowledge question AND doesn't contain technology keywords, it's off-topic
        is_general_knowledge_off_topic = (has_general_knowledge or (starts_with_question_word and not contains_technology)) and not is_resume_related
        
        # If no resume keywords AND has off-topic indicators, OR if malicious, OR if general knowledge question, mark as off-topic
        is_off_topic = ((not is_resume_related) and (
            has_philosophical or 
            has_personal_off_topic or 
            has_academic_off_topic or 
            has_cooking or
            is_general_knowledge_off_topic
        )) or has_malicious_patterns
        
        if is_off_topic:
            print(f"🚨 OFF-TOPIC QUERY DETECTED: '{question}'")
        
        return is_off_topic
