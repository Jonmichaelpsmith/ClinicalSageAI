"""Form generation utilities using docxtpl templates."""

from __future__ import annotations

import os
from typing import Dict, Any
from io import BytesIO
from docxtpl import DocxTemplate

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates", "forms")


def _render_docx(template_name: str, context: Dict[str, Any]) -> BytesIO:
    """Render a DOCX template with the given context and return a BytesIO."""
    path = os.path.join(TEMPLATES_DIR, template_name)
    doc = DocxTemplate(path)
    doc.render(context)
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    return output


def generate_form_1571(project_data: Dict[str, Any]) -> BytesIO:
    """Generate Form FDA 1571 using project data."""
    return _render_docx("form1571.docx.j2", project_data)


def generate_form_1572(project_data: Dict[str, Any]) -> BytesIO:
    """Generate Form FDA 1572 using project data."""
    return _render_docx("form1572.docx.j2", project_data)


def generate_form_3674(project_data: Dict[str, Any]) -> BytesIO:
    """Generate Form FDA 3674 using project data."""
    return _render_docx("form3674.docx.j2", project_data)


def generate_cover_letter(project_data: Dict[str, Any]) -> BytesIO:
    """Generate an IND cover letter using project data."""
    return _render_docx("cover_letter.docx.j2", project_data)


form_generators = {
    "1571": generate_form_1571,
    "1572": generate_form_1572,
    "3674": generate_form_3674,
    "cover": generate_cover_letter,
}


def generate_form(form_type: str, project_data: Dict[str, Any]) -> BytesIO:
    """Generate a form document based on the form type and project data."""
    try:
        generator = form_generators[form_type]
    except KeyError:
        raise ValueError(f"Unsupported form type: {form_type}")
    return generator(project_data)
