"""
Database service for Supabase integration
Handles guestbook signatures and AI session logging
"""

import os
import uuid
from datetime import datetime
from typing import List, Dict, Optional, Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class DatabaseService:
    def __init__(self):
        """Initialize Supabase client"""
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        self.supabase: Optional[Client] = None
        
        if not self.supabase_url or not self.supabase_key:
            print("❌ Supabase credentials not found in environment variables")
            return
        
        try:
            # Create the client with proper error handling
            self.supabase = create_client(self.supabase_url, self.supabase_key)
            print("✅ Supabase client initialized successfully")
        except Exception as e:
            print(f"❌ Supabase client initialization failed: {e}")
            self.supabase = None
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.supabase is not None
    
    # Guestbook Methods
    def save_signature(self, name: str, emoji: str, image_data: str) -> Dict[str, Any]:
        """Save a guestbook signature"""
        if not self.is_connected():
            raise Exception("Database not connected")
            
        signature_data = {
            "id": str(uuid.uuid4()),
            "name": name,
            "emoji": emoji,
            "image_data": image_data,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = self.supabase.table("guestbook_signatures").insert(signature_data).execute()
        return result.data[0] if result.data else None
    
    def get_signatures(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all guestbook signatures"""
        if not self.is_connected():
            raise Exception("Database not connected")
            
        result = self.supabase.table("guestbook_signatures")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data if result.data else []
    
    def delete_signature(self, signature_id: str) -> bool:
        """Delete a signature by ID"""
        if not self.is_connected():
            raise Exception("Database not connected")
            
        result = self.supabase.table("guestbook_signatures")\
            .delete()\
            .eq("id", signature_id)\
            .execute()
        
        return len(result.data) > 0 if result.data else False
    
    # AI Session Logging Methods
    def create_session(self, session_id: Optional[str] = None, user_id: Optional[str] = None) -> str:
        """Create a new AI session or ensure an existing session_id exists in the database
        
        Args:
            session_id: Optional session ID. If provided, creates session with this ID.
                       If None, generates a new UUID.
            user_id: Optional user identifier
            
        Returns:
            The session ID (either provided or generated)
        """
        if not self.is_connected():
            raise Exception("Database not connected")
        
        # Use provided session_id or generate new one
        if session_id is None:
            session_id = str(uuid.uuid4())
        
        # Check if session already exists
        try:
            existing = self.supabase.table("ai_sessions")\
                .select("id")\
                .eq("id", session_id)\
                .execute()
            
            if existing.data and len(existing.data) > 0:
                print(f"🔍 DatabaseService: Session {session_id} already exists in database")
                return session_id
        except Exception as e:
            print(f"⚠️ DatabaseService: Error checking for existing session: {e}")
        
        # Create new session
        session_data = {
            "id": session_id,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        try:
            self.supabase.table("ai_sessions").insert(session_data).execute()
            print(f"✅ DatabaseService: Created new session {session_id}")
        except Exception as e:
            # Handle race condition - if session was created between our check and insert
            if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
                print(f"🔍 DatabaseService: Session {session_id} was created by another process (race condition)")
                return session_id
            else:
                raise
        
        return session_id
    
    def log_interaction(self, session_id: str, prompt: str, response: str, 
                            model_used: str = "gpt-4", tokens_used: Optional[int] = None) -> Dict[str, Any]:
        """Log an AI interaction"""
        if not self.is_connected():
            raise Exception("Database not connected")
        
        print(f"🔍 DatabaseService: Logging interaction for session {session_id}")
        print(f"🔍 DatabaseService: Connected to Supabase: {self.supabase is not None}")
            
        interaction_data = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "prompt": prompt,
            "response": response,
            "model_used": model_used,
            "tokens_used": tokens_used,
            "created_at": datetime.utcnow().isoformat()
        }
        
        print(f"🔍 DatabaseService: Inserting interaction data...")
        result = self.supabase.table("ai_interactions").insert(interaction_data).execute()
        print(f"🔍 DatabaseService: Insert result: {result}")
        
        # Update session timestamp
        print(f"🔍 DatabaseService: Updating session timestamp...")
        self.supabase.table("ai_sessions")\
            .update({"updated_at": datetime.utcnow().isoformat()})\
            .eq("id", session_id)\
            .execute()
        
        return result.data[0] if result.data else None
    
    def get_session_interactions(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all interactions for a session"""
        if not self.is_connected():
            raise Exception("Database not connected")
            
        result = self.supabase.table("ai_interactions")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return result.data if result.data else []
    
    def get_recent_sessions(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent AI sessions"""
        if not self.is_connected():
            raise Exception("Database not connected")
            
        result = self.supabase.table("ai_sessions")\
            .select("*")\
            .order("updated_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data if result.data else []
    
    def get_recent_interactions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent AI interactions"""
        if not self.is_connected():
            raise Exception("Database not connected")
        
        result = self.supabase.table("ai_interactions")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data if result.data else []
    
    def get_session_stats(self, session_id: str) -> Dict[str, Any]:
        """Get statistics for a session"""
        if not self.is_connected():
            raise Exception("Database not connected")
            
        # Get interaction count
        interactions_result = self.supabase.table("ai_interactions")\
            .select("id, tokens_used")\
            .eq("session_id", session_id)\
            .execute()
        
        interactions = interactions_result.data if interactions_result.data else []
        
        total_tokens = sum(i.get("tokens_used", 0) for i in interactions)
        
        return {
            "session_id": session_id,
            "total_interactions": len(interactions),
            "total_tokens": total_tokens,
            "interactions": interactions
        }

# Global instance
db_service = DatabaseService()
