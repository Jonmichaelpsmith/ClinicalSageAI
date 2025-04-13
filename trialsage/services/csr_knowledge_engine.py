# trialsage/services/csr_knowledge_engine.py
# Advanced CSR Knowledge Engine for Deep Clinical Study Report Analysis

import os
import json
import time
import logging
from typing import Dict, List, Any, Optional, Tuple, Set
from pathlib import Path
import re
from openai import OpenAI
import numpy as np
from .openai_engine import generate_text_embedding, GPT_MODEL

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Constants for data paths
CSR_DATA_DIR = Path(__file__).parent.parent / "data" / "csr_knowledge"
CSR_INDEX_PATH = CSR_DATA_DIR / "csr_index.json"
CSR_EMBEDDING_PATH = CSR_DATA_DIR / "csr_embeddings.json"
CSR_METADATA_PATH = CSR_DATA_DIR / "csr_metadata.json"
CSR_SECTIONS_PATH = CSR_DATA_DIR / "csr_sections.json"

# Create necessary directories
CSR_DATA_DIR.mkdir(parents=True, exist_ok=True)

# CSR section types for semantic indexing
CSR_SECTION_TYPES = [
    "protocol_design",
    "eligibility_criteria",
    "endpoints",
    "statistical_methods",
    "safety_monitoring",
    "results",
    "adverse_events",
    "dropouts",
    "efficacy_outcomes"
]

# In-memory cache
csr_index = {}
csr_embeddings = {}
csr_metadata = {}
csr_sections = {}
is_initialized = False

