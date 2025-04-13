# trialsage/services/deep_csr_analyzer.py
# Advanced Deep Learning CSR Semantic Understanding Engine

import os
import json
import time
import logging
from typing import Dict, List, Any, Optional, Tuple, Set, Union
from pathlib import Path
import re
from openai import OpenAI
import numpy as np
from collections import defaultdict
from .openai_engine import generate_text_embedding, GPT_MODEL

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_api_key = os.environ.get("OPENAI_API_KEY")
if not openai_api_key:
    logger.error("OPENAI_API_KEY not found in environment variables")
    raise ValueError("OPENAI_API_KEY is required for the Deep CSR Analyzer")

client = OpenAI(api_key=openai_api_key)

# Constants for data paths
CSR_KNOWLEDGE_DIR = Path(__file__).parent.parent / "data" / "deep_csr_knowledge"
CSR_VECTOR_DB_PATH = CSR_KNOWLEDGE_DIR / "csr_vector_db.json"
CSR_ENTITY_MAP_PATH = CSR_KNOWLEDGE_DIR / "csr_entity_map.json"
CSR_SEMANTIC_GRAPH_PATH = CSR_KNOWLEDGE_DIR / "csr_semantic_graph.json"
CSR_STRUCTURED_DATA_PATH = CSR_KNOWLEDGE_DIR / "csr_structured_data.json"
CSR_INSIGHT_NETWORK_PATH = CSR_KNOWLEDGE_DIR / "csr_insight_network.json"
CSR_CHUNK_METADATA_PATH = CSR_KNOWLEDGE_DIR / "csr_chunk_metadata.json"

# Create necessary directories
CSR_KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

# Define CSR ontology - the semantic structure of clinical trial knowledge
CSR_ONTOLOGY = {
    "entities": [
        "drug", "indication", "endpoint", "outcome_measure", "inclusion_criteria", 
        "exclusion_criteria", "adverse_event", "statistical_method", "population", 
        "biomarker", "dosage", "study_design", "protocol_deviation", "efficacy_result",
        "safety_result", "dropout_reason", "regulatory_consideration", "demographic",
        "concomitant_medication", "randomization_method", "blinding_method"
    ],
    "entity_attributes": {
        "drug": ["name", "class", "mechanism", "formulation", "manufacturer"],
        "indication": ["name", "category", "severity", "stage", "code"],
        "endpoint": ["name", "type", "timepoint", "measurement_method", "is_primary", "is_secondary"],
        "outcome_measure": ["name", "description", "type", "timepoint", "statistical_approach"],
        "inclusion_criteria": ["criterion", "rationale", "category"],
        "exclusion_criteria": ["criterion", "rationale", "category", "safety_related"],
        "adverse_event": ["name", "severity", "frequency", "relation_to_treatment", "serious"],
        "statistical_method": ["name", "description", "purpose", "assumptions"],
        "population": ["name", "definition", "size", "analysis_set"],
        "biomarker": ["name", "type", "measurement_method", "cutoff_value"],
        "efficacy_result": ["endpoint", "value", "statistical_significance", "confidence_interval"],
        "safety_result": ["parameter", "finding", "significance", "interpretation"]
    },
    "relation_types": [
        "has_endpoint", "was_measured_at", "resulted_in", "is_associated_with",
        "was_analyzed_using", "is_required_for", "led_to", "supports", "contradicts",
        "is_similar_to", "is_effective_for", "causes", "improves", "worsens",
        "correlates_with", "predicts", "is_indicated_for", "is_contraindicated_for"
    ]
}

# In-memory cache
vector_db = {}
entity_map = {}
semantic_graph = {}
structured_data = {}
insight_network = {}
chunk_metadata = {}
is_initialized = False

# Semantic chunk size for detailed context understanding
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 150

