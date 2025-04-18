import io
import os
import logging
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

logger = logging.getLogger(__name__)

def render_form1571(data: dict) -> io.BytesIO:
    """Generate FDA Form 1571 (Investigational New Drug Application)"""
    try:
        # Create a new Document
        doc = Document()
        
        # Add title
        title = doc.add_heading('FORM FDA 1571', level=1)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add subtitle
        subtitle = doc.add_heading('INVESTIGATIONAL NEW DRUG APPLICATION (IND)', level=2)
        subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add metadata section
        doc.add_paragraph('NOTE: No drug may be shipped or clinical investigation begun until an IND for that investigation is in effect (21 U.S.C. 355(i); 21 CFR Part 312).')
        
        # Add sponsor information
        doc.add_heading('1. SPONSOR NAME', level=3)
        doc.add_paragraph(data.get('sponsor_name', 'Not Provided'))
        
        doc.add_heading('2. IND NUMBER', level=3) 
        doc.add_paragraph(data.get('IND_number', 'Pending'))
        
        doc.add_heading('3. DRUG NAME', level=3)
        doc.add_paragraph(data.get('drug_name', 'Not Provided'))
        
        # Phase information with checkboxes
        doc.add_heading('4. PHASE(S) OF CLINICAL INVESTIGATION TO BE CONDUCTED', level=3)
        phase_text = f"☐ Phase 1   ☐ Phase 2   ☐ Phase 3   ☐ Other (Specify): "
        # Replace the appropriate checkbox based on data
        if data.get('phase1_checked', '☐') == '☒':
            phase_text = phase_text.replace('☐ Phase 1', '☒ Phase 1')
        if data.get('phase2_checked', '☐') == '☒':
            phase_text = phase_text.replace('☐ Phase 2', '☒ Phase 2')
        if data.get('phase3_checked', '☐') == '☒':
            phase_text = phase_text.replace('☐ Phase 3', '☒ Phase 3')
        if data.get('other_phase_checked', '☐') == '☒':
            phase_text = phase_text.replace('☐ Other', '☒ Other')
        
        doc.add_paragraph(phase_text)
        
        doc.add_heading('5. PROTOCOL NUMBER', level=3)
        doc.add_paragraph(data.get('protocol_number', 'Not Provided'))
        
        doc.add_heading('6. SUBMISSION DATE', level=3)
        doc.add_paragraph(data.get('submission_date', 'Not Provided'))
        
        # Add signature section
        doc.add_heading('SIGNATURE OF SPONSOR OR AUTHORIZED REPRESENTATIVE', level=3)
        doc.add_paragraph('DATE: ' + data.get('submission_date', ''))
        
        # Save document to BytesIO
        f = io.BytesIO()
        doc.save(f)
        f.seek(0)
        return f
    
    except Exception as e:
        logger.error(f"Error generating Form 1571: {str(e)}")
        return None

def render_form1572(data: dict) -> io.BytesIO:
    """Generate FDA Form 1572 (Statement of Investigator)"""
    try:
        # Create a new Document
        doc = Document()
        
        # Add title
        title = doc.add_heading('FORM FDA 1572', level=1)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add subtitle
        subtitle = doc.add_heading('STATEMENT OF INVESTIGATOR', level=2)
        subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add form content
        doc.add_paragraph('NOTE: No investigator may participate in an investigation until he/she provides the sponsor with a completed, signed Statement of Investigator (21 CFR 312.53(c)).')
        
        # Add investigator information
        doc.add_heading('1. NAME AND ADDRESS OF INVESTIGATOR', level=3)
        doc.add_paragraph(f"Name: {data.get('principal_investigator_name', 'Not Provided')}")
        doc.add_paragraph(f"Address: {data.get('investigator_address', 'Not Provided')}")
        
        # Protocol Information
        doc.add_heading('2. EDUCATION, TRAINING, AND EXPERIENCE', level=3)
        doc.add_paragraph('(CV or other statement of qualifications to be attached)')
        
        doc.add_heading('3. PROTOCOL INFORMATION', level=3)
        doc.add_paragraph(f"Protocol Number: {data.get('protocol_number', 'Not Provided')}")
        doc.add_paragraph(f"Study Drug: {data.get('drug_name', 'Not Provided')}")
        doc.add_paragraph(f"Phase: {data.get('phase', 'Not Provided')}")
        
        # Add signature section
        doc.add_heading('INVESTIGATOR SIGNATURE', level=3)
        doc.add_paragraph('I agree to conduct the study in accordance with the relevant, current protocol(s) and will only make changes after notifying the sponsor, except when necessary to protect the safety, rights, or welfare of subjects.')
        
        # Save document to BytesIO
        f = io.BytesIO()
        doc.save(f)
        f.seek(0)
        return f
    
    except Exception as e:
        logger.error(f"Error generating Form 1572: {str(e)}")
        return None