def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors"""
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    return dot_product / (norm_a * norm_b)

def load_csr_data():
    """Load CSR data from disk or initialize empty structures"""
    global csr_index, csr_embeddings, csr_metadata, csr_sections, is_initialized
    
    if is_initialized:
        return
    
    # Load or initialize index
    if CSR_INDEX_PATH.exists():
        with open(CSR_INDEX_PATH, 'r') as f:
            csr_index = json.load(f)
    else:
        csr_index = {"csrs": {}, "count": 0}
        
    # Load or initialize embeddings
    if CSR_EMBEDDING_PATH.exists():
        with open(CSR_EMBEDDING_PATH, 'r') as f:
            csr_embeddings = json.load(f)
    else:
        csr_embeddings = {}
        
    # Load or initialize metadata
    if CSR_METADATA_PATH.exists():
        with open(CSR_METADATA_PATH, 'r') as f:
            csr_metadata = json.load(f)
    else:
        csr_metadata = {}
        
    # Load or initialize sections
    if CSR_SECTIONS_PATH.exists():
        with open(CSR_SECTIONS_PATH, 'r') as f:
            csr_sections = json.load(f)
    else:
        csr_sections = {}
        
    is_initialized = True
    logger.info(f"Loaded CSR knowledge base with {csr_index.get('count', 0)} reports")

def save_csr_data():
    """Save current CSR data to disk"""
    with open(CSR_INDEX_PATH, 'w') as f:
        json.dump(csr_index, f)
        
    with open(CSR_EMBEDDING_PATH, 'w') as f:
        json.dump(csr_embeddings, f)
        
    with open(CSR_METADATA_PATH, 'w') as f:
        json.dump(csr_metadata, f)
        
    with open(CSR_SECTIONS_PATH, 'w') as f:
        json.dump(csr_sections, f)
        
    logger.info(f"Saved CSR knowledge base with {csr_index.get('count', 0)} reports")

def extract_semantic_sections(csr_id: str, csr_text: str) -> Dict[str, str]:
    """
    Extract semantic sections from a CSR text using OpenAI
    
    Args:
        csr_id: The CSR identifier
        csr_text: The full text of the CSR
        
    Returns:
        Dictionary mapping section types to extracted content
    """
    # Prepare the prompt for extracting sections
    prompt = f"""
    I'm going to provide you with text from a Clinical Study Report (CSR) with ID: {csr_id}.
    Please extract the following sections from this report, preserving all relevant details:

    1. PROTOCOL_DESIGN: Details about the study design, including type, randomization, blinding, etc.
    2. ELIGIBILITY_CRITERIA: Both inclusion and exclusion criteria for the study
    3. ENDPOINTS: Primary and secondary endpoints with definitions
    4. STATISTICAL_METHODS: Statistical approaches, analyses, and methods
    5. SAFETY_MONITORING: Safety assessment procedures and monitoring
    6. RESULTS: Key efficacy and safety results
    7. ADVERSE_EVENTS: Information about adverse events, their frequency and severity
    8. DROPOUTS: Information about study discontinuations and reasons
    9. EFFICACY_OUTCOMES: Specific outcomes related to efficacy endpoints

    For each section, extract as much detail as possible. If a section is not present in the text, indicate with "Not available in this CSR text".
    Format your response as JSON with the section names as keys and the extracted text as values.

    Here is the CSR text:
    {csr_text[:15000]}  # Truncate to avoid exceeding token limits
    """
    
    try:
        # Call OpenAI to extract the sections
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized clinical trial document analyzer. Your task is to extract structured information from Clinical Study Reports (CSRs) with high accuracy and retain all relevant details."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        # Extract the JSON content from the response
        extraction_result = json.loads(response.choices[0].message.content)
        
        # Convert to our expected format
        sections = {}
        for section_type in CSR_SECTION_TYPES:
            section_key = section_type.upper()
            if section_key in extraction_result:
                section_content = extraction_result[section_key]
                # Only store if actual content was found
                if section_content and "Not available" not in section_content:
                    sections[section_type] = section_content
        
        return sections
    
    except Exception as e:
        logger.error(f"Error extracting semantic sections for CSR {csr_id}: {str(e)}")
        return {}

def extract_metadata(csr_id: str, csr_text: str) -> Dict[str, Any]:
    """
    Extract key metadata from a CSR text using OpenAI
    
    Args:
        csr_id: The CSR identifier
        csr_text: The full text of the CSR
        
    Returns:
        Dictionary of extracted metadata
    """
    # Prepare the prompt for extracting metadata
    prompt = f"""
    I'm going to provide you with text from a Clinical Study Report (CSR) with ID: {csr_id}.
    Please extract the following metadata from this report:

    1. TITLE: The full study title
    2. INDICATION: The disease or condition under study
    3. PHASE: The clinical trial phase (I, II, III, IV, etc.)
    4. SAMPLE_SIZE: Total number of participants enrolled
    5. STUDY_DESIGN: Brief description of study design (e.g., "Randomized, double-blind, placebo-controlled")
    6. PRIMARY_ENDPOINTS: List of primary endpoints
    7. INTERVENTION: Description of the intervention or treatment
    8. SPONSOR: Company or organization sponsoring the study
    9. COMPLETION_DATE: When the study was completed (if available)
    10. OUTCOME: Overall outcome or results summary

    Format your response as JSON with these fields as keys and the extracted information as values.
    If information for a field is not present, use null for that field.

    Here is the CSR text:
    {csr_text[:10000]}  # Truncate to avoid exceeding token limits
    """
    
    try:
        # Call OpenAI to extract the metadata
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized clinical trial document analyzer. Your task is to extract structured metadata from Clinical Study Reports (CSRs) with high accuracy."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        # Extract the JSON content from the response
        return json.loads(response.choices[0].message.content)
    
    except Exception as e:
        logger.error(f"Error extracting metadata for CSR {csr_id}: {str(e)}")
        return {
            "TITLE": f"CSR {csr_id}",
            "INDICATION": None,
            "PHASE": None,
            "SAMPLE_SIZE": None,
            "STUDY_DESIGN": None,
            "PRIMARY_ENDPOINTS": None,
            "INTERVENTION": None,
            "SPONSOR": None,
            "COMPLETION_DATE": None,
            "OUTCOME": None
        }

def extract_key_insights(csr_id: str, csr_text: str) -> List[Dict[str, str]]:
    """
    Extract key insights and learning from a CSR text using OpenAI
    
    Args:
        csr_id: The CSR identifier
        csr_text: The full text of the CSR
        
    Returns:
        List of insights with categories and descriptions
    """
    # Prepare the prompt for extracting insights
    prompt = f"""
    I'm going to provide you with text from a Clinical Study Report (CSR) with ID: {csr_id}.
    Please extract key insights and learnings from this report in the following categories:

    1. DESIGN_INSIGHTS: Important learnings about the study design, what worked well or could be improved
    2. ENDPOINT_INSIGHTS: Observations about the selected endpoints, their sensitivity, specificity, or performance
    3. EXECUTION_INSIGHTS: Learnings about trial execution, recruitment, retention, etc.
    4. STATISTICAL_INSIGHTS: Observations about statistical methods, analyses, or power
    5. SAFETY_INSIGHTS: Important safety findings or considerations for future studies
    6. REGULATORY_INSIGHTS: Points relevant to regulatory considerations or approval pathways

    For each category, provide 1-3 specific, evidence-based insights from this CSR.
    Format your response as a JSON array of objects, each with "category" and "insight" fields.

    Here is the CSR text:
    {csr_text[:12000]}  # Truncate to avoid exceeding token limits
    """
    
    try:
        # Call OpenAI to extract the insights
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized clinical trial analyst skilled at extracting evidence-based insights from Clinical Study Reports (CSRs). Focus on identifying non-obvious, specific learnings that would be valuable for future trial design."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        # Extract the JSON content from the response
        result = json.loads(response.choices[0].message.content)
        
        # Extract the array of insights from the result
        if isinstance(result, list):
            insights = result
        elif isinstance(result, dict) and "insights" in result:
            insights = result["insights"]
        else:
            # Try to find an array in the dictionary
            for key, value in result.items():
                if isinstance(value, list) and len(value) > 0:
                    insights = value
                    break
            else:
                # If no array is found, create a structured version
                insights = []
                for category, data in result.items():
                    if isinstance(data, str):
                        insights.append({"category": category, "insight": data})
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, str):
                                insights.append({"category": category, "insight": item})
                            elif isinstance(item, dict) and "insight" in item:
                                item["category"] = category
                                insights.append(item)
        
        return insights
    
    except Exception as e:
        logger.error(f"Error extracting insights for CSR {csr_id}: {str(e)}")
        return []

def index_csr(csr_id: str, csr_text: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
    """
    Process and index a CSR for semantic search
    
    Args:
        csr_id: The CSR identifier
        csr_text: The full text of the CSR
        metadata: Optional metadata if already available
        
    Returns:
        Success status
    """
    try:
        # Ensure data is loaded
        load_csr_data()
        
        # Check if already indexed
        if csr_id in csr_index.get("csrs", {}):
            logger.info(f"CSR {csr_id} already indexed, updating...")
        
        # Extract metadata if not provided
        if not metadata:
            metadata = extract_metadata(csr_id, csr_text)
            
        # Generate embeddings for the full text
        full_text_embedding = generate_text_embedding(csr_text[:12000])  # Truncate for embedding
        
        # Extract structured sections
        sections = extract_semantic_sections(csr_id, csr_text)
        
        # Extract key insights
        insights = extract_key_insights(csr_id, csr_text)
        
        # Save all data
        csr_index["csrs"][csr_id] = {
            "id": csr_id,
            "indexed_at": time.time(),
            "has_sections": bool(sections),
            "has_insights": bool(insights),
            "metadata_keys": list(metadata.keys()) if metadata else []
        }
        csr_index["count"] = len(csr_index["csrs"])
        
        csr_embeddings[csr_id] = {
            "full_text": full_text_embedding,
            "sections": {
                section: generate_text_embedding(content[:8000])
                for section, content in sections.items()
            }
        }
        
        csr_metadata[csr_id] = metadata
        csr_sections[csr_id] = {
            "sections": sections,
            "insights": insights
        }
        
        # Save to disk
        save_csr_data()
        
        return True
    
    except Exception as e:
        logger.error(f"Error indexing CSR {csr_id}: {str(e)}")
        return False

def search_csrs(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search for CSRs semantically similar to a query
    
    Args:
        query: The search query
        top_k: Number of results to return
        
    Returns:
        List of matching CSRs with similarity scores and metadata
    """
    # Ensure data is loaded
    load_csr_data()
    
    # Generate query embedding
    query_embedding = generate_text_embedding(query)
    
    # Calculate similarity with all CSRs
    results = []
    for csr_id, embeddings in csr_embeddings.items():
        if "full_text" in embeddings:
            similarity = cosine_similarity(query_embedding, embeddings["full_text"])
            
            # Get metadata
            metadata = csr_metadata.get(csr_id, {})
            
            results.append({
                "csr_id": csr_id,
                "similarity": similarity,
                "title": metadata.get("TITLE", f"CSR {csr_id}"),
                "indication": metadata.get("INDICATION"),
                "phase": metadata.get("PHASE"),
                "sample_size": metadata.get("SAMPLE_SIZE"),
                "study_design": metadata.get("STUDY_DESIGN"),
                "primary_endpoints": metadata.get("PRIMARY_ENDPOINTS"),
                "sponsor": metadata.get("SPONSOR")
            })
    
    # Sort by similarity
    results.sort(key=lambda x: x["similarity"], reverse=True)
    
    # Return top_k results
    return results[:top_k]

