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
        
        # Remove hard-coded rankings - let LLM decide dynamically based on context
        
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
            "llm": ["LLM", "large language models", "AI", "conversational AI", "Qwen-7B", "language models"],
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
        
        if any(re.search(pattern, query_lower.strip()) for pattern in greeting_patterns):
            return "greeting"
        
        # Check for "Do you know X?" or "Are you familiar with X?" type questions
        # These should be treated as skills/technology queries
        know_patterns = [
            r"(?i)do you know\s+(\w+)",
            r"(?i)are you familiar with\s+(\w+)",
            r"(?i)can you\s+(\w+)",
            r"(?i)do you have experience with\s+(\w+)"
        ]
        
        for pattern in know_patterns:
            match = re.search(pattern, query_lower)
            if match:
                # Check if the mentioned technology is in our mappings
                mentioned_tech = match.group(1)
                if mentioned_tech in self.tech_mappings or any(mentioned_tech in keywords for keywords in self.tech_mappings.values()):
                    return "skills"  # Treat as a skills query
        
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

    def is_superlative_query(self, query: str) -> bool:
        """Check if query asks for the 'best', 'most impressive', etc."""
        return any(re.search(pattern, query) for pattern in self.superlative_patterns)

    def sort_projects_by_date(self, projects: List[Dict]) -> List[Dict]:
        """Sort projects by date (most recent first) as default ordering"""
        return sorted(projects, key=lambda x: x.get("date", "2020"), reverse=True)

    def extract_technologies(self, query: str) -> List[str]:
        """Extract mentioned technologies/keywords from the query (conservative approach)"""
        query_lower = query.lower()
        found_techs = []
        
        # Only check for explicit technology mappings with word boundaries
        for tech, keywords in self.tech_mappings.items():
            for keyword in keywords:
                if re.search(r'\b' + re.escape(keyword.lower()) + r'\b', query_lower):
                    found_techs.append(tech)
                    break
        
        return list(set(found_techs))

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
        followup_patterns = [
            r'(?i)\btell me more\b',
            r'(?i)\bmore about (that|those|them|it)\b',
            r'(?i)\bwhat about (that|those|them)\b',
            r'(?i)\bexpand on (that|those|them)\b',
            r'(?i)\bshow me more\b',
            r'(?i)\bgive me details\b',
            r'(?i)\b(that|those|them|it)\b.*\b(sounds?|looks?|seems?)\b',
        ]
        
        return any(re.search(pattern, question) for pattern in followup_patterns)
    
    def _handle_followup_query(self, question: str, conversation_history: list) -> QueryResult:
        """Handle follow-up queries using conversation context"""
        if not conversation_history:
            return None
            
        # Find the most recent query that had results
        last_query_with_results = None
        for entry in reversed(conversation_history):
            if isinstance(entry, dict) and entry.get('metadata', {}).get('total_results', 0) > 0:
                last_query_with_results = entry
                break
        
        if not last_query_with_results:
            return None
            
        # Extract previous context
        prev_tech_filters = last_query_with_results.get('metadata', {}).get('tech_filters', [])
        prev_query = last_query_with_results.get('metadata', {}).get('original_query', '')
        
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
        
        # CONTEXT-AWARE PROCESSING: Handle follow-up queries
        if conversation_history and self._is_followup_query(question):
            context_result = self._handle_followup_query(question, conversation_history)
            if context_result:
                return context_result
        
        # Extract intent and technology filters
        intent = self.extract_intent(question)
        tech_filters = self.extract_technologies(question)
        
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
        if tech_filters or intent in ["publications", "blog"]:
            all_items = []
            content_type_counts = {}
            
            # Determine which content types to search based on intent + tech filters
            content_types_to_search = []
            
            # Always search projects, experience, AND publications for tech filters
            if tech_filters:
                content_types_to_search.extend(["projects", "experience", "publications"])
            
            # Add specific intent-based content types
            if intent == "publications" or "research" in question.lower():
                content_types_to_search.append("publications")
            if intent == "blog":
                content_types_to_search.append("blog")
            
            # Remove duplicates while preserving order
            content_types_to_search = list(dict.fromkeys(content_types_to_search))
            
            # Search across all relevant content types
            for content_type in content_types_to_search:
                items = self.resume_data.get(content_type, [])
                
                # Apply technology filters if we have them
                if tech_filters and content_type not in ["education"]:  # Don't filter education by tech
                    items = self.filter_by_technology(items, tech_filters)
                
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
                
                # Add experience third
                if "experience" in content_type_counts:
                    exp_items = [item for item in all_items if item["content_source"] == "experience"]
                    exp_items = sorted(exp_items, key=lambda x: x.get("dates", "2020"), reverse=True)
                    sorted_items.extend(exp_items)
                
                # Add blog posts last
                if "blog" in content_type_counts:
                    blog_items = [item for item in all_items if item["content_source"] == "blog"]
                    sorted_items.extend(blog_items)
                
                response_text = f"Found {len(sorted_items)} items across {len(content_type_counts)} content types"
                if tech_filters:
                    response_text += f" with {', '.join(tech_filters)} experience"
                
                return QueryResult(
                    response_text=response_text,
                    items=sorted_items,
                    item_type=primary_type,
                    metadata={
                        "tech_filters": tech_filters,
                        "original_query": question,
                        "total_results": len(sorted_items),
                        "needs_cards": len(sorted_items) > 0,
                        "cross_content_search": True,
                        "content_types_searched": content_types_to_search,
                        "content_type_counts": content_type_counts,
                        "multi_keyword_extraction": True
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
            # Default to projects
            items = self.resume_data.get("projects", [])
        
        # Apply technology filters for single-type queries
        if tech_filters and intent not in ["skills", "education", "publications", "blog"]:
            items = self.filter_by_technology(items, tech_filters)
        
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
                "original_query": question,
                "total_results": len(items),
                "needs_cards": len(items) > 0
            }
        )

# Test function
def test_query_processor():
    """Test the query processor with various queries"""
    processor = ResumeQueryProcessor()
    
    test_queries = [
        "What projects has he worked on?",
        "Tell me about his experience with AWS",
        "What machine learning projects has he done?",
        "What are his skills in Python?",
        "Where did he study?",
        "What research papers has he published?",
        "What blog posts has he written?",
        "Tell me about his experience at startups",
        "What EEG or BCI work has he done?"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        result = processor.query(query)
        print(f"Intent: {result.item_type}")
        print(f"Response: {result.response_text}")
        print(f"Items found: {len(result.items)}")
        if result.metadata["tech_filters"]:
            print(f"Tech filters: {result.metadata['tech_filters']}")
        print("-" * 50)

if __name__ == "__main__":
    test_query_processor()