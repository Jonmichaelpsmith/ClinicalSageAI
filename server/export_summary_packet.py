#!/usr/bin/env python3
"""
Summary Packet Export API
This script provides an API endpoint for exporting summary intelligence packets as PDFs
with multiple data sources including reasoning trace logs
"""

import os
import json
import sys
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, Body, HTTPException
from fpdf import FPDF

# Import branded cover sheet module
from branded_cover_sheet import generate_cover_sheet, load_session_metadata

app = FastAPI(title="Summary Packet Export Service")

@app.post("/api/export/summary-packet")
def export_summary_packet(data: Dict = Body(...)):
    """
    Generate a comprehensive summary packet PDF with multiple intelligence components:
    - Dropout risk forecast
    - Success prediction
    - IND Module 2.5 summary
    - AI reasoning trace (wisdom log)
    
    Args:
        data: Dictionary containing export parameters including session_id
        
    Returns:
        Dictionary with status and path to generated PDF
    """
    session_id = data.get("session_id", "default_session")
    persona = data.get("persona", "Regulatory")
    
    # Determine archive directory based on environment
    if os.path.exists("/mnt/data"):
        # Production environment
        archive_dir = f"/mnt/data/lumen_reports_backend/sessions/{session_id}"
    else:
        # Development environment
        archive_dir = f"data/sessions/{session_id}"
    
    os.makedirs(archive_dir, exist_ok=True)

    # Initialize PDF
    pdf_path = os.path.join(archive_dir, "summary_packet.pdf")
    pdf = FPDF()
    
    # Add branded cover sheet
    sections = [
        "Dropout Risk Forecast",
        "Success Prediction Model",
        "IND Module 2.5 Summary",
        "Assistant Reasoning Trace"
    ]
    
    # Load metadata from session files
    protocol_metadata = load_session_metadata(session_id)
    
    # Generate the branded cover sheet
    generate_cover_sheet(
        pdf=pdf, 
        title="Clinical Trial Intelligence Summary",
        session_id=session_id,
        persona=persona,
        sections=sections,
        protocol_metadata=protocol_metadata,
        report_type="Summary Intelligence Packet"
    )
    pdf.set_font("Arial", "I", size=11)
    pdf.cell(0, 10, txt=f"Session ID: {session_id}", 0, 1, 'C')
    pdf.cell(0, 5, txt=f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}", 0, 1, 'C')
    pdf.ln(5)

    # Add dropout forecast section
    dropout_path = os.path.join(archive_dir, "dropout_forecast.json")
    if os.path.exists(dropout_path):
        try:
            with open(dropout_path, "r") as f:
                dropout_data = json.load(f)
                summary = dropout_data.get("summary", "")
                pdf.ln(5)
                pdf.set_font("Arial", "B", size=12)
                pdf.cell(0, 10, txt="📉 Dropout Risk Forecast", 0, 1, 'L')
                pdf.set_font("Arial", size=10)
                pdf.multi_cell(0, 5, summary)
                
                # Add risk level if available
                risk_level = dropout_data.get("risk_level", "")
                if risk_level:
                    pdf.ln(3)
                    pdf.set_font("Arial", "B", size=10)
                    pdf.cell(30, 5, "Risk Level:", 0, 0)
                    pdf.set_font("Arial", size=10)
                    pdf.cell(0, 5, risk_level.upper(), 0, 1)
                    
                # Add completion rate if available
                completion_rate = dropout_data.get("expected_completion_rate", 0)
                if completion_rate:
                    pdf.set_font("Arial", "B", size=10)
                    pdf.cell(30, 5, "Completion Rate:", 0, 0)
                    pdf.set_font("Arial", size=10)
                    pdf.cell(0, 5, f"{completion_rate}%", 0, 1)
        except Exception as e:
            pdf.multi_cell(0, 5, f"Error loading dropout forecast: {str(e)}")

    # Add success prediction section
    success_path = os.path.join(archive_dir, "success_prediction.json")
    if os.path.exists(success_path):
        try:
            with open(success_path, "r") as f:
                pred_data = json.load(f)
                pdf.ln(10)
                pdf.set_font("Arial", "B", size=12)
                pdf.cell(0, 10, txt="📈 Predicted Trial Outcome", 0, 1, 'L')
                
                # Extract key values with defaults
                probability = pred_data.get("probability", pred_data.get("success_probability", 0))
                method = pred_data.get("method", pred_data.get("model_name", "Statistical Model"))
                confidence = pred_data.get("confidence", 0.5)
                factors = pred_data.get("factors", [])
                
                # Format probability as percentage
                prob_pct = round(probability * 100)
                
                # Determine color based on probability
                if prob_pct >= 70:
                    color_text = "green"
                elif prob_pct >= 50:
                    color_text = "amber"
                else:
                    color_text = "red"
                
                # Add formatted prediction text
                pdf.set_font("Arial", "B", size=11)
                pdf.cell(0, 8, f"{prob_pct}% Success Probability ({color_text})", 0, 1)
                
                # Add model and confidence info
                confidence_text = "Low" if confidence < 0.4 else "Medium" if confidence < 0.7 else "High"
                pdf.set_font("Arial", "I", size=10)
                pdf.cell(0, 5, f"Model: {method} | Confidence: {confidence_text}", 0, 1)
                pdf.ln(5)
                
                # Add prediction summary if available
                summary = pred_data.get("summary", "")
                if summary:
                    pdf.set_font("Arial", size=10)
                    pdf.multi_cell(0, 5, summary)
                    pdf.ln(5)
                
                # Add contributing factors if available
                if factors:
                    pdf.set_font("Arial", "B", size=10)
                    pdf.cell(0, 5, "Key Contributing Factors:", 0, 1)
                    pdf.ln(2)
                    
                    pdf.set_font("Arial", size=9)
                    for factor in factors:
                        # Handle both string factors and dictionary factors
                        if isinstance(factor, dict):
                            factor_text = f"{factor.get('factor', '')}: {factor.get('impact', '')}"
                        else:
                            factor_text = factor
                            
                        pdf.cell(5, 5, "•", 0, 0)
                        pdf.multi_cell(0, 5, factor_text)
        except Exception as e:
            pdf.multi_cell(0, 5, f"Error loading success prediction: {str(e)}")
    
    # Add IND Module 2.5 summary
    ind_path = os.path.join(archive_dir, "ind_summary.txt")
    if os.path.exists(ind_path):
        try:
            with open(ind_path, "r") as f:
                ind_text = f.read()
                pdf.ln(10)
                pdf.set_font("Arial", "B", size=12)
                pdf.cell(0, 10, txt="📄 IND Module 2.5 Summary", 0, 1, 'L')
                pdf.set_font("Arial", size=10)
                pdf.multi_cell(0, 5, ind_text.strip())
        except Exception as e:
            pdf.multi_cell(0, 5, f"Error loading IND summary: {str(e)}")
    
    # Add reasoning trace (wisdom log)
    wisdom_path = os.path.join(archive_dir, "reasoning_trace.txt")
    if os.path.exists(wisdom_path):
        try:
            with open(wisdom_path, "r") as f:
                wisdom_text = f.read()
                pdf.add_page()
                pdf.set_font("Arial", "B", size=12)
                pdf.cell(0, 10, txt="🧠 AI Reasoning Trace", 0, 1, 'L')
                pdf.set_font("Arial", "I", size=9)
                pdf.cell(0, 5, txt="How the AI assistant reached these conclusions:", 0, 1)
                pdf.ln(5)
                
                # Add collapsible explanation of reasoning trace
                pdf.set_font("Arial", size=10)
                pdf.multi_cell(0, 5, "This section documents the step-by-step reasoning process the AI used to generate recommendations. It's intended for transparency, auditability, and regulatory documentation.")
                pdf.ln(5)
                
                # Format and add wisdom text, breaking into sections if needed
                pdf.set_font("Arial", size=9)
                
                # Process reasoning trace by paragraphs for better formatting
                paragraphs = wisdom_text.split('\n\n')
                for i, para in enumerate(paragraphs):
                    if para.strip():  # Skip empty paragraphs
                        # Add section headers if detected
                        if para.strip().startswith('# ') or para.strip().startswith('## '):
                            pdf.set_font("Arial", "B", size=10)
                            pdf.multi_cell(0, 5, para.strip().replace('#', '').strip())
                            pdf.set_font("Arial", size=9)
                        else:
                            pdf.multi_cell(0, 5, para.strip())
                        
                        # Add a small gap between paragraphs
                        if i < len(paragraphs) - 1:
                            pdf.ln(2)
        except Exception as e:
            pdf.multi_cell(0, 5, f"Error loading reasoning trace: {str(e)}")
    
    # Finalize and save PDF
    pdf.output(pdf_path)
    
    # Return the path to the generated PDF
    return {
        "status": "ok", 
        "path": f"/static/{session_id}/summary_packet.pdf",
        "sections_included": {
            "dropout_forecast": os.path.exists(dropout_path),
            "success_prediction": os.path.exists(success_path),
            "ind_summary": os.path.exists(ind_path),
            "reasoning_trace": os.path.exists(wisdom_path)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)