#!/usr/bin/env python3
"""
Protocol Intelligence Report Generator
This script generates PDF reports with protocol analysis results and benchmark comparisons
"""

import os
import json
import sys
from fpdf import FPDF
import time
import argparse
from datetime import datetime

# Ensure reports directory exists
os.makedirs("data/reports", exist_ok=True)

def deep_clean(text):
    """Clean text of problematic Unicode characters for PDF generation"""
    if not text:
        return ""
    
    # Replace problematic characters
    replacements = {
        "–": "-",  # en dash
        "—": "-",  # em dash
        "'": "'",  # curly quote
        "'": "'",  # curly quote
        """: '"',  # curly quote
        """: '"',  # curly quote
        "≥": ">=",
        "≤": "<=",
        "±": "+/-",
        "°": " degrees ",
        "…": "...",
        "→": "->",
        "⁄": "/",
        "≠": "!=",
        "≈": "~=",
        "×": "x",
        "÷": "/",
        "•": "*",
        "·": "*",
        "α": "alpha",
        "β": "beta",
        "μ": "mu",
        "σ": "sigma",
        "Δ": "Delta",
        "©": "(c)",
        "®": "(R)",
        "™": "(TM)",
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Remove any remaining non-ASCII characters
    text = ''.join(c if ord(c) < 128 else ' ' for c in text)
    
    return text

class ProtocolReportPDF(FPDF):
    def __init__(self, protocol_id, title=None):
        super().__init__()
        self.protocol_id = deep_clean(str(protocol_id))
        self.title = deep_clean(title if title else f"Protocol Intelligence Report - {protocol_id}")
        self.set_auto_page_break(auto=True, margin=15)
    
    def header(self):
        # Title
        self.set_font('Arial', 'B', 14)
        self.cell(0, 10, self.title, 0, 1, 'C')
        
        # Subtitle with date
        self.set_font('Arial', 'I', 10)
        date_str = datetime.now().strftime('%Y-%m-%d')
        self.cell(0, 5, f"Generated on {date_str}", 0, 1, 'C')
        
        # Line break
        self.ln(5)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
    
    def add_section(self, title, content):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, deep_clean(title), 0, 1, 'L')
        self.ln(1)
        
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 5, deep_clean(content))
        self.ln(3)
    
    def add_bullet_list(self, items):
        self.set_font('Arial', '', 11)
        for item in items:
            clean_item = deep_clean(item)
            self.cell(5, 5, '•', 0, 0)
            self.multi_cell(0, 5, clean_item)
        self.ln(3)
    
    def add_bar_chart(self, title, labels, values1, values2, labels1="Your Protocol", labels2="CSR Median"):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, deep_clean(title), 0, 1, 'L')
        
        # Chart area
        chart_y = self.get_y()
        chart_height = 50  # height of chart
        bar_width = 20     # width of each bar
        max_value = max(max(values1), max(values2)) * 1.1  # max value with 10% padding
        scale_factor = chart_height / max_value if max_value > 0 else 1
        
        # Draw chart grid
        self.set_draw_color(200, 200, 200)
        
        # Draw value axis (vertical)
        self.line(30, chart_y, 30, chart_y + chart_height)
        
        # Draw labels axis (horizontal)
        self.line(30, chart_y + chart_height, 180, chart_y + chart_height)
        
        # Draw bars
        self.set_font('Arial', '', 8)
        x_pos = 40
        
        # Draw legend
        legend_y = chart_y + chart_height + 15
        
        # Legend for protocol
        self.set_fill_color(100, 149, 237)  # Cornflower blue
        self.rect(40, legend_y, 5, 5, 'F')
        self.set_xy(47, legend_y - 1)
        self.cell(30, 5, labels1, 0, 0)
        
        # Legend for CSR median
        self.set_fill_color(60, 179, 113)  # Medium sea green
        self.rect(90, legend_y, 5, 5, 'F')
        self.set_xy(97, legend_y - 1)
        self.cell(30, 5, labels2, 0, 0)
        
        # Draw bars and labels
        for i in range(len(labels)):
            # Draw category label
            self.set_xy(x_pos, chart_y + chart_height + 5)
            self.cell(bar_width * 2, 5, deep_clean(labels[i]), 0, 0, 'C')
            
            # Draw protocol bar
            protocol_height = values1[i] * scale_factor
            self.set_fill_color(100, 149, 237)  # Cornflower blue
            self.rect(x_pos, chart_y + chart_height - protocol_height, bar_width, protocol_height, 'F')
            
            # Draw value above bar
            self.set_xy(x_pos, chart_y + chart_height - protocol_height - 8)
            self.cell(bar_width, 5, str(values1[i]), 0, 0, 'C')
            
            # Draw CSR median bar
            median_height = values2[i] * scale_factor
            self.set_fill_color(60, 179, 113)  # Medium sea green
            self.rect(x_pos + bar_width, chart_y + chart_height - median_height, bar_width, median_height, 'F')
            
            # Draw value above bar
            self.set_xy(x_pos + bar_width, chart_y + chart_height - median_height - 8)
            self.cell(bar_width, 5, str(values2[i]), 0, 0, 'C')
            
            x_pos += bar_width * 3
        
        # Move to position after chart
        self.set_y(legend_y + 15)

