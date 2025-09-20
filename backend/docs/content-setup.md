# Content Configuration Guide

This guide explains how to configure and manage content for the Conversational AI Backend's intelligent content system.

## Overview

The content system provides structured data that the AI can intelligently select and present to users based on their queries. It supports five main content types: projects, experience, skills, education, and publications.

## Content Data Structure

### File Location
Content is stored in `resume_data.json` in the backend root directory.

### Schema Overview
```json
{
  "projects": [...],
  "experience": [...], 
  "skills": {...},
  "education": [...],
  "publications": [...]
}
```

## Content Types

### 1. Projects

Projects represent personal or professional work, including software projects, research, and creative endeavors.

#### Schema:
```json
{
  "id": "unique-identifier",
  "title": "Project Title",
  "description": "Detailed description of the project",
  "technologies": ["Python", "React", "TensorFlow"],
  "keywords": ["machine learning", "web development"],
  "metrics": "Quantified impact or achievements",
  "link": "https://github.com/user/project",
  "status": "completed|in-progress|planned",
  "featured": true|false,
  "start_date": "2024-01-01",
  "end_date": "2024-06-01",
  "category": "web|mobile|ml|research|other"
}
```

#### Required Fields:
- `id`: Unique identifier (kebab-case recommended)
- `title`: Human-readable project name
- `description`: Comprehensive project description
- `technologies`: Array of technologies used

#### Optional Fields:
- `keywords`: Additional search terms
- `metrics`: Quantified achievements ("50% performance improvement")
- `link`: Project URL (GitHub, demo, etc.)
- `status`: Current project status
- `featured`: Whether to highlight this project
- `start_date`/`end_date`: Project timeline
- `category`: Project classification

#### Example:
```json
{
  "id": "chicago-crime-forecasting",
  "title": "Chicago Crime Forecasting",
  "description": "Machine learning model for predicting crime patterns using historical data from the Chicago Police Department. Implemented ensemble methods combining time series analysis with geospatial features to achieve 89% accuracy improvement over baseline models.",
  "technologies": ["Python", "TensorFlow", "Pandas", "Scikit-learn", "PostGIS"],
  "keywords": ["machine learning", "crime prediction", "data science", "time series"],
  "metrics": "89% accuracy improvement, 12% reduction in false positives",
  "link": "https://github.com/user/chicago-crime-forecasting",
  "status": "completed",
  "featured": true,
  "start_date": "2024-01-15",
  "end_date": "2024-05-30",
  "category": "ml"
}
```

### 2. Experience

Work history, internships, and professional roles.

#### Schema:
```json
{
  "id": "unique-identifier",
  "company": "Company Name",
  "position": "Job Title",
  "duration": "Jan 2024 - Present",
  "location": "City, Country",
  "description": "Role description and key responsibilities",
  "achievements": ["Achievement 1", "Achievement 2"],
  "technologies": ["Tech1", "Tech2"],
  "skills_gained": ["Skill1", "Skill2"],
  "type": "full-time|internship|contract|freelance",
  "industry": "technology|finance|healthcare|other"
}
```

#### Required Fields:
- `id`: Unique identifier
- `company`: Organization name
- `position`: Job title or role
- `duration`: Time period (human-readable)
- `description`: Role responsibilities

#### Example:
```json
{
  "id": "spenza-inc-sde",
  "company": "Spenza Inc.",
  "position": "Software Development Engineer",
  "duration": "Jun 2024 - Present",
  "location": "Remote",
  "description": "Led development of scalable backend services for fintech applications, focusing on payment processing and user authentication systems.",
  "achievements": [
    "Reduced API response times by 40% through optimization",
    "Implemented OAuth2 authentication serving 10,000+ users",
    "Mentored 3 junior developers on best practices"
  ],
  "technologies": ["Node.js", "PostgreSQL", "Redis", "Docker", "AWS"],
  "skills_gained": ["System Design", "Performance Optimization", "Team Leadership"],
  "type": "full-time",
  "industry": "technology"
}
```

