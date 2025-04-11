#!/usr/bin/env python3
"""
Script to generate PDF reports for trial success predictions.
This script takes a JSON input file and generates a formatted PDF report.
"""

import json
import sys
import os
from datetime import datetime
from fpdf import FPDF
import time

def clean_unicode_for_pdf(text):
    """Clean Unicode characters that can cause issues in PDF generation"""
    if text is None:
        return ""
    
    # Replace problematic characters
    replacements = {
        '–': '-',  # en dash
        '—': '-',  # em dash
        '"': '"',  # left double quote
        '"': '"',  # right double quote
        ''': "'",  # left single quote
        ''': "'",  # right single quote
        '…': '...',  # ellipsis
        '≥': '>=',  # greater than or equal
        '≤': '<=',  # less than or equal
        '°': ' degrees',  # degree symbol
        '±': '+/-',  # plus-minus
        '×': 'x',  # multiplication
        '÷': '/',  # division
        '•': '*',  # bullet
        '​': '',  # zero-width space
        '\u200b': '',  # zero-width space
        '\u200e': '',  # left-to-right mark
        '\u200f': '',  # right-to-left mark
        '\u2028': ' ',  # line separator
        '\u2029': ' '   # paragraph separator
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    return text

def create_success_prediction_pdf(input_data):
    """Generate a PDF report for trial success prediction results"""
    
    # Extract data from input
    success_rate = input_data.get('success_rate', 0)
    inputs = input_data.get('inputs', {})
    protocol_id = input_data.get('protocol_id', 'Unknown')
    timestamp = input_data.get('timestamp', datetime.now().timestamp())
    
    # Convert success rate to percentage with 1 decimal point
    success_percentage = round(success_rate * 100, 1)
    
    # Format date
    date_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
    
    # Clean protocol ID to ensure safe PDF generation
    protocol_id = clean_unicode_for_pdf(str(protocol_id))
    
    # Create PDF document
    pdf = FPDF()
    pdf.add_page()
    
    # Set up fonts
    pdf.set_font('Arial', 'B', 16)
    
    # Header
    pdf.cell(0, 10, 'TrialSage - Success Prediction Report', 0, 1, 'C')
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 6, f'Protocol ID: {protocol_id}', 0, 1, 'C')
    pdf.cell(0, 6, f'Generated: {date_str}', 0, 1, 'C')
    pdf.ln(10)
    
    # Success Prediction Results
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Prediction Results', 0, 1, 'L')
    pdf.set_font('Arial', '', 12)
    
    # Create colored success indicator
    if success_percentage > 75:
        pdf.set_text_color(0, 128, 0)  # Green
        status = "High Probability of Success"
    elif success_percentage > 50:
        pdf.set_text_color(0, 0, 255)  # Blue
        status = "Moderate Probability of Success"
    else:
        pdf.set_text_color(255, 0, 0)  # Red
        status = "Low Probability of Success"
    
    # Clean status message to prevent PDF encoding issues
    status = clean_unicode_for_pdf(status)
    pdf.cell(0, 10, f'Success Prediction: {success_percentage}% ({status})', 0, 1, 'L')
    pdf.set_text_color(0, 0, 0)  # Reset to black
    pdf.ln(5)
    
    # Trial Parameters
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Trial Parameters', 0, 1, 'L')
    pdf.set_font('Arial', '', 12)
    
    sample_size = inputs.get('sample_size', 'Not specified')
    duration_weeks = inputs.get('duration_weeks', 'Not specified')
    dropout_rate = inputs.get('dropout_rate', 'Not specified')
    indication = clean_unicode_for_pdf(str(inputs.get('indication', 'Not specified')))
    phase = clean_unicode_for_pdf(str(inputs.get('phase', 'Not specified')))
    
    pdf.cell(0, 8, f'Sample Size: {sample_size}', 0, 1, 'L')
    pdf.cell(0, 8, f'Duration: {duration_weeks} weeks', 0, 1, 'L')
    pdf.cell(0, 8, f'Dropout Rate: {dropout_rate}', 0, 1, 'L')
    pdf.cell(0, 8, f'Indication: {indication}', 0, 1, 'L')
    pdf.cell(0, 8, f'Phase: {phase}', 0, 1, 'L')
    pdf.ln(5)
    
    # Recommendations (based on prediction)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Recommendations', 0, 1, 'L')
    pdf.set_font('Arial', '', 12)
    
    if success_percentage > 75:
        recommendations = [
            "Trial parameters are optimal. Proceed with the planned design.",
            "Consider documenting design decisions for future trials.",
            "Monitor dropout closely to maintain high success probability."
        ]
    elif success_percentage > 50:
        recommendations = [
            "Consider increasing sample size if feasible.",
            "Implement robust retention strategies to reduce dropout.",
            "Review endpoint selection and measurement timing."
        ]
    else:
        recommendations = [
            "Reassess sample size - current value may be insufficient.",
            "Consider extending trial duration for more robust outcomes.",
            "Implement enhanced participant retention strategies.",
            "Review eligibility criteria to ensure appropriate population targeting."
        ]
    
    for i, rec in enumerate(recommendations, 1):
        # Clean any Unicode characters in recommendations
        clean_rec = clean_unicode_for_pdf(rec)
        pdf.cell(0, 8, f"{i}. {clean_rec}", 0, 1, 'L')
    
    pdf.ln(5)
    
    # Footer
    pdf.set_y(-30)
    pdf.set_font('Arial', 'I', 8)
    pdf.cell(0, 10, 'This report was generated by TrialSage AI Clinical Trial Intelligence Platform', 0, 0, 'C')
    pdf.cell(0, 10, f'Page {pdf.page_no()}', 0, 0, 'R')
    
    # Generate filename and path
    filename = f"Trial_Success_Prediction_{protocol_id.replace(' ', '_')}_{int(timestamp)}.pdf"
    filepath = os.path.join('data', 'exports', filename)
    
    # Save the PDF
    pdf.output(filepath)
    return filepath

def main():
    """Main entry point for script"""
    if len(sys.argv) != 2:
        print("Usage: python generate_success_pdf.py <input_json_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        with open(input_file, 'r') as f:
            input_data = json.load(f)
            
        output_filepath = create_success_prediction_pdf(input_data)
        
        # Print the output filepath to stdout for the Node.js process to capture
        print(output_filepath)
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()