def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors"""
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    return dot_product / (norm_a * norm_b)

def load_csr_knowledge_base():
    """Load CSR knowledge base from disk or initialize empty structures"""
    global vector_db, entity_map, semantic_graph, structured_data, insight_network, chunk_metadata, is_initialized
    
    if is_initialized:
        return
    
    # Load or initialize vector database
    if CSR_VECTOR_DB_PATH.exists():
        with open(CSR_VECTOR_DB_PATH, 'r') as f:
            vector_db = json.load(f)
    else:
        vector_db = {"chunks": {}, "metadata": {}, "count": 0}
        
    # Load or initialize entity map
    if CSR_ENTITY_MAP_PATH.exists():
        with open(CSR_ENTITY_MAP_PATH, 'r') as f:
            entity_map = json.load(f)
    else:
        entity_map = {"entities": defaultdict(list), "count": 0}
        
    # Load or initialize semantic graph
    if CSR_SEMANTIC_GRAPH_PATH.exists():
        with open(CSR_SEMANTIC_GRAPH_PATH, 'r') as f:
            semantic_graph = json.load(f)
    else:
        semantic_graph = {"nodes": {}, "edges": [], "clusters": {}}
    
    # Load or initialize structured data
    if CSR_STRUCTURED_DATA_PATH.exists():
        with open(CSR_STRUCTURED_DATA_PATH, 'r') as f:
            structured_data = json.load(f)
    else:
        structured_data = {}
    
    # Load or initialize insight network
    if CSR_INSIGHT_NETWORK_PATH.exists():
        with open(CSR_INSIGHT_NETWORK_PATH, 'r') as f:
            insight_network = json.load(f)
    else:
        insight_network = {"insights": [], "connections": [], "themes": {}}
    
    # Load or initialize chunk metadata
    if CSR_CHUNK_METADATA_PATH.exists():
        with open(CSR_CHUNK_METADATA_PATH, 'r') as f:
            chunk_metadata = json.load(f)
    else:
        chunk_metadata = {}
    
    is_initialized = True
    logger.info(f"Loaded Deep CSR Knowledge Base with {vector_db.get('count', 0)} chunks")

def save_csr_knowledge_base():
    """Save current CSR knowledge base to disk"""
    # Convert defaultdict to regular dict for JSON serialization
    if isinstance(entity_map["entities"], defaultdict):
        entity_map["entities"] = dict(entity_map["entities"])
    
    with open(CSR_VECTOR_DB_PATH, 'w') as f:
        json.dump(vector_db, f)
        
    with open(CSR_ENTITY_MAP_PATH, 'w') as f:
        json.dump(entity_map, f)
        
    with open(CSR_SEMANTIC_GRAPH_PATH, 'w') as f:
        json.dump(semantic_graph, f)
        
    with open(CSR_STRUCTURED_DATA_PATH, 'w') as f:
        json.dump(structured_data, f)
        
    with open(CSR_INSIGHT_NETWORK_PATH, 'w') as f:
        json.dump(insight_network, f)
        
    with open(CSR_CHUNK_METADATA_PATH, 'w') as f:
        json.dump(chunk_metadata, f)
        
    logger.info(f"Saved Deep CSR Knowledge Base with {vector_db.get('count', 0)} chunks")

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """
    Split text into semantically meaningful chunks with overlap
    
    Args:
        text: The text to chunk
        chunk_size: Size of each chunk
        overlap: Overlap between chunks
        
    Returns:
        List of text chunks
    """
    # Split into sentences (simple approximation)
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        # If adding this sentence exceeds the chunk size, save the current chunk
        if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            # Keep some overlap for context
            overlap_text = " ".join(current_chunk.split()[-overlap:]) if overlap > 0 else ""
            current_chunk = overlap_text + " " + sentence
        else:
            current_chunk += " " + sentence
    
    # Add the last chunk if it has content
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks

def extract_semantic_entities(text: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Extract semantic entities from text using OpenAI
    
    Args:
        text: Text to analyze
        
    Returns:
        Dictionary mapping entity types to lists of extracted entities
    """
    # Include relevant entity types based on the text length and content
    # For longer text, focus on high-level entities; for shorter text, go into detail
    is_short_text = len(text) < 2000
    
    if is_short_text:
        # For shorter text, we can extract more detailed entities
        entity_types = CSR_ONTOLOGY["entities"]
    else:
        # For longer text, focus on high-level entities
        entity_types = [
            "drug", "indication", "endpoint", "outcome_measure", 
            "adverse_event", "statistical_method", "study_design"
        ]
    
    entity_type_str = ", ".join(entity_types)
    
    prompt = f"""
    Extract all semantic entities from this clinical trial text segment.
    
    Entity types to extract: {entity_type_str}
    
    For each entity found, provide:
    1. Type (from the list above)
    2. Name/text (the specific entity mention)
    3. Attributes (relevant properties like dosage, frequency, severity, etc.)
    4. Context (the surrounding sentence or context where the entity appears)
    
    TEXT:
    {text[:6000]}  # Limit text to avoid token limits
    
    Format your response as a JSON object with entity types as keys and arrays of extracted entities as values.
    Each entity should be an object with name, attributes, and context properties.
    """
    
    try:
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized biomedical entity extraction system designed to identify and categorize clinical trial concepts with high precision."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        entities = json.loads(response.choices[0].message.content)
        return entities
    
    except Exception as e:
        logger.error(f"Error extracting semantic entities: {str(e)}")
        return {}