### 3. Skills

Technical skills, programming languages, and proficiencies.

#### Schema:
```json
{
  "programming_languages": [
    {
      "name": "Python",
      "proficiency": "Expert",
      "experience_years": 5,
      "projects_count": 15,
      "description": "Extensive experience in backend development, data science, and ML"
    }
  ],
  "frameworks": [...],
  "databases": [...],
  "tools": [...],
  "soft_skills": [...]
}
```

#### Proficiency Levels:
- **Beginner**: Basic knowledge, can complete simple tasks
- **Intermediate**: Comfortable with common patterns and tasks
- **Advanced**: Can handle complex problems and mentor others
- **Expert**: Deep expertise, can architect solutions and lead teams

#### Categories:
- `programming_languages`: Python, JavaScript, Java, etc.
- `frameworks`: React, Django, TensorFlow, etc.
- `databases`: PostgreSQL, MongoDB, Redis, etc.
- `tools`: Docker, Git, AWS, etc.
- `soft_skills`: Leadership, Communication, etc.

#### Example:
```json
{
  "programming_languages": [
    {
      "name": "Python",
      "proficiency": "Expert",
      "experience_years": 5,
      "projects_count": 15,
      "description": "Backend development, data science, machine learning, and automation"
    },
    {
      "name": "JavaScript",
      "proficiency": "Advanced", 
      "experience_years": 4,
      "projects_count": 12,
      "description": "Frontend development with React, Node.js backend services"
    }
  ],
  "frameworks": [
    {
      "name": "React",
      "proficiency": "Advanced",
      "experience_years": 3,
      "projects_count": 8,
      "description": "Modern web applications with hooks, context, and performance optimization"
    }
  ]
}
```

### 4. Education

Academic background, degrees, and educational achievements.

#### Schema:
```json
{
  "id": "unique-identifier",
  "institution": "University Name",
  "degree": "Bachelor of Science",
  "field": "Computer Science",
  "graduation_year": 2024,
  "gpa": "3.8/4.0",
  "honors": ["Summa Cum Laude", "Dean's List"],
  "relevant_coursework": ["Data Structures", "Machine Learning"],
  "thesis": {
    "title": "Thesis Title",
    "description": "Brief description",
    "advisor": "Professor Name"
  },
  "activities": ["Computer Science Club", "Hackathon Winner"]
}
```

#### Example:
```json
{
  "id": "university-bs-cs",
  "institution": "Massachusetts Institute of Technology",
  "degree": "Bachelor of Science",
  "field": "Computer Science",
  "graduation_year": 2024,
  "gpa": "3.8/4.0",
  "honors": ["Summa Cum Laude", "Dean's List (6 semesters)"],
  "relevant_coursework": [
    "Algorithms and Data Structures",
    "Machine Learning",
    "Database Systems",
    "Computer Networks",
    "Software Engineering"
  ],
  "thesis": {
    "title": "Neural Networks for Real-time Audio Processing",
    "description": "Research on optimizing neural network architectures for low-latency audio processing applications",
    "advisor": "Dr. Jane Smith"
  },
  "activities": [
    "Computer Science Club Vice President",
    "MIT Hackathon Winner 2023",
    "Teaching Assistant for CS 101"
  ]
}
```

### 5. Publications

Research papers, articles, and published work.

#### Schema:
```json
{
  "id": "unique-identifier",
  "title": "Publication Title",
  "authors": ["Author 1", "Author 2"],
  "venue": "Conference/Journal Name",
  "year": 2024,
  "type": "conference|journal|workshop|preprint",
  "link": "https://doi.org/...",
  "abstract": "Brief abstract",
  "citations": 15,
  "keywords": ["keyword1", "keyword2"]
}
```

