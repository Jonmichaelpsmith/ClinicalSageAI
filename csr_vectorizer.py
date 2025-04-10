# 🧠 SagePlus | CSR Vectorizer (Phase 2: Embedding & Vector Database)
# Converts structured JSON CSR data into vector embeddings for similarity search

import os
import json
import requests
import time
from typing import List, Dict, Any

HF_API_KEY = os.getenv("HF_API_KEY")
# Using Hugging Face's all-MiniLM-L6-v2 embedding model as suggested
HF_EMBEDDING_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

# Function to generate a summary text from structured CSR data
def generate_summary_text(csr_data: Dict[str, Any]) -> str:
    """Generate a natural language summary from structured CSR data for embedding"""
    try:
        return f"""
        {csr_data.get('study_title', 'Unnamed trial')} was a {csr_data.get('phase', '')} trial 
        in {csr_data.get('indication', '')} with {csr_data.get('sample_size', '')} subjects. 
        Study arms: {', '.join(csr_data.get('study_arms', []))}. 
        Primary endpoint(s): {', '.join(csr_data.get('primary_endpoints', []))}. 
        Secondary endpoint(s): {', '.join(csr_data.get('secondary_endpoints', []))}. 
        Outcome: {csr_data.get('outcome_summary', '')}. 
        Adverse events: {csr_data.get('adverse_events', '')}.
        """.strip()
    except Exception as e:
        print(f"Error generating summary: {e}")
        return ""

# Function to get embeddings from Hugging Face API
def get_embedding(text: str) -> List[float]:
    """Get vector embedding for a text using Hugging Face API"""
    try:
        response = requests.post(
            HF_EMBEDDING_URL,
            headers=HEADERS,
            json={"inputs": text}
        )
        if response.status_code != 200:
            print(f"Error from HF API: {response.text}")
            return []
        return response.json()
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return []

# Process JSON files and create embeddings
def process_json_files(input_dir="csr_json", output_dir="csr_vectors"):
    """Process all JSON files in the input directory and create vector embeddings"""
    os.makedirs(output_dir, exist_ok=True)
    files = [f for f in os.listdir(input_dir) if f.endswith(".json")]
    
    for file in files:
        input_path = os.path.join(input_dir, file)
        print(f"Processing {file} for vectorization...")
        
        try:
            # Load the structured CSR data
            with open(input_path, 'r') as f:
                csr_data = json.load(f)
            
            # Generate the summary text for embedding
            summary_text = generate_summary_text(csr_data)
            if not summary_text:
                print(f"Skipping {file} - could not generate summary")
                continue
                
            # Get vector embedding
            embedding = get_embedding(summary_text)
            if not embedding:
                print(f"Skipping {file} - could not generate embedding")
                continue
                
            # Add the embedding to the data
            csr_data['text_summary'] = summary_text
            csr_data['embedding'] = embedding
            
            # Save the enhanced data
            output_path = os.path.join(output_dir, file)
            with open(output_path, 'w') as f:
                json.dump(csr_data, f, indent=2)
                
            print(f"Successfully vectorized {file}")
            time.sleep(1)  # Avoid rate limiting
            
        except Exception as e:
            print(f"Error processing {file}: {e}")
            
    print(f"Vectorization complete for {len(files)} files")

# Run the vectorization process
if __name__ == "__main__":
    process_json_files()