def render_form3674(data: dict) -> io.BytesIO:
    """Generate FDA Form 3674 (Certification of Compliance with ClinicalTrials.gov)"""
    try:
        # Create a new Document
        doc = Document()
        
        # Add title
        title = doc.add_heading('FORM FDA 3674', level=1)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add subtitle
        subtitle = doc.add_heading('CERTIFICATION OF COMPLIANCE WITH CLINICALTRIALS.GOV REQUIREMENTS', level=2)
        subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add form content
        doc.add_paragraph('Required by Public Law 110-85, Title VIII, Section 801 for certain applications and submissions to FDA')
        
        # Add drug and sponsor information
        doc.add_heading('1. DRUG AND SPONSOR INFORMATION', level=3)
        doc.add_paragraph(f"Drug Name: {data.get('drug_name', 'Not Provided')}")
        doc.add_paragraph(f"Sponsor Name: {data.get('sponsor_name', 'Not Provided')}")
        
        # NCT information
        doc.add_heading('2. CLINICALTRIALS.GOV REGISTRATION INFORMATION', level=3)
        doc.add_paragraph(f"NCT Number: {data.get('nct_number', 'Not Provided')}")
        doc.add_paragraph(f"Registration Statement: {data.get('study_registration_statement', 'Not Provided')}")
        
        # Add certification section
        doc.add_heading('3. CERTIFICATION STATEMENT', level=3)
        doc.add_paragraph('I certify that the information provided above is true and accurate. I understand that failure to submit required clinical trial information can result in civil monetary penalties and other enforcement actions.')
        
        # Add signature section
        doc.add_heading('CERTIFIER INFORMATION', level=3)
        doc.add_paragraph(f"Name: {data.get('certifier_name', 'Not Provided')}")
        doc.add_paragraph(f"Date: {data.get('submission_date', 'Not Provided')}")
        
        # Save document to BytesIO
        f = io.BytesIO()
        doc.save(f)
        f.seek(0)
        return f
    
    except Exception as e:
        logger.error(f"Error generating Form 3674: {str(e)}")
        return None

def render_cover_letter(data: dict) -> io.BytesIO:
    """Generate Cover Letter for IND submission"""
    try:
        # Create a new Document
        doc = Document()
        
        # Add letterhead
        doc.add_paragraph(data.get('sponsor_name', 'Sponsor Company'))
        doc.add_paragraph(data.get('sponsor_address', 'Company Address'))
        
        # Add date
        doc.add_paragraph(data.get('submission_date', 'Date'))
        
        # Add recipient
        doc.add_paragraph('Food and Drug Administration')
        doc.add_paragraph('Center for Drug Evaluation and Research')
        doc.add_paragraph('Central Document Room')
        doc.add_paragraph('5901-B Ammendale Road')
        doc.add_paragraph('Beltsville, MD 20705-1266')
        
        # Add subject line
        subject = doc.add_paragraph()
        subject.add_run('Subject: ').bold = True
        ind_num = data.get('IND_number', 'Pending')
        drug_name = data.get('drug_name', 'Study Drug')
        subject.add_run(f"IND {ind_num} - {drug_name}")
        
        # Add serial number
        doc.add_paragraph(f"Serial Number: {data.get('serial_number', '0001')}")
        
        # Add salutation
        doc.add_paragraph('Dear Sir/Madam:')
        
        # Add body
        body = doc.add_paragraph()
        body.add_run(f"Please find enclosed an Investigational New Drug Application (IND) for {drug_name} for the treatment of {data.get('indication', 'the specified indication')}. This submission contains all the necessary documentation as required by 21 CFR Part 312.")
        
        # Add closing
        doc.add_paragraph('If you have any questions or require additional information, please contact:')
        doc.add_paragraph(f"Name: {data.get('contact_name', 'Contact Person')}")
        doc.add_paragraph(f"Phone: {data.get('contact_phone', 'Phone Number')}")
        doc.add_paragraph(f"Email: {data.get('contact_email', 'Email Address')}")
        
        # Add signature
        doc.add_paragraph('Sincerely,')
        doc.add_paragraph()
        doc.add_paragraph()
        doc.add_paragraph(data.get('contact_name', 'Contact Person'))
        
        # Save document to BytesIO
        f = io.BytesIO()
        doc.save(f)
        f.seek(0)
        return f
    
    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}")
        return None