#### Example:
```json
{
  "id": "neural-audio-processing-2024",
  "title": "Efficient Neural Networks for Real-time Audio Processing",
  "authors": ["John Doe", "Jane Smith", "Alice Johnson"],
  "venue": "International Conference on Machine Learning (ICML)",
  "year": 2024,
  "type": "conference",
  "link": "https://proceedings.mlr.press/v202/doe24a.html",
  "abstract": "We present a novel architecture for neural networks optimized for real-time audio processing, achieving 90% accuracy with 10x faster inference times.",
  "citations": 23,
  "keywords": ["neural networks", "audio processing", "real-time systems", "optimization"]
}
```

## Content Management

### Adding New Content

1. **Identify Content Type**: Determine which category (projects, experience, etc.)
2. **Generate Unique ID**: Use kebab-case format (e.g., "my-awesome-project")
3. **Fill Required Fields**: Ensure all required fields are populated
4. **Add Optional Fields**: Include relevant optional information
5. **Validate JSON**: Ensure valid JSON syntax
6. **Test Queries**: Verify content appears in relevant searches

### Content Optimization for AI Queries

#### Keyword Strategy:
- Include domain-specific terms in descriptions
- Add relevant technologies to the `technologies` array
- Use `keywords` field for additional search terms
- Include metrics and quantified achievements

#### Description Best Practices:
- Start with a clear, concise summary
- Include specific technologies and methodologies
- Mention quantified results when possible
- Use technical terms that users might query

#### Example Optimized Description:
```json
{
  "description": "Full-stack web application built with React and Node.js, featuring real-time chat functionality using WebSockets. Implemented JWT authentication, RESTful APIs, and PostgreSQL database design. Deployed on AWS with Docker containers, achieving 99.9% uptime and serving 1,000+ concurrent users."
}
```

### Content Validation

#### JSON Schema Validation:
```python
# Example validation script
import json
import jsonschema

def validate_content(content_file):
    with open(content_file) as f:
        content = json.load(f)
    
    # Validate each content type
    for content_type, items in content.items():
        schema = load_schema(content_type)
        for item in items:
            jsonschema.validate(item, schema)
    
    print("Content validation successful!")
```

#### Required Field Checking:
```bash
# Check for missing required fields
python validate_content.py --check-required resume_data.json
```

### Content Updates

#### Version Control:
- Keep `resume_data.json` in version control
- Use meaningful commit messages for content updates
- Consider branching for major content restructuring

#### Backup Strategy:
```bash
# Create backup before major changes
cp resume_data.json resume_data.json.backup.$(date +%Y%m%d)
```

#### Hot Reloading:
The system automatically reloads content when `resume_data.json` is updated, no restart required.

## Query Processing Configuration

### Intent Patterns

The system uses regex patterns to classify user queries. These can be customized in `resume_query_processor.py`:

```python
self.intent_patterns = {
    "projects": [
        r"(?i)projects?", r"(?i)built", r"(?i)created", r"(?i)developed",
        r"(?i)portfolio", r"(?i)work", r"(?i)applications?"
    ],
    "experience": [
        r"(?i)experience", r"(?i)worked?", r"(?i)job", r"(?i)career",
        r"(?i)companies?", r"(?i)roles?", r"(?i)positions?"
    ],
    "skills": [
        r"(?i)skills?", r"(?i)technologies", r"(?i)programming",
        r"(?i)languages?", r"(?i)frameworks?", r"(?i)tools?"
    ],
    "education": [
        r"(?i)education", r"(?i)studied?", r"(?i)degree", r"(?i)university",
        r"(?i)college", r"(?i)academic", r"(?i)school"
    ],
    "publications": [
        r"(?i)publications?", r"(?i)papers?", r"(?i)research",
        r"(?i)published", r"(?i)articles?", r"(?i)conferences?"
    ]
}
```

### Technology Filters

Technology-based filtering helps narrow down content based on mentioned technologies:

```python
def extract_technologies(query):
    """Extract technology mentions from query"""
    known_technologies = {
        'python', 'javascript', 'react', 'node', 'django', 'flask',
        'tensorflow', 'pytorch', 'machine learning', 'ml', 'ai',
        'database', 'sql', 'postgresql', 'mongodb', 'redis',
        # Add more technologies as needed
    }
    
    query_lower = query.lower()
    found_technologies = []
    
    for tech in known_technologies:
        if tech in query_lower:
            found_technologies.append(tech)
    
    return found_technologies
```

