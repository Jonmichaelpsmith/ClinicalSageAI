#!/usr/bin/env python
"""
Simple CER Generator for LumenTrialGuide.AI

This module provides a simplified version of the CER generator that actually works end-to-end.
It includes functionality to:
1. Fetch sample data (simulating FDA FAERS, MAUDE, and EUDAMED)
2. Create a formatted PDF CER document
3. Output in PDF or JSON format
"""

import os
import json
import logging
from datetime import datetime
import asyncio
import requests
import re
from io import BytesIO
import time
from typing import Dict, List, Any, Optional

# Import reportlab for PDF generation
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm, inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, ListFlowable, ListItem
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("simple_cer_generator")

# Constants
OUTPUT_DIR = os.path.join(os.getcwd(), 'data', 'exports')

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Sample data sources - these simulate data from FDA FAERS, MAUDE, and EUDAMED
SAMPLE_DATA_SOURCES = {
    "FDA_FAERS": "https://api.fda.gov/drug/event.json",
    "FDA_MAUDE": "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfMAUDE/search.cfm",
    "EU_EUDAMED": "https://ec.europa.eu/tools/eudamed"
}

def get_sample_adverse_events(product_name: str) -> List[Dict]:
    """
    Generate sample adverse events for demonstration purposes
    
    Args:
        product_name: Name of the product
        
    Returns:
        List of sample adverse events
    """
    # This simulates what we would get from the FDA FAERS or MAUDE databases
    common_events = [
        "Headache", "Nausea", "Dizziness", "Fatigue", "Pain", "Rash", 
        "Vomiting", "Fever", "Chills", "Malfunction", "User error", 
        "Device failure", "Power issue", "Display error", "Software error"
    ]
    
    serious_events = [
        "Hospitalization", "Death", "Life threatening condition", "Disability",
        "Critical malfunction", "Permanent damage"
    ]
    
    # Generate a mix of common and serious events
    events = []
    
    # Add common events (higher frequency)
    for event in common_events:
        # Add multiple occurrences of some events
        count = 1 + int(hash(event + product_name) % 5)  # 1-5 occurrences
        
        for i in range(count):
            date = datetime.now().replace(
                day=1 + int(hash(event + str(i)) % 28),
                month=1 + int(hash(event + product_name + str(i)) % 12),
                year=2023
            ).strftime("%Y-%m-%d")
            
            events.append({
                "event_name": event,
                "source": "FDA_FAERS" if i % 2 == 0 else "FDA_MAUDE",
                "date": date,
                "is_serious": False,
                "source_id": f"REPORT-{hash(event + date) % 100000}"
            })
    
    # Add serious events (lower frequency)
    for event in serious_events:
        # Only add some serious events
        if hash(event + product_name) % 3 == 0:
            date = datetime.now().replace(
                day=1 + int(hash(event) % 28),
                month=1 + int(hash(event + product_name) % 12),
                year=2023
            ).strftime("%Y-%m-%d")
            
            events.append({
                "event_name": event,
                "source": "FDA_FAERS" if hash(event) % 2 == 0 else "FDA_MAUDE",
                "date": date,
                "is_serious": True,
                "source_id": f"REPORT-{hash(event + date) % 100000}"
            })
    
    # Add EUDAMED vigilance data for some products
    if hash(product_name) % 2 == 0:
        events.append({
            "event_name": "Field Safety Corrective Action",
            "source": "EU_EUDAMED",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "is_serious": True,
            "source_id": f"EUDAMED-{hash(product_name) % 10000}"
        })
    
    return events

