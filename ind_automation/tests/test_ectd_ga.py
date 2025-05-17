import shutil
import tempfile
import importlib.util
from pathlib import Path
import xml.etree.ElementTree as ET
import unittest

has_lxml = importlib.util.find_spec("lxml") is not None
if has_lxml:
    from ind_automation import ectd_ga
else:  # pragma: no cover - skip when lxml missing
    ectd_ga = None


@unittest.skipUnless(has_lxml, "lxml not installed")
class BuildSequenceTest(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        tmp_path = Path(self.tmp_dir.name)
        self.base_dir = tmp_path / "ectd"
        self.output_dir = tmp_path / "output"
        self.output_dir.mkdir(parents=True)

        src_dir = Path(__file__).resolve().parents[2] / "output"
        for f in src_dir.glob("*.docx"):
            shutil.copy2(f, self.output_dir / f.name)

        self.orig_base = ectd_ga.BASE
        self.orig_output = ectd_ga.OUTPUT_DIR
        ectd_ga.BASE = self.base_dir
        ectd_ga.OUTPUT_DIR = self.output_dir

    def tearDown(self):
        ectd_ga.BASE = self.orig_base
        ectd_ga.OUTPUT_DIR = self.orig_output
        self.tmp_dir.cleanup()

    def test_build_sequence(self):
        pid = "TESTPID"
        serial = "0001"
        ectd_ga.build_sequence(pid, serial)

        seq_dir = self.base_dir / pid / serial
        tree = ET.parse(seq_dir / "index.xml")
        root = tree.getroot()
        self.assertEqual(root.tag, "ectd")
        self.assertEqual(root.findtext("sequence"), serial)

        leafs = list(root.findall("leaf"))
        self.assertEqual(len(leafs), len(ectd_ga.LEAFS))
        for leaf, (path, meta) in zip(leafs, ectd_ga.LEAFS.items()):
            file_path = seq_dir / path
            self.assertEqual(leaf.attrib["href"], path)
            self.assertEqual(leaf.attrib["operation"], meta["operation"])
            self.assertEqual(leaf.attrib["checksum"], ectd_ga._md5(file_path))
            self.assertEqual(leaf.attrib["checksumType"], "md5")
            self.assertEqual(leaf.findtext("title"), meta["title"])

        expected_lines = [f"{ectd_ga._md5(seq_dir / p)}  {p}" for p in ectd_ga.LEAFS]
        checksums = (seq_dir / "checksum.md5").read_text().strip().splitlines()
        self.assertEqual(checksums, expected_lines)

        # Cleanup sequence directory
        shutil.rmtree(self.base_dir)


if __name__ == "__main__":
    unittest.main()
