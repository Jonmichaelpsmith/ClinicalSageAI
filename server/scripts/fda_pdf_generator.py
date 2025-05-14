"""
FDA PDF Generator

This script generates FDA-compliant PDFs for 510(k) submissions using reportlab.
It enforces strict formatting requirements as specified in FDA guidance documents.

Usage:
    python fda_pdf_generator.py input.json output.pdf

Where:
    input.json - A JSON file containing the structured document content
    output.pdf - The path where the generated PDF should be saved
"""

import sys
import json
import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image

# Register fonts - using standard fonts that are FDA-compliant
pdfmetrics.registerFont(TTFont('Times', 'Times-Roman'))
pdfmetrics.registerFont(TTFont('Times-Bold', 'Times-Bold'))
pdfmetrics.registerFont(TTFont('Times-Italic', 'Times-Italic'))
pdfmetrics.registerFont(TTFont('Times-BoldItalic', 'Times-BoldItalic'))

def create_styles():
    """Create paragraph styles that comply with FDA requirements"""
    styles = getSampleStyleSheet()
    
    # Title style (centered, 14pt, bold)
    styles.add(ParagraphStyle(
        name='FDA_Title',
        fontName='Times-Bold',
        fontSize=14,
        alignment=1,  # Center alignment
        spaceAfter=12,
        leading=18
    ))
    
    # Subtitle style (centered, 12pt, bold)
    styles.add(ParagraphStyle(
        name='FDA_Subtitle',
        fontName='Times-Bold',
        fontSize=12,
        alignment=1,  # Center alignment
        spaceAfter=12,
        leading=16
    ))
    
    # Section heading style (left-aligned, 12pt, bold)
    styles.add(ParagraphStyle(
        name='FDA_Section',
        fontName='Times-Bold',
        fontSize=12,
        alignment=0,  # Left alignment
        spaceAfter=8,
        spaceBefore=12,
        leading=16
    ))
    
    # Subheading style (left-aligned, 11pt, bold)
    styles.add(ParagraphStyle(
        name='FDA_Subheading',
        fontName='Times-Bold',
        fontSize=11,
        alignment=0,  # Left alignment
        spaceAfter=6,
        spaceBefore=8,
        leading=14
    ))
    
    # Normal text style (justified, 11pt)
    styles.add(ParagraphStyle(
        name='FDA_Normal',
        fontName='Times',
        fontSize=11,
        alignment=4,  # Justified
        spaceAfter=6,
        leading=14
    ))
    
    # Footer style (centered, 9pt)
    styles.add(ParagraphStyle(
        name='FDA_Footer',
        fontName='Times',
        fontSize=9,
        alignment=1,  # Center alignment
        textColor=colors.gray
    ))
    
    return styles

def process_text(text):
    """Process text to handle line breaks and escaping"""
    if not text:
        return ""
    # Replace newlines with HTML line breaks
    text = text.replace('\n', '<br/>')
    # Escape XML special characters
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # Convert back <br/> tags
    text = text.replace('&lt;br/&gt;', '<br/>')
    return text

def create_table(table_data, headers):
    """Create a table with FDA-compliant styling"""
    if not headers or not table_data:
        return None
    
    # Add headers as first row
    data = [headers]
    data.extend(table_data)
    
    # Create table with appropriate styling
    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, 0), 'Times-Bold'),
        ('FONT', (0, 1), (-1, -1), 'Times'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('ALIGN', (1, 1), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.black),
        ('BOX', (0, 0), (-1, -1), 0.25, colors.black),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    return table

def generate_pdf(content, output_path):
    """Generate FDA-compliant PDF from structured content"""
    # Set up document with FDA-compliant margins (1 inch all around)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=1*inch,
        rightMargin=1*inch,
        topMargin=1*inch,
        bottomMargin=1*inch
    )
    
    # Get styles
    styles = create_styles()
    
    # Build story (document content)
    story = []
    
    # Add title
    if 'title' in content:
        story.append(Paragraph(process_text(content['title']), styles['FDA_Title']))
    
    # Add subtitle if present
    if 'subtitle' in content:
        story.append(Paragraph(process_text(content['subtitle']), styles['FDA_Subtitle']))
    
    # Add document date in FDA format
    story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['FDA_Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Process each section
    if 'sections' in content and isinstance(content['sections'], list):
        for section in content['sections']:
            # Add section title with appropriate spacing
            if 'title' in section:
                story.append(Paragraph(process_text(section['title']), styles['FDA_Section']))
            
            # Process section content
            if 'content' in section and isinstance(section['content'], list):
                for item in section['content']:
                    # Add subheading if present
                    if 'heading' in item:
                        story.append(Paragraph(process_text(item['heading']), styles['FDA_Subheading']))
                    
                    # Add text content if present
                    if 'text' in item:
                        story.append(Paragraph(process_text(item['text']), styles['FDA_Normal']))
                    
                    # Add table if present
                    if 'table' in item and isinstance(item['table'], dict):
                        if ('headers' in item['table'] and 'rows' in item['table'] and 
                            isinstance(item['table']['headers'], list) and 
                            isinstance(item['table']['rows'], list)):
                            
                            table = create_table(item['table']['rows'], item['table']['headers'])
                            if table:
                                story.append(Spacer(1, 0.1*inch))
                                story.append(table)
                                story.append(Spacer(1, 0.1*inch))
            
            # Add page break after certain sections per FDA guidelines
            if 'title' in section and section['title'] in [
                "Cover Letter", 
                "Indications for Use", 
                "510(k) Summary", 
                "Substantial Equivalence Comparison",
                "Performance Data"
            ]:
                story.append(PageBreak())
    
    # Add footer if present
    if 'footer' in content and 'text' in content['footer']:
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph(process_text(content['footer']['text']), styles['FDA_Footer']))
    
    # Build the PDF
    doc.build(story)
    
    return True

def main():
    """Main entry point for the script"""
    if len(sys.argv) != 3:
        print("Usage: python fda_pdf_generator.py input.json output.pdf")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(input_path):
        print(f"Error: Input file '{input_path}' not found.")
        sys.exit(1)
    
    try:
        with open(input_path, 'r') as f:
            content = json.load(f)
        
        success = generate_pdf(content, output_path)
        if success:
            print(f"Successfully generated FDA-compliant PDF: {output_path}")
            sys.exit(0)
        else:
            print("Failed to generate PDF.")
            sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()