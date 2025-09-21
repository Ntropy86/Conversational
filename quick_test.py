#!/usr/bin/env python3
"""
Quick validation test for all 5 content types
"""

import requests
import json

BASE_URL = "http://localhost:8000"
TEST_ENDPOINT = f"{BASE_URL}/test/llm"

# Simplified test cases - one per content type
TESTS = [
    ("Skills", "What programming languages does he know?"),
    ("Experience", "Where did he work?"),
    ("Projects", "What projects has he built?"),
    ("Publications", "Has he published any papers?"),
    ("Blog", "What blog posts has he written?")
]

def test_query(content_type, query):
    """Test a single query"""
    print(f"\n🧪 Testing {content_type}: '{query}'")
    
    try:
        response = requests.post(
            TEST_ENDPOINT,
            json={"text": query},
            headers={"Content-Type": "application/json"},
            timeout=60  # Longer timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            item_type = data.get("item_type", "unknown")
            items_count = len(data.get("items", []))
            response_text = data.get("response", "")
            processing_time = data.get("processing_time_ms", 0)
            
            print(f"✅ SUCCESS: {response_text}")
            print(f"   Type: {item_type} | Cards: {items_count} | Time: {processing_time:.0f}ms")
            
            if items_count > 0:
                first_item = data["items"][0]
                title = first_item.get("title", first_item.get("id", "Unknown"))
                print(f"   Sample: {title}")
            
            return True, item_type, items_count
        else:
            print(f"❌ HTTP ERROR: {response.status_code}")
            return False, None, 0
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False, None, 0

def main():
    print("🚀 QUICK VALIDATION TEST - All 5 Content Types")
    print("=" * 60)
    
    results = []
    
    for content_type, query in TESTS:
        success, item_type, items_count = test_query(content_type, query)
        results.append((content_type, success, item_type, items_count))
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    for content_type, success, item_type, items_count in results:
        status = "✅" if success and items_count > 0 else "❌" if not success else "⚠️"
        print(f"{status} {content_type:<12}: {item_type} ({items_count} cards)")
    
    working = sum(1 for _, success, _, items in results if success and items > 0)
    print(f"\n🎯 Working: {working}/5 content types")

if __name__ == "__main__":
    main()