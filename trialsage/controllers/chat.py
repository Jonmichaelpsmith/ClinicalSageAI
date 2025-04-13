#!/usr/bin/env python3
# trialsage/controllers/chat.py
# Enhanced chat controller with semantic search, design recommendations, and risk analysis

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
import os
import json
from typing import List, Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Import local modules
try:
    from trialsage.semantic_search import search_similar_csrs
    from trialsage.design_recommendations import generate_design_from_matches
    from trialsage.deep_csr_analyzer import extract_risk_factors_from_protocol
    from trialsage.services.openai_engine import create_assistant_thread, run_assistant, get_run_output
    
    MODULES_AVAILABLE = True
    logger.info("Successfully imported all required modules")
except ImportError as e:
    MODULES_AVAILABLE = False
    logger.error(f"Failed to import modules: {str(e)}")

# Check for OpenAI API key
OPENAI_AVAILABLE = os.environ.get("OPENAI_API_KEY") is not None
if not OPENAI_AVAILABLE:
    logger.warning("OPENAI_API_KEY not found in environment. Some functionality will be limited.")

# Request model
class ChatMessage(BaseModel):
    message: str
    thread_id: Optional[str] = None
    files: Optional[List[str]] = None
    context: Optional[Dict[str, Any]] = None

# Thread-file mapping for tracking uploaded documents
# In a real implementation, this would be stored in a database
THREAD_FILES = {}

@router.post("/api/chat/send-message")
async def chat_send(chat: ChatMessage):
    """
    Enhanced chat endpoint that combines:
    1. GPT assistant for natural language responses
    2. Semantic CSR search for evidence-based results
    3. Design recommendations based on similar CSRs
    4. Risk analysis of the recommended design
    """
    if not MODULES_AVAILABLE:
        raise HTTPException(status_code=500, detail="Required modules not available")
    
    thread_id = chat.thread_id
    
    # Create a new thread if none provided
    if not thread_id:
        thread_id = create_assistant_thread()
        logger.info(f"Created new thread: {thread_id}")
        
        # Initialize thread file tracking if needed
        if thread_id not in THREAD_FILES:
            THREAD_FILES[thread_id] = []
    
    # Track files if provided
    if chat.files:
        THREAD_FILES[thread_id].extend(chat.files)
        logger.info(f"Added files to thread {thread_id}: {chat.files}")
    
    # Construct the message
    user_message = chat.message
    
    try:
        # 1. Run assistant to get natural language response
        run_id = run_assistant(thread_id, user_message)
        raw_response = get_run_output(thread_id, run_id)
        
        # 2. Perform semantic CSR search in parallel
        similar_csrs = search_similar_csrs(user_message)
        logger.info(f"Found {len(similar_csrs)} similar CSRs")
        
        # 3. Generate design recommendations based on matches
        suggested_design = generate_design_from_matches(similar_csrs)
        logger.info(f"Generated design recommendation with {len(suggested_design.get('source', []))} sources")
        
        # 4. Analyze recommended design for risks
        design_text = suggested_design.get("protocol", "")
        risks = extract_risk_factors_from_protocol(design_text)
        logger.info(f"Identified {len(risks)} potential risk factors")
        
        # Prepare the response
        response = {
            "thread_id": thread_id,
            "answer": raw_response,
            "csr_matches": similar_csrs,
            "recommended_design": suggested_design,
            "risk_flags": risks
        }
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.post("/api/chat/upload")
async def upload_file(file_data: Dict[str, Any]):
    """
    Handle file upload and associate with a thread
    
    In a real implementation, this would store the file and extract text
    """
    try:
        thread_id = file_data.get("thread_id")
        file_path = file_data.get("file_path")
        
        if not thread_id or not file_path:
            raise HTTPException(status_code=400, detail="thread_id and file_path are required")
            
        # Initialize thread tracking if needed
        if thread_id not in THREAD_FILES:
            THREAD_FILES[thread_id] = []
            
        # Add file to thread tracking
        THREAD_FILES[thread_id].append(file_path)
        
        return {
            "success": True,
            "thread_id": thread_id,
            "file_path": file_path
        }
    
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")