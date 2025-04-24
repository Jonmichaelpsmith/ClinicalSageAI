"""
ICH Guidelines Indexer Module for ICH Wiz

This module handles the indexing of ICH guidelines documents
into a vector database using OpenAI embeddings and Pinecone.
"""
import json
import os
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Set

import openai
import pinecone
import structlog

from services.ich_wiz.config import settings

# Set up logging
logger = structlog.get_logger(__name__)

# Configure OpenAI
openai.api_key = settings.OPENAI_API_KEY

# Initialize Pinecone
try:
    pinecone.init(
        api_key=settings.PINECONE_API_KEY,
        environment=settings.PINECONE_ENVIRONMENT
    )
    logger.info("Pinecone initialized successfully")
except Exception as e:
    logger.error("Failed to initialize Pinecone", error=str(e))
    raise

# Create index if it doesn't exist
def ensure_index_exists() -> None:
    """
    Ensure the Pinecone index exists, creating it if necessary.
    """
    try:
        if settings.PINECONE_INDEX_NAME not in pinecone.list_indexes():
            pinecone.create_index(
                name=settings.PINECONE_INDEX_NAME,
                dimension=3072,  # Dimension for text-embedding-3-large
                metric="cosine"
            )
            logger.info("Created Pinecone index", index_name=settings.PINECONE_INDEX_NAME)
        else:
            logger.info("Pinecone index already exists", index_name=settings.PINECONE_INDEX_NAME)
    except Exception as e:
        logger.error("Failed to create Pinecone index", error=str(e))
        raise


# Get the index
def get_index():
    """
    Get the Pinecone index.
    """
    try:
        return pinecone.Index(settings.PINECONE_INDEX_NAME)
    except Exception as e:
        logger.error("Failed to get Pinecone index", error=str(e))
        raise


# Text chunking function
def chunk_text(text: str, chunk_size: int = None, chunk_overlap: int = None) -> List[str]:
    """
    Split text into chunks of specified size with overlap.
    
    Args:
        text: The text to split
        chunk_size: Size of each chunk in characters
        chunk_overlap: Overlap between chunks in characters
        
    Returns:
        List of text chunks
    """
    if chunk_size is None:
        chunk_size = settings.CHUNK_SIZE
    if chunk_overlap is None:
        chunk_overlap = settings.CHUNK_OVERLAP
    
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        # If we're not at the beginning, back up to include overlap
        if start > 0:
            start = start - chunk_overlap
        
        # Extract the chunk
        chunk = text[start:end]
        chunks.append(chunk)
        
        # Move to next position
        start = end
    
    return chunks


# Create embeddings for text chunks
def create_embeddings(chunks: List[str]) -> List[List[float]]:
    """
    Create embeddings for a list of text chunks.
    
    Args:
        chunks: List of text chunks
        
    Returns:
        List of embeddings (vectors)
    """
    try:
        embeddings = []
        for i in range(0, len(chunks), 10):  # Process in batches of 10
            batch = chunks[i:i+10]
            response = openai.embeddings.create(
                input=batch,
                model=settings.OPENAI_EMBEDDING_MODEL
            )
            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)
            
            # Rate limiting - sleep a bit to avoid hitting OpenAI rate limits
            if i + 10 < len(chunks):
                time.sleep(0.5)
                
        return embeddings
    except Exception as e:
        logger.error("Failed to create embeddings", error=str(e))
        raise


# Index a document
def index_document(
    file_path: Path,
    document_type: str,
    metadata: Dict[str, Any]
) -> Tuple[int, Set[str]]:
    """
    Index a document by chunking its text, creating embeddings,
    and storing them in Pinecone.
    
    Args:
        file_path: Path to the document
        document_type: Type of document (e.g., "ich_guideline", "csr")
        metadata: Additional metadata about the document
        
    Returns:
        Tuple of (count of vectors indexed, set of vector IDs created)
    """
    try:
        # Read file content
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
        
        # Create a document ID from the file name
        doc_id = file_path.stem
        
        # Add basic metadata
        base_metadata = {
            "document_id": doc_id,
            "document_type": document_type,
            "file_name": file_path.name,
            "indexed_at": time.time(),
            **metadata
        }
        
        # Chunk the text
        chunks = chunk_text(text)
        logger.info("Document chunked", document_id=doc_id, chunk_count=len(chunks))
        
        # Create embeddings
        embeddings = create_embeddings(chunks)
        logger.info("Embeddings created", document_id=doc_id, embedding_count=len(embeddings))
        
        # Store in Pinecone
        index = get_index()
        
        # Create vector IDs and prepare items for upsert
        vector_ids = set()
        vectors_to_upsert = []
        
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            # Create a unique vector ID
            vector_id = f"{doc_id}_{i}"
            vector_ids.add(vector_id)
            
            # Create metadata for this chunk
            chunk_metadata = {
                **base_metadata,
                "chunk_index": i,
                "text": chunk[:1000],  # Store first 1000 chars of text for context
            }
            
            # Add to upsert batch
            vectors_to_upsert.append({
                "id": vector_id,
                "values": embedding,
                "metadata": chunk_metadata
            })
        
        # Upsert in batches of 100
        batch_size = 100
        for i in range(0, len(vectors_to_upsert), batch_size):
            batch = vectors_to_upsert[i:i+batch_size]
            index.upsert(vectors=batch)
            logger.info("Upserted batch", document_id=doc_id, batch_size=len(batch), 
                       start_index=i, end_index=min(i+batch_size, len(vectors_to_upsert)))
        
        return len(vectors_to_upsert), vector_ids
    
    except Exception as e:
        logger.error("Failed to index document", file_path=str(file_path), error=str(e))
        raise


