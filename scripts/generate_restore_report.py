from fpdf import FPDF
import time
import os
import sys
import json

def deep_clean(text):
    if not isinstance(text, str):
        return str(text)
        
    return (
        text.replace("–", "-")
            .replace("'", "'")
            .replace(""", '"')
            .replace(""", '"')
            .replace("≥", ">=")
            .replace("•", "-")
            .replace("–", "-")
    )

def generate_restore_report(protocol_id, version_id, restored_data):
    restored_timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    
    class RestoredPDF(FPDF):
        def header(self):
            self.set_font("Arial", "B", 14)
            self.cell(0, 10, deep_clean(f"Protocol Version Restore Report - {protocol_id} ({version_id})"), ln=True, align="C")
            self.ln(5)

        def section(self, title, content):
            self.set_font("Arial", "B", 12)
            self.cell(0, 10, deep_clean(title), ln=True)
            self.ln(1)
            self.set_font("Arial", "", 11)
            self.multi_cell(0, 8, deep_clean(content))
            self.ln(2)

    pdf = RestoredPDF()
    pdf.add_page()

    pdf.section("Restored Version Metadata", f"""
    - Protocol ID: {protocol_id}
    - Version Restored: {version_id}
    - Restore Time (UTC): {restored_timestamp}
    """)

    # Extract key protocol data
    indication = restored_data.get('indication', 'N/A')
    phase = restored_data.get('phase', 'N/A')
    sample_size = restored_data.get('sample_size', 'N/A')
    duration_weeks = restored_data.get('duration_weeks', 'N/A')
    dropout_rate = restored_data.get('dropout_rate', 0)
    endpoint_primary = restored_data.get('endpoint_primary', 'N/A')

    pdf.section("Restored Protocol Configuration", f"""
    - Indication: {indication}
    - Phase: {phase}
    - Sample Size: {sample_size}
    - Duration: {duration_weeks} weeks
    - Dropout Rate: {dropout_rate * 100:.1f}% (if applicable)
    - Primary Endpoint: {endpoint_primary}
    """)

    pdf.section("Next Steps", """
    - This version has been restored into the Protocol Builder.
    - All intelligence tools are now using this version.
    - Export options, dossier tracking, and AI recommendations will reflect this restored version.
    """)

    # Ensure the directory exists
    reports_dir = os.path.join('temp', 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    timestamp = int(time.time())
    pdf_filename = f"Protocol_Version_Restore_Report_{protocol_id}_{version_id}_{timestamp}.pdf"
    pdf_path = os.path.join(reports_dir, pdf_filename)
    
    pdf.output(pdf_path)
    return pdf_path

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python generate_restore_report.py <protocol_id> <version_id> <json_data_path>")
        sys.exit(1)
        
    protocol_id = sys.argv[1]
    version_id = sys.argv[2]
    json_path = sys.argv[3]
    
    with open(json_path, 'r') as f:
        data = json.load(f)
        
    pdf_path = generate_restore_report(protocol_id, version_id, data)
    print(f"Report generated: {pdf_path}")