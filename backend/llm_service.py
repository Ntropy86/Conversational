# llm_service.py
import os
import json
import re
from typing import Dict, Any
from groq import Groq
from dotenv import load_dotenv
from resume_query_processor import ResumeQueryProcessor
load_dotenv() # Load environment variables from .env file

class ConversationManager:
    def __init__(self):
        print("Initializing Groq conversation manager...")
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable not set. Run: export GROQ_API_KEY=your_key_here")
            
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.1-8b-instant"  # Use your available model
        
        # Initialize resume query processor
        self.query_processor = ResumeQueryProcessor()
        
        # Load full resume data for context
        with open("resume_data.json", 'r') as f:
            resume_data = json.load(f)
        
        self.system_prompt = (
            "You are a witty, sarcastic friend who represents Nitigya. Keep responses conversational and engaging. "
            "You focus on discussing Nitigya's resume, skills, projects, and technical expertise. "
            "For general technical questions (like 'Do you know Python?'), answer based on Nitigya's experience with that technology. "
            "For completely unrelated questions (like politics, weather, etc.), reply: 'Hmm, maybe ChatGPT can help you out with that?' \n"
            "Never mention you're an AI. Use comedic flair but stay professional when discussing technical work.\n\n"
            
            "ABSOLUTE RULE: Response must be 30 words or LESS. NO EXCEPTIONS. Count each word carefully before responding. Short and punchy responses only.\n\n"

            "CONVERSATION AWARENESS: If conversation context is provided, maintain continuity and reference previous topics naturally. "
            "Use pronouns like 'that project', 'the one I mentioned', etc. when appropriate.\n\n"

            "IMPORTANT: The system will provide you with structured data about Nitigya's background. "
            "Use this data to give accurate, specific responses about his projects, experience, and skills. "
            "When discussing specific projects or experiences, reference the exact details provided.\n\n"
            
            "CRITICAL: NEVER include internal IDs, keys, or technical identifiers in your responses. "
            "Only mention human-readable information like university names, project titles, company names, etc. "
            "Do NOT say things like 'IDS:', 'id:', or include technical keys in your conversational responses.\n\n"

            f"FULL RESUME CONTEXT:\n{json.dumps(resume_data, indent=2)}\n\n"

            "If structured data is provided, incorporate those details naturally into your response. "
            "Keep your personality but be accurate about technical details, dates, and achievements. "
            "Remember: speak naturally about the content, never expose internal data structure details.\n"
        )
        
        # Initialize chat history
        self.chat_history = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": "Hey there!"},
            {"role": "assistant", "content": "Yo, I'm in a comedic mood today. Let's do this."},
        ]
        print("Conversation manager initialized successfully")
        
    def add_user_message(self, message):
        """Add a user message to the conversation history"""
        self.chat_history.append({"role": "user", "content": message})
        
    def generate_response(self):
        """Generate a complete response at once"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.chat_history,  # Use existing chat history with system prompt
            temperature=0.9,
            top_p=0.95,
            max_tokens=128
        )
        
        reply = response.choices[0].message.content.strip()
        self.chat_history.append({"role": "assistant", "content": reply})
        return reply, self.chat_history
        
    def stream_response(self):
        """Stream response token by token"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.chat_history,  # Use existing chat history with system prompt
            temperature=0.9,
            top_p=0.95,
            max_tokens=128,
            stream=True,
        )
        
        full_reply = ""
        for chunk in response:
            delta = chunk.choices[0].delta
            content = getattr(delta, "content", None)
            if content:
                yield content
                full_reply += content
                
        self.chat_history.append({"role": "assistant", "content": full_reply.strip()})

    def generate_structured_response(self, user_message: str, conversation_history: list = None) -> Dict:
        """Generate an intelligent response that only shows cards when relevant content is mentioned"""
        
        # Create conversation context if provided
        context_summary = ""
        if conversation_history and len(conversation_history) > 0:
            context_summary = "\n\nCONVERSATION CONTEXT:\n"
            for msg in conversation_history[-5:]:  # Use last 5 messages for context
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                context_summary += f"{role.upper()}: {content}\n"
        
        # First, use the query processor to determine if cards are needed
        query_result = self.query_processor.query(user_message)
        
        # DEBUG: Print what the query processor returned
        print(f"🔍 DEBUG - Query: '{user_message}'")
        print(f"🔍 DEBUG - Items found: {len(query_result.items)}")
        print(f"🔍 DEBUG - Item type: {query_result.item_type}")
        print(f"🔍 DEBUG - Metadata: {query_result.metadata}")
        if query_result.items:
            print(f"🔍 DEBUG - First item: {query_result.items[0].get('id', 'no-id')}")
        
        # If no cards needed (greeting, general convo), just do conversational response
        if query_result.item_type == "none" or len(query_result.items) == 0:
            # Simple conversational response
            conversation_prompt = f"""
User says: {user_message}
{context_summary}

You are Nitigya's witty, sarcastic friend. Respond naturally and conversationally.

RULES:
- Keep it under 30 words
- Be friendly but with personality 
- If it's a greeting, greet back naturally
- If it's casual conversation, engage casually
- Don't mention projects/work unless specifically asked
- Never mention you're an AI

Just have a normal conversation.
"""
            
            # Truncate conversation history for casual chat too
            truncated_history = self.chat_history[-4:] if len(self.chat_history) > 4 else self.chat_history
            enhanced_history = truncated_history + [
                {"role": "system", "content": conversation_prompt},
                {"role": "user", "content": user_message}
            ]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=enhanced_history,
                temperature=0.8,
                max_tokens=100
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Add to conversation history
            self.chat_history.append({"role": "user", "content": user_message})
            self.chat_history.append({"role": "assistant", "content": response_text})
            
            return {
                "response": response_text,
                "items": [],
                "item_type": "none",
                "metadata": {"reasoning": "Casual conversation - no cards needed"}
            }
        
        # Cards are needed - do intelligent selection
        # Truncate items to prevent token limit issues
        max_items = 8 if len(query_result.items) > 8 else len(query_result.items)
        truncated_items = query_result.items[:max_items]
        
        # Simplify item data to reduce tokens
        simplified_items = []
        for item in truncated_items:
            simplified_item = {
                "id": item.get("id", ""),
                "title": item.get("title", ""),
                "company": item.get("company", ""),
                "role": item.get("role", ""),
                "description": item.get("description", "")[:200] + "..." if len(item.get("description", "")) > 200 else item.get("description", "")
            }
            simplified_items.append(simplified_item)
        
        # Handle fallback scenarios with special context
        fallback_context = ""
        if query_result.metadata.get('fallback_search'):
            requested_techs = query_result.metadata.get('requested_technologies', [])
            found_similar = query_result.metadata.get('similar_technologies_found', [])
            fallback_context = f"""
IMPORTANT - FALLBACK SCENARIO:
User asked about: {', '.join(requested_techs)}
No direct experience found, showing related work with: {', '.join(found_similar)}
Your response should acknowledge this gap and explain the similarity.
"""
        
        selection_prompt = f"""User: "{user_message}"
{fallback_context}
{query_result.item_type.title()} options:
{json.dumps(simplified_items, indent=1)}

Pick 1-3 most relevant items. Respond with witty comment (max 25 words).

RULES:
- If this is a fallback scenario, acknowledge the user asked about technologies he doesn't have
- Explain what similar work he does have
- Be honest about what's missing
- Don't hallucinate or make up experience

FORMAT:
RESPONSE: [witty comment]
IDS: [comma-separated IDs]

Example:
RESPONSE: This guy's been around the block!
IDS: people-robots-lab, spenza-inc"""
        
        # Truncate conversation history to prevent token limits
        max_history = 4  # Keep only last 4 messages (2 exchanges)
        truncated_history = self.chat_history[-max_history:] if len(self.chat_history) > max_history else self.chat_history
        
        enhanced_history = truncated_history + [
            {"role": "system", "content": selection_prompt},
            {"role": "user", "content": user_message}
        ]
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=enhanced_history,
            temperature=0.7,
            max_tokens=200
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # DEBUG: Show what LLM returned
        print(f"🔍 DEBUG - LLM raw response: '{ai_response}'")
        
        # Parse the response
        try:
            # Look for the RESPONSE: and IDS: markers
            response_text = ""
            selected_ids = []
            
            # ROBUST PARSING: Handle complex multi-line responses
            if "IDS:" in ai_response:
                # Split at IDS: to separate response and IDs
                parts = ai_response.split("IDS:")
                if len(parts) == 2:
                    response_part = parts[0].strip()
                    ids_part = parts[1].strip()
                    
                    # IMPROVED: Extract response text intelligently
                    if "RESPONSE:" in response_part:
                        # Extract everything after RESPONSE:
                        response_lines = response_part.split("RESPONSE:")
                        if len(response_lines) >= 2:
                            response_text = response_lines[-1].strip()  # Take last part after RESPONSE:
                        else:
                            response_text = response_part.strip()
                    else:
                        # If no RESPONSE: marker, use the whole response part
                        response_text = response_part.strip()
                    
                    # Parse IDs
                    if ids_part and ids_part != "NONE":
                        selected_ids = [id.strip() for id in ids_part.split(",") if id.strip()]
            
            # Fallback: try multi-line format
            if not response_text and not selected_ids:
                lines = ai_response.split('\n')
                response_lines = []
                
                for line in lines:
                    line = line.strip()
                    if line.startswith("RESPONSE:"):
                        response_text = line[9:].strip()
                    elif line.startswith("IDS:"):
                        ids_text = line[4:].strip()
                        if ids_text and ids_text != "NONE":
                            selected_ids = [id.strip() for id in ids_text.split(",") if id.strip()]  
                    elif not line.startswith("IDS:") and line and not response_text:
                        # Collect non-structured lines as potential response
                        response_lines.append(line)
                
                # If no structured RESPONSE: found, use collected lines
                if not response_text and response_lines:
                    response_text = " ".join(response_lines)
            
            # If we didn't find structured format, extract IDs from the whole response
            if not response_text and not selected_ids:
                # Look for patterns that might be IDs
                import re
                # Look for lines that might contain IDs
                possible_ids = re.findall(r'\b[a-z-]+\b', ai_response.lower())
                # Check if any match actual item IDs
                actual_ids = [item.get("id", "") for item in query_result.items]
                selected_ids = [id for id in possible_ids if id in actual_ids]
                response_text = ai_response
            
            # Filter items based on selected IDs
            selected_items = [item for item in query_result.items if item.get("id") in selected_ids]
            
            # Ensure we have a response text
            if not response_text and selected_items:
                response_text = f"Here's what you're looking for about his {query_result.item_type}:"
            elif not response_text:
                response_text = "Tell me more about what you're looking for."
                
            # Fallback - if no specific IDs found but we have a good response, don't show any cards
            if not selected_ids and response_text and "here's what you're looking for" not in response_text.lower():
                selected_items = []
            elif not selected_ids:
                # Last resort - show first relevant item if we have any
                selected_items = query_result.items[:1] if len(query_result.items) > 0 else []
                
        except Exception as e:
            print(f"Parsing error: {e}")
            print(f"AI Response: {ai_response}")
            response_text = ai_response if ai_response else "Tell me more about what you're looking for."
            selected_items = []
        
        # Add to conversation history
        self.chat_history.append({"role": "user", "content": user_message})
        self.chat_history.append({"role": "assistant", "content": response_text})
        
        return {
            "response": response_text,
            "items": selected_items,
            "item_type": query_result.item_type,
            "metadata": {
                **query_result.metadata,
                "intelligent_selection": True,
                "cards_shown": len(selected_items) > 0
            }
        }

    async def generate_structured_response_async(self, user_message: str, conversation_history: list = None) -> Dict:
        """Async version of generate_structured_response for background processing"""
        import asyncio
        
        # Run the synchronous method in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            self.generate_structured_response, 
            user_message, 
            conversation_history
        )

# Test function - make sure we use the SAME conversation manager for both tests
def test_llm(input_text=None):
    try:
        if not input_text:
            input_text = input("Enter text to send to LLM: ")
        
        # Create ONE conversation manager
        convo = ConversationManager()
        
        # Test non-streaming first
        convo.add_user_message(input_text)
        print("Non-streaming response:")
        response, _ = convo.generate_response()
        print(f"Response: {response}")
        
        # Now test streaming with a new message
        new_input = "Tell me about your machine learning skills."
        print(f"\nTesting streaming with: '{new_input}'")
        convo.add_user_message(new_input)
        print("Response: ", end="", flush=True)
        for token in convo.stream_response():
            print(token, end="", flush=True)
        print()  # New line after streaming
    except Exception as e:
        print(f"Error testing LLM: {e}")

if __name__ == "__main__":
    test_llm()