"""Form generation utilities using DOCX templates."""

import os
import re
import zipfile
from io import BytesIO
from typing import Dict, Any

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates", "forms")


def _render_with_docxtpl(template_path: str, context: Dict[str, Any]) -> BytesIO:
    """Render a DOCX template with docxtpl if available."""
    try:
        from docxtpl import DocxTemplate
    except Exception:  # docxtpl not installed
        return None
    try:
        doc = DocxTemplate(template_path)
        doc.render(context)
        output = BytesIO()
        doc.save(output)
        output.seek(0)
        return output
    except Exception:
        return None


def _render_manually(template_path: str, context: Dict[str, Any]) -> BytesIO:
    """Simple DOCX rendering without external dependencies."""
    buffer = BytesIO()
    with zipfile.ZipFile(template_path) as zin:
        with zipfile.ZipFile(buffer, "w") as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == "word/document.xml":
                    text = data.decode("utf-8")
                    def repl(match: re.Match) -> str:
                        key = match.group(1).strip()
                        return str(context.get(key, ""))
                    text = re.sub(r"{{\s*(\w+)\s*}}", repl, text)
                    data = text.encode("utf-8")
                zout.writestr(item, data)
    buffer.seek(0)
    return buffer


def render_template(template_name: str, context: Dict[str, Any]) -> BytesIO:
    """Render a template located in ``templates/forms`` and return BytesIO."""
    template_path = os.path.join(TEMPLATES_DIR, template_name)
    if not os.path.exists(template_path):
        raise FileNotFoundError(template_path)

    output = _render_with_docxtpl(template_path, context)
    if output is None:
        output = _render_manually(template_path, context)
    return output


def generate_form(form_type: str, project_data: Dict[str, Any]) -> BytesIO:
    """Generate a form DOCX for the given type using project data."""
    templates = {
        "1571": "form1571.docx.j2",
        "1572": "form1572.docx.j2",
        "3674": "form3674.docx.j2",
        "cover_letter": "cover_letter.docx.j2",
    }
    if form_type not in templates:
        raise ValueError(f"Unsupported form type: {form_type}")
    return render_template(templates[form_type], project_data)

