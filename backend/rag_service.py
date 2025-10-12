"""
RAG Service for Semantic Search on Resume Data
Uses sentence-transformers for embeddings and cosine similarity for search
"""

import json
import numpy as np
from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer
from pathlib import Path

class ResumeRAG:
    def __init__(self, resume_data_path: str = "resume_data.json"):
        """Initialize RAG with resume data"""
        print("🔧 Initializing Resume RAG service...")
        
        # Load lightweight embedding model (all-MiniLM-L6-v2: 384 dims, 80MB)
        print("📦 Loading embedding model (all-MiniLM-L6-v2)...")
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        
        # Load resume data
        with open(resume_data_path, 'r') as f:
            self.resume_data = json.load(f)
        
        # Build vector index
        self.items = []
        self.embeddings = []
        self._build_index()
        
        print(f"✅ RAG initialized with {len(self.items)} items")
    
    def _build_index(self):
        """Build vector index from resume items"""
        print("🏗️ Building vector index...")
        
        # Process each section
        sections = [
            ('projects', self.resume_data.get('projects', [])),
            ('experience', self.resume_data.get('experience', [])),
            ('publications', self.resume_data.get('publications', [])),
            ('education', self.resume_data.get('education', []))
        ]
        
        texts_to_embed = []
        
        for section_name, items in sections:
            for item in items:
                # Create rich text representation for embedding
                text_parts = []
                
                # Add title/name/role
                if 'title' in item:
                    text_parts.append(item['title'])
                if 'role' in item:
                    text_parts.append(item['role'])
                if 'name' in item:
                    text_parts.append(item['name'])
                
                # Add description
                if 'description' in item:
                    if isinstance(item['description'], list):
                        text_parts.extend(item['description'][:2])  # First 2 bullet points
                    else:
                        text_parts.append(item['description'])
                
                # Add key details
                if 'key_details' in item:
                    text_parts.extend(item['key_details'][:2])
                
                # Add tech stack (important for matching!)
                if 'tech_stack' in item and item['tech_stack']:
                    if isinstance(item['tech_stack'], list):
                        text_parts.append("Technologies: " + ", ".join(item['tech_stack'][:6]))
                    elif isinstance(item['tech_stack'], dict):
                        # If tech_stack is a dict, get all values
                        all_techs = []
                        for techs in item['tech_stack'].values():
                            if isinstance(techs, list):
                                all_techs.extend(techs)
                        if all_techs:
                            text_parts.append("Technologies: " + ", ".join(all_techs[:6]))
                
                if 'technologies' in item and item['technologies']:
                    if isinstance(item['technologies'], list):
                        text_parts.append("Technologies: " + ", ".join(item['technologies'][:6]))
                
                # Add company/university/journal
                if 'company' in item:
                    text_parts.append(f"Company: {item['company']}")
                if 'university' in item:
                    text_parts.append(f"University: {item['university']}")
                if 'journal' in item:
                    text_parts.append(f"Published in: {item['journal']}")
                
                # Combine into single text
                combined_text = " | ".join(text_parts)
                
                # Store item with metadata
                self.items.append({
                    'item': item,
                    'section': section_name,
                    'text': combined_text
                })
                texts_to_embed.append(combined_text)
        
        # Create embeddings (batch for efficiency)
        print(f"🔢 Generating embeddings for {len(texts_to_embed)} items...")
        self.embeddings = self.model.encode(texts_to_embed, show_progress_bar=False)
        print(f"✅ Embeddings created: shape {self.embeddings.shape}")
    
    def semantic_search(
        self, 
        query: str, 
        top_k: int = 10,
        min_score: float = 0.3,
        section_filter: List[str] = None
    ) -> List[Tuple[Dict[Any, Any], float]]:
        """
        Perform semantic search on resume items
        
        Args:
            query: Search query
            top_k: Number of results to return
            min_score: Minimum similarity score (0-1)
            section_filter: Filter by sections (e.g., ['projects', 'experience'])
        
        Returns:
            List of (item, score) tuples sorted by relevance
        """
        # Embed query
        query_embedding = self.model.encode(query, show_progress_bar=False)
        
        # Compute cosine similarities
        similarities = np.dot(self.embeddings, query_embedding) / (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_embedding)
        )
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[::-1][:top_k * 2]  # Get 2x for filtering
        
        # Filter and collect results
        results = []
        for idx in top_indices:
            score = similarities[idx]
            
            # Skip if below threshold
            if score < min_score:
                continue
            
            item_data = self.items[idx]
            
            # Apply section filter if specified
            if section_filter and item_data['section'] not in section_filter:
                continue
            
            results.append((item_data['item'], float(score)))
            
            if len(results) >= top_k:
                break
        
        return results
    
    def get_relevant_context(
        self, 
        query: str, 
        top_k: int = 4,
        section_filter: List[str] = None
    ) -> Dict[str, Any]:
        """
        Get relevant context for LLM
        
        Returns:
            {
                'items': [list of relevant items],
                'scores': [similarity scores],
                'total_results': int,
                'search_query': str
            }
        """
        results = self.semantic_search(query, top_k=top_k, section_filter=section_filter)
        
        if not results:
            return {
                'items': [],
                'scores': [],
                'total_results': 0,
                'search_query': query
            }
        
        items = [item for item, score in results]
        scores = [score for item, score in results]
        
        return {
            'items': items,
            'scores': scores,
            'total_results': len(results),
            'search_query': query,
            'avg_score': float(np.mean(scores)) if scores else 0.0
        }


# Singleton instance (lazy loaded)
_rag_instance = None

def get_rag() -> ResumeRAG:
    """Get or create RAG instance (singleton pattern)"""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = ResumeRAG()
    return _rag_instance


if __name__ == "__main__":
    # Test the RAG service
    print("\n" + "="*60)
    print("Testing Resume RAG Service")
    print("="*60 + "\n")
    
    rag = ResumeRAG()
    
    # Test 1: Technical query
    print("Test 1: 'machine learning projects'")
    results = rag.semantic_search("machine learning projects", top_k=3)
    for item, score in results:
        title = item.get('title', item.get('role', 'Unknown'))
        print(f"  - {title} (score: {score:.3f})")
    print()
    
    # Test 2: Conceptual query
    print("Test 2: 'distributed systems and scalability'")
    results = rag.semantic_search("distributed systems and scalability", top_k=3)
    for item, score in results:
        title = item.get('title', item.get('role', 'Unknown'))
        print(f"  - {title} (score: {score:.3f})")
    print()
    
    # Test 3: Technology query
    print("Test 3: 'python and fastapi backend'")
    results = rag.semantic_search("python and fastapi backend", top_k=3)
    for item, score in results:
        title = item.get('title', item.get('role', 'Unknown'))
        print(f"  - {title} (score: {score:.3f})")
    print()
    
    print("✅ RAG tests complete!")

