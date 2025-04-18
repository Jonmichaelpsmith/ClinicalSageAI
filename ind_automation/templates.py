import io
from docxtpl import DocxTemplate
TEMPLATE_DIR = "templates/forms"

def _render(path: str, context: dict) -> io.BytesIO:
    tpl = DocxTemplate(path)
    tpl.render(context)
    buf = io.BytesIO(); tpl.save(buf); buf.seek(0)
    return buf

def render_form1571(ctx): return _render(f"{TEMPLATE_DIR}/form1571.docx.j2", ctx)
def render_form1572(ctx): return _render(f"{TEMPLATE_DIR}/form1572.docx.j2", ctx)
def render_form3674(ctx): return _render(f"{TEMPLATE_DIR}/form3674.docx.j2", ctx)
