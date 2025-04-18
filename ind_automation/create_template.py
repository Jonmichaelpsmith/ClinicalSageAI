import os
import docxtpl
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
import logging
import io
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class TemplateGenerator:
    """
    Handles the generation of IND document templates based on provided data
    """
    
    def __init__(self):
        self.templates_dir = os.path.join(os.path.dirname(__file__), "templates")
        logger.info(f"Initialized TemplateGenerator with templates dir: {self.templates_dir}")
    
    def generate_module3(self, data: Dict[str, Any]) -> Optional[bytes]:
        """
        Generate Module 3 (Chemistry, Manufacturing, and Controls) document
        
        Args:
            data: Dictionary containing CMC data for Module 3
            
        Returns:
            Document as bytes or None if generation fails
        """
        try:
            logger.info(f"Generating Module 3 document for drug: {data.get('drug_name', 'Unknown')}")
            
            # Creating a blank document to ensure proper formatting
            doc = Document()
            
            # Set up document properties
            doc.core_properties.title = f"Module 3 - CMC - {data.get('drug_name', 'Unknown')}"
            doc.core_properties.subject = "Chemistry, Manufacturing, and Controls"
            
            # Add title
            title = doc.add_heading("MODULE 3: CHEMISTRY, MANUFACTURING, AND CONTROLS", level=0)
            title.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Add drug name
            drug_name_paragraph = doc.add_paragraph()
            drug_name_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            drug_name_run = drug_name_paragraph.add_run(data.get('drug_name', 'Unknown'))
            drug_name_run.font.size = Pt(18)
            drug_name_run.bold = True
            
            # Add IND application subtitle
            subtitle = doc.add_paragraph("Investigational New Drug Application")
            subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Add date and batch info
            date_para = doc.add_paragraph()
            date_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            date_para.add_run(f"Date: {data.get('manufacture_date', 'N/A')}")
            
            batch_para = doc.add_paragraph()
            batch_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            batch_para.add_run(f"Batch Number: {data.get('batch_number', 'N/A')}")
            
            doc.add_paragraph()  # Add spacing
            
            # Section 1: Drug Substance
            doc.add_heading("1. DRUG SUBSTANCE", level=1)
            
            # Nomenclature
            doc.add_heading("1.1 Nomenclature", level=2)
            nomenclature = data.get('nomenclature', {})
            doc.add_paragraph(f"Chemical Name: {nomenclature.get('chemical_name', 'N/A')}")
            doc.add_paragraph(f"CAS Registry Number: {nomenclature.get('cas_number', 'N/A')}")
            doc.add_paragraph(f"Molecular Formula: {nomenclature.get('molecular_formula', 'N/A')}")
            
            # Physical and Chemical Properties
            doc.add_heading("1.2 Physical and Chemical Properties", level=2)
            drug_substance = data.get('drug_substance', {})
            doc.add_paragraph(f"Appearance: {drug_substance.get('appearance', 'N/A')}")
            doc.add_paragraph(f"Solubility: {drug_substance.get('solubility', 'N/A')}")
            doc.add_paragraph(f"Polymorphism: {drug_substance.get('polymorphism', 'N/A')}")
            
            # Manufacturing Process
            doc.add_heading("1.3 Manufacturing Process", level=2)
            doc.add_paragraph(f"Synthesis Route: {drug_substance.get('synthesis_route', 'N/A')}")
            doc.add_paragraph(f"Manufacturing Site: {data.get('manufacturing_site', 'N/A')}")
            doc.add_paragraph(f"Facility Address: {data.get('facility_address', 'N/A')}")
            
            # Section 2: Specifications and Analytical Methods
            doc.add_heading("2. SPECIFICATIONS AND ANALYTICAL METHODS", level=1)
            
            # Create specifications table
            table = doc.add_table(rows=1, cols=4)
            table.style = 'Table Grid'
            
            # Add header row
            header_cells = table.rows[0].cells
            header_cells[0].text = "Parameter"
            header_cells[1].text = "Method"
            header_cells[2].text = "Acceptance Criteria"
            header_cells[3].text = "Results"
            
            # Make header row bold
            for cell in header_cells:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.bold = True
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Add specification rows
            for spec in data.get('specifications', []):
                row_cells = table.add_row().cells
                row_cells[0].text = spec.get('parameter', 'N/A')
                row_cells[1].text = spec.get('method', 'N/A')
                row_cells[2].text = spec.get('acceptance_criteria', 'N/A')
                row_cells[3].text = spec.get('result', 'N/A')
                
                # Center content
                for i in range(1, 4):  # Center the last three columns
                    for paragraph in row_cells[i].paragraphs:
                        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Section 3: Stability Data
            doc.add_heading("3. STABILITY DATA", level=1)
            
            # Create stability table
            stab_table = doc.add_table(rows=1, cols=5)
            stab_table.style = 'Table Grid'
            
            # Add header row
            stab_header = stab_table.rows[0].cells
            stab_header[0].text = "Time Point"
            stab_header[1].text = "Assay"
            stab_header[2].text = "Purity"
            stab_header[3].text = "Water Content"
            stab_header[4].text = "Appearance"
            
            # Make header row bold
            for cell in stab_header:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.bold = True
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Add stability data rows
            for stab_data in data.get('stability_data', []):
                row_cells = stab_table.add_row().cells
                row_cells[0].text = stab_data.get('timepoint', 'N/A')
                row_cells[1].text = stab_data.get('assay', 'N/A')
                row_cells[2].text = stab_data.get('purity', 'N/A')
                row_cells[3].text = stab_data.get('water_content', 'N/A')
                row_cells[4].text = stab_data.get('appearance', 'N/A')
                
                # Center all cells
                for cell in row_cells:
                    for paragraph in cell.paragraphs:
                        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Section 4: Container Closure System
            doc.add_heading("4. CONTAINER CLOSURE SYSTEM", level=1)
            doc.add_paragraph(data.get('container_closure', 'N/A'))
            
            # Section 5: Storage Conditions
            doc.add_heading("5. STORAGE CONDITIONS", level=1)
            doc.add_paragraph(data.get('storage_conditions', 'N/A'))
            
            # Save document to bytes
            output = io.BytesIO()
            doc.save(output)
            output.seek(0)
            
            logger.info(f"Successfully generated Module 3 document")
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error generating Module 3 document: {str(e)}", exc_info=True)
            return None