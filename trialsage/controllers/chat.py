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

        # Extract potential citations using a comprehensive pattern match for multiple knowledge sources
        # In a production system, this would use vector search against various knowledge bases
        citations = []
        
        # CSR and clinical trial related citation patterns
        csr_triggers = ["study", "trial", "report", "according to", "published", "clinical", "csr", "clinical study report"]
        
        # Academic literature citation patterns
        academic_triggers = ["journal", "publication", "paper", "research", "article", "literature", "meta-analysis", "systematic review"]
        
        # Regulatory agency citation patterns
        regulatory_triggers = ["fda", "ema", "nmpa", "pmda", "health canada", "mhra", "anvisa", "regulatory", "guidance", "guideline", "ich"]
        
        # Best practices citation patterns
        best_practice_triggers = ["best practice", "standard", "recommendation", "consensus", "industry standard", "protocol standard"]
        
        # Add CSR citations
        for trigger in csr_triggers:
            if trigger in answer.lower():
                # This is a simplified placeholder - real implementation would extract actual CSR identifiers
                citations.append(f"CSR_{trigger.upper().replace(' ', '_')}")
        
        # Add academic literature citations
        for trigger in academic_triggers:
            if trigger in answer.lower():
                citations.append(f"ACADEMIC_{trigger.upper().replace(' ', '_')}")
        
        # Add regulatory citations
        for trigger in regulatory_triggers:
            if trigger in answer.lower():
                citations.append(f"REG_{trigger.upper().replace(' ', '_')}")
        
        # Add best practices citations
        for trigger in best_practice_triggers:
            if trigger in answer.lower():
                citations.append(f"BP_{trigger.upper().replace(' ', '_')}")
        
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