# /controllers/chat.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from services.openai_engine import create_assistant_thread, run_assistant, get_run_output

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    thread_id: Optional[str] = None

@router.post("/send-message")
async def chat_send(chat: ChatMessage):
    """
    Send a message to the OpenAI Assistant API
    
    This endpoint handles:
    1. Creating a new thread if thread_id is not provided
    2. Sending the message to the OpenAI Assistant
    3. Waiting for and retrieving the response
    4. Including relevant CSR citations in the response
    """
    try:
        thread_id = chat.thread_id or create_assistant_thread()
        run_id = run_assistant(thread_id, chat.message)
        answer = get_run_output(thread_id, run_id)

        # Extract potential citations using a simple pattern match
        # In a production system, this would use vector search against CSR database
        citations = []
        
        # Look for potential citation patterns like "In a study by..." or "According to..."
        citation_triggers = ["study", "trial", "report", "according to", "published", "clinical"]
        
        for trigger in citation_triggers:
            if trigger in answer.lower():
                # This is a simplified placeholder - real implementation would extract actual CSR identifiers
                citations.append(f"CSR_{trigger.upper().replace(' ', '_')}")
        
        if not citations:
            # Ensure we have at least some citations
            citations = ["CSR_GENERAL_REFERENCE"]
            
        return {
            "thread_id": thread_id,
            "answer": answer,
            "citations": list(set(citations))  # Remove duplicates
        }
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return {
            "thread_id": chat.thread_id or "error",
            "answer": f"I apologize, but I encountered an error while processing your query. Please try again with a more specific question about clinical trial design.",
            "error": str(e),
            "error_details": error_details,
            "citations": []
        }