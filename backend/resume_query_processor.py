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
        
        # Intent patterns for different query types
        self.intent_patterns = {
            "projects": [
                r"(?i)projects?", r"(?i)built", r"(?i)created", r"(?i)developed",
                r"(?i)what.*made", r"(?i)what.*worked on", r"(?i)portfolio",
                r"(?i)build", r"(?i)builds?"
            ],
            "experience": [
                r"(?i)experience", r"(?i)worked at", r"(?i)companies?", r"(?i)jobs?",
                r"(?i)internships?", r"(?i)roles?", r"(?i)positions?"
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
            ]
        }
        
        # Superlative patterns for ranking queries
        self.superlative_patterns = [
            r"(?i)best", r"(?i)most.*impressive", r"(?i)crown.*jewel", r"(?i)standout",
            r"(?i)favorite", r"(?i)top", r"(?i)greatest", r"(?i)coolest", r"(?i)amazing",
            r"(?i)remarkable", r"(?i)outstanding", r"(?i)flagship"
        ]
        
        # Remove hard-coded rankings - let LLM decide dynamically based on context
        
        # Technology mappings for filtering (only actual technologies, not context)
        self.tech_mappings = {
            "machine_learning": ["machine learning", "ML", "neural", "AI", "SMOTE", "ExtraTrees"],
            "data_science": ["data science", "analytics", "scikit-learn", "pandas", "statistics"],
            "algorithms": ["algorithm", "sort", "merge", "tree", "optimization"],
            "systems": ["systems programming", "memory management", "I/O optimization", "performance", "C++"],
            "web_development": ["Chrome extension", "HTML", "CSS", "GitHub Actions", "CI/CD"],
            "backend": ["FastAPI", "backend development", "API development", "server", "database"],
            "aws": ["AWS", "lambda", "S3", "SQS", "cloud computing"],
            "database": ["MongoDB", "PostgreSQL", "Redis", "database design"],
            "python": ["Python", "FastAPI", "Flask", "scikit-learn"],
            "javascript": ["JavaScript", "TypeScript", "Node.js"],
            "eeg": ["EEG", "BCI", "brain computer interface", "P300", "neuroscience"],
            "robotics": ["robot", "robotics", "Misty", "ROS"]
        }

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
        """Filter items by technology keywords"""
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
                # Direct technology match
                if any(tech_filter.lower() in tech.lower() for tech in item_techs):
                    match_found = True
                    break
                # Keyword match
                if any(tech_filter.lower() in keyword.lower() for keyword in item_keywords):
                    match_found = True
                    break
                # Text content match using tech mappings
                if tech_filter in self.tech_mappings:
                    mapped_keywords = self.tech_mappings[tech_filter]
                    if any(keyword.lower() in item_text for keyword in mapped_keywords):
                        match_found = True
                        break
                # Direct text match
                if tech_filter.lower() in item_text:
                    match_found = True
                    break
            
            if match_found:
                filtered_items.append(item)
        
        return filtered_items

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
        
        return f"Here's what I found about {intent}:"

    def query(self, question: str) -> QueryResult:
        """Process a natural language query and return structured results"""
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
        
        # Get relevant data based on intent
        if intent == "projects":
            items = self.resume_data.get("projects", [])
        elif intent == "experience":
            items = self.resume_data.get("experience", [])
        elif intent == "education":
            items = self.resume_data.get("education", [])
        elif intent == "publications":
            items = self.resume_data.get("publications", [])
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
        
        # Apply technology filters (except for education and publications which don't need filtering)
        if tech_filters and intent not in ["skills", "education", "publications"]:
            items = self.filter_by_technology(items, tech_filters)
        
        # Sort projects by date as default (LLM will do context-based selection)
        if intent == "projects":
            items = self.sort_projects_by_date(items)
            
        # Return all relevant items for LLM to dynamically select from
        # No hard limits - let LLM decide what's most relevant
        
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