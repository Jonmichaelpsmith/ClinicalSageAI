# 🧠 SagePlus | Batch CSR Extractor to Structured JSON (Phase 1: Extraction)
# Uses PyMuPDF (fitz) to parse PDFs, Hugging Face LLM to extract structured fields

import os
import fitz  # PyMuPDF
import json
import requests
import time

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

# Prompt Template for extracting structured trial data from raw text
PROMPT_TEMPLATE = """
You are a clinical trial report parser. Extract the following fields from the text:
- Study Title
- Indication
- Phase
- Sample Size
- Study Arms
- Primary Endpoints
- Secondary Endpoints
- Outcome Summary
- Adverse Events (summary format)
Return only valid JSON with those keys.

CSR TEXT:
{text}
"""

# Function to read CSR text from PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    return "\n".join([page.get_text() for page in doc])

# Function to query Hugging Face LLM
def extract_structured_data(text):
    prompt = PROMPT_TEMPLATE.replace("{text}", text[:8000])
    response = requests.post(HF_MODEL_URL, headers=HEADERS, json={"inputs": prompt})
    try:
        return json.loads(response.json()[0]['generated_text'])
    except Exception as e:
        print("Parsing error:", e)
        return {}

# Batch process folder of CSR PDFs
def process_csr_folder(input_dir="csrs", output_dir="csr_json"):
    os.makedirs(output_dir, exist_ok=True)
    files = [f for f in os.listdir(input_dir) if f.endswith(".pdf")]
    for file in files:
        pdf_path = os.path.join(input_dir, file)
        print(f"🔍 Processing {file}...")
        text = extract_text_from_pdf(pdf_path)
        data = extract_structured_data(text)

        with open(os.path.join(output_dir, file.replace(".pdf", ".json")), "w") as f:
            json.dump(data, f, indent=2)
        time.sleep(2)  # Avoid rate limits

# Run the batch job
if __name__ == "__main__":
    process_csr_folder()