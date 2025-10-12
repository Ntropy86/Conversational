#!/bin/bash

echo "🧪 Testing Ordinal References (first, second, third, last)"
echo "==========================================================="
echo ""

# Test: Initial query + ordinal reference
echo "Step 1: Initial query - 'Tell me about his golang experience'"
response1=$(curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell me about his golang experience", "session_id": "ordinal_test"}')

echo "$response1" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Initial query returned', len(data['items']), 'items:')
for i, item in enumerate(data['items'], 1):
    title = item.get('title', item.get('role', '?'))
    print(f'  {i}. {title[:60]}')
print()
"

# Extract conversation history
conv_hist=$(echo "$response1" | python3 -c "
import json, sys
data = json.load(sys.stdin)
hist = [
    {'role': 'user', 'content': 'Tell me about his golang experience'},
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
print(json.dumps(hist))
")

echo "Step 2: Ask about 'the second project'"
curl -s -X POST http://localhost:8000/smart/query \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Tell me about the second project\", \"session_id\": \"ordinal_test\", \"conversation_history\": $conv_hist}" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Ordinal reference returned', len(data['items']), 'item(s):')
for item in data['items']:
    title = item.get('title', item.get('role', '?'))
    print(f'  - {title}')
print()
print('Is ordinal reference:', data['metadata'].get('is_ordinal_reference', False))
print('Expected: Item #2 from previous results (Portfolio AI Mode)')
"

echo ""
echo "==========================================================="
echo "✅ Test complete!"
echo ""
echo "Expected behavior:"
echo "- Initial query shows 4 items"
echo "- 'second project' returns ONLY item #2 (Portfolio AI Mode)"
echo "- NOT a new search for projects with 'second' in the name!"

