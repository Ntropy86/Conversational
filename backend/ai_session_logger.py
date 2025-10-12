"""
AI Session Logging Service
Logs all prompts and responses per session for analysis
"""

import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from database_service import db_service

class AISessionLogger:
    def __init__(self):
        """Initialize AI session logger"""
        self.current_session_id: Optional[str] = None
        self.session_start_time = None
    
    def start_session(self, user_id: Optional[str] = None) -> str:
        """Start a new AI session"""
        try:
            self.current_session_id = db_service.create_session(user_id)
            self.session_start_time = datetime.utcnow()
            print(f"Started AI session: {self.current_session_id}")
            return self.current_session_id
        except Exception as e:
            print(f"Failed to start session: {e}")
            # Fallback to local session ID
            self.current_session_id = str(uuid.uuid4())
            self.session_start_time = datetime.utcnow()
            return self.current_session_id
    
    def log_interaction(self, prompt: str, response: str, 
                       model_used: str = "gpt-4", tokens_used: Optional[int] = None,
                       session_id: Optional[str] = None) -> bool:
        """Log an AI interaction"""
        # Use provided session_id or current session
        target_session_id = session_id or self.current_session_id
        
        if not target_session_id:
            print("No active session, starting new one")
            self.start_session()
            target_session_id = self.current_session_id
        
        print(f"🔍 Attempting to log interaction for session: {target_session_id}")
        print(f"🔍 Prompt: {prompt[:50]}...")
        print(f"🔍 Response: {response[:50]}...")
        
        try:
            # Ensure the session exists in the database
            # Use the updated create_session which handles existing sessions gracefully
            try:
                db_service.create_session(session_id=target_session_id)
                print(f"✅ Ensured session exists in database: {target_session_id}")
            except Exception as session_error:
                print(f"⚠️ Session creation/verification failed: {session_error}")
                # Continue anyway - the session might already exist
            
            result = db_service.log_interaction(
                session_id=target_session_id,
                prompt=prompt,
                response=response,
                model_used=model_used,
                tokens_used=tokens_used
            )
            
            if result:
                print(f"✅ Logged interaction for session {target_session_id}")
                return True
            else:
                print(f"❌ Failed to log interaction for session {target_session_id}")
                return False
                
        except Exception as e:
            print(f"❌ Error logging interaction: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def get_session_stats(self) -> Dict[str, Any]:
        """Get current session statistics"""
        if not self.current_session_id:
            return {"error": "No active session"}
        
        try:
            return db_service.get_session_stats(self.current_session_id)
        except Exception as e:
            print(f"Error getting session stats: {e}")
            return {"error": str(e)}
    
    def get_recent_sessions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent AI sessions"""
        try:
            return db_service.get_recent_sessions(limit)
        except Exception as e:
            print(f"Error getting recent sessions: {e}")
            return []
    
    def end_session(self) -> Dict[str, Any]:
        """End current session and return stats"""
        if not self.current_session_id:
            return {"error": "No active session"}
        
        try:
            stats = self.get_session_stats()
            self.current_session_id = None
            self.session_start_time = None
            return stats
        except Exception as e:
            print(f"Error ending session: {e}")
            return {"error": str(e)}

# Global instance
ai_logger = AISessionLogger()

# Convenience functions
def start_ai_session(user_id: Optional[str] = None) -> str:
    """Start a new AI session"""
    return ai_logger.start_session(user_id)

def log_ai_interaction(prompt: str, response: str, 
                      model_used: str = "gpt-4", tokens_used: Optional[int] = None, 
                      session_id: Optional[str] = None) -> bool:
    """Log an AI interaction"""
    if session_id:
        # Use the provided session_id directly
        return ai_logger.log_interaction(prompt, response, model_used, tokens_used, session_id)
    else:
        # Use the AI logger's current session
        return ai_logger.log_interaction(prompt, response, model_used, tokens_used)

def get_ai_session_stats() -> Dict[str, Any]:
    """Get current AI session statistics"""
    return ai_logger.get_session_stats()

def end_ai_session() -> Dict[str, Any]:
    """End current AI session"""
    return ai_logger.end_session()
