#!/usr/bin/env python3
"""
FDA Forms Template Engine

This module handles the templating logic for FDA form generation.
It uses the python-docx library to fill in templates with provided data.
"""

import docx
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os
import logging
import io
from datetime import datetime

# Setup logging
logger = logging.getLogger(__name__)

# Template directory
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), 'templates', 'forms')

def check_templates_exist():
    """Check if all required templates exist"""
    templates = ['form1571.docx', 'form1572.docx', 'form3674.docx', 'cover_letter.docx']
    missing = []
    
    for template in templates:
        template_path = os.path.join(TEMPLATE_DIR, template)
        if not os.path.exists(template_path):
            missing.append(template)
    
    if missing:
        logger.warning(f"Missing templates: {', '.join(missing)}")
        return False
    
    return True

def create_templates_if_needed():
    """Create templates if they don't exist"""
    if not check_templates_exist():
        logger.info("Creating FDA form templates...")
        try:
            from create_form_templates import main as create_templates
            create_templates()
            result = check_templates_exist()
            if result:
                logger.info("Templates successfully created")
            else:
                logger.error("Failed to create all required templates")
            return result
        except Exception as e:
            logger.error(f"Error creating templates: {str(e)}", exc_info=True)
            # Create templates directory if it doesn't exist
            os.makedirs(TEMPLATE_DIR, exist_ok=True)
            return False
    return True

def _replace_placeholders(doc, data):
    """
    Replace placeholders in document with provided data
    
    Args:
        doc: Document object
        data: Dictionary containing replacement values
    """
    # Search for placeholders in paragraphs
    for paragraph in doc.paragraphs:
        if '{{' in paragraph.text and '}}' in paragraph.text:
            inline = paragraph.runs
            # Loop through each run in paragraph
            for i, run in enumerate(inline):
                for key, value in data.items():
                    placeholder = f"{{{{{key}}}}}"
                    if placeholder in run.text:
                        text = run.text.replace(placeholder, str(value) if value is not None else "")
                        run.text = text

    # Also search in tables, if any
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    if '{{' in paragraph.text and '}}' in paragraph.text:
                        inline = paragraph.runs
                        for i, run in enumerate(inline):
                            for key, value in data.items():
                                placeholder = f"{{{{{key}}}}}"
                                if placeholder in run.text:
                                    text = run.text.replace(placeholder, str(value) if value is not None else "")
                                    run.text = text

def render_form1571(data):
    """
    Fill Form 1571 template with provided data
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the filled document
    """
    # Ensure templates exist
    if not create_templates_if_needed():
        raise ValueError("Could not create form templates")
    
    template_path = os.path.join(TEMPLATE_DIR, 'form1571.docx')
    doc = docx.Document(template_path)
    
    # Fill in defaults for missing fields
    defaults = {
        'submission_date': datetime.now().strftime('%m/%d/%Y'),
        'sponsor_address': '',
        'contact_title': 'Regulatory Affairs Manager',
        'contact_email': '',
        'contact_phone': '',
        'authorizer_title': 'Chief Executive Officer',
    }
    
    # Combine with provided data
    form_data = {**defaults, **data}
    
    # Replace placeholders
    _replace_placeholders(doc, form_data)
    
    # Save to memory stream
    output = io.BytesIO()
    doc.save(output)
    output.seek(0)
    return output

def render_form1572(data):
    """
    Fill Form 1572 template with provided data
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the filled document
    """
    # Ensure templates exist
    if not create_templates_if_needed():
        raise ValueError("Could not create form templates")
    
    template_path = os.path.join(TEMPLATE_DIR, 'form1572.docx')
    doc = docx.Document(template_path)
    
    # Fill in defaults for missing fields
    defaults = {
        'submission_date': datetime.now().strftime('%m/%d/%Y'),
        'investigator_address': '',
        'research_facility_name': '',
        'research_facility_address': '',
        'clinical_lab_name': '',
        'clinical_lab_address': '',
        'irb_name': '',
        'irb_address': '',
    }
    
    # Combine with provided data
    form_data = {**defaults, **data}
    
    # Replace placeholders
    _replace_placeholders(doc, form_data)
    
    # Save to memory stream
    output = io.BytesIO()
    doc.save(output)
    output.seek(0)
    return output

def render_form3674(data):
    """
    Fill Form 3674 template with provided data
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the filled document
    """
    # Ensure templates exist
    if not create_templates_if_needed():
        raise ValueError("Could not create form templates")
    
    template_path = os.path.join(TEMPLATE_DIR, 'form3674.docx')
    doc = docx.Document(template_path)
    
    # Fill in defaults for missing fields
    defaults = {
        'submission_date': datetime.now().strftime('%m/%d/%Y'),
        'ind_number': '',
        'nct_number': '',
        'certifier_name': data.get('authorizer_name', ''),
        'certifier_title': data.get('authorizer_title', 'Chief Medical Officer'),
        'certifier_address': data.get('sponsor_address', ''),
        'certifier_email': data.get('contact_email', ''),
        'certifier_phone': data.get('contact_phone', ''),
        'certifier_fax': '',
    }
    
    # Combine with provided data
    form_data = {**defaults, **data}
    
    # Replace placeholders
    _replace_placeholders(doc, form_data)
    
    # Save to memory stream
    output = io.BytesIO()
    doc.save(output)
    output.seek(0)
    return output

def create_cover_letter(data):
    """
    Fill cover letter template with provided data
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the filled document
    """
    # Ensure templates exist
    if not create_templates_if_needed():
        raise ValueError("Could not create form templates")
    
    template_path = os.path.join(TEMPLATE_DIR, 'cover_letter.docx')
    doc = docx.Document(template_path)
    
    # Fill in defaults for missing fields
    defaults = {
        'submission_date': datetime.now().strftime('%B %d, %Y'),
        'serial_number': '0000',
        'protocol_number': '',
        'protocol_title': '',
        'contact_title': 'Regulatory Affairs Manager',
        'contact_email': '',
        'contact_phone': '',
        'authorizer_title': 'Chief Executive Officer',
    }
    
    # Combine with provided data
    form_data = {**defaults, **data}
    
    # Replace placeholders
    _replace_placeholders(doc, form_data)
    
    # Save to memory stream
    output = io.BytesIO()
    doc.save(output)
    output.seek(0)
    return output