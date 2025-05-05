from flask import Blueprint, request, send_file, jsonify
from fpdf import FPDF
import io

export_bp = Blueprint('export_compliance', __name__)

@export_bp.route('/api/cer/export-compliance', methods=['POST'])
def export_compliance():
    try:
        data = request.json.get("data")
        threshold = request.json.get("threshold", 80)
        if not data:
            return jsonify({"error": "No data provided."}), 400

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="CER Compliance Scorecard", ln=True, align='C')

        pdf.set_font("Arial", '', 12)
        pdf.ln(10)
        pdf.cell(200, 10, txt=f"Overall Compliance: {data['overallScore']}%", ln=True)
        status = "Ready for Review" if data['overallScore'] >= threshold else "Needs Attention"
        color = (0, 128, 0) if status == "Ready for Review" else (200, 0, 0)

        pdf.set_text_color(*color)
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 8, txt=f"Status: {status}", ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(5)

        # Check if we're using the sectionScores format from the API
        if 'sectionScores' in data:
            sections = data['sectionScores']
            for section in sections:
                # Highlight low scores below 70%
                highlight = section['averageScore'] < 0.7
                if highlight:
                    pdf.set_text_color(220, 53, 69)  # Bootstrap danger red
                    pdf.set_font("Arial", 'B', 12)
                    pdf.cell(200, 8, txt=f"{section['title']} ⚠️", ln=True)
                else:
                    pdf.set_text_color(0, 0, 0)
                    pdf.set_font("Arial", 'B', 12)
                    pdf.cell(200, 8, txt=section['title'], ln=True)

                pdf.set_text_color(0, 0, 0)
                pdf.set_font("Arial", '', 11)
                pdf.cell(200, 6, txt=f"Score: {int(section['averageScore'] * 100)}%", ln=True)
                
                # Extract comments from standards if available
                remarks = []
                if 'standards' in section:
                    for standard_name, standard_data in section['standards'].items():
                        if 'suggestions' in standard_data and standard_data['suggestions']:
                            remarks.extend(standard_data['suggestions'])
                
                if remarks:
                    pdf.set_font("Arial", '', 10)
                    pdf.cell(200, 6, txt="Improvement Suggestions:", ln=True)
                    for remark in remarks[:3]:  # Limit to 3 remarks to keep PDF readable
                        pdf.multi_cell(0, 5, txt=f"• {remark}")
                
                pdf.ln(4)
        # Use the older format with 'breakdown' if provided
        elif 'breakdown' in data:
            for section in data['breakdown']:
                # Highlight low scores below 70%
                highlight = section['score'] < 70
                if highlight:
                    pdf.set_text_color(220, 53, 69)  # Bootstrap danger red
                    pdf.set_font("Arial", 'B', 12)
                    pdf.cell(200, 8, txt=f"{section['section']} ⚠️", ln=True)
                else:
                    pdf.set_text_color(0, 0, 0)
                    pdf.set_font("Arial", 'B', 12)
                    pdf.cell(200, 8, txt=section['section'], ln=True)

                pdf.set_text_color(0, 0, 0)
                pdf.set_font("Arial", '', 11)
                pdf.cell(200, 6, txt=f"Score: {section['score']}%", ln=True)
                pdf.multi_cell(0, 6, txt=f"Remarks: {section['comment']}")
                pdf.ln(4)

        buffer = io.BytesIO()
        pdf.output(buffer)
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name="compliance_scorecard.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
