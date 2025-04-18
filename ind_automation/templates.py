"""
IND Automation Templates Module

This module provides functions for generating FDA IND application forms and related documents
using python-docx instead of docxtpl.
"""

import os
import io
from typing import Dict, Any
from io import BytesIO
from datetime import datetime

import docx
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

def _get_template_path(template_name: str) -> str:
    """Get the absolute path to a template file"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, "templates", "forms", template_name)

def generate_form_1571(data: Dict[str, Any]) -> BytesIO:
    """
    Generate FDA Form 1571 (Investigational New Drug Application)
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the generated document
    """
    # Create a new document
    doc = docx.Document()
    
    # Add title
    title = doc.add_heading("DEPARTMENT OF HEALTH AND HUMAN SERVICES", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    subtitle = doc.add_heading("FOOD AND DRUG ADMINISTRATION", 1)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    form_title = doc.add_heading("INVESTIGATIONAL NEW DRUG APPLICATION (IND)", 1)
    form_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    form_number = doc.add_paragraph("FORM FDA 1571")
    form_number.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add form sections
    doc.add_heading("1. NAME OF SPONSOR", 2)
    doc.add_paragraph(data.get("sponsor", ""))
    
    doc.add_heading("2. DATE OF SUBMISSION", 2)
    doc.add_paragraph(data.get("submission_date", datetime.now().strftime("%Y-%m-%d")))
    
    # Save the document to a BytesIO object
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    return output

def generate_form_1572(data: Dict[str, Any]) -> BytesIO:
    """
    Generate FDA Form 1572 (Statement of Investigator)
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the generated document
    """
    # Create a new document
    doc = docx.Document()
    
    # Add title
    title = doc.add_heading("DEPARTMENT OF HEALTH AND HUMAN SERVICES", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    subtitle = doc.add_heading("FOOD AND DRUG ADMINISTRATION", 1)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    form_title = doc.add_heading("STATEMENT OF INVESTIGATOR", 1)
    form_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    form_number = doc.add_paragraph("FORM FDA 1572")
    form_number.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add form sections
    doc.add_heading("1. NAME AND ADDRESS OF INVESTIGATOR", 2)
    doc.add_paragraph(data.get("pi_name", ""))
    doc.add_paragraph(data.get("pi_address", ""))
    
    # Save the document to a BytesIO object
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    return output

def generate_form_3674(data: Dict[str, Any]) -> BytesIO:
    """
    Generate FDA Form 3674 (Certification of Compliance with ClinicalTrials.gov)
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the generated document
    """
    # Create a new document
    doc = docx.Document()
    
    # Add title
    title = doc.add_heading("DEPARTMENT OF HEALTH AND HUMAN SERVICES", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    subtitle = doc.add_heading("FOOD AND DRUG ADMINISTRATION", 1)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    form_title = doc.add_heading("CERTIFICATION OF COMPLIANCE WITH CLINICALTRIALS.GOV REQUIREMENTS", 1)
    form_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    form_number = doc.add_paragraph("FORM FDA 3674")
    form_number.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add form sections
    doc.add_heading("CLINICAL TRIAL INFORMATION", 2)
    doc.add_paragraph(f"NCT Number: {data.get('nct_number', '')}")
    
    # Save the document to a BytesIO object
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    return output

def generate_cover_letter(data: Dict[str, Any]) -> BytesIO:
    """
    Generate a cover letter for IND submission
    
    Args:
        data: Dictionary containing cover letter data
        
    Returns:
        BytesIO object containing the generated document
    """
    # Create a new document
    doc = docx.Document()
    
    # Add content
    doc.add_paragraph(f"Date: {data.get('submission_date', datetime.now().strftime('%Y-%m-%d'))}")
    doc.add_paragraph("To: Food and Drug Administration")
    doc.add_paragraph(f"From: {data.get('sponsor', '')}")
    
    # Add title
    title = doc.add_heading("INVESTIGATIONAL NEW DRUG APPLICATION COVER LETTER", 1)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add main content
    doc.add_paragraph(f"Drug Name: {data.get('drug_name', '')}")
    
    # Save the document to a BytesIO object
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    return output
