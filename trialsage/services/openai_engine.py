# /trialsage/services/openai_engine.py
# OpenAI service for TrialSage intelligence engine

import os
import json
import time
from typing import Dict, List, Optional, Any
from openai import OpenAI
from pathlib import Path

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Constants
TRIALSAGE_ASSISTANT_ID_FILE = Path(__file__).parent.parent / "data" / ".assistant-id"
THREAD_CACHE_DIR = Path(__file__).parent.parent / "data" / "threads"

# GPT Model settings
GPT_MODEL = "gpt-4o"  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024
EMBEDDING_MODEL = "text-embedding-3-large"

# Create necessary directories
THREAD_CACHE_DIR.mkdir(parents=True, exist_ok=True)
(Path(__file__).parent.parent / "data").mkdir(parents=True, exist_ok=True)

def get_or_create_assistant() -> str:
    """Get existing assistant ID or create a new one"""
    if TRIALSAGE_ASSISTANT_ID_FILE.exists():
        return TRIALSAGE_ASSISTANT_ID_FILE.read_text().strip()
    
    # Assistant doesn't exist, create one
    assistant = client.beta.assistants.create(
        name="TrialSage Assistant",
        description="Expert in clinical trial protocol design and regulatory documentation",
        instructions="""
        You are TrialSage, an AI specialized in clinical trial protocol design and regulatory documentation.
        
        Your capabilities include:
        1. Generating evidence-based clinical trial protocols
        2. Creating IND Module sections (2.5, 2.7, etc.)
        3. Developing Statistical Analysis Plans (SAPs)
        4. Analyzing clinical study reports (CSRs)
        5. Providing regulatory guidance and risk analysis
        
        Always base your recommendations on scientific evidence and regulatory standards from FDA, EMA, and ICH.
        Cite specific CSRs and clinical trials when providing recommendations.
        Structure your responses with clear sections and use Markdown formatting.
        
        When analyzing protocols, evaluate:
        - Appropriate endpoints for the indication
        - Statistically sound sample size calculation
        - Regulatory-compliant eligibility criteria
        - Suitable control arms and randomization strategy
        - Comprehensive safety monitoring plan
        """,
        model=GPT_MODEL,
        tools=[{"type": "code_interpreter"}],
    )
    
    # Save the assistant ID
    TRIALSAGE_ASSISTANT_ID_FILE.write_text(assistant.id)
    return assistant.id

def create_thread() -> Dict[str, Any]:
    """Create a new thread for conversation context"""
    thread = client.beta.threads.create()
    return {"id": thread.id}

def add_message_to_thread(thread_id: str, content: str, role: str = "user") -> Dict[str, Any]:
    """Add a message to an existing thread"""
    message = client.beta.threads.messages.create(
        thread_id=thread_id,
        role=role,
        content=content
    )
    return {"id": message.id, "thread_id": thread_id}

def create_assistant_thread() -> str:
    """Create a new thread and return its ID"""
    thread = create_thread()
    return thread["id"]

def run_assistant(thread_id: str, message: str, assistant_id: Optional[str] = None) -> str:
    """
    Run the assistant on a thread with a new message
    
    Args:
        thread_id: The ID of the thread to use
        message: The message to add to the thread
        assistant_id: Optional assistant ID (will use default if not provided)
        
    Returns:
        The run ID
    """
    # Add the message to the thread
    add_message_to_thread(thread_id, message)
    
    # Get assistant ID
    if not assistant_id:
        assistant_id = get_or_create_assistant()
    
    # Create the run
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id
    )
    
    return run.id

def get_run_status(thread_id: str, run_id: str) -> Dict[str, Any]:
    """Get the status of an assistant run"""
    run = client.beta.threads.runs.retrieve(
        thread_id=thread_id,
        run_id=run_id
    )
    return {
        "id": run.id,
        "thread_id": thread_id,
        "status": run.status,
        "last_error": run.last_error
    }

def wait_for_completion(thread_id: str, run_id: str, timeout: int = 300) -> Dict[str, Any]:
    """Wait for a run to complete with timeout"""
    start_time = time.time()
    while True:
        run_status = get_run_status(thread_id, run_id)
        
        if run_status["status"] in ["completed", "failed", "cancelled", "expired"]:
            return run_status
        
        # Check timeout
        if time.time() - start_time > timeout:
            # Cancel the run if it's taking too long
            client.beta.threads.runs.cancel(thread_id=thread_id, run_id=run_id)
            raise TimeoutError(f"Assistant run timed out after {timeout} seconds")
        
        # Wait before checking again (polling interval)
        time.sleep(2)

