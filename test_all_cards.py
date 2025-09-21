#!/usr/bin/env python3
"""
Comprehensive Test Script for All Content Types
Tests card generation for: Skills, Experience, Projects, Publications, and Blogposts
"""

import requests
import json
import time
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_ENDPOINT = f"{BASE_URL}/test/llm"

# Define test cases for each content type
TEST_CASES = {
    "skills": [
        "What skills does he have?",
        "What technologies does he know?",
        "What programming languages can he use?",
        "Tell me about his technical expertise",
        "What tools and frameworks has he worked with?"
    ],
    "experience": [
        "Tell me where did he work",
        "What companies has he worked at?",
        "What is his work experience?",
        "Where has he been employed?",
        "Tell me about his career history"
    ],
    "projects": [
        "What projects has he built?",
        "Show me his portfolio",
        "What has he created?",
        "Tell me about his personal projects",
        "What applications has he developed?"
    ],
    "publications": [
        "Has he done any research?",
        "What papers has he published?",
        "Tell me about his research work",
        "Show me his publications",
        "What academic work has he done?"
    ],
    "blogposts": [
        "What has he written about?",
        "Show me his blog posts",
        "What articles has he published?",
        "Tell me about his writing",
        "What insights has he shared?"
    ]
}

def test_content_type(content_type, queries):
    """Test a specific content type with multiple queries"""
    print(f"\n{'='*60}")
    print(f"TESTING {content_type.upper()} CARDS")
    print(f"{'='*60}")
    
    results = []
    
    for i, query in enumerate(queries, 1):
        print(f"\n[{i}/{len(queries)}] Testing: '{query}'")
        print("-" * 50)
        
        try:
            # Make API request
            response = requests.post(
                TEST_ENDPOINT,
                json={"text": query},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract key information
                item_type = data.get("item_type", "unknown")
                items_count = len(data.get("items", []))
                response_text = data.get("response", "")
                metadata = data.get("metadata", {})
                processing_time = data.get("processing_time_ms", 0)
                
                # Check if it's fallback mode
                is_fallback = metadata.get("fallback_mode", False)
                llm_error = metadata.get("llm_error", None)
                
                # Print results
                print(f"✅ SUCCESS")
                print(f"   Response: {response_text}")
                print(f"   Item Type: {item_type}")
                print(f"   Cards Generated: {items_count}")
                print(f"   Processing Time: {processing_time:.1f}ms")
                
                if is_fallback:
                    print(f"   ⚠️  FALLBACK MODE: {llm_error[:100]}..." if llm_error else "   ⚠️  FALLBACK MODE")
                
                # Validate content type matches expected
                expected_types = {
                    "skills": ["skills", "skill"],
                    "experience": ["experience", "experiences"],
                    "projects": ["projects", "project"], 
                    "publications": ["publications", "publication"],
                    "blogposts": ["blog", "blogposts"]
                }
                
                if item_type in expected_types.get(content_type, []):
                    print(f"   ✅ CORRECT TYPE: Expected {content_type}, got {item_type}")
                else:
                    print(f"   ❌ TYPE MISMATCH: Expected {content_type}, got {item_type}")
                
                # Show first item as example
                if data.get("items") and len(data["items"]) > 0:
                    first_item = data["items"][0]
                    print(f"   📄 Sample Card: '{first_item.get('title', first_item.get('id', 'Unknown'))}'")
                
                results.append({
                    "query": query,
                    "success": True,
                    "item_type": item_type,
                    "items_count": items_count,
                    "processing_time": processing_time,
                    "is_fallback": is_fallback,
                    "type_match": item_type in expected_types.get(content_type, [])
                })
                
            else:
                print(f"❌ HTTP ERROR: {response.status_code}")
                print(f"   Response: {response.text}")
                results.append({
                    "query": query,
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "response": response.text
                })
                
        except Exception as e:
            print(f"❌ EXCEPTION: {str(e)}")
            results.append({
                "query": query,
                "success": False,
                "error": str(e)
            })
        
        # Small delay between requests
        time.sleep(0.5)
    
    # Print summary for this content type
    print(f"\n{'='*60}")
    print(f"{content_type.upper()} SUMMARY")
    print(f"{'='*60}")
    
    successful = sum(1 for r in results if r["success"])
    type_matches = sum(1 for r in results if r.get("type_match", False))
    fallbacks = sum(1 for r in results if r.get("is_fallback", False))
    
    print(f"Total Tests: {len(results)}")
    print(f"Successful: {successful}/{len(results)} ({successful/len(results)*100:.1f}%)")
    print(f"Correct Type: {type_matches}/{len(results)} ({type_matches/len(results)*100:.1f}%)")
    print(f"Fallback Mode: {fallbacks}/{len(results)} ({fallbacks/len(results)*100:.1f}%)")
    
    if successful > 0:
        avg_time = sum(r.get("processing_time", 0) for r in results if r["success"]) / successful
        print(f"Avg Processing Time: {avg_time:.1f}ms")
    
    return results

def main():
    """Run comprehensive tests for all content types"""
    print("🚀 STARTING COMPREHENSIVE CARD GENERATION TEST")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 Testing endpoint: {TEST_ENDPOINT}")
    
    # Check if server is running
    try:
        health_response = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"✅ Server is running (status: {health_response.status_code})")
    except Exception as e:
        print(f"❌ Server connection failed: {e}")
        print("Please make sure the backend server is running on port 8000")
        return
    
    all_results = {}
    
    # Test each content type
    for content_type, queries in TEST_CASES.items():
        results = test_content_type(content_type, queries)
        all_results[content_type] = results
    
    # Overall summary
    print(f"\n{'='*80}")
    print("🏆 OVERALL SUMMARY")
    print(f"{'='*80}")
    
    total_tests = sum(len(results) for results in all_results.values())
    total_successful = sum(sum(1 for r in results if r["success"]) for results in all_results.values())
    total_type_matches = sum(sum(1 for r in results if r.get("type_match", False)) for results in all_results.values())
    total_fallbacks = sum(sum(1 for r in results if r.get("is_fallback", False)) for results in all_results.values())
    
    print(f"📊 Total Tests Run: {total_tests}")
    print(f"✅ Overall Success Rate: {total_successful}/{total_tests} ({total_successful/total_tests*100:.1f}%)")
    print(f"🎯 Type Accuracy: {total_type_matches}/{total_tests} ({total_type_matches/total_tests*100:.1f}%)")
    print(f"⚠️  Fallback Usage: {total_fallbacks}/{total_tests} ({total_fallbacks/total_tests*100:.1f}%)")
    
    # Per-type breakdown
    print(f"\n📋 BREAKDOWN BY CONTENT TYPE:")
    for content_type, results in all_results.items():
        successful = sum(1 for r in results if r["success"])
        type_matches = sum(1 for r in results if r.get("type_match", False))
        print(f"   {content_type.upper():<12}: {successful}/{len(results)} success, {type_matches}/{len(results)} correct type")
    
    # Identify any problematic queries
    failed_queries = []
    for content_type, results in all_results.items():
        for result in results:
            if not result["success"] or not result.get("type_match", False):
                failed_queries.append((content_type, result["query"], result.get("error", "Type mismatch")))
    
    if failed_queries:
        print(f"\n⚠️  ISSUES FOUND ({len(failed_queries)} queries):")
        for content_type, query, error in failed_queries:
            print(f"   {content_type}: '{query}' - {error}")
    else:
        print(f"\n🎉 ALL TESTS PASSED! Card generation is working perfectly for all content types.")
    
    print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Save detailed results to file
    with open('test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": total_tests,
                "total_successful": total_successful,
                "total_type_matches": total_type_matches,
                "total_fallbacks": total_fallbacks
            },
            "results": all_results
        }, f, indent=2)
    
    print(f"💾 Detailed results saved to: test_results.json")

if __name__ == "__main__":
    main()