def search_csr_sections(query: str, section_type: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search for specific sections across CSRs
    
    Args:
        query: The search query
        section_type: Type of section to search (eligibility_criteria, endpoints, etc.)
        top_k: Number of results to return
        
    Returns:
        List of matching sections with similarity scores and metadata
    """
    # Ensure data is loaded
    load_csr_data()
    
    # Generate query embedding
    query_embedding = generate_text_embedding(query)
    
    # Calculate similarity with specific sections
    results = []
    for csr_id, embeddings in csr_embeddings.items():
        if "sections" in embeddings and section_type in embeddings["sections"]:
            section_embedding = embeddings["sections"][section_type]
            similarity = cosine_similarity(query_embedding, section_embedding)
            
            # Get metadata and section content
            metadata = csr_metadata.get(csr_id, {})
            section_content = csr_sections.get(csr_id, {}).get("sections", {}).get(section_type, "")
            
            results.append({
                "csr_id": csr_id,
                "similarity": similarity,
                "title": metadata.get("TITLE", f"CSR {csr_id}"),
                "indication": metadata.get("INDICATION"),
                "phase": metadata.get("PHASE"),
                "section_type": section_type,
                "section_content": section_content
            })
    
    # Sort by similarity
    results.sort(key=lambda x: x["similarity"], reverse=True)
    
    # Return top_k results
    return results[:top_k]

def get_csr_insights(indication: str, topic: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get insights from CSRs for a specific indication and optional topic
    
    Args:
        indication: The disease or condition
        topic: Optional topic filter (design, endpoints, etc.)
        
    Returns:
        List of relevant insights with CSR metadata
    """
    # Ensure data is loaded
    load_csr_data()
    
    # Find CSRs for the indication
    matching_csrs = []
    for csr_id, metadata in csr_metadata.items():
        if "INDICATION" in metadata and metadata["INDICATION"]:
            csr_indication = metadata["INDICATION"].lower()
            if indication.lower() in csr_indication or csr_indication in indication.lower():
                matching_csrs.append(csr_id)
    
    # Collect insights from matching CSRs
    all_insights = []
    for csr_id in matching_csrs:
        if csr_id in csr_sections and "insights" in csr_sections[csr_id]:
            insights = csr_sections[csr_id]["insights"]
            for insight in insights:
                # Apply topic filter if provided
                if topic:
                    category = insight.get("category", "").lower()
                    if topic.lower() not in category:
                        continue
                
                # Add CSR metadata
                metadata = csr_metadata.get(csr_id, {})
                all_insights.append({
                    "csr_id": csr_id,
                    "title": metadata.get("TITLE", f"CSR {csr_id}"),
                    "indication": metadata.get("INDICATION"),
                    "phase": metadata.get("PHASE"),
                    "category": insight.get("category"),
                    "insight": insight.get("insight")
                })
    
    return all_insights

def generate_evidence_summary(query: str, max_csrs: int = 3) -> Dict[str, Any]:
    """
    Generate a summary of evidence from CSRs related to a query
    
    Args:
        query: The query to find relevant CSRs
        max_csrs: Maximum number of CSRs to include
        
    Returns:
        Evidence summary with citations
    """
    # Search for relevant CSRs
    relevant_csrs = search_csrs(query, top_k=max_csrs)
    
    if not relevant_csrs:
        return {
            "summary": "No relevant clinical study reports found for this query.",
            "citations": []
        }
    
    # Collect CSR data for the summary
    csr_data = []
    for result in relevant_csrs:
        csr_id = result["csr_id"]
        metadata = csr_metadata.get(csr_id, {})
        sections = csr_sections.get(csr_id, {}).get("sections", {})
        
        # Extract the most relevant sections for the query
        relevant_section_types = ["protocol_design", "endpoints", "results", "efficacy_outcomes"]
        relevant_section_contents = []
        
        for section_type in relevant_section_types:
            if section_type in sections:
                section_content = sections[section_type]
                # Truncate long sections
                if len(section_content) > 1500:
                    section_content = section_content[:1500] + "..."
                relevant_section_contents.append(f"{section_type.upper()}: {section_content}")
        
        csr_text = "\n\n".join(relevant_section_contents)
        
        csr_data.append({
            "id": csr_id,
            "title": metadata.get("TITLE", f"CSR {csr_id}"),
            "indication": metadata.get("INDICATION"),
            "phase": metadata.get("PHASE"),
            "sample_size": metadata.get("SAMPLE_SIZE"),
            "study_design": metadata.get("STUDY_DESIGN"),
            "primary_endpoints": metadata.get("PRIMARY_ENDPOINTS"),
            "text": csr_text
        })
    
    # Generate summary using OpenAI
    prompt = f"""
    I need you to generate an evidence summary based on the following Clinical Study Reports (CSRs) for this query:
    
    QUERY: {query}
    
    Here are the relevant CSRs:
    
    {json.dumps(csr_data, indent=2)}
    
    Please provide:
    1. A comprehensive evidence summary (2-3 paragraphs)
    2. Key findings relevant to the query (bullet points)
    3. Implications for clinical trial design (bullet points)
    4. A list of citations to the CSRs used
    
    Format your response as JSON with the following structure:
    {{
      "summary": "...",
      "key_findings": ["...", "..."],
      "implications": ["...", "..."],
      "citations": [
        {{"id": "CSR_ID", "title": "Study Title", "citation_text": "Brief citation text"}}
      ]
    }}
    """
    
    try:
        # Call OpenAI to generate the summary
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert in analyzing clinical trial evidence. Your task is to synthesize information from Clinical Study Reports (CSRs) to provide accurate, evidence-based summaries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        # Extract the JSON content from the response
        return json.loads(response.choices[0].message.content)
    
    except Exception as e:
        logger.error(f"Error generating evidence summary: {str(e)}")
        return {
            "summary": "Error generating evidence summary.",
            "key_findings": [],
            "implications": [],
            "citations": [{"id": r["csr_id"], "title": r["title"], "citation_text": f"Clinical Study {r['csr_id']}"} for r in relevant_csrs]
        }

def extract_csr_references(text: str) -> List[Dict[str, str]]:
    """
    Extract structured CSR references from text
    
    Args:
        text: Text to extract references from
        
    Returns:
        List of structured references
    """
    # Ensure data is loaded
    load_csr_data()
    
    # Look for CSR IDs or titles in the text
    references = []
    
    # Add all available CSR IDs
    csr_ids = list(csr_metadata.keys())
    
    # Extract explicit CSR references with regex patterns
    csr_id_pattern = re.compile(r'CSR[_\s-]?(\w+)', re.IGNORECASE)
    matches = csr_id_pattern.findall(text)
    
    for match in matches:
        csr_id = match.strip()
        if csr_id in csr_ids:
            metadata = csr_metadata.get(csr_id, {})
            references.append({
                "id": csr_id,
                "title": metadata.get("TITLE", f"CSR {csr_id}"),
                "reference_type": "explicit"
            })
    
    # If we have too few explicit references, add semantically relevant ones
    if len(references) < 3:
        # Find semantically similar CSRs
        relevant_csrs = search_csrs(text, top_k=5)
        
        for result in relevant_csrs:
            csr_id = result["csr_id"]
            
            # Skip if already in references
            if any(ref["id"] == csr_id for ref in references):
                continue
                
            references.append({
                "id": csr_id,
                "title": result["title"],
                "reference_type": "semantic",
                "similarity": result["similarity"]
            })
    
    # Deduplicate by CSR ID
    unique_refs = {}
    for ref in references:
        if ref["id"] not in unique_refs:
            unique_refs[ref["id"]] = ref
    
    return list(unique_refs.values())

def generate_csr_citation(csr_id: str) -> str:
    """
    Generate a formatted citation for a CSR
    
    Args:
        csr_id: The CSR identifier
        
    Returns:
        Formatted citation string
    """
    # Ensure data is loaded
    load_csr_data()
    
    # Get metadata
    metadata = csr_metadata.get(csr_id, {})
    
    # Build citation
    title = metadata.get("TITLE", f"Clinical Study Report {csr_id}")
    sponsor = metadata.get("SPONSOR", "Unknown Sponsor")
    phase = metadata.get("PHASE", "")
    indication = metadata.get("INDICATION", "")
    
    # Format depends on available metadata
    if sponsor and phase and indication:
        return f"{title}. {sponsor}. {phase} study in {indication}. CSR ID: {csr_id}."
    elif sponsor:
        return f"{title}. {sponsor}. CSR ID: {csr_id}."
    else:
        return f"{title}. CSR ID: {csr_id}."

def get_structured_data_from_csr(csr_id: str, data_type: str) -> Dict[str, Any]:
    """
    Extract specific structured data from a CSR
    
    Args:
        csr_id: The CSR identifier
        data_type: Type of data to extract (endpoints, eligibility, statistics, etc.)
        
    Returns:
        Structured data as dictionary
    """
    # Ensure data is loaded
    load_csr_data()
    
    # Check if CSR exists
    if csr_id not in csr_metadata:
        return {"error": f"CSR {csr_id} not found in the knowledge base"}
    
    # Get metadata and sections
    metadata = csr_metadata.get(csr_id, {})
    sections = csr_sections.get(csr_id, {}).get("sections", {})
    
    # Build base response with metadata
    result = {
        "csr_id": csr_id,
        "title": metadata.get("TITLE", f"CSR {csr_id}"),
        "indication": metadata.get("INDICATION"),
        "phase": metadata.get("PHASE")
    }
    
    # Add data based on type
    if data_type.lower() == "endpoints":
        endpoints_section = sections.get("endpoints", "")
        
        # Use OpenAI to extract structured endpoint data
        if endpoints_section:
            prompt = f"""
            Extract all endpoints from this clinical study text in structured format.
            Include primary and secondary endpoints with their definitions.
            
            CSR TEXT:
            {endpoints_section}
            
            Format as JSON with primary_endpoints and secondary_endpoints arrays.
            """
            
            try:
                response = client.chat.completions.create(
                    model=GPT_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a specialized clinical trial document analyzer."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                
                endpoint_data = json.loads(response.choices[0].message.content)
                result.update(endpoint_data)
            except Exception as e:
                logger.error(f"Error extracting endpoint data: {str(e)}")
                result["primary_endpoints"] = metadata.get("PRIMARY_ENDPOINTS", [])
                result["secondary_endpoints"] = []
                result["extraction_error"] = str(e)
        else:
            result["primary_endpoints"] = metadata.get("PRIMARY_ENDPOINTS", [])
            result["secondary_endpoints"] = []
            result["note"] = "No detailed endpoint section found in CSR"
    
    elif data_type.lower() == "eligibility":
        eligibility_section = sections.get("eligibility_criteria", "")
        
        # Use OpenAI to extract structured eligibility criteria
        if eligibility_section:
            prompt = f"""
            Extract inclusion and exclusion criteria from this clinical study text in structured format.
            
            CSR TEXT:
            {eligibility_section}
            
            Format as JSON with inclusion_criteria and exclusion_criteria arrays.
            """
            
            try:
                response = client.chat.completions.create(
                    model=GPT_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a specialized clinical trial document analyzer."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                
                eligibility_data = json.loads(response.choices[0].message.content)
                result.update(eligibility_data)
            except Exception as e:
                logger.error(f"Error extracting eligibility data: {str(e)}")
                result["inclusion_criteria"] = []
                result["exclusion_criteria"] = []
                result["extraction_error"] = str(e)
        else:
            result["inclusion_criteria"] = []
            result["exclusion_criteria"] = []
            result["note"] = "No detailed eligibility criteria section found in CSR"
    
    # Add more data types as needed
    
    return result

# Build CSR search index on module load
try:
    load_csr_data()
except Exception as e:
    logger.error(f"Error loading CSR data: {str(e)}")