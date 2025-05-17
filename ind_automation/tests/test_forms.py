import os
from io import BytesIO
from ind_automation.form_generator import generate_form

sample_data = {
    "sponsor_name": "ACME Pharma",
    "submission_date": "2024-01-01",
    "drug_name": "DrugX",
    "indication": "Test Indication",
    "phase": "1",
    "contact_name": "Dr. Doe",
}


def test_generate_all_forms():
    for form in ["1571", "1572", "3674", "cover_letter"]:
        result = generate_form(form, sample_data)
        assert isinstance(result, BytesIO)
        assert result.getbuffer().nbytes > 0
