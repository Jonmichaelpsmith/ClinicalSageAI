from __future__ import annotations
import re
import zipfile
from io import BytesIO
from pathlib import Path

class DocxTemplate:
    """Minimal stub of docxtpl.DocxTemplate for offline rendering."""

    def __init__(self, template_path: str | Path):
        self.template_path = Path(template_path)
        if not self.template_path.exists():
            raise FileNotFoundError(template_path)
        self._parts = None
        self._xml = None

    def _load(self):
        if self._parts is None:
            with zipfile.ZipFile(self.template_path, "r") as z:
                self._parts = {name: z.read(name) for name in z.namelist()}
            self._xml = self._parts.get("word/document.xml", b"{}").decode("utf-8")

    def render(self, context: dict[str, object]):
        self._load()
        def repl(match):
            key = match.group(1).strip()
            return str(context.get(key, ""))
        rendered = re.sub(r"{{\s*(.+?)\s*}}", repl, self._xml)
        self._parts["word/document.xml"] = rendered.encode("utf-8")

    def save(self, target):
        if self._parts is None:
            self._load()
        if hasattr(target, "write"):
            out = target
            close = False
        else:
            out = open(target, "wb")
            close = True
        with zipfile.ZipFile(out, "w") as z:
            for name, data in self._parts.items():
                z.writestr(name, data)
        if close:
            out.close()
