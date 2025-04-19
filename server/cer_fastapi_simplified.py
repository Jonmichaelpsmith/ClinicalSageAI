"""
Simplified CER FastAPI Server

This module provides API endpoints for the CER Generator with simplified implementations
to enable frontend testing without dependencies on external services.
"""
from typing import List, Dict, Any, Optional
import json
import random
from datetime import datetime, timedelta
import io

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import Response, JSONResponse

# For PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors

# Create FastAPI app
app = FastAPI(title="CER Generation API", 
              description="API for Clinical Evaluation Report generation and analysis",
              version="1.0.0")

# Add CORS middleware to allow requests from web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import validation routers
try:
    from server.api.validation.profiles import router as validation_profiles_router
    from server.api.validation.submission import router as validation_submission_router
    
    # Include validation routers
    app.include_router(validation_profiles_router)
    app.include_router(validation_submission_router)
except ImportError as e:
    print(f"Warning: Unable to import validation routers: {str(e)}")

# --- Input Models ---

class NdcRequest(BaseModel):
    ndc_code: str

class MultiNdcRequest(BaseModel):
    ndc_codes: List[str]
    
# --- API Endpoints ---

@app.get("/health")
async def health_check():
    """Health check endpoint to verify the server is running."""
    return {
        "status": "ok",
        "service": "CER Generation API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/cer/generate")
