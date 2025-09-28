#!/usr/bin/env python3
"""
Comprehensive test script for backend queries - Query Processor Only
"""
import os
import sys
import json
from resume_query_processor import ResumeQueryProcessor

def test_query_processor():
    """Test the ResumeQueryProcessor with various queries"""
    print("🔍 Testing ResumeQueryProcessor with various queries...")

    processor = ResumeQueryProcessor()

    # Test queries that should work
    test_queries = [
        # Core queries that should work
        "tell me about his latest experience",
        "what projects has he built",
        "what are his skills",
        "tell me about his work at Spenza",
        "what technologies does he know",
        "show me his research",
        "what is his background",
        "tell me about his education",
        "what companies has he worked at",
        "show me his publications",

        # Technology-specific queries
        "what is machine learning",  # Should show ML-related work
        "tell me about python programming",  # Should show Python work
        "what is AI",  # Should show AI work

        # Edge cases
        "how does he code",  # Might be borderline
        "write a function for me",  # Should NOT work - code request

        # Off-topic queries that should NOT return results
        "what is the weather like",
        "how do I cook pasta",
        "who won the election",
        "what is the capital of France",
    ]

    results = []

    for i, query in enumerate(test_queries, 1):
        print(f"\n{'='*60}")
        print(f"🧪 TEST {i:2d}: '{query}'")
        print(f"{'='*60}")

        try:
            result = processor.query(query)
            print(f"✅ Response: {result.response_text}")
            print(f"📊 Items found: {len(result.items)}")
            print(f"🏷️  Item type: {result.item_type}")
            print(f"📋 Metadata: {result.metadata}")

            if result.items:
                print("📄 Sample items:")
                for j, item in enumerate(result.items[:2]):  # Show first 2 items
                    title = item.get('title', item.get('role', 'no title'))
                    company = item.get('company', 'no company')
                    print(f"   {j+1}. {title} at {company}")

            # Check for potential issues
            issues = []

            # Check if response contains ChatGPT redirect (shouldn't happen at query processor level)
            if "chatgpt" in result.response_text.lower():
                issues.append("❌ CONTAINS CHATGPT REDIRECT")

            # Check for code-related responses that should be handled at LLM level
            if "consultation" in result.response_text.lower() and "code" in query.lower():
                issues.append("⚠️  CODE REQUEST DETECTED")

            # Check for empty results on valid queries
            valid_query_indicators = ['his', 'experience', 'projects', 'skills', 'work', 'background', 'education', 'companies', 'publications', 'research', 'technologies']
            is_valid_resume_query = any(indicator in query.lower() for indicator in valid_query_indicators)

            if is_valid_resume_query and len(result.items) == 0 and result.item_type not in ['none']:
                issues.append("⚠️  VALID QUERY BUT NO ITEMS FOUND")

            # Check for off-topic queries that return results (shouldn't happen)
            off_topic_indicators = ['weather', 'cook', 'pasta', 'election', 'capital', 'france']
            is_off_topic = any(indicator in query.lower() for indicator in off_topic_indicators)

            if is_off_topic and len(result.items) > 0:
                issues.append("❌ OFF-TOPIC QUERY RETURNS RESULTS")

            if issues:
                print(f"🚨 ISSUES: {'; '.join(issues)}")
                status = "❌ FAIL"
            else:
                print("✅ NO ISSUES DETECTED")
                status = "✅ PASS"

            results.append({
                'query': query,
                'response': result.response_text,
                'item_count': len(result.items),
                'item_type': result.item_type,
                'issues': issues,
                'status': status
            })

        except Exception as e:
            print(f"❌ ERROR: {e}")
            results.append({
                'query': query,
                'error': str(e),
                'issues': ['EXCEPTION'],
                'status': '❌ ERROR'
            })

    # Summary
    print(f"\n{'='*80}")
    print("📊 TEST SUMMARY")
    print(f"{'='*80}")

    total_tests = len(results)
    passed_tests = len([r for r in results if r['status'] == '✅ PASS'])
    failed_tests = total_tests - passed_tests

    print(f"Total tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")

    if failed_tests > 0:
        print(f"\n❌ FAILED TESTS:")
        for result in results:
            if result['status'] != '✅ PASS':
                print(f"   - '{result['query']}' → {result['issues']}")

    # Save detailed results
    with open('backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n💾 Detailed results saved to backend_test_results.json")
    return failed_tests == 0

if __name__ == "__main__":
    success = test_query_processor()
    sys.exit(0 if success else 1)