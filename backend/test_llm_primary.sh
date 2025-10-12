#!/bin/bash

echo "🧪 Testing LLM as Primary Responder"
echo "===================================="
echo ""

# Test 1: Missing Tech (Go) - Should be quirky!
echo "📝 Test 1: Missing Tech (Go) - Expecting QUIRKY response with puns"
echo "Query: 'Give me his experience in Go'"
echo ""
response1=$(curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d '{"text": "Give me his experience in Go", "session_id": "test_primary_1"}')

echo "$response1" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Response:', data['response'])
print('LLM Generated:', data['metadata'].get('llm_generated', False))
print('Items:', len(data.get('items', [])))
print('')
"

# Test 2: Existing Tech (Python) - Should be enthusiastic!
echo "📝 Test 2: Existing Tech (Python) - Expecting ENTHUSIASTIC response"
echo "Query: 'Show me Python projects'"
echo ""
response2=$(curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d '{"text": "Show me Python projects", "session_id": "test_primary_2"}')

echo "$response2" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Response:', data['response'])
print('LLM Generated:', data['metadata'].get('llm_generated', False))
print('Items:', len(data.get('items', [])))
print('')
"

# Test 3: Query 3+ (Should STILL use LLM!)
echo "📝 Test 3-5: Multiple Queries - ALL should be LLM-generated"
echo "Query 3: 'Tell me about his work'"
echo ""
response3=$(curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell me about his work", "session_id": "test_primary_3"}')

echo "$response3" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Response:', data['response'])
print('LLM Generated:', data['metadata'].get('llm_generated', False))
print('')
"

echo "Query 4: 'What about his education?'"
echo ""
response4=$(curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d '{"text": "What about his education?", "session_id": "test_primary_3"}')

echo "$response4" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Response:', data['response'])
print('LLM Generated:', data['metadata'].get('llm_generated', False))
print('')
"

echo "Query 5: 'Any publications?'"
echo ""
response5=$(curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d '{"text": "Any publications?", "session_id": "test_primary_3"}')

echo "$response5" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Response:', data['response'])
print('LLM Generated:', data['metadata'].get('llm_generated', False))
print('')
"

# Test 4: Missing Tech (Rust) - Should be quirky with different pun!
echo "📝 Test 4: Missing Tech (Rust) - Expecting DIFFERENT quirky response"
echo "Query: 'Rust projects?'"
echo ""
response6=$(curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d '{"text": "Rust projects?", "session_id": "test_primary_4"}')

echo "$response6" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Response:', data['response'])
print('LLM Generated:', data['metadata'].get('llm_generated', False))
print('Items:', len(data.get('items', [])))
print('')
"

echo "===================================="
echo "✅ All tests complete!"
echo ""
echo "Expected results:"
echo "- ALL responses should have 'LLM Generated: True'"
echo "- Go/Rust queries should have QUIRKY, CREATIVE responses with puns"
echo "- Python query should be ENTHUSIASTIC"
echo "- Queries 3-5 should STILL use LLM (not boring templates!)"
echo ""
echo "If any response is boring or template-like, LLM is not being used!"