def get_messages(thread_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get messages from a thread"""
    messages = client.beta.threads.messages.list(
        thread_id=thread_id,
        limit=limit
    )
    
    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content[0].text.value if msg.content else "",
            "created_at": msg.created_at
        }
        for msg in messages.data
    ]

def extract_structured_data(text: str) -> Dict[str, Any]:
    """Extract structured data from text response"""
    # Try to find JSON in the text
    try:
        # Look for json patterns {..} or ```json .. ```
        json_match = text.split("```json")
        if len(json_match) > 1:
            json_text = json_match[1].split("```")[0].strip()
            return json.loads(json_text)
        
        # Default JSON extraction attempt
        sections = {}
        
        # Extract potential citations
        citation_section = text.lower().find("citations:")
        reference_section = text.lower().find("references:")
        
        # Find the earlier section marker
        section_marker = -1
        if citation_section >= 0 and reference_section >= 0:
            section_marker = min(citation_section, reference_section)
        elif citation_section >= 0:
            section_marker = citation_section
        elif reference_section >= 0:
            section_marker = reference_section
            
        if section_marker >= 0:
            sections["recommendation"] = text[:section_marker].strip()
            citation_text = text[section_marker:].strip()
            
            # Extract citations as list
            citations = []
            for line in citation_text.split("\n")[1:]:  # Skip the "Citations:" header
                if line.strip():
                    citations.append(line.strip())
            sections["citations"] = citations
        else:
            sections["recommendation"] = text
            sections["citations"] = []
        
        return sections
    except Exception as e:
        # If any issues parsing, return the raw text
        return {
            "recommendation": text,
            "citations": []
        }

def generate_protocol_from_evidence(
    indication: str, 
    thread_id: Optional[str] = None,
    phase: str = "Phase II",
    primary_endpoint: Optional[str] = None
) -> Dict[str, Any]:
    """Generate protocol suggestions based on evidence"""
    # Use existing thread or create new one
    if not thread_id:
        thread = create_thread()
        thread_id = thread["id"]
    
    # Structured protocol prompt
    system_message = f"""
    Please generate a detailed clinical trial protocol for a {phase} study in {indication}.
    
    Include the following sections:
    1. Study Design: Type, randomization, blinding, duration, control arm
    2. Eligibility Criteria: Key inclusion and exclusion criteria
    3. Endpoints: Primary and key secondary endpoints with clear definitions
    4. Treatment Plan: Dosing, schedule, administration
    5. Safety Assessments: Key safety parameters and monitoring
    6. Statistical Considerations: Sample size, analysis populations, key analyses
    
    {f'The primary endpoint should be: {primary_endpoint}' if primary_endpoint else ''}
    
    Format your response with clear section headers. After your protocol, include a "Citations:" section listing relevant clinical trials that inform this design.
    
    Use only real, evidence-based approaches from published literature or clinical trials. Be specific with numbers, criteria, and dosing.
    """
    
    # Add messages to thread
    add_message_to_thread(thread_id, system_message)
    
    # Run the assistant
    assistant_id = get_or_create_assistant()
    run = run_assistant(thread_id, assistant_id)
    
    # Wait for completion
    run_status = wait_for_completion(thread_id, run["id"])
    
    if run_status["status"] != "completed":
        raise Exception(f"Assistant run failed with status: {run_status['status']}")
    
    # Get the messages
    messages = get_messages(thread_id)
    
    # Find the latest assistant response
    assistant_messages = [msg for msg in messages if msg["role"] == "assistant"]
    if not assistant_messages:
        raise Exception("No assistant response found")
    
    latest_response = assistant_messages[0]["content"]
    
    # Process the response to extract structured data
    protocol_data = extract_structured_data(latest_response)
    
    # Generate IND 2.5 and risk analysis in parallel
    ind_prompt = f"""
    Based on the protocol for {indication} ({phase}), please generate a detailed IND Module 2.5 (Clinical Overview).
    
    Include these key sections:
    1. Overview of Clinical Pharmacology
    2. Overview of Clinical Efficacy
    3. Overview of Clinical Safety 
    4. Benefit-Risk Assessment
    
    Format your response as a well-structured document with clear section headers.
    """
    
    risk_prompt = f"""
    Based on the protocol for {indication} ({phase}), please generate a comprehensive regulatory risk analysis.
    
    Identify potential regulatory concerns in these categories:
    1. Study Design and Control Selection
    2. Endpoint Appropriateness
    3. Statistical Approach 
    4. Safety Monitoring
    5. Eligibility Criteria
    
    For each risk, provide a specific mitigation strategy.
    """
    
    # Add the IND 2.5 prompt
    add_message_to_thread(thread_id, ind_prompt)
    ind_run = run_assistant(thread_id, assistant_id)
    ind_status = wait_for_completion(thread_id, ind_run["id"])
    
    if ind_status["status"] != "completed":
        # If IND generation fails, continue with what we have
        ind_module_2_5 = {"section": "2.5", "content": "IND Module 2.5 generation failed. Please try again."}
    else:
        # Get the IND 2.5 content
        messages = get_messages(thread_id)
        ind_content = [msg["content"] for msg in messages if msg["role"] == "assistant"][0]
        ind_module_2_5 = {"section": "2.5", "content": ind_content}
    
    # Add the risk analysis prompt
    add_message_to_thread(thread_id, risk_prompt)
    risk_run = run_assistant(thread_id, assistant_id)
    risk_status = wait_for_completion(thread_id, risk_run["id"])
    
    if risk_status["status"] != "completed":
        # If risk analysis fails, continue with what we have
        risk_summary = "Risk analysis generation failed. Please try again."
    else:
        # Get the risk analysis content
        messages = get_messages(thread_id)
        risk_summary = [msg["content"] for msg in messages if msg["role"] == "assistant"][0]
    
    # Return the complete package
    return {
        "recommendation": protocol_data.get("recommendation", ""),
        "citations": protocol_data.get("citations", []),
        "ind_module_2_5": ind_module_2_5,
        "risk_summary": risk_summary,
        "thread_id": thread_id
    }

def generate_ind_section(
    study_id: str,
    section: str,
    context: str,
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """Generate a specific IND section or other document"""
    # Use existing thread or create new one
    if not thread_id:
        thread = create_thread()
        thread_id = thread["id"]
    
    # Craft appropriate prompt based on section
    if section.lower() == "evidence":
        prompt = f"""
        Find evidence in the clinical trial literature related to the following topic for {study_id}:
        
        {context}
        
        Please provide:
        1. Summary of key evidence
        2. Specific citations from relevant clinical trials
        3. Implications for protocol design
        """
    elif section.lower() == "quote":
        prompt = f"""
        For the following citation:
        
        {context}
        
        Please extract a direct supporting quote or key finding that would be relevant for protocol design.
        """
    elif section.lower() == "sap":
        prompt = f"""
        Generate a detailed Statistical Analysis Plan (SAP) for study {study_id} based on this context:
        
        {context}
        
        Include:
        1. Analysis populations
        2. Primary analysis methods 
        3. Secondary analyses
        4. Handling of missing data
        5. Sensitivity analyses
        6. Interim analyses (if applicable)
        7. Sample size justification
        
        Provide specific statistical tests, confidence intervals, and methods.
        """
    else:
        # General IND section generation
        prompt = f"""
        Generate content for IND Module {section} for study {study_id}.
        
        Context: {context}
        
        Provide detailed and specific content appropriate for submission to regulatory authorities.
        Use proper regulatory language and structure according to ICH/FDA guidelines.
        """
    
    # Add message to thread
    add_message_to_thread(thread_id, prompt)
    
    # Run the assistant
    assistant_id = get_or_create_assistant()
    run = run_assistant(thread_id, assistant_id)
    
    # Wait for completion
    run_status = wait_for_completion(thread_id, run["id"])
    
    if run_status["status"] != "completed":
        raise Exception(f"Assistant run failed with status: {run_status['status']}")
    
    # Get the messages
    messages = get_messages(thread_id)
    
    # Find the latest assistant response
    assistant_messages = [msg for msg in messages if msg["role"] == "assistant"]
    if not assistant_messages:
        raise Exception("No assistant response found")
    
    content = assistant_messages[0]["content"]
    
    # Return structured response
    return {
        "section": section,
        "content": content,
        "thread_id": thread_id
    }

def get_run_output(thread_id: str, run_id: str) -> str:
    """
    Wait for a run to complete and return the assistant's response
    
    Args:
        thread_id: The thread ID
        run_id: The run ID
        
    Returns:
        The text response from the assistant
    """
    # Wait for completion
    run_status = wait_for_completion(thread_id, run_id)
    
    if run_status["status"] != "completed":
        raise Exception(f"Assistant run failed with status: {run_status['status']}")
    
    # Get the messages
    messages = get_messages(thread_id)
    
    # Find the latest assistant response
    assistant_messages = [msg for msg in messages if msg["role"] == "assistant"]
    if not assistant_messages:
        raise Exception("No assistant response found")
    
    latest_response = assistant_messages[0]["content"]
    return latest_response

def generate_text_embedding(text: str) -> List[float]:
    """Generate embedding for text using OpenAI's embedding model"""
    response = client.embeddings.create(
        input=text,
        model=EMBEDDING_MODEL
    )
    return response.data[0].embedding