async def generate_cer(request: NdcRequest):
    """
    Generate a Clinical Evaluation Report for a given NDC code.
    
    In a real implementation, this would:
    1. Query the FDA FAERS database for adverse events
    2. Process the data into statistics
    3. Generate a narrative using NLP
    4. Return the full CER
    
    This simplified version returns sample data.
    """
    try:
        # Simulate processing delay
        # Simulate product data (in real implementation, this would come from FAERS)
        product_info = get_product_info(request.ndc_code)
        
        # Simulate adverse events data
        events_data = generate_sample_events()
        
        # Generate a narrative
        narrative = generate_sample_narrative(request.ndc_code, product_info, events_data)
        
        # Compile the complete response
        response = {
            "ndc_code": request.ndc_code,
            "product_name": product_info["name"],
            "manufacturer": product_info["manufacturer"],
            "date_generated": datetime.now().strftime("%Y-%m-%d"),
            "total_reports": events_data["total"],
            "serious_events": events_data["serious_count"],
            "cer_narrative": narrative,
            "top_events": events_data["top_events"]
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating CER: {str(e)}")

@app.post("/cer/analyze")
async def analyze_ndc_codes(request: MultiNdcRequest):
    """
    Analyze multiple NDC codes and provide comparative data.
    
    This simplified version returns mock comparative data.
    """
    try:
        if not request.ndc_codes or len(request.ndc_codes) == 0:
            raise HTTPException(status_code=400, detail="At least one NDC code is required")
        
        comparative_data = {}
        
        # Generate comparative data for each NDC code
        for ndc_code in request.ndc_codes:
            product_info = get_product_info(ndc_code)
            events_data = generate_sample_events()
            
            # Create standardized event summary
            event_summary = {event["name"]: event["count"] for event in events_data["top_events"]}
            
            # Add some random variation to make the comparison interesting
            for event_name in list(event_summary.keys()):
                event_summary[event_name] = max(1, int(event_summary[event_name] * random.uniform(0.7, 1.3)))
            
            # Generate some sample forecast data
            forecasts = {}
            for event_name in list(event_summary.keys())[:3]:
                forecast_data = {}
                base_value = event_summary[event_name]
                for i in range(1, 7):
                    month = (datetime.now() + timedelta(days=30*i)).strftime("%Y-%m")
                    forecast_data[month] = max(1, int(base_value * (1 + 0.1 * i * random.uniform(0.8, 1.2))))
                forecasts[event_name] = forecast_data
            
            # Compile data for this NDC
            comparative_data[ndc_code] = {
                "product_info": product_info,
                "event_summary": event_summary,
                "total_reports": events_data["total"],
                "serious_events": events_data["serious_count"],
                "forecasts": forecasts
            }
        
        return {
            "comparative_data": comparative_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing NDC codes: {str(e)}")

@app.post("/cer/export-pdf")
async def export_pdf(request: MultiNdcRequest):
    """
    Generate a PDF report for one or more NDC codes.
    """
    try:
        if not request.ndc_codes or len(request.ndc_codes) == 0:
            raise HTTPException(status_code=400, detail="At least one NDC code is required")
        
        # Create a PDF buffer
        buffer = io.BytesIO()
        
        # Create the PDF document
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Add title
        if len(request.ndc_codes) == 1:
            title = f"Clinical Evaluation Report for {request.ndc_codes[0]}"
        else:
            title = f"Comparative Clinical Evaluation Report ({len(request.ndc_codes)} Products)"
        
        elements.append(Paragraph(title, styles['Title']))
        elements.append(Spacer(1, 12))
        
        # Add generation date
        date_text = f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        elements.append(Paragraph(date_text, styles['Normal']))
        elements.append(Spacer(1, 12))
        
        # For each NDC code, add a section
        for ndc_code in request.ndc_codes:
            product_info = get_product_info(ndc_code)
            events_data = generate_sample_events()
            
            # Product heading
            elements.append(Paragraph(f"Product: {product_info['name']} ({ndc_code})", styles['Heading2']))
            elements.append(Spacer(1, 6))
            
            # Product details
            elements.append(Paragraph(f"Manufacturer: {product_info['manufacturer']}", styles['Normal']))
            elements.append(Paragraph(f"Total Reports: {events_data['total']}", styles['Normal']))
            elements.append(Paragraph(f"Serious Events: {events_data['serious_count']}", styles['Normal']))
            elements.append(Spacer(1, 12))
            
            # Top adverse events
            elements.append(Paragraph("Top Adverse Events:", styles['Heading3']))
            elements.append(Spacer(1, 6))
            
            for event in events_data['top_events'][:5]:
                elements.append(Paragraph(f"• {event['name']}: {event['count']} reports", styles['Normal']))
            
            elements.append(Spacer(1, 18))
        
        # Build the PDF
        doc.build(elements)
        
        # Get the PDF data
        pdf_data = buffer.getvalue()
        buffer.close()
        
        # Return the PDF
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=cer_report_{datetime.now().strftime('%Y%m%d')}.pdf"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

# --- Helper Functions ---

def get_product_info(ndc_code: str) -> Dict[str, str]:
    """Get product information for a given NDC code."""
    # In a real implementation, this would query a database or FDA API
    # For now, return sample data
    
    # Deterministic "random" data based on the NDC code
    code_hash = sum([ord(c) for c in ndc_code])
    
    products = [
        {"name": "Acetaminophen Tablets", "manufacturer": "Acme Pharmaceuticals"},
        {"name": "Lisinopril", "manufacturer": "Generic Meds Inc."},
        {"name": "Metformin HCl", "manufacturer": "DiabetRx"},
        {"name": "Atorvastatin Calcium", "manufacturer": "Lipid Solutions"},
        {"name": "Levothyroxine Sodium", "manufacturer": "ThyroHealth Ltd."},
    ]
    
    return products[code_hash % len(products)]

def generate_sample_events() -> Dict[str, Any]:
    """Generate sample adverse events data."""
    # In a real implementation, this would analyze FAERS data
    
    # Common adverse events for demonstration
    all_events = [
        "HEADACHE", "NAUSEA", "DIZZINESS", "FATIGUE", "RASH", 
        "VOMITING", "DIARRHEA", "INSOMNIA", "ABDOMINAL PAIN", "PRURITUS",
        "BACK PAIN", "COUGH", "CONSTIPATION", "PAIN", "ANXIETY"
    ]
    
    # Generate random counts for each event
    total_count = random.randint(100, 500)
    serious_count = int(total_count * random.uniform(0.05, 0.2))
    
    # Create events with counts
    top_events = []
    remaining_count = total_count
    
    # Select 5-10 random events
    num_events = random.randint(5, min(10, len(all_events)))
    selected_events = random.sample(all_events, num_events)
    
    for event in selected_events:
        if remaining_count <= 0:
            break
            
        # Generate a random count for this event
        count = random.randint(5, min(remaining_count, 100))
        remaining_count -= count
        
        # Calculate percentage
        percentage = count / total_count
        
        top_events.append({
            "name": event,
            "count": count,
            "percentage": percentage
        })
    
    # Sort by count (descending)
    top_events.sort(key=lambda x: x["count"], reverse=True)
    
    return {
        "total": total_count,
        "serious_count": serious_count,
        "top_events": top_events
    }

def generate_sample_narrative(ndc_code: str, product_info: Dict[str, str], events_data: Dict[str, Any]) -> str:
    """Generate a sample narrative for the clinical evaluation report."""
    # In a real implementation, this would use an NLP model like OpenAI GPT
    
    product_name = product_info["name"]
    manufacturer = product_info["manufacturer"]
    total_reports = events_data["total"]
    serious_count = events_data["serious_count"]
    top_events = events_data["top_events"]
    
    # Format top events for the narrative
    top_events_text = ""
    for i, event in enumerate(top_events[:5]):
        if i > 0:
            top_events_text += ", "
        if i == len(top_events[:5]) - 1 and i > 0:
            top_events_text += "and "
        top_events_text += f"{event['name']} ({event['count']} reports)"
    
    # Generate a narrative
    narrative = f"""
Clinical Evaluation Report for {product_name} (NDC: {ndc_code})
Manufactured by: {manufacturer}

SUMMARY:
This clinical evaluation report analyzes adverse event data for {product_name} based on FDA Adverse Event Reporting System (FAERS) data. A total of {total_reports} adverse event reports were identified, of which {serious_count} ({serious_count/total_reports*100:.1f}%) were classified as serious.

KEY FINDINGS:
The most frequently reported adverse events include {top_events_text}. The majority of these reports ({(total_reports-serious_count)/total_reports*100:.1f}%) were non-serious in nature, suggesting that the overall safety profile of the product remains consistent with the known risk profile.

SAFETY EVALUATION:
Based on the current analysis, the benefit-risk profile of {product_name} appears to remain favorable. The types and frequencies of reported adverse events are consistent with those described in the product labeling. No new safety signals were identified that would warrant regulatory action at this time.

RECOMMENDATIONS:
Continued routine pharmacovigilance is recommended to monitor for any emerging safety concerns. The manufacturer should maintain regular adverse event monitoring and reporting processes in compliance with regulatory requirements.

This report was generated on {datetime.now().strftime("%Y-%m-%d")} and reflects data available as of this date. The evaluation should be updated periodically as new safety data becomes available.
"""
    
    return narrative

# Run the FastAPI server if executed directly
if __name__ == "__main__":
    import uvicorn
    import os
    
    # Use environment variable for port or default to 8083 to avoid conflicts
    port = int(os.environ.get("FASTAPI_PORT", 8083))
    print(f"Starting FastAPI server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)