def generate_intelligence_report(protocol_data, benchmarks, prediction, protocol_id, output_path=None):
    """Generate a full protocol intelligence report PDF"""
    # Create PDF
    pdf = ProtocolReportPDF(protocol_id, f"Protocol Intelligence Report: {protocol_data.get('indication', 'Unknown')} Trial")
    pdf.add_page()
    
    # Protocol Summary Section
    summary_content = f"""
Indication: {protocol_data.get('indication', 'N/A')}
Phase: {protocol_data.get('phase', 'N/A')}
Sample Size: {protocol_data.get('sample_size', 'N/A')}
Duration: {protocol_data.get('duration_weeks', 'N/A')} weeks
Dropout Rate: {protocol_data.get('dropout_rate', 0) * 100:.1f}%
"""
    
    if 'primary_endpoints' in protocol_data and protocol_data['primary_endpoints']:
        if isinstance(protocol_data['primary_endpoints'], list):
            endpoint_text = protocol_data['primary_endpoints'][0]
        else:
            endpoint_text = protocol_data['primary_endpoints']
        summary_content += f"Primary Endpoint: {endpoint_text}\n"
    
    pdf.add_section("Protocol Summary", summary_content)
    
    # Success Prediction Section
    prediction_value = prediction if isinstance(prediction, (int, float)) else 0.5
    pdf.add_section("Trial Success Prediction", f"{prediction_value * 100:.1f}%")
    
    # Add visual chart comparison
    chart_labels = ["Sample Size", "Duration", "Dropout %"]
    protocol_values = [
        protocol_data.get('sample_size', 0),
        protocol_data.get('duration_weeks', 0),
        protocol_data.get('dropout_rate', 0) * 100
    ]
    
    benchmark_values = [
        benchmarks.get('avg_sample_size', 0),
        benchmarks.get('avg_duration', 0),
        benchmarks.get('avg_dropout', 0) * 100
    ]
    
    pdf.add_bar_chart("Visual Protocol Comparison", chart_labels, protocol_values, benchmark_values)
    
    # CSR Benchmark Comparison Section
    benchmark_content = f"""
Based on {benchmarks.get('total_trials', 0)} CSR-matched trials:

Avg Sample Size: {benchmarks.get('avg_sample_size', 'N/A')}
Avg Duration: {benchmarks.get('avg_duration', 'N/A')} weeks
Avg Dropout Rate: {benchmarks.get('avg_dropout', 0) * 100:.1f}%
"""
    
    if 'success_rate' in benchmarks and benchmarks['success_rate'] is not None:
        benchmark_content += f"Historical Success Rate: {benchmarks['success_rate'] * 100:.1f}%\n"
    
    pdf.add_section("CSR Benchmark Comparison", benchmark_content)
    
    # Recommendations Section
    recommendations = []
    
    # Sample size recommendation
    if protocol_data.get('sample_size', 0) < benchmarks.get('avg_sample_size', 0) * 0.9:
        recommendations.append(f"Consider increasing sample size to closer to CSR average ({benchmarks.get('avg_sample_size', 'N/A')})")
    elif protocol_data.get('sample_size', 0) > benchmarks.get('avg_sample_size', 0) * 1.3:
        recommendations.append(f"Your sample size is larger than average, which may increase costs but provide stronger statistical power")
    else:
        recommendations.append(f"Your sample size is well aligned with CSR precedent")
    
    # Duration recommendation
    if protocol_data.get('duration_weeks', 0) < benchmarks.get('avg_duration', 0) * 0.7:
        recommendations.append(f"Trial duration ({protocol_data.get('duration_weeks', 0)} weeks) is shorter than average ({benchmarks.get('avg_duration', 'N/A')} weeks) - consider if this is sufficient for endpoint measurement")
    elif protocol_data.get('duration_weeks', 0) > benchmarks.get('avg_duration', 0) * 1.3:
        recommendations.append(f"Trial duration is longer than average - consider patient retention strategies to maintain compliance")
    else:
        recommendations.append(f"Your trial duration is well aligned with CSR precedent")
    
    # Dropout recommendation
    benchmark_dropout = benchmarks.get('avg_dropout', 0)
    protocol_dropout = protocol_data.get('dropout_rate', 0)
    
    if protocol_dropout < benchmark_dropout * 0.7:
        recommendations.append(f"Your dropout assumption of {protocol_dropout * 100:.1f}% appears optimistic compared to historical average of {benchmark_dropout * 100:.1f}%")
    else:
        recommendations.append(f"Your dropout rate assumption appears realistic based on historical data")
    
    # Success prediction recommendation
    if prediction_value > 0.7:
        recommendations.append(f"Your protocol shows promising success indicators with {prediction_value * 100:.1f}% predicted probability")
    elif prediction_value < 0.5:
        recommendations.append(f"Your protocol has a lower predicted success probability ({prediction_value * 100:.1f}%) - consider addressing the factors above")
    else:
        recommendations.append(f"Your protocol has a moderate predicted success probability ({prediction_value * 100:.1f}%) - consider optimizations noted above")
    
    pdf.add_section("Strategic Recommendations", "Based on CSR analysis and ML prediction:")
    pdf.add_bullet_list(recommendations)
    
    # Add timestamp and source note
    pdf.set_font('Arial', 'I', 9)
    pdf.cell(0, 5, f"Generated by TrialSage Intelligence Engine on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, 'C')
    
    # Determine output path if not provided
    if not output_path:
        timestamp = int(time.time())
        output_path = f"data/reports/{protocol_id}_intelligence_{timestamp}.pdf"
    
    # Save the PDF
    pdf.output(output_path)
    
    return output_path

def main():
    parser = argparse.ArgumentParser(description="Generate protocol intelligence report PDF")
    parser.add_argument("--protocol", required=True, help="Protocol data JSON file")
    parser.add_argument("--benchmarks", required=True, help="Benchmark data JSON file")
    parser.add_argument("--prediction", type=float, default=0.5, help="Success prediction value (0-1)")
    parser.add_argument("--id", default="protocol", help="Protocol identifier")
    parser.add_argument("--output", help="Output PDF path")
    
    args = parser.parse_args()
    
    # Load protocol data
    with open(args.protocol, 'r', encoding='utf-8') as f:
        protocol_data = json.load(f)
    
    # Load benchmark data
    with open(args.benchmarks, 'r', encoding='utf-8') as f:
        benchmarks = json.load(f)
    
    # Generate report
    output_path = generate_intelligence_report(
        protocol_data, 
        benchmarks, 
        args.prediction, 
        args.id,
        args.output
    )
    
    print(f"Protocol intelligence report generated successfully at {output_path}")
    return output_path

if __name__ == "__main__":
    main()