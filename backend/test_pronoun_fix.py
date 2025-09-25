#!/usr/bin/env python3
"""
Test script for pronoun and implicit reference handling
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from resume_query_processor import ResumeQueryProcessor

def test_pronoun_queries():
    """Test queries with pronouns and implicit references"""
    processor = ResumeQueryProcessor()
    
    test_cases = [
        # The problematic queries from the user
        "Can you tell me about his experience in data science",
        "What about his work with machine learning",
        "Tell me about Nitgy's projects",  # Whisper transcription error
        "What has he built recently",
        "His experience with Python",
        
        # Additional edge cases
        "Tell me about his background",
        "What did he work on at his last job",
        "What companies has he worked for",
        "What technologies does he know",
        "His research experience"
    ]
    
    print("🧪 Testing Pronoun and Implicit Reference Handling\n")
    print("=" * 60)
    
    for i, query in enumerate(test_cases, 1):
        print(f"\n{i}. Query: '{query}'")
        
        # Test intent extraction
        intent = processor.extract_intent(query)
        print(f"   Intent: {intent}")
        
        # Test full query processing
        result = processor.query(query)
        print(f"   Item Type: {result.item_type}")
        print(f"   Items Found: {len(result.items)}")
        print(f"   Tech Filters: {result.metadata.get('tech_filters', [])}")
        
        # Show if it would be classified as person-related
        import re
        person_related_patterns = [
            r"(?i)(his|her|their|its)\s+(experience|work|skills|background)",
            r"(?i)tell me about (his|her|their|its)",
            r"(?i)what (does|can)\s+(he|she|they|it)",
            r"(?i)(nitgy|nityga|nitija|nitigya)",
            r"(?i)data science", r"(?i)machine learning",
            r"(?i)experience (in|with)", r"(?i)worked with"
        ]
        
        is_person_related = any(re.search(pattern, query) for pattern in person_related_patterns)
        print(f"   Person-Related: {is_person_related}")
        
        if result.items:
            print(f"   Sample Result: {result.items[0].get('title', 'No title')}")
        
        print("   " + "-" * 50)

if __name__ == "__main__":
    test_pronoun_queries()