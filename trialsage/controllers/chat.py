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

        # Extract comprehensive semantic citations from the answer using our advanced CSR knowledge engine
        try:
            # Import our deep semantic CSR analyzer
            from ..services.deep_csr_analyzer import extract_csr_citations_from_text
            
            # Use the deep semantic analyzer to extract relevant CSR citations
            csr_citations = extract_csr_citations_from_text(answer)
            
            # Transform the structured citations into the format expected by the frontend
            citations = []
            
            # Extract CSR citations with rich metadata
            for citation in csr_citations:
                csr_id = citation.get("csr_id", "unknown")
                relevance = citation.get("relevance", "medium")
                citation_type = citation.get("citation_type", "semantic")
                context = citation.get("context", "")
                metadata = citation.get("metadata", {})
                
                # Create a formatted citation ID that includes semantic information
                citation_id = f"CSR_{csr_id}_"
                if citation_type == "explicit":
                    citation_id += "EXPLICIT"
                else:
                    citation_id += "SEMANTIC"
                
                # Include indication in the citation if available
                if metadata and "indication" in metadata:
                    indication = metadata.get("indication", "").upper()
                    if indication and len(indication) > 0:
                        # Limit to first word of indication to keep citation IDs manageable
                        indication_word = indication.split()[0]
                        citation_id += f"_{indication_word}"
                
                # Add to citations list
                citations.append(citation_id)
            
            # Also extract academic citations using pattern matching (until we have a deeper academic integration)
            academic_triggers = ["journal", "publication", "paper", "research", "article", "literature", "meta-analysis", "systematic review"]
            for trigger in academic_triggers:
                if trigger in answer.lower():
                    citations.append(f"ACADEMIC_{trigger.upper().replace(' ', '_')}")
            
            # Add regulatory citations
            regulatory_triggers = ["fda", "ema", "nmpa", "pmda", "health canada", "mhra", "anvisa", "regulatory", "guidance", "guideline", "ich"]
            for trigger in regulatory_triggers:
                if trigger in answer.lower():
                    citations.append(f"REG_{trigger.upper().replace(' ', '_')}")
            
            # Add best practices citations
            best_practice_triggers = ["best practice", "standard", "recommendation", "consensus", "industry standard", "protocol standard"]
            for trigger in best_practice_triggers:
                if trigger in answer.lower():
                    citations.append(f"BP_{trigger.upper().replace(' ', '_')}")
            
            if not citations:
                # If deep semantic search failed to find citations, fall back to basic pattern matching
                csr_triggers = ["study", "trial", "report", "according to", "published", "clinical", "csr", "clinical study report"]
                for trigger in csr_triggers:
                    if trigger in answer.lower():
                        citations.append(f"CSR_{trigger.upper().replace(' ', '_')}")
            
            if not citations:
                # Ensure we have at least some citations
                citations = ["CSR_GENERAL_REFERENCE"]
                
        except Exception as e:
            # Log the error but continue with basic citation extraction as fallback
            import logging
            logging.error(f"Error using deep CSR citation extraction: {str(e)}")
            
            # Fall back to pattern matching
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