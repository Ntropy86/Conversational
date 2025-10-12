#!/bin/bash

echo "🧪 Testing Follow-up Fixes"
echo "=========================="
echo ""

# Test 1: Initial query (should work)
echo "📝 Test 1: Initial query - 'Tell me about his experience in golang'"
echo ""
response1=$(curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell me about his experience in golang", "session_id": "test_followup_fix"}')

echo "$response1" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Response:', data['response'][:80] + '...')
print('LLM Generated:', data['metadata'].get('llm_generated', False))
print('Items:', len(data.get('items', [])))
print('Item type:', data['metadata'].get('item_type'))
print('Total results:', data['metadata'].get('total_results'))
print('')
"

# Get the conversation history from response1
conversation_history=$(echo "$response1" | python3 -c "
import json, sys
data = json.load(sys.stdin)
history = [
    {'role': 'user', 'content': 'Tell me about his experience in golang'},
    {
        'role': 'assistant',
        'content': data['response'],
        'structuredData': {
            'items': data['items'],
            'item_type': data['item_type'],
            'metadata': data['metadata']
        }
    }
]
print(json.dumps(history))
")

# Test 2: Follow-up query (should get remaining items)
echo "📝 Test 2: Follow-up - 'Tell me more' (should show remaining items)"
echo ""
curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Tell me more\", \"session_id\": \"test_followup_fix\", \"conversation_history\": $conversation_history}" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Response:', data['response'][:80] + '...')
print('Items:', len(data.get('items', [])))
print('Should have remaining items!')
print('')
"

echo "=========================="
echo "✅ Tests complete!"
echo ""
echo "Expected results:"
echo "- Test 1: Should return 4 items (mixed) with LLM Generated: True"
echo "- Test 2: Should return 4+ remaining items (not 0!)"