# Get processed files registry
def get_processed_files() -> Dict[str, Any]:
    """
    Get the registry of processed files.
    
    Returns:
        Dictionary mapping file paths to metadata about processing
    """
    registry_path = settings.get_processed_file()
    if not registry_path.exists():
        return {}
    
    try:
        with open(registry_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("Failed to load processed files registry", error=str(e))
        return {}


# Save processed files registry
def save_processed_files(registry: Dict[str, Any]) -> None:
    """
    Save the registry of processed files.
    
    Args:
        registry: Dictionary mapping file paths to metadata about processing
    """
    registry_path = settings.get_processed_file()
    
    try:
        with open(registry_path, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2)
        logger.info("Saved processed files registry", file_count=len(registry))
    except Exception as e:
        logger.error("Failed to save processed files registry", error=str(e))
        raise


# Mark a file as processed
def mark_as_processed(
    file_path: Path,
    document_type: str,
    vector_count: int,
    vector_ids: Set[str],
    metadata: Dict[str, Any]
) -> None:
    """
    Mark a file as processed in the registry.
    
    Args:
        file_path: Path to the document
        document_type: Type of document
        vector_count: Number of vectors indexed
        vector_ids: Set of vector IDs created
        metadata: Additional metadata about the document
    """
    registry = get_processed_files()
    
    # Use relative path as key
    key = str(file_path)
    
    registry[key] = {
        "file_name": file_path.name,
        "document_type": document_type,
        "vector_count": vector_count,
        "vector_ids": list(vector_ids),
        "processed_at": time.time(),
        "metadata": metadata
    }
    
    save_processed_files(registry)
    logger.info("Marked file as processed", file_path=key, vector_count=vector_count)


# Check if a file has been processed
def is_processed(file_path: Path) -> bool:
    """
    Check if a file has been processed.
    
    Args:
        file_path: Path to the document
        
    Returns:
        True if the file has been processed, False otherwise
    """
    registry = get_processed_files()
    return str(file_path) in registry


# Search for similar text in the index
def search_similar(
    query: str,
    filter_dict: Optional[Dict[str, Any]] = None,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Search for text similar to the query in the index.
    
    Args:
        query: The query text
        filter_dict: Optional filter dictionary for Pinecone
        top_k: Number of results to return
        
    Returns:
        List of matching results with scores and metadata
    """
    try:
        # Create embedding for query
        response = openai.embeddings.create(
            input=[query],
            model=settings.OPENAI_EMBEDDING_MODEL
        )
        query_embedding = response.data[0].embedding
        
        # Search in Pinecone
        index = get_index()
        
        results = index.query(
            vector=query_embedding,
            filter=filter_dict,
            top_k=top_k,
            include_metadata=True
        )
        
        # Format results
        formatted_results = []
        for match in results.matches:
            formatted_results.append({
                "score": match.score,
                "vector_id": match.id,
                "metadata": match.metadata
            })
        
        return formatted_results
    
    except Exception as e:
        logger.error("Failed to search for similar text", error=str(e))
        raise


# Delete document from index
def delete_document(document_id: str) -> None:
    """
    Delete a document from the index.
    
    Args:
        document_id: ID of the document to delete
    """
    try:
        # Get registry to find vector IDs
        registry = get_processed_files()
        
        vector_ids = []
        registry_updates = {}
        
        # Find all entries for this document
        for file_path, metadata in registry.items():
            if document_id in file_path or metadata.get("metadata", {}).get("document_id") == document_id:
                vector_ids.extend(metadata.get("vector_ids", []))
                # Mark for removal from registry
                registry_updates[file_path] = None
        
        if not vector_ids:
            logger.warning("No vectors found for document ID", document_id=document_id)
            return
        
        # Delete from Pinecone
        index = get_index()
        index.delete(ids=vector_ids)
        logger.info("Deleted vectors from index", document_id=document_id, vector_count=len(vector_ids))
        
        # Update registry
        for file_path in registry_updates:
            if registry_updates[file_path] is None:
                del registry[file_path]
        
        save_processed_files(registry)
        logger.info("Updated registry after deletion", document_id=document_id)
    
    except Exception as e:
        logger.error("Failed to delete document from index", document_id=document_id, error=str(e))
        raise


# Initialize the indexer
def initialize():
    """
    Initialize the indexer.
    """
    ensure_index_exists()
    
    # Create required directories
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    os.makedirs(settings.GUIDELINES_DIR, exist_ok=True)
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    
    logger.info("Indexer initialized successfully")


# Main execution
if __name__ == "__main__":
    initialize()