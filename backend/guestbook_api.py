"""
Guestbook API routes with Supabase database integration
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
from database_service import db_service

router = APIRouter()

# Pydantic models
class SignatureRequest(BaseModel):
    name: str
    emoji: str
    image: str  # Base64 encoded image

class SignatureResponse(BaseModel):
    id: str
    name: str
    emoji: str
    image: str
    created_at: str

class SignatureListResponse(BaseModel):
    signatures: List[SignatureResponse]

# Dependency to check if database is available
def get_db_service():
    """Get database service"""
    try:
        return db_service
    except Exception as e:
        print(f"Database service unavailable: {e}")
        return None

@router.get("/guestbook", response_model=SignatureListResponse)
async def get_signatures(db: Optional[object] = Depends(get_db_service)):
    """Get all guestbook signatures"""
    print(f"🔍 GET /api/guestbook - DB service: {db}")
    try:
        if db:
            print("✅ Using database service")
            # Use database
            signatures = db.get_signatures(limit=100)
            print(f"✅ Found {len(signatures)} signatures from database")
            # Convert image_data to image for frontend compatibility
            converted_signatures = []
            for sig in signatures:
                converted_sig = {
                    "id": sig["id"],
                    "name": sig["name"],
                    "emoji": sig["emoji"],
                    "image": sig["image_data"],  # Convert image_data to image
                    "created_at": sig["created_at"]
                }
                converted_signatures.append(converted_sig)
            print(f"✅ Returning {len(converted_signatures)} converted signatures")
            return SignatureListResponse(signatures=converted_signatures)
        else:
            print("❌ Database service is None, using fallback")
            # Fallback to JSON file (existing logic)
            return await get_signatures_fallback()
    except Exception as e:
        print(f"❌ Error getting signatures: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to JSON file
        return await get_signatures_fallback()

@router.post("/guestbook", response_model=SignatureResponse)
async def save_signature(
    signature: SignatureRequest, 
    db: Optional[object] = Depends(get_db_service)
):
    """Save a new guestbook signature"""
    try:
        if db:
            # Use database
            result = db.save_signature(
                name=signature.name,
                emoji=signature.emoji,
                image_data=signature.image
            )
            if result:
                # Convert image_data to image for frontend compatibility
                response_data = {
                    "id": result["id"],
                    "name": result["name"],
                    "emoji": result["emoji"],
                    "image": result["image_data"],  # Convert image_data to image
                    "created_at": result["created_at"]
                }
                return SignatureResponse(**response_data)
            else:
                raise HTTPException(status_code=500, detail="Failed to save signature")
        else:
            # Fallback to JSON file
            return await save_signature_fallback(signature)
    except Exception as e:
        print(f"Error saving signature: {e}")
        # Fallback to JSON file
        return await save_signature_fallback(signature)

@router.delete("/guestbook/{signature_id}")
async def delete_signature(
    signature_id: str, 
    db: Optional[object] = Depends(get_db_service)
):
    """Delete a signature by ID"""
    try:
        if db:
            success = db.delete_signature(signature_id)
            if success:
                return {"message": "Signature deleted successfully"}
            else:
                raise HTTPException(status_code=404, detail="Signature not found")
        else:
            raise HTTPException(status_code=503, detail="Database not available")
    except Exception as e:
        print(f"Error deleting signature: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete signature")

# Fallback functions for JSON file storage
async def get_signatures_fallback():
    """Fallback to JSON file storage"""
    import json
    import os
    
    guestbook_file = os.path.join(os.getcwd(), "guestbook-signatures.json")
    
    try:
        if os.path.exists(guestbook_file):
            with open(guestbook_file, 'r') as f:
                data = json.load(f)
                return SignatureListResponse(signatures=data.get("signatures", []))
        else:
            return SignatureListResponse(signatures=[])
    except Exception as e:
        print(f"Error reading fallback file: {e}")
        return SignatureListResponse(signatures=[])

async def save_signature_fallback(signature: SignatureRequest):
    """Fallback to JSON file storage"""
    import json
    import os
    from datetime import datetime
    
    guestbook_file = os.path.join(os.getcwd(), "guestbook-signatures.json")
    
    try:
        # Read existing data
        if os.path.exists(guestbook_file):
            with open(guestbook_file, 'r') as f:
                data = json.load(f)
        else:
            data = {"signatures": []}
        
        # Create new signature
        new_signature = {
            "id": str(int(datetime.now().timestamp() * 1000)),
            "name": signature.name,
            "emoji": signature.emoji,
            "image": signature.image,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Add to beginning of list
        data["signatures"] = [new_signature] + data["signatures"]
        
        # Limit to 100 signatures
        if len(data["signatures"]) > 100:
            data["signatures"] = data["signatures"][:100]
        
        # Save back to file
        with open(guestbook_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        return SignatureResponse(**new_signature)
        
    except Exception as e:
        print(f"Error saving to fallback file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save signature")