### Relevance Scoring

The system calculates relevance scores to rank content:

```python
def calculate_relevance_score(query, item):
    score = 0.0
    
    # Keyword relevance (40%)
    if any(keyword in query.lower() for keyword in item.get('keywords', [])):
        score += 0.4
    
    # Technology match (30%)
    query_techs = extract_technologies(query)
    item_techs = [tech.lower() for tech in item.get('technologies', [])]
    tech_overlap = len(set(query_techs) & set(item_techs))
    if tech_overlap > 0:
        score += 0.3 * min(tech_overlap / len(query_techs), 1.0)
    
    # Title/description match (20%)
    title_words = item.get('title', '').lower().split()
    desc_words = item.get('description', '').lower().split()
    query_words = query.lower().split()
    
    word_matches = sum(1 for word in query_words 
                      if word in title_words or word in desc_words)
    if word_matches > 0:
        score += 0.2 * min(word_matches / len(query_words), 1.0)
    
    # Featured content bonus (10%)
    if item.get('featured', False):
        score += 0.1
    
    return min(score, 1.0)
```

## Testing Content Configuration

### Unit Tests for Content

```python
import pytest
from resume_query_processor import ResumeQueryProcessor

def test_project_query():
    processor = ResumeQueryProcessor()
    results = processor.get_relevant_items("tell me about python projects")
    
    assert len(results) > 0
    assert results[0]['type'] == 'projects'
    assert 'python' in str(results[0]).lower()

def test_skill_query():
    processor = ResumeQueryProcessor()
    results = processor.get_relevant_items("what programming languages")
    
    assert len(results) > 0
    assert results[0]['type'] == 'skills'
```

### Manual Testing Queries

Test common user queries to ensure content appears correctly:

```bash
# Test queries via API
curl -X POST http://localhost:8000/process/text \
  -H "Content-Type: application/json" \
  -d '{"text": "What projects have you built with Python?"}'

curl -X POST http://localhost:8000/process/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell me about your work experience"}'
```

### Content Analytics

Track which content is being requested most frequently:

```python
# Add to LLM service for analytics
content_requests = defaultdict(int)

def track_content_request(items, query):
    for item in items:
        content_requests[item['id']] += 1
        
    # Log popular content periodically
    if sum(content_requests.values()) % 100 == 0:
        popular_items = sorted(content_requests.items(), 
                             key=lambda x: x[1], reverse=True)
        logger.info("Popular content", items=popular_items[:10])
```

## Troubleshooting Content Issues

### Common Problems

#### "No content found for query"
- **Check**: Content exists in `resume_data.json`
- **Check**: Query intent patterns match user input
- **Solution**: Add relevant keywords or adjust intent patterns

#### "Wrong content type returned"
- **Check**: Intent classification logic
- **Check**: Keyword overlaps between content types
- **Solution**: Refine intent patterns or add specific keywords

#### "Content not being selected"
- **Check**: Relevance scoring algorithm
- **Check**: Required fields are populated
- **Solution**: Improve descriptions or adjust scoring weights

### Debugging Tools

#### Content Search Testing:
```python
# Test content search manually
from resume_query_processor import ResumeQueryProcessor

processor = ResumeQueryProcessor()
results = processor.get_relevant_items("your test query")
for result in results:
    print(f"Score: {result.get('relevance_score', 'N/A')}")
    print(f"Title: {result['title']}")
    print(f"Type: {result['type']}")
    print("---")
```

#### Query Analysis:
```python
# Analyze query processing
query = "Show me machine learning projects"
intent = processor.analyze_intent(query)
technologies = processor.extract_technologies(query)

print(f"Intent: {intent}")
print(f"Technologies: {technologies}")
```

This content configuration system provides a flexible foundation for managing structured data that can be intelligently queried and presented by the conversational AI system.