from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fpdf import FPDF
import os
import time
import sys

router = APIRouter()

class ProtocolExportRequest(BaseModel):
    content: str
    fileName: str = "fixed_protocol"
    format: str = "pdf"

@router.post("/export/fixed-protocol")
async def export_fixed_protocol(request: ProtocolExportRequest):
    """
    Export a fixed protocol as PDF or text file and return the file for download.
    """
    try:
        # Create static directory if it doesn't exist
        os.makedirs("static", exist_ok=True)
        
        timestamp = int(time.time())
        file_name = f"{request.fileName}_{timestamp}"
        
        if request.format.lower() == "pdf":
            # Generate PDF
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=11)
            
            # Add a title
            pdf.set_font("Arial", 'B', 16)
            pdf.cell(0, 10, "Protocol Document", ln=True, align='C')
            pdf.ln(10)
            
            # Reset font for main content
            pdf.set_font("Arial", size=11)
            
            # Split content by newlines and add as paragraphs
            lines = request.content.split('\n')
            for line in lines:
                if line.strip():  # Skip empty lines
                    pdf.multi_cell(0, 7, line)
                    pdf.ln(2)
                else:
                    pdf.ln(5)
            
            # Save the PDF
            file_path = f"static/{file_name}.pdf"
            pdf.output(file_path)
            
            # Keep a copy as latest_fixed_protocol.pdf
            latest_path = "static/latest_fixed_protocol.pdf"
            pdf.output(latest_path)
            
            return FileResponse(
                path=file_path,
                filename=f"{request.fileName}.pdf",
                media_type="application/pdf"
            )
            
        elif request.format.lower() == "docx":
            # For now, just return a text file as docx isn't easily supported without dependencies
            file_path = f"static/{file_name}.txt"
            with open(file_path, "w") as f:
                f.write(request.content)
                
            # Keep a copy as latest_fixed_protocol.txt
            latest_path = "static/latest_fixed_protocol.txt"
            with open(latest_path, "w") as f:
                f.write(request.content)
                
            return FileResponse(
                path=file_path,
                filename=f"{request.fileName}.docx",
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
            
        elif request.format.lower() == "txt":
            # Create a plain text file
            file_path = f"static/{file_name}.txt"
            with open(file_path, "w") as f:
                f.write(request.content)
                
            # Keep a copy as latest_fixed_protocol.txt
            latest_path = "static/latest_fixed_protocol.txt"
            with open(latest_path, "w") as f:
                f.write(request.content)
                
            return FileResponse(
                path=file_path,
                filename=f"{request.fileName}.txt",
                media_type="text/plain"
            )
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {request.format}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting protocol: {str(e)}")

@router.get("/export/fixed-protocol")
async def get_fixed_protocol(text: str = None):
    """
    Return the latest fixed protocol PDF, or generate one from the provided text.
    """
    try:
        # If text is provided, generate a new PDF
        if text:
            os.makedirs("static", exist_ok=True)
            
            # Generate PDF
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=11)
            
            # Add a title
            pdf.set_font("Arial", 'B', 16)
            pdf.cell(0, 10, "Protocol Document", ln=True, align='C')
            pdf.ln(10)
            
            # Reset font for main content
            pdf.set_font("Arial", size=11)
            
            # Split content by newlines and add as paragraphs
            lines = text.split('\n')
            for line in lines:
                if line.strip():  # Skip empty lines
                    pdf.multi_cell(0, 7, line)
                    pdf.ln(2)
                else:
                    pdf.ln(5)
            
            # Save the PDF
            latest_path = "static/latest_fixed_protocol.pdf"
            pdf.output(latest_path)
            
            return FileResponse(
                path=latest_path,
                filename="fixed_protocol.pdf",
                media_type="application/pdf"
            )
        
        # Otherwise, return the latest PDF if it exists
        latest_path = "static/latest_fixed_protocol.pdf"
        if os.path.exists(latest_path):
            return FileResponse(
                path=latest_path,
                filename="fixed_protocol.pdf",
                media_type="application/pdf"
            )
        else:
            raise HTTPException(status_code=404, detail="No fixed protocol PDF found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving protocol: {str(e)}")