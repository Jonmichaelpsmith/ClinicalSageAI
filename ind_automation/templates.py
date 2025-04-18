#!/usr/bin/env python3
"""
IND Automation Templates Module

This module provides functions for generating FDA IND application forms and related documents
using python-docx instead of docxtpl.
"""
from io import BytesIO
from typing import Dict, Any, Optional
import os

import docx
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

def _get_template_path(template_name: str) -> str:
    """Get the absolute path to a template file"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, 'templates', 'forms', template_name)

def generate_form_1571(data: Dict[str, Any]) -> BytesIO:
    """
    Generate FDA Form 1571 (Investigational New Drug Application)
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the generated document
    """
    try:
        # Create a new document
        doc = docx.Document()
        
        # Add title
        title = doc.add_heading('FORM FDA 1571', 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add subtitle
        subtitle = doc.add_heading('INVESTIGATIONAL NEW DRUG APPLICATION (IND)', 1)
        subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add form sections
        doc.add_heading('1. NAME OF SPONSOR', 2)
        if 'sponsor_name' in data:
            doc.add_paragraph(data['sponsor_name'])
        else:
            doc.add_paragraph('[Sponsor Name]')
            
        doc.add_heading('2. DATE OF SUBMISSION', 2)
        if 'submission_date' in data:
            doc.add_paragraph(data['submission_date'])
        else:
            doc.add_paragraph('[Submission Date]')
            
        doc.add_heading('3. ADDRESS', 2)
        if 'sponsor_address' in data:
            doc.add_paragraph(data['sponsor_address'])
        else:
            doc.add_paragraph('[Sponsor Address]')
            
        doc.add_heading('4. TELEPHONE NUMBER', 2)
        if 'sponsor_phone' in data:
            doc.add_paragraph(data['sponsor_phone'])
        else:
            doc.add_paragraph('[Sponsor Phone]')
            
        # Add more sections as needed for a complete form
        
        # Save the document to a BytesIO object
        document_buffer = BytesIO()
        doc.save(document_buffer)
        document_buffer.seek(0)
        
        return document_buffer
    
    except Exception as e:
        print(f"Error generating Form 1571: {str(e)}")
        # Return an empty document with error message
        doc = docx.Document()
        doc.add_heading('ERROR GENERATING FORM 1571', 0)
        doc.add_paragraph(f"An error occurred: {str(e)}")
        
        document_buffer = BytesIO()
        doc.save(document_buffer)
        document_buffer.seek(0)
        
        return document_buffer

def generate_form_1572(data: Dict[str, Any]) -> BytesIO:
    """
    Generate FDA Form 1572 (Statement of Investigator)
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the generated document
    """
    try:
        # Create a new document
        doc = docx.Document()
        
        # Add title
        title = doc.add_heading('FORM FDA 1572', 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add subtitle
        subtitle = doc.add_heading('STATEMENT OF INVESTIGATOR', 1)
        subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add note
        note = doc.add_paragraph('(Title 21, Code of Federal Regulations (CFR) Part 312)')
        note.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add form sections
        doc.add_heading('1. NAME AND ADDRESS OF INVESTIGATOR', 2)
        if 'principal_investigator_name' in data:
            doc.add_paragraph(data['principal_investigator_name'])
        else:
            doc.add_paragraph('[Investigator Name]')
            
        if 'investigator_address' in data:
            doc.add_paragraph(data['investigator_address'])
        else:
            doc.add_paragraph('[Investigator Address]')
            
        # Add more sections as needed for a complete form
        
        # Save the document to a BytesIO object
        document_buffer = BytesIO()
        doc.save(document_buffer)
        document_buffer.seek(0)
        
        return document_buffer
    
    except Exception as e:
        print(f"Error generating Form 1572: {str(e)}")
        # Return an empty document with error message
        doc = docx.Document()
        doc.add_heading('ERROR GENERATING FORM 1572', 0)
        doc.add_paragraph(f"An error occurred: {str(e)}")
        
        document_buffer = BytesIO()
        doc.save(document_buffer)
        document_buffer.seek(0)
        
        return document_buffer

def generate_form_3674(data: Dict[str, Any]) -> BytesIO:
    """
    Generate FDA Form 3674 (Certification of Compliance with ClinicalTrials.gov)
    
    Args:
        data: Dictionary containing form data
        
    Returns:
        BytesIO object containing the generated document
    """
    try:
        # Create a new document
        doc = docx.Document()
        
        # Add title
        title = doc.add_heading('FORM FDA 3674', 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add subtitle
        subtitle = doc.add_heading('CERTIFICATION OF COMPLIANCE WITH CLINICALTRIALS.GOV REQUIREMENTS', 1)
        subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add form sections
        doc.add_heading('APPLICATION INFORMATION', 2)
        
        doc.add_paragraph('Type of Application:')
        app_type = doc.add_paragraph('☒ IND (Investigational New Drug Application)')
        app_type.paragraph_format.left_indent = Inches(0.5)
        
        doc.add_paragraph('FDA Application Number (if known):')
        if 'ind_number' in data:
            app_num = doc.add_paragraph(data['ind_number'])
        else:
            app_num = doc.add_paragraph('[IND Number]')
        app_num.paragraph_format.left_indent = Inches(0.5)
        
        doc.add_heading('CLINICAL TRIALS INFORMATION', 2)
        
        doc.add_paragraph('Title of Clinical Trial:')
        if 'protocol_title' in data:
            trial_title = doc.add_paragraph(data['protocol_title'])
        else:
            trial_title = doc.add_paragraph('[Protocol Title]')
        trial_title.paragraph_format.left_indent = Inches(0.5)
        
        doc.add_paragraph('NCT Number:')
        if 'nct_number' in data:
            nct_num = doc.add_paragraph(data['nct_number'])
        else:
            nct_num = doc.add_paragraph('[NCT Number]')
        nct_num.paragraph_format.left_indent = Inches(0.5)
        
        # Add more sections as needed for a complete form
        
        # Save the document to a BytesIO object
        document_buffer = BytesIO()
        doc.save(document_buffer)
        document_buffer.seek(0)
        
        return document_buffer
    
    except Exception as e:
        print(f"Error generating Form 3674: {str(e)}")
        # Return an empty document with error message
        doc = docx.Document()
        doc.add_heading('ERROR GENERATING FORM 3674', 0)
        doc.add_paragraph(f"An error occurred: {str(e)}")
        
        document_buffer = BytesIO()
        doc.save(document_buffer)
        document_buffer.seek(0)
        
        return document_buffer

def generate_cover_letter(data: Dict[str, Any]) -> BytesIO:
    """
    Generate a cover letter for IND submission
    
    Args:
        data: Dictionary containing letter data
        
    Returns:
        BytesIO object containing the generated document
    """
    try:
        # Create a new document
        doc = docx.Document()
        
        # Add sender information
        if 'sponsor_name' in data:
            doc.add_paragraph(data['sponsor_name'])
        else:
            doc.add_paragraph('[Sponsor Name]')
            
        if 'sponsor_address' in data:
            doc.add_paragraph(data['sponsor_address'])
        else:
            doc.add_paragraph('[Sponsor Address]')
            
        if 'submission_date' in data:
            doc.add_paragraph(data['submission_date'])
        else:
            from datetime import datetime
            doc.add_paragraph(datetime.now().strftime('%B %d, %Y'))
        
        # Add recipient information
        doc.add_paragraph()
        doc.add_paragraph('Food and Drug Administration')
        doc.add_paragraph('Center for Drug Evaluation and Research')
        doc.add_paragraph('Central Document Room')
        doc.add_paragraph('5901-B Ammendale Road')
        doc.add_paragraph('Beltsville, MD 20705-1266')
        
        # Add subject line
        doc.add_paragraph()
        if 'ind_number' in data and data['ind_number']:
            subject = doc.add_paragraph(f"SUBJECT: IND {data['ind_number']}")
        else:
            subject = doc.add_paragraph("SUBJECT: Initial IND Submission")
        subject.style = 'Heading 1'
        
        if 'drug_name' in data and data['drug_name']:
            drug_line = doc.add_paragraph(f"DRUG: {data['drug_name']}")
            drug_line.style = 'Heading 2'
        
        if 'indication' in data and data['indication']:
            indication_line = doc.add_paragraph(f"INDICATION: {data['indication']}")
            indication_line.style = 'Heading 2'
        
        # Add greeting
        doc.add_paragraph()
        doc.add_paragraph('Dear Sir/Madam:')
        
        # Add body
        doc.add_paragraph()
        if 'sponsor_name' in data and data['sponsor_name']:
            sponsor_name = data['sponsor_name']
        else:
            sponsor_name = "[Sponsor Name]"
            
        if 'drug_name' in data and data['drug_name']:
            drug_name = data['drug_name']
        else:
            drug_name = "[Drug Name]"
            
        if 'ind_number' in data and data['ind_number']:
            ind_type = f"IND {data['ind_number']}"
        else:
            ind_type = "an Initial IND"
        
        body = doc.add_paragraph(f"{sponsor_name} is submitting {ind_type} for {drug_name}. ")
        
        if 'indication' in data and data['indication']:
            body.add_run(f"The proposed indication is for the treatment of {data['indication']}. ")
        
        body.add_run("This submission contains the following items:")
        
        # Add list of contents
        doc.add_paragraph()
        contents = doc.add_paragraph()
        contents.add_run("• Form FDA 1571\n")
        contents.add_run("• Form FDA 1572\n")
        contents.add_run("• Form FDA 3674\n")
        contents.add_run("• Investigator's Brochure\n")
        contents.add_run("• Clinical Protocol\n")
        contents.add_run("• Chemistry, Manufacturing, and Controls (CMC) Information\n")
        contents.add_run("• Pharmacology and Toxicology Information\n")
        contents.add_run("• Previous Human Experience")
        
        # Add closing
        doc.add_paragraph()
        doc.add_paragraph("If you have any questions or require additional information, please contact:")
        
        if 'contact_name' in data and 'contact_email' in data and 'contact_phone' in data:
            contact = doc.add_paragraph(f"{data['contact_name']}\n")
            contact.add_run(f"Email: {data['contact_email']}\n")
            contact.add_run(f"Phone: {data['contact_phone']}")
        else:
            contact = doc.add_paragraph("[Contact Name]\n")
            contact.add_run("Email: [Contact Email]\n")
            contact.add_run("Phone: [Contact Phone]")
        
        # Add signature
        doc.add_paragraph()
        doc.add_paragraph("Sincerely,")
        doc.add_paragraph()
        doc.add_paragraph()
        
        if 'authorizer_name' in data and 'authorizer_title' in data:
            signature = doc.add_paragraph(f"{data['authorizer_name']}\n")
            signature.add_run(f"{data['authorizer_title']}")
        else:
            signature = doc.add_paragraph("[Authorizer Name]\n")
            signature.add_run("[Authorizer Title]")
        
        # Save the document to a BytesIO object
        document_buffer = BytesIO()
        doc.save(document_buffer)
        document_buffer.seek(0)
        
        return document_buffer
    
    except Exception as e:
        print(f"Error generating cover letter: {str(e)}")
        # Return an empty document with error message
        doc = docx.Document()
        doc.add_heading('ERROR GENERATING COVER LETTER', 0)
        doc.add_paragraph(f"An error occurred: {str(e)}")
        
        document_buffer = BytesIO()
        doc.save(document_buffer)
        document_buffer.seek(0)
        
        return document_buffer