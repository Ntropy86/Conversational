#!/usr/bin/env python3
"""
Simple Test Script for Resume Query Processor
Tests individual queries to verify they work correctly
"""

import requests
import time
import json

class SimpleTester:
    def __init__(self):
        self.base_url = "http://localhost:8000/smart/query"
        self.headers = {"Content-Type": "application/json"}

    def query_api(self, text: str) -> dict:
        """Query the API and return response"""
        payload = {"text": text}
        try:
            response = requests.post(self.base_url, json=payload, headers=self.headers, timeout=10)
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    def test_query(self, query: str) -> None:
        """Test a single query and print results"""
        print(f"\n🧪 Testing: {query}")
        print("=" * 60)

        result = self.query_api(query)

        if "error" in result:
            print(f"❌ API Error: {result['error']}")
            return

        items = result.get("items", [])
        response_text = result.get("response", "")
        item_type = result.get("item_type", "")

        print(f"Response: {response_text}")
        print(f"Items found: {len(items)}")
        print(f"Item type: {item_type}")

        if len(items) > 0:
            print("✅ SUCCESS: Found items!")
            # Show first item as example
            if items:
                first_item = items[0]
                title = first_item.get("title", "No title")
                print(f"Sample item: {title}")
        else:
            print("❌ FAILED: No items found")

        # Check for specific technologies mentioned
        query_lower = query.lower()
        tech_keywords = ['python', 'fastapi', 'react', 'javascript', 'ai', 'machine learning', 'tensorflow']
        mentioned_techs = [tech for tech in tech_keywords if tech in query_lower]

        if mentioned_techs and len(items) == 0:
            print(f"⚠️  ISSUE: Query mentions {mentioned_techs} but found no results")

    def run_tests(self):
        """Run all test queries"""
        print("🚀 Simple Resume Query Test")
        print("=" * 60)

        test_queries = [
            # Working queries from individual tests
            "What projects have you worked on?",
            "What experience do you have with FastAPI?",
            "What Python experience do you have?",

            # Queries that were failing in comprehensive test
            "What papers have you published?",
            "Tell me about your research on educational robots",
            "What are your career highlights?",
            "Show me your key achievements",
            "What are you most proud of professionally?",
            "What did you work on in 2024?",
            "What projects from 2025?",
            "Show me recent work from the past year",

            # Additional test queries
            "Tell me about your work at People & Robots Lab",
            "What did you do at the University of Wisconsin?",
            "Tell me about the Portfolio AI Mode project",
            "What conversational AI work have you done?",
            "Tell me about your machine learning projects",
            "What AI and ML work have you done?",
        ]

        for query in test_queries:
            self.test_query(query)
            time.sleep(0.2)  # Small delay between requests

        print("\n" + "=" * 60)
        print("✅ Test complete!")

if __name__ == "__main__":
    tester = SimpleTester()
    tester.run_tests()