#!/usr/bin/env python3
"""
Follow-up Questions Test Script
Tests conversation context and follow-up query handling
"""

import requests
import time

class FollowupTester:
    def __init__(self):
        self.base_url = "http://localhost:8000/smart/query"
        self.headers = {"Content-Type": "application/json"}

    def query_api(self, text: str, conversation_history: list = None) -> dict:
        """Query the API and return response"""
        payload = {"text": text}
        if conversation_history:
            payload["conversation_history"] = conversation_history
        try:
            response = requests.post(self.base_url, json=payload, headers=self.headers, timeout=10)
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    def test_followup_questions(self):
        """Test follow-up question handling"""
        print("🔄 Testing Follow-up Questions")
        print("=" * 50)

        # Test 1: Follow-up after a specific project query
        print("\n📋 Test 1: Follow-up after project query")
        base_query = "Tell me about the Portfolio AI Mode project"
        base_result = self.query_api(base_query)

        print(f"Base: '{base_query}' → {len(base_result.get('items', []))} items")

        followup_queries = [
            "Tell me more about that",
            "What technologies did you use?",
            "Who was it for?",
            "How long did it take?"
        ]

        conversation_history = [base_result]
        for followup in followup_queries:
            result = self.query_api(followup, conversation_history)
            items_found = len(result.get("items", []))
            response_text = result.get("response", "")

            # Check if it's a contextual response
            is_contextual = any(phrase in response_text.lower() for phrase in [
                "portfolio", "ai mode", "conversational", "that project", "this project"
            ])

            status = "✅" if is_contextual or items_found > 0 else "❌"
            print(f"  {status} '{followup}' → {items_found} items, contextual: {is_contextual}")

            conversation_history.append(result)

        # Test 2: Follow-up after experience query
        print("\n💼 Test 2: Follow-up after experience query")
        base_query = "What did you do at People & Robots Lab?"
        base_result = self.query_api(base_query)

        print(f"Base: '{base_query}' → {len(base_result.get('items', []))} items")

        followup_queries = [
            "What was your role there?",
            "Tell me more about that work",
            "What did you accomplish?",
            "How long were you there?"
        ]

        conversation_history = [base_result]
        for followup in followup_queries:
            result = self.query_api(followup, conversation_history)
            items_found = len(result.get("items", []))
            response_text = result.get("response", "")

            is_contextual = any(phrase in response_text.lower() for phrase in [
                "people & robots", "lab", "research", "university", "wisconsin"
            ])

            status = "✅" if is_contextual or items_found > 0 else "❌"
            print(f"  {status} '{followup}' → {items_found} items, contextual: {is_contextual}")

            conversation_history.append(result)

        # Test 3: Generic follow-ups
        print("\n🎯 Test 3: Generic follow-up queries")
        base_query = "What Python experience do you have?"
        base_result = self.query_api(base_query)

        print(f"Base: '{base_query}' → {len(base_result.get('items', []))} items")

        followup_queries = [
            "Show me more details",
            "Can you expand on this?",
            "What else have you worked on?",
            "Give me more information"
        ]

        conversation_history = [base_result]
        for followup in followup_queries:
            result = self.query_api(followup, conversation_history)
            items_found = len(result.get("items", []))
            response_text = result.get("response", "")

            # Generic follow-ups should either provide more content or gracefully handle
            has_content = items_found > 0
            graceful_fallback = any(phrase in response_text.lower() for phrase in [
                "here's more", "let me show", "check out", "here are"
            ])

            status = "✅" if has_content or graceful_fallback else "❌"
            print(f"  {status} '{followup}' → {items_found} items, graceful: {graceful_fallback}")

            conversation_history.append(result)

if __name__ == "__main__":
    tester = FollowupTester()
    tester.test_followup_questions()