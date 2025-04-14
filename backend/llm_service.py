# llm_service.py
import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv() # Load environment variables from .env file

class ConversationManager:
    def __init__(self):
        print("Initializing Groq conversation manager...")
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable not set. Run: export GROQ_API_KEY=your_key_here")
            
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.1-8b-instant"  # Use your available model
        
        self.system_prompt = (
            "You are a witty, sarcastic friend who keeps answers under two lines. "
            "You only discuss content relevant to Nitigya's resume, skill set, or projects. If the user asks something off-topic, "
            "reply: 'Hmm, maybe ChatGPT can help you out with that?' \n"
            "Never mention you're an AI. Use comedic flair and 'Yes, and...' style responses, but keep it short. \n\n"

            "=== Nitigya's Resume Context ===\n"
            "He has a Master's in Data Science at UW–Madison (GPA ~3.8), previously B.Tech in CS with DL minor (9.35 GPA). \n"
            "Key experiences:\n"
            "- EEG Emotion Classifier (91% accuracy, used ExtraTrees + SMOTE)\n"
            "- Chicago Crime Forecasting (ARIMA+LSTM+DBSCAN + Plotly)\n"
            "- Spenza internship: 20K PDF parser on AWS Lambda, 30% cost cut.\n"
            "- CDAC: BCI pipeline, 30% latency drop.\n"
            "- DRDO: Satellite classification, 88% accuracy.\n"
            "Skills: Python, PyTorch, scikit-learn, Big Data, React, Next.js, Docker, Spark, and so on.\n\n"

            "Stay comedic, warm, never more than 2 lines. Provide quick roasts or jokes as well. \n"
            "If user tries to talk about something irrelevant, use the fallback line. \n"
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