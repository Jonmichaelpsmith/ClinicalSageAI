
import os
import json
import glob
from typing import List, Dict, Any, Optional

# Directory settings
METADATA_DIR = 'data/knowledge_metadata'
CONTENT_DIR = 'data/processed_knowledge'

class KnowledgeBase:
    def __init__(self):
        self.metadata_collection = self._load_metadata()
    
    def _load_metadata(self) -> List[Dict[str, Any]]:
        """Load all metadata files into memory."""
        metadata_files = glob.glob(os.path.join(METADATA_DIR, '*.json'))
        metadata_collection = []
        
        for metadata_file in metadata_files:
            if metadata_file.endswith('ingestion_summary.json'):
                continue
            
            try:
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                    metadata_collection.append(metadata)
            except Exception as e:
                print(f"Error loading metadata from {metadata_file}: {str(e)}")
        
        return metadata_collection
    
    def get_document_content(self, document_id: str) -> Optional[str]:
        """Get the content of a specific document by ID."""
        content_file = os.path.join(CONTENT_DIR, f"{document_id}.txt")
        
        try:
            with open(content_file, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error loading content from {content_file}: {str(e)}")
            return None
    
    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for documents containing the query."""
        results = []
        
        for metadata in self.metadata_collection:
            content = self.get_document_content(metadata['id'])
            
            if content and query.lower() in content.lower():
                # Calculate relevance score based on term frequency
                relevance_score = content.lower().count(query.lower())
                
                results.append({
                    "metadata": metadata,
                    "relevance_score": relevance_score
                })
        
        # Sort by relevance score
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results[:limit]
    
    def get_relevant_context(self, query: str, max_chars: int = 2000) -> str:
        """Get relevant context for a query to augment AI responses."""
        results = self.search(query, limit=3)
        
        if not results:
            return ""
        
        context_parts = []
        remaining_chars = max_chars
        
        for result in results:
            metadata = result["metadata"]
            document_id = metadata["id"]
            filename = metadata["filename"]
            
            content = self.get_document_content(document_id)
            if not content:
                continue
            
            # Find the most relevant section
            query_pos = content.lower().find(query.lower())
            if query_pos == -1:
                continue
            
            # Extract a window around the query mention
            window_size = min(remaining_chars, 500)  # Max 500 chars per document
            start = max(0, query_pos - window_size // 2)
            end = min(len(content), query_pos + len(query) + window_size // 2)
            
            excerpt = content[start:end]
            context_parts.append(f"From document '{filename}':\n{excerpt}\n")
            
            remaining_chars -= len(excerpt) + len(f"From document '{filename}':\n\n")
            if remaining_chars <= 0:
                break
        
        if context_parts:
            return "RELEVANT CONTEXT:\n" + "\n".join(context_parts)
        return ""

# Function to augment AI prompts with relevant knowledge
def augment_prompt_with_knowledge(base_prompt: str, query: str) -> str:
    """
    Augment an AI prompt with relevant knowledge from the knowledge base.
    
    Args:
        base_prompt: The original prompt to send to the AI
        query: The query to search for in the knowledge base
        
    Returns:
        An augmented prompt with relevant knowledge
    """
    kb = KnowledgeBase()
    relevant_context = kb.get_relevant_context(query)
    
    if relevant_context:
        return f"{relevant_context}\n\n{base_prompt}"
    
    return base_prompt

# Function to use in API responses to provide citations
def get_citations_for_query(query: str) -> List[Dict[str, Any]]:
    """
    Get citation information for a query to include in AI responses.
    
    Args:
        query: The query to search for in the knowledge base
        
    Returns:
        A list of citation metadata
    """
    kb = KnowledgeBase()
    results = kb.search(query)
    
    citations = []
    for result in results:
        metadata = result["metadata"]
        citations.append({
            "source": metadata["filename"],
            "source_path": metadata["source_path"],
            "extraction_date": metadata["extraction_date"]
        })
    
    return citations
