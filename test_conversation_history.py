#!/usr/bin/env python3
"""
Test script to investigate conversation history and fuzzy finding issues
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from resume_query_processor import ResumeQueryProcessor

def test_conversation_history():
    """Test how conversation history affects item selection"""
    # Change to backend directory to find resume_data.json
    import os
    original_cwd = os.getcwd()
    os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))
    
    try:
        processor = ResumeQueryProcessor()
        
        print("=== Testing Conversation History Effects ===")
        
        # First query - get some projects
        print("\n1. First query: 'show me his projects'")
        result1 = processor.query('show me his projects')
        print(f"Items returned: {len(result1.items)}")
        print(f"Total results: {result1.metadata.get('total_results', 'N/A')}")
        print("Items:")
        for i, item in enumerate(result1.items):
            print(f"  {i+1}. {item.get('title', item.get('company', 'Unknown'))}")

        # Simulate conversation history with these items
        conversation_history = [
            {
                "role": "user",
                "content": "show me his projects"
            },
            {
                "role": "assistant",
                "content": "Here are some projects:",
                "structuredData": {
                    "items": result1.items,
                    "metadata": result1.metadata
                }
            }
        ]

        # Second query with conversation history - should show different items
        print("\n2. Second query with history: 'show me more projects'")
        result2 = processor.query('show me more projects', conversation_history=conversation_history)
        print(f"Items returned: {len(result2.items)}")
        print(f"Total results: {result2.metadata.get('total_results', 'N/A')}")
        print("Items:")
        for i, item in enumerate(result2.items):
            print(f"  {i+1}. {item.get('title', item.get('company', 'Unknown'))}")

        # Check for duplicates
        print("\n3. Checking for duplicates:")
        shown_items = set()
        for item in result1.items:
            item_id = item.get('id')
            if item_id:
                shown_items.add(item_id)

        duplicates = []
        for item in result2.items:
            item_id = item.get('id')
            if item_id and item_id in shown_items:
                duplicates.append(item_id)

        if duplicates:
            print(f"❌ DUPLICATES FOUND: {duplicates}")
        else:
            print("✅ No duplicates found")
            
    finally:
        os.chdir(original_cwd)

def test_fuzzy_finding():
    """Test fuzzy finding behavior"""
    # Change to backend directory to find resume_data.json
    import os
    original_cwd = os.getcwd()
    os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))
    
    try:
        processor = ResumeQueryProcessor()
        
        print("\n=== Testing Fuzzy Finding ===")
        
        # Test various similar queries
        queries = [
            'show me his projects',
            'tell me about his projects',
            'what projects has he worked on',
            'his project work'
        ]
        
        results = {}
        for query in queries:
            result = processor.query(query)
            results[query] = result
            print(f"\nQuery: '{query}'")
            print(f"Items: {len(result.items)}, Total: {result.metadata.get('total_results', 'N/A')}")
            item_ids = [item.get('id') for item in result.items if item.get('id')]
            print(f"Item IDs: {item_ids}")
        
        # Check if fuzzy finding returns similar results
        print("\n4. Comparing results across queries:")
        all_item_ids = set()
        for query, result in results.items():
            query_ids = set(item.get('id') for item in result.items if item.get('id'))
            all_item_ids.update(query_ids)
        
        print(f"Total unique items found: {len(all_item_ids)}")
        print(f"All item IDs: {sorted(all_item_ids)}")
        
        # Check consistency
        first_result = results[queries[0]]
        consistent = True
        for query in queries[1:]:
            if results[query].metadata.get('total_results') != first_result.metadata.get('total_results'):
                consistent = False
                break
        
        if consistent:
            print("✅ Fuzzy finding is consistent across similar queries")
        else:
            print("❌ Fuzzy finding returns inconsistent total_results")
            
    finally:
        os.chdir(original_cwd)

if __name__ == "__main__":
    test_conversation_history()
    test_fuzzy_finding()