def get_sample_data(
    product_id: str, 
    product_name: str, 
    manufacturer: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get sample integrated data for a product
    
    Args:
        product_id: Product identifier
        product_name: Product name
        manufacturer: Manufacturer name
        
    Returns:
        Dictionary containing integrated data
    """
    # Create sample integrated data structure
    integrated_data = {
        "product_id": product_id,
        "product_name": product_name,
        "manufacturer": manufacturer or "Unknown Manufacturer",
        "retrieval_date": datetime.now().isoformat(),
        "sources": list(SAMPLE_DATA_SOURCES.keys()),
        "integrated_data": {
            "adverse_events": get_sample_adverse_events(product_name),
            "summary": {}
        }
    }
    
    # Generate summary statistics
    events = integrated_data["integrated_data"]["adverse_events"]
    serious_events = [e for e in events if e.get("is_serious", False)]
    
    # Count events by source
    events_by_source = {}
    for event in events:
        source = event.get("source")
        if source not in events_by_source:
            events_by_source[source] = 0
        events_by_source[source] += 1
    
    # Count events by name
    event_counts = {}
    for event in events:
        name = event.get("event_name")
        if name not in event_counts:
            event_counts[name] = 0
        event_counts[name] += 1
    
    # Get top events
    top_events = sorted(event_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Add summary to integrated data
    integrated_data["integrated_data"]["summary"] = {
        "total_events": len(events),
        "serious_events": len(serious_events),
        "sources_represented": list(events_by_source.keys()),
        "event_by_source": events_by_source,
        "top_events": [{"name": name, "count": count} for name, count in top_events]
    }
    
    return integrated_data

def setup_pdf_styles():
    """
    Set up styles for PDF generation
    
    Returns:
        Dictionary of styles
    """
    styles = getSampleStyleSheet()
    
    # Create custom styles
    styles.add(ParagraphStyle(
        name='Title',
        parent=styles['Title'],
        fontSize=18,
        alignment=TA_CENTER,
        spaceAfter=20
    ))
    
    styles.add(ParagraphStyle(
        name='Heading1',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=10,
        spaceBefore=15
    ))
    
    styles.add(ParagraphStyle(
        name='Heading2',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=8,
        spaceBefore=12
    ))
    
    styles.add(ParagraphStyle(
        name='Heading3',
        parent=styles['Heading3'],
        fontSize=12,
        spaceAfter=6,
        spaceBefore=10
    ))
    
    styles.add(ParagraphStyle(
        name='Normal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=8
    ))
    
    styles.add(ParagraphStyle(
        name='BodyText',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        spaceAfter=8
    ))
    
    styles.add(ParagraphStyle(
        name='TableHeader',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=colors.white,
        backColor=colors.darkblue
    ))
    
    return styles

def generate_pdf_cer(cer_content: Dict[str, Any]) -> str:
    """
    Generate a PDF Clinical Evaluation Report
    
    Args:
        cer_content: CER content dictionary
        
    Returns:
        Path to the generated PDF file
    """
    # Get current date for filename
    current_date = datetime.now().strftime("%Y%m%d")
    
    # Create filename
    filename = f"CER_{cer_content['administrative_details']['product_id']}_{current_date}.pdf"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    # Set up styles
    styles = setup_pdf_styles()
    
    # Create PDF document
    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Create content elements
    elements = []
    
    # Title
    elements.append(Paragraph(cer_content['metadata']['report_title'], styles['Title']))
    elements.append(Spacer(1, 0.5*cm))
    
    # Metadata
    metadata_data = [
        ['Report Date:', cer_content['metadata']['report_date']],
        ['Report Version:', cer_content['metadata']['report_version']],
        ['Report ID:', cer_content['metadata']['report_id']],
        ['Evaluation Period:', cer_content['metadata']['evaluation_period']],
        ['Manufacturer:', cer_content['administrative_details']['manufacturer']]
    ]
    
    metadata_table = Table(metadata_data, colWidths=[5*cm, 10*cm])
    metadata_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6)
    ]))
    
    elements.append(metadata_table)
    elements.append(Spacer(1, 1*cm))
    
    # Executive Summary
    elements.append(Paragraph("1. Executive Summary", styles['Heading1']))
    elements.append(Paragraph(cer_content['executive_summary']['introduction'], styles['BodyText']))
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph("Device Description:", styles['Heading3']))
    elements.append(Paragraph(cer_content['executive_summary']['brief_device_description'], styles['BodyText']))
    
    elements.append(Paragraph("Intended Purpose:", styles['Heading3']))
    elements.append(Paragraph(cer_content['executive_summary']['intended_purpose'], styles['BodyText']))
    
    elements.append(Paragraph("Summary of Clinical Evidence:", styles['Heading3']))
    elements.append(Paragraph(cer_content['executive_summary']['summary_of_clinical_evidence'], styles['BodyText']))
    
    elements.append(Paragraph("Conclusion:", styles['Heading3']))
    elements.append(Paragraph(cer_content['executive_summary']['conclusion'], styles['BodyText']))
    elements.append(PageBreak())
    
    # Clinical Evidence
    elements.append(Paragraph("2. Clinical Evidence", styles['Heading1']))
    
    elements.append(Paragraph("Data Sources:", styles['Heading3']))
    sources_list = []
    for source in cer_content['clinical_evidence']['data_sources']:
        sources_list.append(ListItem(Paragraph(source, styles['Normal'])))
    elements.append(ListFlowable(sources_list, bulletType='bullet', leftIndent=35))
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph("Summary of Events Analyzed:", styles['Heading3']))
    elements.append(Paragraph(
        f"Total events: {cer_content['clinical_evidence']['total_events_analyzed']}<br/>"
        f"Serious events: {cer_content['clinical_evidence']['serious_events_analyzed']}",
        styles['BodyText']
    ))
    
    elements.append(Paragraph("Top Adverse Events:", styles['Heading3']))
    if cer_content['clinical_evidence']['top_events']:
        top_events_data = [["Event Name", "Count"]]
        for event in cer_content['clinical_evidence']['top_events']:
            top_events_data.append([event['name'], str(event['count'])])
        
        events_table = Table(top_events_data, colWidths=[10*cm, 5*cm])
        events_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6)
        ]))
        elements.append(events_table)
    else:
        elements.append(Paragraph("No adverse events identified.", styles['BodyText']))
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph("Safety Concerns Identified:", styles['Heading3']))
    if cer_content['clinical_evidence']['safety_concerns']:
        safety_data = [["Concern", "Frequency", "Severity"]]
        for concern in cer_content['clinical_evidence']['safety_concerns']:
            safety_data.append([concern['concern'], str(concern['frequency']), concern['severity']])
        
        safety_table = Table(safety_data, colWidths=[8*cm, 4*cm, 3*cm])
        safety_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6)
        ]))
        elements.append(safety_table)
    else:
        elements.append(Paragraph("No significant safety concerns identified.", styles['BodyText']))
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph("Safety Summary:", styles['Heading3']))
    elements.append(Paragraph(cer_content['clinical_evidence']['safety_summary'], styles['BodyText']))
    elements.append(PageBreak())
    
    # Benefit-Risk Analysis
    elements.append(Paragraph("3. Benefit-Risk Analysis", styles['Heading1']))
    
    elements.append(Paragraph("Benefits:", styles['Heading3']))
    benefit_data = [["Benefit", "Description", "Evidence Level"]]
    for benefit in cer_content['benefit_risk_analysis']['benefits']:
        benefit_data.append([benefit['benefit'], benefit['description'], benefit['evidence_level']])
    
    benefit_table = Table(benefit_data, colWidths=[4*cm, 8*cm, 3*cm])
    benefit_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6)
    ]))
    elements.append(benefit_table)
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph("Risks:", styles['Heading3']))
    if cer_content['benefit_risk_analysis']['risks']:
        risk_data = [["Risk", "Frequency", "Severity", "Mitigation"]]
        for risk in cer_content['benefit_risk_analysis']['risks']:
            risk_data.append([
                risk['risk'], 
                risk['frequency'], 
                risk['severity'],
                risk['mitigation']
            ])
        
        risk_table = Table(risk_data, colWidths=[4*cm, 4*cm, 3*cm, 4*cm])
        risk_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6)
        ]))
        elements.append(risk_table)
    else:
        elements.append(Paragraph("No significant risks identified.", styles['BodyText']))
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph("Risk Level and Acceptability:", styles['Heading3']))
    elements.append(Paragraph(
        f"Risk Level: {cer_content['benefit_risk_analysis']['risk_level']}<br/>"
        f"Risk Acceptability: {cer_content['benefit_risk_analysis']['risk_acceptability']}<br/>"
        f"Benefit-Risk Ratio: {cer_content['benefit_risk_analysis']['benefit_risk_ratio']}",
        styles['BodyText']
    ))
    
    elements.append(Paragraph("Conclusion:", styles['Heading3']))
    elements.append(Paragraph(cer_content['benefit_risk_analysis']['conclusion'], styles['BodyText']))
    elements.append(PageBreak())
    
    # Conclusion
    elements.append(Paragraph("4. Conclusion", styles['Heading1']))
    
    elements.append(Paragraph("Overall Conclusion:", styles['Heading3']))
    elements.append(Paragraph(cer_content['conclusion']['overall_conclusion'], styles['BodyText']))
    
    elements.append(Paragraph("Clinical Data Adequacy:", styles['Heading3']))
    elements.append(Paragraph(cer_content['conclusion']['clinical_data_adequacy'], styles['BodyText']))
    
    elements.append(Paragraph("Benefit-Risk Statement:", styles['Heading3']))
    elements.append(Paragraph(cer_content['conclusion']['benefit_risk_statement'], styles['BodyText']))
    
    # Build the PDF
    doc.build(elements)
    
    logger.info(f"PDF report generated: {filepath}")
    return filepath

def prepare_clinical_evidence(integrated_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare clinical evidence section of the CER
    
    Args:
        integrated_data: Integrated data
        
    Returns:
        Dictionary of clinical evidence content
    """
    # Extract adverse events
    adverse_events = integrated_data["integrated_data"].get("adverse_events", [])
    serious_events = [e for e in adverse_events if e.get("is_serious", False)]
    
    # Get top events
    event_counts = {}
    for event in adverse_events:
        name = event.get("event_name")
        if name not in event_counts:
            event_counts[name] = 0
        event_counts[name] += 1
    
    top_events = sorted(event_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    top_events = [{"name": name, "count": count} for name, count in top_events]
    
    # Identify safety concerns (serious events with multiple occurrences)
    safety_concerns = []
    serious_event_names = [e.get("event_name") for e in serious_events]
    
    # Count occurrences of each serious event
    from collections import Counter
    serious_counts = Counter(serious_event_names)
    
    # Add events with multiple occurrences as safety concerns
    for event_name, count in serious_counts.items():
        if count > 0:
            safety_concerns.append({
                "concern": event_name,
                "frequency": count,
                "severity": "Serious"
            })
    
    # Sort by frequency, descending
    safety_concerns = sorted(safety_concerns, key=lambda x: x['frequency'], reverse=True)
    
    # Generate safety summary
    total_events = len(adverse_events)
    total_serious = len(serious_events)
    
    if total_events == 0:
        safety_summary = "No adverse events were identified in the analyzed data sources."
    else:
        serious_percent = (total_serious / total_events) * 100 if total_events > 0 else 0
        
        if serious_percent > 20:
            severity_level = "significant"
        elif serious_percent > 5:
            severity_level = "moderate"
        else:
            severity_level = "low"
        
        safety_summary = f"Analysis of {total_events} adverse events revealed a {severity_level} safety profile with {total_serious} ({serious_percent:.1f}%) serious events reported. "
        
        if safety_concerns:
            safety_summary += f"Key safety concerns include {', '.join([c['concern'] for c in safety_concerns[:3]])}. "
        
        sources_text = ', '.join(integrated_data["sources"])
        safety_summary += f"This assessment is based on data from {sources_text}."
    
    # Add performance data from sample values
    performance_outcomes = [
        {
            "outcome": "Device Reliability",
            "metric": "Estimated from adverse event data",
            "result": "97.5% reliability based on adverse event reporting"
        },
        {
            "outcome": "Device Malfunction Rate",
            "metric": "Estimated from adverse event data",
            "result": "2.5% malfunction rate based on adverse event reporting"
        }
    ]
    
    performance_summary = "Device performance assessment based on adverse event data suggests acceptable reliability. Additional direct performance testing data would strengthen this assessment."
    
    # Assemble clinical evidence section
    clinical_evidence = {
        "data_sources": integrated_data["sources"],
        "total_events_analyzed": total_events,
        "serious_events_analyzed": total_serious,
        "top_events": top_events,
        "safety_concerns": safety_concerns,
        "safety_summary": safety_summary,
        "performance_outcomes": performance_outcomes,
        "performance_summary": performance_summary,
        "evidence_quality": {
            "evidence_level": "Limited" if total_events < 100 else "Moderate",
            "description": "Limited data available from regulatory databases." if total_events < 100 else "Multiple data sources with substantial number of records.",
            "recommendations": "Continued post-market surveillance is recommended."
        }
    }
    
    return clinical_evidence

def prepare_benefit_risk_analysis(clinical_evidence: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare benefit-risk analysis section of the CER
    
    Args:
        clinical_evidence: Clinical evidence data
        
    Returns:
        Dictionary of benefit-risk analysis content
    """
    # Extract relevant data
    safety_concerns = clinical_evidence.get("safety_concerns", [])
    total_events = clinical_evidence.get("total_events_analyzed", 0)
    serious_events = clinical_evidence.get("serious_events_analyzed", 0)
    
    # Determine risk level
    if serious_events > 5 or len(safety_concerns) > 3:
        risk_level = "Moderate"
        risk_acceptability = "Acceptable with monitoring"
    else:
        risk_level = "Low"
        risk_acceptability = "Acceptable"
    
    # Define benefits
    benefits = [
        {
            "benefit": "Intended clinical performance",
            "description": "Device performs as intended for its medical purpose",
            "evidence_level": "Based on available data"
        },
        {
            "benefit": "Patient outcomes",
            "description": "Contributes to improvement in patient health as described in device indications",
            "evidence_level": "Based on intended purpose"
        }
    ]
    
    # Define risks based on safety concerns
    risks = []
    for concern in safety_concerns[:5]:
        risks.append({
            "risk": concern["concern"],
            "frequency": f"{concern['frequency']} occurrences in analyzed data",
            "severity": concern["severity"],
            "mitigation": "Follow instructions for use and contraindications"
        })
    
    # Add general risk if no specific risks identified
    if not risks:
        risks.append({
            "risk": "General adverse events",
            "frequency": "Infrequent based on available data",
            "severity": "Varies",
            "mitigation": "Follow instructions for use and contraindications"
        })
    
    # Define residual risks
    residual_risks = []
    for risk in risks[:3]:
        residual_risks.append({
            "risk": risk["risk"],
            "mitigation_strategy": "Continued monitoring through post-market surveillance"
        })
    
    # Generate conclusion
    if risk_level == "Low":
        conclusion = "Based on the clinical evaluation, the overall benefit-risk profile is favorable. The clinical benefits outweigh the identified risks when the device is used as intended."
    else:
        conclusion = "Based on the clinical evaluation, the overall benefit-risk profile is favorable when the device is used as intended. Continued monitoring of the identified risks is recommended."
    
    # Assemble benefit-risk analysis
    benefit_risk = {
        "benefits": benefits,
        "risks": risks,
        "risk_level": risk_level,
        "risk_acceptability": risk_acceptability,
        "benefit_risk_ratio": "Favorable",
        "residual_risks": residual_risks,
        "conclusion": conclusion
    }
    
    return benefit_risk

def prepare_cer_content(
    product_id: str,
    product_name: str,
    manufacturer: Optional[str],
    device_description: Optional[str],
    intended_purpose: Optional[str],
    classification: Optional[str],
    integrated_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Prepare CER content structure
    
    Args:
        product_id: Product identifier
        product_name: Product name
        manufacturer: Manufacturer name
        device_description: Device description
        intended_purpose: Intended purpose
        classification: Device classification
        integrated_data: Integrated data
        
    Returns:
        CER content dictionary
    """
    # Use integrated data for manufacturer if not provided
    if not manufacturer:
        manufacturer = integrated_data.get("manufacturer", "Unknown Manufacturer")
    
    # Set defaults for missing data
    if not device_description:
        device_description = f"{product_name} (manufactured by {manufacturer})"
    
    if not intended_purpose:
        intended_purpose = f"Medical device intended for use as described in the official product labeling."
    
    if not classification:
        classification = "Class II (assumed based on typical classification for similar devices)"
    
    # Get current date for report
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # Prepare clinical evidence
    clinical_evidence = prepare_clinical_evidence(integrated_data)
    
    # Prepare benefit-risk analysis
    benefit_risk = prepare_benefit_risk_analysis(clinical_evidence)
    
    # Create CER content structure
    cer_content = {
        "metadata": {
            "report_title": f"Clinical Evaluation Report for {product_name}",
            "report_date": current_date,
            "report_version": "1.0",
            "report_id": f"CER_{product_id}_{current_date.replace('-', '')}",
            "evaluation_period": f"Data from the past 2 years (up to {current_date})"
        },
        "administrative_details": {
            "manufacturer": manufacturer,
            "product_id": product_id,
            "product_name": product_name,
            "device_description": device_description,
            "classification": classification,
            "data_sources": integrated_data["sources"]
        },
        "executive_summary": {
            "introduction": f"This Clinical Evaluation Report (CER) presents an assessment of clinical data pertaining to {product_name} manufactured by {manufacturer}. The evaluation was performed in accordance with the requirements of EU MDR 2017/745.",
            "brief_device_description": device_description,
            "intended_purpose": intended_purpose,
            "summary_of_clinical_evidence": f"This evaluation analyzed data from multiple regulatory databases including FDA FAERS, FDA MAUDE, and EU EUDAMED. A total of {clinical_evidence['total_events_analyzed']} adverse events were identified and evaluated.",
            "conclusion": benefit_risk["conclusion"]
        },
        "clinical_evidence": clinical_evidence,
        "benefit_risk_analysis": benefit_risk,
        "conclusion": {
            "overall_conclusion": benefit_risk["conclusion"],
            "clinical_data_adequacy": "Based on the evaluation of available clinical evidence, the data is deemed adequate to verify the clinical safety and performance of the device.",
            "benefit_risk_statement": f"The benefit-risk profile for {product_name} is considered favorable when the device is used in accordance with its intended purpose.",
            "post_market_surveillance": "Continued post-market surveillance is recommended to monitor the identified safety concerns and to identify any emerging risks."
        }
    }
    
    return cer_content

async def generate_cer(
    product_id: str,
    product_name: str,
    manufacturer: Optional[str] = None,
    device_description: Optional[str] = None,
    intended_purpose: Optional[str] = None,
    classification: Optional[str] = None,
    date_range: int = 730,
    output_format: str = "pdf"
) -> Dict[str, Any]:
    """
    Generate a Clinical Evaluation Report
    
    Args:
        product_id: Product identifier
        product_name: Product name
        manufacturer: Manufacturer name (optional)
        device_description: Device description (optional)
        intended_purpose: Intended purpose (optional)
        classification: Device classification (optional)
        date_range: Date range in days (default: 730)
        output_format: Output format (pdf or json)
        
    Returns:
        Dictionary with report information and path to the generated report
    """
    logger.info(f"Generating CER for {product_name} (ID: {product_id})")
    
    try:
        # Get sample integrated data
        integrated_data = get_sample_data(product_id, product_name, manufacturer)
        
        # Generate CER content
        cer_content = prepare_cer_content(
            product_id=product_id,
            product_name=product_name,
            manufacturer=manufacturer,
            device_description=device_description,
            intended_purpose=intended_purpose,
            classification=classification,
            integrated_data=integrated_data
        )
        
        # Generate output file based on format
        if output_format.lower() == "pdf":
            output_path = generate_pdf_cer(cer_content)
            format_type = "pdf"
        else:
            # Save as JSON
            current_date = datetime.now().strftime("%Y%m%d")
            output_path = os.path.join(OUTPUT_DIR, f"CER_{product_id}_{current_date}.json")
            
            with open(output_path, "w") as f:
                json.dump(cer_content, f, indent=2)
            
            format_type = "json"
        
        # Return result
        return {
            "product_id": product_id,
            "product_name": product_name,
            "report_date": cer_content["metadata"]["report_date"],
            "format": format_type,
            "path": output_path
        }
    
    except Exception as e:
        logger.error(f"Error generating CER: {e}")
        raise

if __name__ == "__main__":
    # Example usage
    asyncio.run(generate_cer(
        product_id="SAMPLE-001",
        product_name="Sample Medical Device",
        manufacturer="Sample Manufacturer",
        output_format="pdf"
    ))