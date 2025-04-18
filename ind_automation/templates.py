# ind_automation/templates.py
import io
import os
import logging
from typing import Dict, Any, Optional
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

logger = logging.getLogger(__name__)

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates", "forms")

# Ensure template directory exists
os.makedirs(TEMPLATE_DIR, exist_ok=True)

def populate_field(document, key, value):
    """
    Find placeholder text {{key}} in document and replace with value
    """
    for paragraph in document.paragraphs:
        if f"{{{{{key}}}}}" in paragraph.text:
            paragraph.text = paragraph.text.replace(f"{{{{{key}}}}}", str(value or ""))
    
    # Also check tables
    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    if f"{{{{{key}}}}}" in paragraph.text:
                        paragraph.text = paragraph.text.replace(f"{{{{{key}}}}}", str(value or ""))

def render_form_template(template_path: str, data: Dict[str, Any]) -> Optional[bytes]:
    """
    Render a document template with the provided data
    
    Args:
        template_path: Path to the template file
        data: Dictionary of key-value pairs to populate in the template
        
    Returns:
        Document as bytes or None if generation fails
    """
    try:
        if not os.path.exists(template_path):
            logger.error(f"Template file not found: {template_path}")
            return None
            
        doc = Document(template_path)
        
        # Populate all placeholders in the document
        for key, value in data.items():
            populate_field(doc, key, value)
        
        # Save document to bytes
        output = io.BytesIO()
        doc.save(output)
        output.seek(0)
        
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Error rendering template: {str(e)}", exc_info=True)
        return None

def render_form1571(data: Dict[str, Any]) -> Optional[bytes]:
    """
    Render FDA Form 1571 with the provided data
    """
    template_path = os.path.join(TEMPLATE_DIR, "form1571.docx")
    return render_form_template(template_path, data)

def render_form1572(data: Dict[str, Any]) -> Optional[bytes]:
    """
    Render FDA Form 1572 with the provided data
    """
    template_path = os.path.join(TEMPLATE_DIR, "form1572.docx")
    return render_form_template(template_path, data)

def render_form3674(data: Dict[str, Any]) -> Optional[bytes]:
    """
    Render FDA Form 3674 with the provided data
    """
    template_path = os.path.join(TEMPLATE_DIR, "form3674.docx")
    return render_form_template(template_path, data)

def create_cover_letter(data: Dict[str, Any]) -> Optional[bytes]:
    """
    Create a cover letter document for IND submission
    """
    try:
        # Create a new document
        doc = Document()
        
        # Add header
        header = doc.add_paragraph()
        header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        header_run = header.add_run(data.get("submission_date", ""))
        
        # Add addresses
        doc.add_paragraph(data.get("sponsor_name", ""))
        doc.add_paragraph(data.get("sponsor_address", ""))
        doc.add_paragraph()
        doc.add_paragraph("Food and Drug Administration")
        doc.add_paragraph("Center for Drug Evaluation and Research")
        doc.add_paragraph("Central Document Room")
        doc.add_paragraph("5901-B Ammendale Road")
        doc.add_paragraph("Beltsville, MD 20705-1266")
        doc.add_paragraph()
        
        # Add subject line
        subject = doc.add_paragraph("Subject: ")
        subject_run = subject.add_run(f"IND {data.get('ind_number', 'PENDING')} for {data.get('drug_name', '')}")
        subject_run.bold = True
        doc.add_paragraph()
        
        # Add greeting
        doc.add_paragraph("Dear Sir/Madam:")
        doc.add_paragraph()
        
        # Add body
        doc.add_paragraph(f"Please find enclosed our submission for {data.get('drug_name', '')}, IND {data.get('ind_number', 'PENDING')}. This submission includes:")
        doc.add_paragraph()
        
        # Add bullet points for included items
        for item in data.get("included_items", ["FDA Form 1571", "FDA Form 1572", "FDA Form 3674", "Module 3: Chemistry, Manufacturing, and Controls"]):
            p = doc.add_paragraph()
            p.style = 'List Bullet'
            p.add_run(item)
        
        doc.add_paragraph()
        doc.add_paragraph("If you have any questions or require additional information, please contact:")
        doc.add_paragraph()
        doc.add_paragraph(f"Name: {data.get('contact_name', '')}")
        doc.add_paragraph(f"Phone: {data.get('contact_phone', '')}")
        doc.add_paragraph(f"Email: {data.get('contact_email', '')}")
        doc.add_paragraph()
        
        # Add closing
        doc.add_paragraph("Sincerely,")
        doc.add_paragraph()
        doc.add_paragraph()
        doc.add_paragraph()
        doc.add_paragraph(f"{data.get('authorizer_name', '')}")
        doc.add_paragraph(f"{data.get('authorizer_title', '')}")
        doc.add_paragraph(f"{data.get('sponsor_name', '')}")
        
        # Save document to bytes
        output = io.BytesIO()
        doc.save(output)
        output.seek(0)
        
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Error creating cover letter: {str(e)}", exc_info=True)
        return None