def extract_semantic_relations(text: str, entities: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """
    Extract semantic relations between entities
    
    Args:
        text: Source text
        entities: Extracted entities
        
    Returns:
        List of relations
    """
    # Flatten entities into a single list for the prompt
    flat_entities = []
    for entity_type, entity_list in entities.items():
        for entity in entity_list:
            flat_entities.append({
                "id": f"{entity_type}_{len(flat_entities)}",
                "type": entity_type,
                "name": entity.get("name", ""),
                "attributes": entity.get("attributes", {})
            })
    
    # If we have too many entities, filter to the most important ones
    if len(flat_entities) > 20:
        primary_types = ["drug", "indication", "endpoint", "outcome_measure", "adverse_event", "study_design"]
        flat_entities = [e for e in flat_entities if e["type"] in primary_types][:20]
    
    if not flat_entities:
        return []
    
    relation_type_str = ", ".join(CSR_ONTOLOGY["relation_types"])
    
    prompt = f"""
    Identify semantic relationships between these clinical trial entities extracted from the text:
    
    {json.dumps(flat_entities, indent=2)}
    
    Relationship types to consider: {relation_type_str}
    
    For each relationship found, provide:
    1. Source entity ID
    2. Target entity ID 
    3. Relationship type
    4. Evidence from the text that supports this relationship
    
    TEXT:
    {text[:4000]}  # Limit text to avoid token limits
    
    Format your response as a JSON array of relationship objects.
    """
    
    try:
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized system for identifying semantic relationships between biomedical concepts in clinical trial documentation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Extract relations from the result
        if isinstance(result, list):
            relations = result
        elif isinstance(result, dict) and "relations" in result:
            relations = result["relations"]
        elif isinstance(result, dict) and "relationships" in result:
            relations = result["relationships"]
        else:
            # If we can't find the expected structure, return an empty list
            relations = []
            for key, value in result.items():
                if isinstance(value, list) and len(value) > 0:
                    relations = value
                    break
        
        return relations
    
    except Exception as e:
        logger.error(f"Error extracting semantic relations: {str(e)}")
        return []

def extract_structured_trial_data(text: str, csr_id: str) -> Dict[str, Any]:
    """
    Extract comprehensive structured data from a clinical trial text
    
    Args:
        text: Clinical trial text
        csr_id: CSR identifier
        
    Returns:
        Structured data
    """
    # Define the key sections we want to extract
    sections = [
        "trial_design", "intervention", "eligibility", "endpoints", 
        "statistical_methods", "demographics", "efficacy", "safety", 
        "pharmacokinetics", "biomarkers", "conclusions"
    ]
    
    prompt = f"""
    Extract comprehensive structured data from this clinical trial document (CSR ID: {csr_id}).
    
    Extract detailed information for ALL of these sections:
    1. trial_design: Study design, phase, blinding, randomization, duration, etc.
    2. intervention: Drug/intervention details, dosing, regimen, comparators
    3. eligibility: Key inclusion/exclusion criteria
    4. endpoints: Primary and secondary endpoints with definitions
    5. statistical_methods: Statistical approaches, sample size justification, analyses
    6. demographics: Population characteristics
    7. efficacy: Efficacy results for all endpoints
    8. safety: Safety findings, adverse events, serious adverse events
    9. pharmacokinetics: PK parameters and findings (if available)
    10. biomarkers: Biomarker analyses and results (if available)
    11. conclusions: Study conclusions and implications
    
    For each section, provide comprehensive, detailed structured data in a way that captures all the nuances of the trial.
    If information is not available for a section, include the section with a note that the information is not provided.
    
    TEXT:
    {text[:10000]}  # Limit text to avoid token limits
    
    Format your response as a JSON object with the section names as keys and detailed structured data as values.
    """
    
    try:
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized system for extracting comprehensive structured data from clinical trial reports with high precision and detail."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        structured_data = json.loads(response.choices[0].message.content)
        
        # Ensure all sections are present
        for section in sections:
            if section not in structured_data:
                structured_data[section] = {"note": "Information not available in the provided text"}
        
        return structured_data
    
    except Exception as e:
        logger.error(f"Error extracting structured trial data: {str(e)}")
        # Return minimal structure with error information
        return {section: {"note": "Extraction error: " + str(e)} for section in sections}

def extract_deep_insights(text: str, structured_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract deep insights from clinical trial text and structured data
    
    Args:
        text: Clinical trial text
        structured_data: Extracted structured data
        
    Returns:
        List of insights
    """
    # Create a summary of the structured data for the prompt
    structured_summary = "\n".join([
        f"{section.upper()}: {json.dumps(data)[:300]}..." 
        for section, data in structured_data.items()
    ])
    
    prompt = f"""
    Analyze this clinical trial data and extract deep, non-obvious insights about the trial.
    
    Focus on insights related to:
    1. Trial design considerations and their impact on outcomes
    2. Efficacy findings and their implications
    3. Safety patterns and their significance
    4. Statistical approach strengths and limitations
    5. Population selection insights
    6. Unique aspects of this trial compared to similar trials
    7. Regulatory implications
    8. Future trial design recommendations based on these findings
    
    STRUCTURED DATA SUMMARY:
    {structured_summary}
    
    TEXT SAMPLE:
    {text[:3000]}
    
    For each insight, provide:
    1. category: The category of insight (design, efficacy, safety, etc.)
    2. insight: The specific insight or finding
    3. evidence: Supporting evidence from the trial
    4. implications: Clinical or regulatory implications
    5. confidence: Your confidence in this insight (high, medium, low)
    
    Format your response as a JSON array of insight objects.
    """
    
    try:
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized clinical trial analyst with expertise in extracting deep, nuanced insights from clinical study reports. Focus on identifying insights that would not be obvious from a superficial reading."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Extract insights from the result
        if isinstance(result, list):
            insights = result
        elif isinstance(result, dict) and "insights" in result:
            insights = result["insights"]
        else:
            # If we can't find the expected structure, check for any arrays
            insights = []
            for key, value in result.items():
                if isinstance(value, list) and len(value) > 0:
                    insights = value
                    break
        
        return insights
    
    except Exception as e:
        logger.error(f"Error extracting deep insights: {str(e)}")
        return []

def connect_insights_to_semantic_network(insights: List[Dict[str, Any]], csr_id: str) -> Dict[str, Any]:
    """
    Connect extracted insights to the broader semantic network
    
    Args:
        insights: List of insights
        csr_id: CSR identifier
        
    Returns:
        Updated network connections
    """
    # Prepare a summary of the insights
    insight_summaries = []
    for i, insight in enumerate(insights):
        summary = {
            "id": f"{csr_id}_insight_{i}",
            "category": insight.get("category", "unknown"),
            "text": insight.get("insight", ""),
            "evidence": insight.get("evidence", ""),
            "implications": insight.get("implications", ""),
            "confidence": insight.get("confidence", "medium")
        }
        insight_summaries.append(summary)
    
    # If we don't have insights to connect, return empty structure
    if not insight_summaries:
        return {
            "new_connections": [],
            "updated_themes": {}
        }
    
    # Get existing insight network information (if any)
    load_csr_knowledge_base()
    existing_insights = insight_network.get("insights", [])
    existing_themes = insight_network.get("themes", {})
    
    # Prepare summary of existing themes for context
    theme_summary = "\n".join([
        f"THEME: {theme} - {details.get('description', '')}" 
        for theme, details in existing_themes.items()
    ])
    
    # If we don't have existing themes, provide instructions for creating them
    if not theme_summary:
        theme_guidance = """
        Create 3-5 initial themes to categorize these insights. Each theme should represent a significant pattern or area of learning across clinical trials.
        """
    else:
        theme_guidance = """
        Connect these insights to existing themes where appropriate. You may also suggest 1-2 new themes if needed.
        """
    
    # If we have many existing insights, summarize a sample of them
    existing_insight_summary = ""
    if existing_insights:
        sample_insights = existing_insights[:10]  # Limit to a reasonable sample
        existing_insight_summary = "SAMPLE OF EXISTING INSIGHTS:\n" + "\n".join([
            f"- {insight.get('id', 'unknown')}: {insight.get('text', '')}"
            for insight in sample_insights
        ])
    
    prompt = f"""
    Connect these newly extracted clinical trial insights to the broader knowledge network.
    
    NEW INSIGHTS:
    {json.dumps(insight_summaries, indent=2)}
    
    {existing_insight_summary}
    
    EXISTING THEMES:
    {theme_summary}
    
    {theme_guidance}
    
    For each new insight:
    1. Identify which theme(s) it belongs to
    2. Find connections to existing insights (if any)
    3. Suggest new themes if appropriate
    
    Format your response as a JSON object with:
    1. "connections": Array of connection objects (source_id, target_id, relationship, strength)
    2. "theme_assignments": Array of assignments (insight_id, theme_name)
    3. "new_themes": Object of new themes (theme_name: description)
    """
    
    try:
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized system for connecting clinical trial insights into a coherent knowledge network, identifying patterns and relationships across studies."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Clean up the result for return
        connections = result.get("connections", [])
        theme_assignments = result.get("theme_assignments", [])
        new_themes = result.get("new_themes", {})
        
        # Update the theme descriptions with insight IDs
        updated_themes = {}
        for theme_name, description in new_themes.items():
            # Find all insights assigned to this theme
            assigned_insights = [
                assignment["insight_id"] 
                for assignment in theme_assignments 
                if assignment["theme_name"] == theme_name
            ]
            
            updated_themes[theme_name] = {
                "description": description,
                "insights": assigned_insights
            }
        
        return {
            "new_connections": connections,
            "theme_assignments": theme_assignments,
            "updated_themes": updated_themes
        }
    
    except Exception as e:
        logger.error(f"Error connecting insights to network: {str(e)}")
        return {
            "new_connections": [],
            "theme_assignments": [],
            "updated_themes": {}
        }

def process_csr_document(csr_id: str, text: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Process a CSR document with deep semantic analysis
    
    Args:
        csr_id: CSR identifier
        text: Full CSR text
        metadata: Optional metadata
        
    Returns:
        Processing results summary
    """
    try:
        # Ensure knowledge base is loaded
        load_csr_knowledge_base()
        
        # 1. Chunk the document for processing
        logger.info(f"Chunking CSR document {csr_id}")
        chunks = chunk_text(text)
        
        # 2. Process each chunk with deep semantic analysis
        all_entities = defaultdict(list)
        all_relations = []
        all_chunk_embeddings = {}
        
        for i, chunk in enumerate(chunks):
            chunk_id = f"{csr_id}_chunk_{i}"
            
            # Generate embedding for the chunk
            chunk_embedding = generate_text_embedding(chunk)
            all_chunk_embeddings[chunk_id] = chunk_embedding
            
            # Extract entities from the chunk
            chunk_entities = extract_semantic_entities(chunk)
            
            # Add chunk context to entities and add to collection
            for entity_type, entities in chunk_entities.items():
                for entity in entities:
                    entity["chunk_id"] = chunk_id
                    entity["chunk_index"] = i
                    all_entities[entity_type].append(entity)
            
            # Extract relations from the chunk and entities
            chunk_relations = extract_semantic_relations(chunk, chunk_entities)
            
            # Add chunk context to relations
            for relation in chunk_relations:
                relation["chunk_id"] = chunk_id
                relation["chunk_index"] = i
                all_relations.append(relation)
            
            # Store chunk metadata
            chunk_metadata[chunk_id] = {
                "csr_id": csr_id,
                "index": i,
                "text": chunk,
                "entity_count": sum(len(entities) for entities in chunk_entities.values()),
                "relation_count": len(chunk_relations)
            }
            
            # Add to vector database
            vector_db["chunks"][chunk_id] = chunk_embedding
            vector_db["metadata"][chunk_id] = {
                "csr_id": csr_id,
                "chunk_index": i
            }
            
            vector_db["count"] = len(vector_db["chunks"])
            
            logger.info(f"Processed chunk {i+1}/{len(chunks)} for CSR {csr_id}")
        
        # 3. Extract structured trial data
        logger.info(f"Extracting structured data for CSR {csr_id}")
        trial_data = extract_structured_trial_data(text, csr_id)
        
        # 4. Extract deep insights
        logger.info(f"Extracting deep insights for CSR {csr_id}")
        insights = extract_deep_insights(text, trial_data)
        
        # 5. Connect insights to semantic network
        logger.info(f"Connecting insights to semantic network for CSR {csr_id}")
        network_connections = connect_insights_to_semantic_network(insights, csr_id)
        
        # 6. Update knowledge base
        # Store extracted structured data
        structured_data[csr_id] = trial_data
        
        # Update entity map
        for entity_type, entities in all_entities.items():
            if isinstance(entity_map["entities"], dict):
                if entity_type not in entity_map["entities"]:
                    entity_map["entities"][entity_type] = []
                entity_map["entities"][entity_type].extend(entities)
            else:
                # If entity_map["entities"] is not a dict, initialize it
                entity_map["entities"] = defaultdict(list)
                entity_map["entities"][entity_type].extend(entities)
        
        entity_map["count"] = sum(len(entities) for entities in entity_map["entities"].values())
        
        # Update semantic graph with new nodes and edges
        for entity_type, entities in all_entities.items():
            for entity in entities:
                entity_id = f"{csr_id}_{entity_type}_{len(semantic_graph['nodes'])}"
                semantic_graph["nodes"][entity_id] = {
                    "id": entity_id,
                    "type": entity_type,
                    "name": entity.get("name", ""),
                    "attributes": entity.get("attributes", {}),
                    "csr_id": csr_id,
                    "chunk_id": entity.get("chunk_id")
                }
        
        for relation in all_relations:
            edge = {
                "source": relation.get("source"),
                "target": relation.get("target"),
                "type": relation.get("relationship_type", relation.get("type", "is_related_to")),
                "evidence": relation.get("evidence", ""),
                "csr_id": csr_id,
                "chunk_id": relation.get("chunk_id")
            }
            semantic_graph["edges"].append(edge)
        
        # Update insight network
        # Add new insights
        for i, insight in enumerate(insights):
            insight_id = f"{csr_id}_insight_{i}"
            insight_object = {
                "id": insight_id,
                "csr_id": csr_id,
                "category": insight.get("category", "unknown"),
                "text": insight.get("insight", ""),
                "evidence": insight.get("evidence", ""),
                "implications": insight.get("implications", ""),
                "confidence": insight.get("confidence", "medium")
            }
            insight_network["insights"].append(insight_object)
        
        # Add new connections
        for connection in network_connections.get("new_connections", []):
            insight_network["connections"].append(connection)
        
        # Update themes
        for theme_name, theme_data in network_connections.get("updated_themes", {}).items():
            if theme_name not in insight_network["themes"]:
                insight_network["themes"][theme_name] = {
                    "description": theme_data.get("description", ""),
                    "insights": []
                }
            
            # Add new insights to the theme
            insight_network["themes"][theme_name]["insights"].extend(theme_data.get("insights", []))
            # Remove duplicates
            insight_network["themes"][theme_name]["insights"] = list(set(insight_network["themes"][theme_name]["insights"]))
        
        # Save knowledge base to disk
        save_csr_knowledge_base()
        
        # Return processing summary
        return {
            "csr_id": csr_id,
            "chunks_processed": len(chunks),
            "entities_extracted": {
                entity_type: len(entities) for entity_type, entities in all_entities.items()
            },
            "relations_extracted": len(all_relations),
            "insights_generated": len(insights),
            "structured_data_sections": list(trial_data.keys()),
            "network_connections": len(network_connections.get("new_connections", [])),
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"Error processing CSR document {csr_id}: {str(e)}")
        return {
            "csr_id": csr_id,
            "status": "error",
            "error": str(e)
        }

def semantic_search(query: str, top_k: int = 5, filter_by_csr: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Perform semantic search against the CSR knowledge base
    
    Args:
        query: Search query
        top_k: Number of results to return
        filter_by_csr: Optional CSR ID to filter results
        
    Returns:
        Ranked search results with context
    """
    # Ensure knowledge base is loaded
    load_csr_knowledge_base()
    
    # Generate query embedding
    query_embedding = generate_text_embedding(query)
    
    # Calculate similarity with chunks in vector database
    results = []
    for chunk_id, embedding in vector_db["chunks"].items():
        # Apply CSR filter if specified
        if filter_by_csr:
            chunk_metadata = vector_db["metadata"].get(chunk_id, {})
            if chunk_metadata.get("csr_id") != filter_by_csr:
                continue
        
        # Calculate similarity
        similarity = cosine_similarity(query_embedding, embedding)
        
        # Get chunk data
        chunk_data = chunk_metadata.get(chunk_id, {})
        
        # Add to results
        results.append({
            "chunk_id": chunk_id,
            "csr_id": chunk_data.get("csr_id", "unknown"),
            "similarity": similarity,
            "text": chunk_data.get("text", "")
        })
    
    # Sort by similarity
    results.sort(key=lambda x: x["similarity"], reverse=True)
    
    # Return top_k results with context enhancement
    top_results = results[:top_k]
    enhanced_results = []
    
    for result in top_results:
        # Get CSR context
        csr_id = result["csr_id"]
        trial_data = structured_data.get(csr_id, {})
        
        # Add structured context
        enhanced_result = {
            "chunk_id": result["chunk_id"],
            "csr_id": csr_id,
            "similarity": result["similarity"],
            "text": result["text"],
            "context": {
                "trial_design": trial_data.get("trial_design", {}),
                "intervention": trial_data.get("intervention", {}),
                "endpoints": trial_data.get("endpoints", {}),
            }
        }
        
        enhanced_results.append(enhanced_result)
    
    return enhanced_results

def entity_search(entity_type: str, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
    """
    Search for specific entities in the knowledge base
    
    Args:
        entity_type: Type of entity to search for
        query: Search query
        top_k: Number of results to return
        
    Returns:
        Matching entities with context
    """
    # Ensure knowledge base is loaded
    load_csr_knowledge_base()
    
    # Generate query embedding
    query_embedding = generate_text_embedding(query)
    
    # Get entities of the specified type
    if isinstance(entity_map["entities"], dict):
        entities = entity_map["entities"].get(entity_type, [])
    else:
        entities = []
    
    if not entities:
        return []
    
    # For each entity, generate embeddings for the name and context
    results = []
    for entity in entities:
        # Create a text representation of the entity
        entity_text = f"{entity.get('name', '')} {entity.get('context', '')}"
        
        # Generate embedding
        entity_embedding = generate_text_embedding(entity_text)
        
        # Calculate similarity
        similarity = cosine_similarity(query_embedding, entity_embedding)
        
        # Add to results
        results.append({
            "entity": entity,
            "similarity": similarity
        })
    
    # Sort by similarity
    results.sort(key=lambda x: x["similarity"], reverse=True)
    
    # Return top_k results with enhanced context
    top_results = results[:top_k]
    enhanced_results = []
    
    for result in top_results:
        entity = result["entity"]
        chunk_id = entity.get("chunk_id")
        
        # Get chunk context if available
        chunk_context = ""
        if chunk_id in chunk_metadata:
            chunk_context = chunk_metadata[chunk_id].get("text", "")
        
        # Add structured context
        enhanced_result = {
            "entity_type": entity_type,
            "name": entity.get("name", ""),
            "attributes": entity.get("attributes", {}),
            "context": chunk_context,
            "csr_id": entity.get("csr_id", ""),
            "similarity": result["similarity"]
        }
        
        enhanced_results.append(enhanced_result)
    
    return enhanced_results

def find_related_entities(entity_type: str, entity_name: str, max_distance: int = 2) -> Dict[str, Any]:
    """
    Find entities related to a specified entity in the semantic graph
    
    Args:
        entity_type: Type of entity to start from
        entity_name: Name of the entity to start from
        max_distance: Maximum graph distance to traverse
        
    Returns:
        Related entities and the paths connecting them
    """
    # Ensure knowledge base is loaded
    load_csr_knowledge_base()
    
    # Find the entity in the graph
    starting_nodes = []
    for node_id, node in semantic_graph["nodes"].items():
        if node["type"] == entity_type and node["name"].lower() == entity_name.lower():
            starting_nodes.append(node_id)
    
    if not starting_nodes:
        return {
            "entity": f"{entity_type}:{entity_name}",
            "related_entities": [],
            "paths": []
        }
    
    # For simplicity, use the first matching entity
    start_node = starting_nodes[0]
    
    # Build adjacency list from edges
    adjacency_list = defaultdict(list)
    for edge in semantic_graph["edges"]:
        source = edge.get("source")
        target = edge.get("target")
        if source and target:
            adjacency_list[source].append({
                "target": target,
                "type": edge.get("type", "is_related_to"),
                "evidence": edge.get("evidence", "")
            })
            # Add reverse direction to make graph undirected
            adjacency_list[target].append({
                "target": source,
                "type": f"reverse_{edge.get('type', 'is_related_to')}",
                "evidence": edge.get("evidence", "")
            })
    
    # Perform BFS to find related entities
    visited = set([start_node])
    queue = [(start_node, 0, [])]  # (node, distance, path)
    related_entities = []
    paths = []
    
    while queue:
        node, distance, path = queue.pop(0)
        
        # If we've reached max distance, don't explore further
        if distance >= max_distance:
            continue
        
        # Process neighbors
        for neighbor in adjacency_list[node]:
            target = neighbor["target"]
            
            if target not in visited:
                visited.add(target)
                
                # Add edge to path
                new_path = path + [{
                    "source": node,
                    "target": target,
                    "type": neighbor["type"],
                    "evidence": neighbor["evidence"]
                }]
                
                # Add to related entities
                if target in semantic_graph["nodes"]:
                    target_node = semantic_graph["nodes"][target]
                    related_entities.append({
                        "id": target,
                        "type": target_node.get("type", "unknown"),
                        "name": target_node.get("name", ""),
                        "distance": distance + 1
                    })
                    paths.append(new_path)
                
                # Enqueue for further exploration
                queue.append((target, distance + 1, new_path))
    
    return {
        "entity": f"{entity_type}:{entity_name}",
        "related_entities": related_entities,
        "paths": paths
    }

def generate_evidence_synthesis(query: str, max_results: int = 5) -> Dict[str, Any]:
    """
    Generate a comprehensive evidence synthesis from the knowledge base
    
    Args:
        query: The query to synthesize evidence for
        max_results: Maximum number of sources to include
        
    Returns:
        Synthesized evidence with sources and recommendations
    """
    # Find relevant chunks
    relevant_results = semantic_search(query, top_k=max_results)
    
    if not relevant_results:
        return {
            "query": query,
            "synthesis": "No relevant evidence found in the knowledge base.",
            "sources": [],
            "recommendations": []
        }
    
    # Collect context
    contexts = []
    for result in relevant_results:
        csr_id = result["csr_id"]
        context = {
            "source": f"CSR_{csr_id}",
            "text": result["text"],
            "structured_data": result.get("context", {})
        }
        contexts.append(context)
    
    # Find relevant insights
    relevant_insights = []
    for insight in insight_network.get("insights", []):
        # Simple keyword matching for insights (could be enhanced with embeddings)
        if query.lower() in insight.get("text", "").lower() or query.lower() in insight.get("category", "").lower():
            relevant_insights.append(insight)
    
    # Limit to top 5 insights
    relevant_insights = relevant_insights[:5]
    
    # Generate synthesis with OpenAI
    prompt = f"""
    Generate a comprehensive evidence synthesis for the following query using these clinical trial sources:
    
    QUERY: {query}
    
    SOURCES:
    {json.dumps(contexts, indent=2)}
    
    RELEVANT INSIGHTS:
    {json.dumps(relevant_insights, indent=2)}
    
    Provide:
    1. A thorough evidence synthesis (2-3 paragraphs)
    2. Key findings across trials (bullet points)
    3. Methodological considerations (strengths/limitations)
    4. Clinical implications
    5. Regulatory considerations
    6. Specific recommendations for trial design in this area
    7. A list of the sources used with brief descriptions
    
    Format your response as JSON with these sections.
    """
    
    try:
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized clinical evidence synthesis system able to integrate findings across multiple clinical trial sources to generate comprehensive, evidence-based analyses."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.15,
            response_format={"type": "json_object"}
        )
        
        synthesis = json.loads(response.choices[0].message.content)
        synthesis["query"] = query
        
        return synthesis
    
    except Exception as e:
        logger.error(f"Error generating evidence synthesis: {str(e)}")
        return {
            "query": query,
            "synthesis": "Error generating evidence synthesis.",
            "sources": [{"id": r["csr_id"], "text": r["text"][:100] + "..."} for r in relevant_results],
            "error": str(e)
        }

def generate_study_design_recommendations(indication: str, phase: str, primary_endpoint: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate evidence-based study design recommendations
    
    Args:
        indication: Target disease/condition
        phase: Clinical trial phase
        primary_endpoint: Optional primary endpoint
        
    Returns:
        Detailed study design recommendations
    """
    # Ensure knowledge base is loaded
    load_csr_knowledge_base()
    
    # Find most relevant CSRs for this indication and phase
    search_query = f"{indication} {phase} clinical trial"
    if primary_endpoint:
        search_query += f" {primary_endpoint} endpoint"
    
    relevant_csrs = semantic_search(search_query, top_k=5)
    
    # Collect relevant structured data
    design_data = []
    for result in relevant_csrs:
        csr_id = result["csr_id"]
        if csr_id in structured_data:
            csr_data = structured_data[csr_id]
            design_info = {
                "csr_id": csr_id,
                "design": csr_data.get("trial_design", {}),
                "intervention": csr_data.get("intervention", {}),
                "eligibility": csr_data.get("eligibility", {}),
                "endpoints": csr_data.get("endpoints", {}),
                "statistical_methods": csr_data.get("statistical_methods", {})
            }
            design_data.append(design_info)
    
    # Find relevant insights
    design_insights = []
    for insight in insight_network.get("insights", []):
        category = insight.get("category", "").lower()
        text = insight.get("text", "").lower()
        # Look for design-related insights matching the query
        if ("design" in category or "endpoint" in category or "method" in category) and (
            indication.lower() in text or phase.lower() in text
        ):
            design_insights.append(insight)
    
    # Generate recommendations
    prompt = f"""
    Generate comprehensive, evidence-based study design recommendations for:
    
    INDICATION: {indication}
    PHASE: {phase}
    {f"PRIMARY ENDPOINT: {primary_endpoint}" if primary_endpoint else ""}
    
    Use these reference designs from similar trials:
    {json.dumps(design_data, indent=2)}
    
    And consider these relevant design insights:
    {json.dumps(design_insights, indent=2)}
    
    Provide detailed recommendations for:
    1. Overall trial design (type, duration, etc.)
    2. Control/comparator selection
    3. Randomization approach 
    4. Blinding considerations
    5. Key eligibility criteria (inclusion/exclusion)
    6. Primary and secondary endpoints with justification
    7. Statistical considerations (sample size, analyses)
    8. Key safety monitoring parameters
    9. Special populations or stratification factors
    10. Innovative design elements to consider
    
    For each recommendation, cite the specific evidence source.
    Be specific and detailed - provide actual numbers, timeframes, and detailed criteria.
    
    Format your response as a JSON object with sections for each design element.
    """
    
    try:
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized clinical trial design system with expertise in generating evidence-based, regulatory-compliant trial designs across therapeutic areas and phases."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        recommendations = json.loads(response.choices[0].message.content)
        
        # Add query information
        recommendations["query"] = {
            "indication": indication,
            "phase": phase,
            "primary_endpoint": primary_endpoint
        }
        
        # Add sources
        recommendations["sources"] = [
            {"csr_id": design["csr_id"]} for design in design_data
        ]
        
        return recommendations
    
    except Exception as e:
        logger.error(f"Error generating study design recommendations: {str(e)}")
        return {
            "query": {
                "indication": indication,
                "phase": phase,
                "primary_endpoint": primary_endpoint
            },
            "error": str(e),
            "sources": [{"csr_id": design["csr_id"]} for design in design_data]
        }

def perform_cross_csr_analysis(analysis_type: str, query_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Perform cross-CSR analysis for meta-insights
    
    Args:
        analysis_type: Type of analysis to perform
        query_params: Parameters for the analysis
        
    Returns:
        Analysis results
    """
    # Ensure knowledge base is loaded
    load_csr_knowledge_base()
    
    # Define different analysis types
    if analysis_type == "endpoint_effectiveness":
        # Analyze effectiveness of different endpoints across trials
        indication = query_params.get("indication", "")
        
        # Find all CSRs for this indication
        matching_csrs = []
        for csr_id, csr_data in structured_data.items():
            trial_design = csr_data.get("trial_design", {})
            if indication.lower() in str(trial_design).lower():
                matching_csrs.append(csr_id)
        
        # Collect endpoint data
        endpoint_data = []
        for csr_id in matching_csrs:
            csr_data = structured_data.get(csr_id, {})
            endpoints = csr_data.get("endpoints", {})
            efficacy = csr_data.get("efficacy", {})
            
            endpoint_info = {
                "csr_id": csr_id,
                "endpoints": endpoints,
                "efficacy": efficacy
            }
            endpoint_data.append(endpoint_info)
        
        prompt = f"""
        Perform a comprehensive cross-trial analysis of endpoint effectiveness for {indication}.
        
        Analyze these endpoint data from multiple clinical trials:
        {json.dumps(endpoint_data, indent=2)}
        
        Provide:
        1. A comparison of endpoint performance across trials
        2. Assessment of which endpoints were most sensitive to treatment effects
        3. Patterns in primary vs. secondary endpoint results
        4. Recommendations for optimal endpoints for future {indication} trials
        5. Methodological considerations for endpoint selection
        
        Focus on evidence-based insights that would help optimize endpoint selection.
        Format your response as a JSON object with these sections.
        """
        
        analysis_name = f"Endpoint Effectiveness for {indication}"
    
    elif analysis_type == "eligibility_impact":
        # Analyze impact of eligibility criteria on outcomes
        indication = query_params.get("indication", "")
        
        # Find relevant CSRs
        matching_csrs = []
        for csr_id, csr_data in structured_data.items():
            if indication.lower() in str(csr_data).lower():
                matching_csrs.append(csr_id)
        
        # Collect eligibility and efficacy data
        eligibility_data = []
        for csr_id in matching_csrs:
            csr_data = structured_data.get(csr_id, {})
            eligibility = csr_data.get("eligibility", {})
            efficacy = csr_data.get("efficacy", {})
            dropout = csr_data.get("safety", {})  # Often contains dropout information
            
            data = {
                "csr_id": csr_id,
                "eligibility": eligibility,
                "efficacy": efficacy,
                "safety": dropout
            }
            eligibility_data.append(data)
        
        prompt = f"""
        Perform a comprehensive analysis of eligibility criteria impact on trial outcomes for {indication}.
        
        Analyze these data from multiple clinical trials:
        {json.dumps(eligibility_data, indent=2)}
        
        Provide:
        1. Patterns in eligibility criteria across trials
        2. Assessment of how inclusion/exclusion criteria affected outcomes
        3. Key criteria that appear to impact efficacy or safety
        4. Criteria that may have led to increased dropouts
        5. Recommendations for optimal eligibility criteria for future {indication} trials
        
        Focus on evidence-based insights that would help optimize participant selection.
        Format your response as a JSON object with these sections.
        """
        
        analysis_name = f"Eligibility Criteria Impact for {indication}"
    
    elif analysis_type == "safety_patterns":
        # Analyze safety patterns across trials
        intervention = query_params.get("intervention", "")
        
        # Find relevant CSRs
        matching_csrs = []
        for csr_id, csr_data in structured_data.items():
            intervention_data = csr_data.get("intervention", {})
            if intervention.lower() in str(intervention_data).lower():
                matching_csrs.append(csr_id)
        
        # Collect safety data
        safety_data = []
        for csr_id in matching_csrs:
            csr_data = structured_data.get(csr_id, {})
            safety = csr_data.get("safety", {})
            intervention_details = csr_data.get("intervention", {})
            
            data = {
                "csr_id": csr_id,
                "safety": safety,
                "intervention": intervention_details
            }
            safety_data.append(data)
        
        prompt = f"""
        Perform a comprehensive safety pattern analysis for {intervention} across clinical trials.
        
        Analyze these safety data from multiple trials:
        {json.dumps(safety_data, indent=2)}
        
        Provide:
        1. Common adverse events and their frequencies
        2. Dose-response patterns in adverse events
        3. Serious adverse events and their relation to the intervention
        4. Safety patterns in special populations
        5. Recommendations for safety monitoring in future trials
        
        Focus on evidence-based safety insights across trials.
        Format your response as a JSON object with these sections.
        """
        
        analysis_name = f"Safety Patterns for {intervention}"
    
    else:
        return {
            "error": f"Unknown analysis type: {analysis_type}",
            "supported_types": ["endpoint_effectiveness", "eligibility_impact", "safety_patterns"]
        }
    
    try:
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized clinical trial meta-analysis system that can synthesize patterns and insights across multiple clinical studies to identify evidence-based best practices."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        analysis_results = json.loads(response.choices[0].message.content)
        
        # Add metadata
        analysis_results["analysis_type"] = analysis_type
        analysis_results["analysis_name"] = analysis_name
        analysis_results["query_params"] = query_params
        
        return analysis_results
    
    except Exception as e:
        logger.error(f"Error performing cross-CSR analysis: {str(e)}")
        return {
            "analysis_type": analysis_type,
            "analysis_name": analysis_name,
            "query_params": query_params,
            "error": str(e)
        }

def extract_csr_citations_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extract deep, comprehensive CSR citations from text
    
    Args:
        text: Text to analyze for CSR citations
        
    Returns:
        List of structured CSR citations with metadata
    """
    # Ensure knowledge base is loaded
    load_csr_knowledge_base()
    
    # First, perform semantic search to find relevant CSRs
    relevant_csrs = semantic_search(text, top_k=10)
    relevant_csr_ids = [result["csr_id"] for result in relevant_csrs]
    
    # Build context for citation extraction
    csr_contexts = []
    for csr_id in relevant_csr_ids:
        if csr_id in structured_data:
            csr_data = structured_data[csr_id]
            context = {
                "csr_id": csr_id,
                "design": csr_data.get("trial_design", {}),
                "indication": csr_data.get("trial_design", {}).get("indication", "Unknown"),
                "phase": csr_data.get("trial_design", {}).get("phase", "Unknown"),
                "intervention": csr_data.get("intervention", {}).get("name", "Unknown")
            }
            csr_contexts.append(context)
    
    prompt = f"""
    Extract all relevant clinical trial (CSR) citations from this text:
    
    TEXT:
    {text}
    
    Here are the most semantically relevant clinical trials in our knowledge base:
    {json.dumps(csr_contexts, indent=2)}
    
    For each citation found in the text:
    1. Identify the specific CSR being referenced
    2. Extract the context where it's cited
    3. Determine if it's explicitly mentioned or implicitly referenced
    4. Assess the relevance/importance of this citation (high, medium, low)
    
    If no explicit CSR citations are found, identify the 3-5 most relevant CSRs from the provided list based on the semantic content of the text.
    
    Format your response as a JSON array of citation objects.
    """
    
    try:
        response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized citation extraction system designed to identify both explicit and implicit references to clinical trials in text, with a focus on precision and relevance."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Extract citations from the result
        if isinstance(result, list):
            citations = result
        elif isinstance(result, dict) and "citations" in result:
            citations = result["citations"]
        else:
            # If we can't find the expected structure, try to find any array
            citations = []
            for key, value in result.items():
                if isinstance(value, list) and len(value) > 0:
                    citations = value
                    break
        
        # Enhance citations with additional metadata
        enhanced_citations = []
        for citation in citations:
            csr_id = citation.get("csr_id")
            if csr_id in structured_data:
                csr_data = structured_data[csr_id]
                citation["metadata"] = {
                    "indication": csr_data.get("trial_design", {}).get("indication", "Unknown"),
                    "phase": csr_data.get("trial_design", {}).get("phase", "Unknown"),
                    "intervention": csr_data.get("intervention", {}).get("name", "Unknown"),
                    "primary_endpoint": str(csr_data.get("endpoints", {}).get("primary_endpoints", "Unknown"))
                }
            enhanced_citations.append(citation)
        
        return enhanced_citations
    
    except Exception as e:
        logger.error(f"Error extracting CSR citations: {str(e)}")
        # Return basic citations from semantic search as fallback
        basic_citations = []
        for i, result in enumerate(relevant_csrs[:5]):
            basic_citations.append({
                "csr_id": result["csr_id"],
                "relevance": "medium",
                "citation_type": "semantic",
                "similarity_score": result["similarity"]
            })
        return basic_citations

# Initialize the knowledge base on module load
try:
    load_csr_knowledge_base()
except Exception as e:
    logger.error(f"Error initializing Deep CSR Knowledge Base: {str(e)}")