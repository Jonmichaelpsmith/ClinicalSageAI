#!/usr/bin/env python3
# trialsage/services/openai_engine.py
# OpenAI service for Assistants API integration

import os
import time
import logging
from typing import Optional, Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Check for OpenAI
try:
    import openai
    
    # Set OpenAI API key if available
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        openai.api_key = api_key
        OPENAI_AVAILABLE = True
        logger.info("OpenAI API key found, enabling OpenAI assistant")
    else:
        OPENAI_AVAILABLE = False
        logger.warning("OpenAI API key not found. Using fallback assistant methods")
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI module not available. Using fallback assistant methods")

# Assistant ID - this would be set when you create your assistant in the OpenAI platform
# In a real implementation, this should be stored in environment variables
ASSISTANT_ID = os.environ.get("OPENAI_ASSISTANT_ID")

def create_assistant_thread() -> str:
    """
    Create a new thread for the OpenAI Assistant
    
    Returns:
        thread_id: The ID of the created thread
    """
    if not OPENAI_AVAILABLE:
        return f"fallback-thread-{int(time.time())}"
    
    try:
        thread = openai.beta.threads.create()
        logger.info(f"Created new thread: {thread.id}")
        return thread.id
    except Exception as e:
        logger.error(f"Error creating thread: {str(e)}")
        return f"fallback-thread-{int(time.time())}"

def run_assistant(thread_id: str, message: str) -> str:
    """
    Run the assistant on a thread with a user message
    
    Args:
        thread_id: The thread ID
        message: The user message
        
    Returns:
        run_id: The run ID
    """
    if not OPENAI_AVAILABLE:
        return f"fallback-run-{int(time.time())}"
    
    try:
        # Add the message to the thread
        openai.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=message
        )
        
        # Create a run
        run = openai.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=ASSISTANT_ID,
            instructions="""
            You are TrialSage, an expert in clinical trial design, analysis, and interpretation.
            Provide evidence-based responses using insights from Clinical Study Reports (CSRs).
            Focus on helping biomedical researchers design better trials by offering:
            
            1. Relevant CSR references for trial design parameters
            2. Benchmarking information for endpoints, duration, and sample sizes
            3. Scientific rationale based on precedent and regulatory expectations
            4. Risk assessment for proposed trial designs
            
            Always cite your sources and provide specific details from relevant CSRs.
            """
        )
        
        logger.info(f"Created new run: {run.id} for thread: {thread_id}")
        return run.id
    except Exception as e:
        logger.error(f"Error running assistant: {str(e)}")
        return f"fallback-run-{int(time.time())}"

def get_run_output(thread_id: str, run_id: str, timeout: int = 60) -> str:
    """
    Get the assistant's response from a run
    
    Args:
        thread_id: The thread ID
        run_id: The run ID
        timeout: Maximum time to wait for the run to complete (in seconds)
        
    Returns:
        response: The assistant's response
    """
    if not OPENAI_AVAILABLE or run_id.startswith("fallback-run-"):
        return _generate_fallback_response()
    
    try:
        # Wait for the run to complete
        start_time = time.time()
        while time.time() - start_time < timeout:
            run = openai.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run_id
            )
            
            if run.status == "completed":
                # Get the assistant's messages
                messages = openai.beta.threads.messages.list(
                    thread_id=thread_id
                )
                
                # Get the latest assistant message
                for message in messages.data:
                    if message.role == "assistant":
                        # Extract text content from the message
                        content = message.content[0].text.value
                        return content
                
                # If we didn't find any assistant messages
                return "No response generated."
            
            elif run.status in ["failed", "cancelled", "expired"]:
                logger.error(f"Run failed with status: {run.status}")
                return f"The assistant encountered an error: {run.status}"
            
            # Sleep before checking again
            time.sleep(1)
        
        # If we timed out
        logger.warning(f"Run timed out after {timeout} seconds")
        return "The assistant is taking too long to respond. Please try again later."
    
    except Exception as e:
        logger.error(f"Error getting run output: {str(e)}")
        return _generate_fallback_response()

def _generate_fallback_response() -> str:
    """
    Generate a fallback response when OpenAI is unavailable
    
    Returns:
        response: A fallback response
    """
    return """
    I'm currently operating in fallback mode due to API connectivity issues.
    
    In a fully operational state, I would provide:
    1. Evidence-based protocol recommendations
    2. Statistical benchmarks from relevant CSRs
    3. Risk assessment for your study design
    
    Please check your OpenAI API key configuration to enable full functionality.
    """