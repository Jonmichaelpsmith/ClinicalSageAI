#!/usr/bin/env python3
"""
Form Template Generator

This script generates templates for FDA Forms with placeholders
for use with the IND Automation System.
"""

import os
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Ensure template directory exists
templates_dir = os.path.join(os.path.dirname(__file__), "templates", "forms")
os.makedirs(templates_dir, exist_ok=True)

def create_form1571_template():
    """Create FDA Form 1571 template with placeholders"""
    doc = Document()
    
    # Add title
    title = doc.add_heading("FORM FDA 1571", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add subtitle
    subtitle = doc.add_heading("INVESTIGATIONAL NEW DRUG APPLICATION (IND)", level=1)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Form section
    doc.add_paragraph("NOTE: No drug may be shipped or clinical investigation begun until an IND for that investigation is in effect (21 CFR 312.40).")
    
    # Form header information
    doc.add_heading("1. NAME OF SPONSOR", level=2)
    doc.add_paragraph("{{sponsor_name}}")
    
    doc.add_heading("2. DATE OF SUBMISSION", level=2)
    doc.add_paragraph("{{submission_date}}")
    
    doc.add_heading("3. ADDRESS (Number, Street, City, State, ZIP Code)", level=2)
    doc.add_paragraph("{{sponsor_address}}")
    
    doc.add_heading("4. TELEPHONE NUMBER", level=2)
    doc.add_paragraph("{{sponsor_phone}}")
    
    doc.add_heading("5. NAME(S) OF DRUG (Include all available names: Trade, Generic, Chemical, Code)", level=2)
    doc.add_paragraph("{{drug_name}}")
    
    doc.add_heading("6. IND NUMBER (If previously assigned)", level=2)
    doc.add_paragraph("{{ind_number}}")
    
    doc.add_heading("7. INDICATION(S) (Covered by this submission)", level=2)
    doc.add_paragraph("{{indication}}")
    
    doc.add_heading("8. PHASE(S) OF CLINICAL INVESTIGATION TO BE CONDUCTED", level=2)
    phases_para = doc.add_paragraph()
    phases_para.add_run("☐ Phase 1  ☐ Phase 2  ☐ Phase 3  ☐ Other (Specify): {{other_phase}}")
    
    doc.add_heading("9. LIST NUMBERS OF ALL INVESTIGATIONAL NEW DRUG APPLICATIONS (INDs), NEW DRUG APPLICATIONS (NDAs), DRUG MASTER FILES (DMFs), AND INVESTIGATIONAL DEVICE EXEMPTIONS (IDEs) REFERENCED IN THIS APPLICATION", level=2)
    doc.add_paragraph("{{referenced_applications}}")
    
    doc.add_heading("10. IND SUBMISSION SHOULD BE CONSECUTIVELY NUMBERED. THE INITIAL IND SHOULD BE NUMBERED SERIAL NO. 0000. THE NEXT SUBMISSION (e.g., Amendment, Report, or Correspondence) SHOULD BE NUMBERED SERIAL NO. 0001. SUBSEQUENT SUBMISSIONS SHOULD BE NUMBERED CONSECUTIVELY IN THE ORDER IN WHICH THEY ARE SUBMITTED.", level=2)
    doc.add_paragraph("SERIAL NO.: {{serial_number}}")
    
    doc.add_heading("11. THIS SUBMISSION CONTAINS THE FOLLOWING (Check all that apply)", level=2)
    checks = [
        "☐ INITIAL INVESTIGATIONAL NEW DRUG APPLICATION (IND)",
        "☐ PROTOCOL AMENDMENT(S): {{protocol_amendment_details}}",
        "☐ NEW PROTOCOL: {{new_protocol_details}}",
        "☐ CHANGE IN PROTOCOL: {{protocol_change_details}}",
        "☐ NEW INVESTIGATOR: {{new_investigator_details}}",
        "☐ RESPONSE TO CLINICAL HOLD: {{clinical_hold_response_details}}",
        "☐ REQUEST FOR REINSTATEMENT OF IND THAT IS WITHDRAWN, INACTIVATED, TERMINATED OR DISCONTINUED: {{reinstatement_details}}",
        "☐ INFORMATION AMENDMENT(S): {{info_amendment_details}}",
        "☐ CHEMISTRY/MICROBIOLOGY: {{chemistry_details}}",
        "☐ PHARMACOLOGY/TOXICOLOGY: {{pharmacology_details}}",
        "☐ CLINICAL: {{clinical_details}}",
        "☐ ANNUAL REPORT: {{annual_report_details}}",
        "☐ GENERAL CORRESPONDENCE: {{correspondence_details}}",
        "☐ RESPONSE TO FDA REQUEST FOR INFORMATION: {{fda_response_details}}",
        "☐ OTHER (Specify): {{other_submission_details}}"
    ]
    
    for check in checks:
        doc.add_paragraph(check)
    
    doc.add_heading("12. NAME AND TITLE OF THE PERSON RESPONSIBLE FOR MONITORING THE CONDUCT AND PROGRESS OF THE CLINICAL INVESTIGATIONS", level=2)
    doc.add_paragraph("NAME: {{monitor_name}}")
    doc.add_paragraph("TITLE: {{monitor_title}}")
    
    doc.add_heading("13. NAME(S) AND TITLE(S) OF THE PERSON(S) RESPONSIBLE FOR REVIEW AND EVALUATION OF INFORMATION RELEVANT TO THE SAFETY OF THE DRUG", level=2)
    doc.add_paragraph("NAME: {{safety_evaluator_name}}")
    doc.add_paragraph("TITLE: {{safety_evaluator_title}}")
    
    # Certification and signature section
    doc.add_heading("I agree not to begin clinical investigations until 30 days after FDA's receipt of the IND unless I receive earlier notification by FDA that the studies may begin. I also agree not to begin or continue clinical investigations covered by the IND if those studies are placed on clinical hold. I agree that an Institutional Review Board (IRB) that complies with the requirements set forth in 21 CFR Part 56 will be responsible for initial and continuing review and approval of each of the studies in the proposed clinical investigation. I agree to conduct the investigation in accordance with all other applicable regulatory requirements.", level=2)
    
    signature = doc.add_paragraph("SIGNATURE OF SPONSOR OR SPONSOR'S AUTHORIZED REPRESENTATIVE")
    signature.add_run("\n\n\n")
    
    doc.add_paragraph("DATE: {{signature_date}}")
    doc.add_paragraph("NAME: {{signature_name}}")
    doc.add_paragraph("TITLE: {{signature_title}}")
    doc.add_paragraph("ADDRESS: {{signature_address}}")
    
    # Save the template
    output_path = os.path.join(templates_dir, "form1571.docx")
    doc.save(output_path)
    print(f"Created Form 1571 template at: {output_path}")

def create_form1572_template():
    """Create FDA Form 1572 template with placeholders"""
    doc = Document()
    
    # Add title
    title = doc.add_heading("FORM FDA 1572", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add subtitle
    subtitle = doc.add_heading("STATEMENT OF INVESTIGATOR", level=1)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Form section
    doc.add_paragraph("(Title 21, Code of Federal Regulations (CFR) Part 312)")
    
    # Form fields
    doc.add_heading("1. NAME AND ADDRESS OF INVESTIGATOR", level=2)
    doc.add_paragraph("NAME: {{investigator_name}}")
    doc.add_paragraph("ADDRESS: {{investigator_address}}")
    doc.add_paragraph("PHONE: {{investigator_phone}}")
    
    doc.add_heading("2. EDUCATION, TRAINING, AND EXPERIENCE THAT QUALIFIES THE INVESTIGATOR AS AN EXPERT IN THE CLINICAL INVESTIGATION OF THE DRUG FOR THE USE UNDER INVESTIGATION. ONE OF THE FOLLOWING IS PROVIDED:", level=2)
    doc.add_paragraph("☐ CURRICULUM VITAE ATTACHED")
    doc.add_paragraph("☐ OTHER STATEMENT OF QUALIFICATIONS (Attached)")
    
    doc.add_heading("3. NAME AND ADDRESS OF ANY MEDICAL SCHOOL, HOSPITAL, OR OTHER RESEARCH FACILITY WHERE THE CLINICAL INVESTIGATION(S) WILL BE CONDUCTED.", level=2)
    doc.add_paragraph("{{research_facility_name}}")
    doc.add_paragraph("{{research_facility_address}}")
    
    doc.add_heading("4. NAME AND ADDRESS OF ANY CLINICAL LABORATORY FACILITIES TO BE USED IN THE STUDY.", level=2)
    doc.add_paragraph("{{clinical_lab_name}}")
    doc.add_paragraph("{{clinical_lab_address}}")
    
    doc.add_heading("5. NAME AND ADDRESS OF THE INSTITUTIONAL REVIEW BOARD (IRB) THAT IS RESPONSIBLE FOR REVIEW AND APPROVAL OF THE STUDY(IES).", level=2)
    doc.add_paragraph("{{irb_name}}")
    doc.add_paragraph("{{irb_address}}")
    
    doc.add_heading("6. NAMES OF THE SUBINVESTIGATORS WHO WILL BE ASSISTING THE INVESTIGATOR IN THE CONDUCT OF THE INVESTIGATION(S).", level=2)
    doc.add_paragraph("{{subinvestigators}}")
    
    doc.add_heading("7. NAME AND CODE NUMBER, IF ANY, OF THE PROTOCOL(S) IN THE IND FOR THE STUDY(IES) TO BE CONDUCTED BY THE INVESTIGATOR.", level=2)
    doc.add_paragraph("{{protocol_name_code}}")
    
    # Commitment section
    doc.add_heading("8. ATTACH THE FOLLOWING CLINICAL PROTOCOL INFORMATION:", level=2)
    doc.add_paragraph("☐ FOR PHASE 1 INVESTIGATIONS, A GENERAL OUTLINE OF THE PLANNED INVESTIGATION INCLUDING THE ESTIMATED DURATION OF THE STUDY AND THE MAXIMUM NUMBER OF SUBJECTS THAT WILL BE INVOLVED.")
    doc.add_paragraph("☐ FOR PHASE 2 OR 3 INVESTIGATIONS, AN OUTLINE OF THE STUDY PROTOCOL INCLUDING AN APPROXIMATION OF THE NUMBER OF SUBJECTS TO BE TREATED WITH THE DRUG AND THE NUMBER TO BE EMPLOYED AS CONTROLS, IF ANY; THE CLINICAL USES TO BE INVESTIGATED; CHARACTERISTICS OF SUBJECTS BY AGE, SEX, AND CONDITION; THE KIND OF CLINICAL OBSERVATIONS AND LABORATORY TESTS TO BE CONDUCTED; THE ESTIMATED DURATION OF THE STUDY; AND COPIES OR A DESCRIPTION OF CASE REPORT FORMS TO BE USED.")
    
    doc.add_heading("9. COMMITMENTS:", level=2)
    commitments = [
        "I agree to conduct the study(ies) in accordance with the relevant, current protocol(s) and will only make changes in a protocol after notifying the sponsor, except when necessary to protect the safety, rights, or welfare of subjects.",
        "I agree to personally conduct or supervise the described investigation(s).",
        "I agree to inform any patients, or any persons used as controls, that the drugs are being used for investigational purposes and I will ensure that the requirements relating to obtaining informed consent in 21 CFR Part 50 and institutional review board (IRB) review and approval in 21 CFR Part 56 are met.",
        "I agree to report to the sponsor adverse experiences that occur in the course of the investigation(s) in accordance with 21 CFR 312.64.",
        "I have read and understand the information in the investigator's brochure, including the potential risks and side effects of the drug.",
        "I agree to ensure that all associates, colleagues, and employees assisting in the conduct of the study(ies) are informed about their obligations in meeting the above commitments.",
        "I agree to maintain adequate and accurate records in accordance with 21 CFR 312.62 and to make those records available for inspection in accordance with 21 CFR 312.68.",
        "I will ensure that an IRB that complies with the requirements of 21 CFR Part 56 will be responsible for the initial and continuing review and approval of the clinical investigation. I also agree to promptly report to the IRB all changes in the research activity and all unanticipated problems involving risks to human subjects or others. Additionally, I will not make any changes in the research without IRB approval, except where necessary to eliminate apparent immediate hazards to human subjects.",
        "I agree to comply with all other requirements regarding the obligations of clinical investigators and all other pertinent requirements in 21 CFR Part 312."
    ]
    
    for commitment in commitments:
        doc.add_paragraph(commitment)
    
    # Signature section
    doc.add_heading("INVESTIGATOR'S SIGNATURE:", level=2)
    doc.add_paragraph("\n\n\n")
    doc.add_paragraph("DATE: {{signature_date}}")
    
    # Save the template
    output_path = os.path.join(templates_dir, "form1572.docx")
    doc.save(output_path)
    print(f"Created Form 1572 template at: {output_path}")

def create_form3674_template():
    """Create FDA Form 3674 template with placeholders"""
    doc = Document()
    
    # Add title
    title = doc.add_heading("FORM FDA 3674", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add subtitle
    subtitle = doc.add_heading("CERTIFICATION OF COMPLIANCE WITH REQUIREMENTS OF CLINICALTRIALS.GOV DATA BANK", level=1)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle = doc.add_heading("(42 U.S.C. 282(j)(5)(B))", level=2)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Explanatory text
    doc.add_paragraph("Public Health Service Act Section 402(j) [42 USC § 282(j)] requires that clinical trials be registered at ClinicalTrials.gov, and also that a certification be submitted to the FDA stating that the requirements of Section 402(j) have been met.")
    
    # Form fields
    doc.add_heading("1. APPLICATION/SUBMISSION TYPE", level=2)
    options = [
        "☐ IND (INVESTIGATIONAL NEW DRUG APPLICATION)",
        "☐ NDA (NEW DRUG APPLICATION)",
        "☐ BLA (BIOLOGICS LICENSE APPLICATION)",
        "☐ EFFICACY SUPPLEMENT",
        "☐ DEVICE 510(k)",
        "☐ DEVICE PMA (PREMARKET APPROVAL APPLICATION)",
        "☐ HDE (HUMANITARIAN DEVICE EXEMPTION)"
    ]
    
    for option in options:
        doc.add_paragraph(option)
    
    doc.add_heading("2. APPLICABLE CLINICAL TRIALS THAT REQUIRE REGISTRATION (Mark all that apply):", level=2)
    options = [
        "☐ TRIALS OF DRUGS AND BIOLOGICS: Controlled, clinical investigation, other than a Phase I investigation, of a product subject to FDA regulation",
        "☐ TRIALS OF DEVICES: 1) Controlled trials with health outcomes of devices subject to FDA regulation, other than small feasibility studies, and 2) Pediatric postmarket surveillance required by FDA",
        "☐ NO APPLICABLE CLINICAL TRIALS: No clinical trials require registration under 42 U.S.C. § 282(j)"
    ]
    
    for option in options:
        doc.add_paragraph(option)
    
    doc.add_heading("3. CERTIFICATION (Mark only one)", level=2)
    options = [
        "☐ A. I certify that the requirements of 42 U.S.C. § 282(j), Section 402(j) of the Public Health Service Act, have been met for the applicable clinical trials identified in the application. Applicable clinical trials have been registered on ClinicalTrials.gov as required.",
        "☐ B. I certify that 42 U.S.C. § 282(j), Section 402(j) of the Public Health Service Act, does not apply to any clinical trial identified in the application.",
        "☐ C. I certify that submission of this application/submission is not subject to 42 U.S.C. § 282(j), Section 402(j) of the Public Health Service Act."
    ]
    
    for option in options:
        doc.add_paragraph(option)
    
    doc.add_heading("4. CLINICALTRIALS.GOV REGISTRATION INFORMATION (Complete if item 3.A is selected)", level=2)
    doc.add_paragraph("☐ All Applicable Clinical Trials provided in the table below have been registered.")
    
    # Create table for trial registration information
    table = doc.add_table(rows=2, cols=3)
    table.style = 'Table Grid'
    
    # Table headers
    headers = table.rows[0].cells
    headers[0].text = "NCT NUMBER"
    headers[1].text = "TRIAL NAME OR TITLE"
    headers[2].text = "TRIAL PHASE"
    
    # Example row with placeholders
    cells = table.rows[1].cells
    cells[0].text = "{{nct_number}}"
    cells[1].text = "{{trial_title}}"
    cells[2].text = "{{trial_phase}}"
    
    # Signature section
    doc.add_heading("5. CERTIFICATION STATEMENT", level=2)
    doc.add_paragraph("I certify that the statements made above are true, complete, and accurate to the best of my knowledge and that I understand that knowingly making a false statement is a criminal offense.")
    
    doc.add_paragraph("NAME OF CERTIFIER: {{certifier_name}}")
    doc.add_paragraph("TITLE OF CERTIFIER: {{certifier_title}}")
    doc.add_paragraph("ADDRESS: {{certifier_address}}")
    doc.add_paragraph("EMAIL ADDRESS: {{certifier_email}}")
    doc.add_paragraph("TELEPHONE NUMBER: {{certifier_phone}}")
    doc.add_paragraph("FAX NUMBER: {{certifier_fax}}")
    
    doc.add_heading("SIGNATURE OF CERTIFIER:", level=2)
    doc.add_paragraph("\n\n\n")
    doc.add_paragraph("DATE: {{signature_date}}")
    
    # Save the template
    output_path = os.path.join(templates_dir, "form3674.docx")
    doc.save(output_path)
    print(f"Created Form 3674 template at: {output_path}")

def create_cover_letter_template():
    """Create a cover letter template"""
    doc = Document()
    
    # Add header with date aligned right
    header = doc.add_paragraph()
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    header.add_run("{{submission_date}}")
    
    # Add double spacing
    doc.add_paragraph()
    
    # Add sender info
    doc.add_paragraph("{{sponsor_name}}")
    doc.add_paragraph("{{sponsor_address}}")
    doc.add_paragraph()
    
    # Add recipient
    doc.add_paragraph("Food and Drug Administration")
    doc.add_paragraph("Center for Drug Evaluation and Research")
    doc.add_paragraph("Central Document Room")
    doc.add_paragraph("5901-B Ammendale Road")
    doc.add_paragraph("Beltsville, MD 20705-1266")
    doc.add_paragraph()
    
    # Add subject line
    subject = doc.add_paragraph("Subject: ")
    subject_run = subject.add_run("IND {{ind_number}} for {{drug_name}}")
    subject_run.bold = True
    doc.add_paragraph()
    
    # Add greeting
    doc.add_paragraph("Dear Sir/Madam:")
    doc.add_paragraph()
    
    # Add body
    doc.add_paragraph("Please find enclosed our submission for {{drug_name}}, IND {{ind_number}}. This submission includes:")
    doc.add_paragraph()
    
    # Add placeholder for included items
    doc.add_paragraph("{{included_items}}")
    doc.add_paragraph()
    
    # Add contact information
    doc.add_paragraph("If you have any questions or require additional information, please contact:")
    doc.add_paragraph()
    doc.add_paragraph("Name: {{contact_name}}")
    doc.add_paragraph("Phone: {{contact_phone}}")
    doc.add_paragraph("Email: {{contact_email}}")
    doc.add_paragraph()
    
    # Add closing
    doc.add_paragraph("Sincerely,")
    doc.add_paragraph()
    doc.add_paragraph()
    doc.add_paragraph()
    doc.add_paragraph("{{authorizer_name}}")
    doc.add_paragraph("{{authorizer_title}}")
    doc.add_paragraph("{{sponsor_name}}")
    
    # Save the template
    output_path = os.path.join(templates_dir, "cover_letter.docx")
    doc.save(output_path)
    print(f"Created cover letter template at: {output_path}")

if __name__ == "__main__":
    # Create all templates
    create_form1571_template()
    create_form1572_template()
    create_form3674_template()
    create_cover_letter_template()
    print("All templates created successfully!")