import importlib
import sys
import types
import xml.etree.ElementTree as ET
import hashlib
import shutil
import tempfile
from pathlib import Path
import unittest

# minimal lxml stub so ind_automation.ectd_ga can be imported without dependency
class _Element(ET.Element):
    def __init__(self, tag, attrib=None, nsmap=None, **extra):
        super().__init__(tag, attrib or {}, **extra)
        self.nsmap = nsmap or {}

def _SubElement(parent, tag, attrib=None, **extra):
    el = _Element(tag, attrib, **extra)
    parent.append(el)
    return el

def _tostring(element, pretty_print=False, xml_declaration=False, encoding="utf-8"):
    return ET.tostring(element, encoding=encoding, xml_declaration=xml_declaration)


def _load_module():
    lxml = types.ModuleType("lxml")
    etree = types.ModuleType("lxml.etree")
    etree.Element = _Element
    etree.SubElement = _SubElement
    etree.tostring = _tostring
    lxml.etree = etree
    sys.modules["lxml"] = lxml
    sys.modules["lxml.etree"] = etree
    return importlib.reload(importlib.import_module("ind_automation.ectd_ga"))


class BuildSequenceTest(unittest.TestCase):
    def test_build_sequence_outputs(self):
        ectd_ga = _load_module()
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            ectd_ga.BASE = tmp_path / "ectd"
            ectd_ga.OUTPUT_DIR = tmp_path / "output"
            ectd_ga.BASE.mkdir()
            ectd_ga.OUTPUT_DIR.mkdir()

            for name in ["1571.docx", "1572.docx"]:
                (ectd_ga.OUTPUT_DIR / name).write_text("sample")

            ectd_ga.build_sequence("PID", "0001")

            seq_dir = ectd_ga.BASE / "PID" / "0001"
            index_text = (seq_dir / "index.xml").read_text()
            checksum_text = (seq_dir / "checksum.md5").read_text()

            md5 = hashlib.md5(b"sample").hexdigest()
            expected_index = (
                f"<?xml version='1.0' encoding='utf-8'?>\n"
                f"<ectd><leaf href=\"m1/1572.docx\" operation=\"new\" checksum=\"{md5}\" "
                f"checksumType=\"md5\"><title>Form 1572</title></leaf></ectd>"
            )
            expected_checksum = f"{md5}  m1/1571.docx\n{md5}  m1/1572.docx\n"

            self.assertEqual(index_text, expected_index)
            self.assertEqual(checksum_text, expected_checksum)

            # cleanup directories explicitly
            shutil.rmtree(ectd_ga.BASE, ignore_errors=True)
            shutil.rmtree(ectd_ga.OUTPUT_DIR, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
