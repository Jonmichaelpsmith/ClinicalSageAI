import io
import os
import logging
from docxtpl import DocxTemplate

logger = logging.getLogger(__name__)

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates/forms")

def render_form1571(data: dict) -> io.BytesIO:
    """Render FDA Form 1571 with template data"""
    try:
        template_path = os.path.join(TEMPLATE_DIR, "form1571.docx.j2")
        tpl = DocxTemplate(template_path)
        tpl.render(data)
        buf = io.BytesIO()
        tpl.save(buf)
        buf.seek(0)
        return buf
    except Exception as e:
        logger.error(f"Error rendering Form 1571: {str(e)}")
        return None

def render_form1572(data: dict) -> io.BytesIO:
    """Render FDA Form 1572 with template data"""
    try:
        template_path = os.path.join(TEMPLATE_DIR, "form1572.docx.j2")
        tpl = DocxTemplate(template_path)
        tpl.render(data)
        buf = io.BytesIO()
        tpl.save(buf)
        buf.seek(0)
        return buf
    except Exception as e:
        logger.error(f"Error rendering Form 1572: {str(e)}")
        return None

def render_form3674(data: dict) -> io.BytesIO:
    """Render FDA Form 3674 with template data"""
    try:
        template_path = os.path.join(TEMPLATE_DIR, "form3674.docx.j2")
        tpl = DocxTemplate(template_path)
        tpl.render(data)
        buf = io.BytesIO()
        tpl.save(buf)
        buf.seek(0)
        return buf
    except Exception as e:
        logger.error(f"Error rendering Form 3674: {str(e)}")
        return None

def render_cover_letter(data: dict) -> io.BytesIO:
    """Render IND submission cover letter with template data"""
    try:
        template_path = os.path.join(TEMPLATE_DIR, "cover_letter.docx.j2")
        tpl = DocxTemplate(template_path)
        tpl.render(data)
        buf = io.BytesIO()
        tpl.save(buf)
        buf.seek(0)
        return buf
    except Exception as e:
        logger.error(f"Error rendering cover letter: {str(e)}")
        return None