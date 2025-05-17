import io
from ind_automation.form_generator import generate_form

SAMPLE_DATA = {
    "sponsor_name": "ACME Pharma",
    "drug_name": "DemoDrug",
    "indication": "Testing",
    "submission_date": "2024-01-01",
    "pi_name": "Dr. Who",
    "pi_address": "123 Street",
    "protocol_number": "P-001",
    "nct_number": "NCT00000000",
}

def test_generate_form_1571():
    buf = generate_form("1571", SAMPLE_DATA)
    assert isinstance(buf, io.BytesIO)
    assert buf.getbuffer().nbytes > 0

def test_generate_form_1572():
    buf = generate_form("1572", SAMPLE_DATA)
    assert isinstance(buf, io.BytesIO)
    assert buf.getbuffer().nbytes > 0

def test_generate_form_3674():
    buf = generate_form("3674", SAMPLE_DATA)
    assert isinstance(buf, io.BytesIO)
    assert buf.getbuffer().nbytes > 0
