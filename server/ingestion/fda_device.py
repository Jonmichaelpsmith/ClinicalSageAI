# ingestion/fda_device.py
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm"

def fetch_fda_device_complaints(device_code: str):
    """
    Scrape FDA Device Complaint Database for entries matching device_code.
    Returns a list of dicts with keys: complaint_id, device_name, complaint_date, narrative.
    """
    params = {"device": device_code}
    response = requests.get(BASE_URL, params=params, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    
    complaints = []
    table = soup.find("table", {"id": "resultTable"})
    if not table:
        return complaints

    for row in table.find_all("tr")[1:]:
        cols = row.find_all("td")
        complaints.append({
            "complaint_id": cols[0].get_text(strip=True),
            "device_name": cols[1].get_text(strip=True),
            "complaint_date": cols[2].get_text(strip=True),
            "narrative": cols[3].get_text(strip=True),
        })
    return complaints