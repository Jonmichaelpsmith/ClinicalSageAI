# /controllers/chat.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from services.openai_engine import create_assistant_thread, run_assistant, get_run_output

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    thread_id: Optional[str] = None

@router.post("/api/chat/send-message")
def chat_send(chat: ChatMessage):
    """
    Send a message to the OpenAI Assistant API
    
    This endpoint handles:
    1. Creating a new thread if thread_id is not provided
    2. Sending the message to the OpenAI Assistant
    3. Waiting for and retrieving the response
    4. Including relevant CSR citations in the response
    """
    thread_id = chat.thread_id or create_assistant_thread()
    run_id = run_assistant(thread_id, chat.message)
    answer = get_run_output(thread_id, run_id)

    # Dummy citations for now (extend with retrieval logic)
    return {
        "thread_id": thread_id,
        "answer": answer,
        "citations": ["CSR_2022_OBESITY_03", "CSR_2021_BMI_12"]
    }