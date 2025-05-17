#!/usr/bin/env python3
"""
ClinicalTrials.gov CSR Downloader

Fetches publicly available Clinical Study Reports (CSRs) for a list of
NCT IDs and stores them in the csrs/ directory.
A download_log.json file tracks processed IDs.
"""

import os
import json
import logging
from typing import List
import requests

CSR_DIR = os.path.join(os.path.dirname(__file__), 'csrs')
LOG_FILE = os.path.join(CSR_DIR, 'download_log.json')

# Sample list of NCT IDs known to have CSR documents available
KNOWN_NCTIDS: List[str] = [
    'NCT03811366', 'NCT03794050', 'NCT03785600', 'NCT03792139',
    'NCT03815682', 'NCT03814343', 'NCT03787836', 'NCT03800550',
]

CLINICALTRIALS_API = 'https://clinicaltrials.gov/api/v2/studies/'


def load_log() -> dict:
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"downloaded": []}


def save_log(log: dict) -> None:
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(log, f, indent=2)


def find_document_url(study_json: dict) -> str | None:
    documents = study_json.get('protocolSection', {}).get('documents', [])
    for doc in documents:
        url = doc.get('url')
        if url and url.lower().endswith('.pdf'):
            return url
    return None


def download_csr(nctid: str) -> bool:
    resp = requests.get(f'{CLINICALTRIALS_API}{nctid}')
    if resp.status_code != 200:
        logging.error('Failed to fetch %s: %s', nctid, resp.status_code)
        return False

    study = resp.json()
    url = find_document_url(study)
    if not url:
        logging.warning('No CSR document found for %s', nctid)
        return False

    os.makedirs(CSR_DIR, exist_ok=True)
    file_path = os.path.join(CSR_DIR, f'{nctid}.pdf')
    if os.path.exists(file_path):
        logging.info('%s already downloaded', nctid)
        return False

    logging.info('Downloading %s from %s', nctid, url)
    pdf_resp = requests.get(url)
    if pdf_resp.status_code != 200:
        logging.error('Failed to download PDF for %s', nctid)
        return False

    with open(file_path, 'wb') as f:
        f.write(pdf_resp.content)
    logging.info('Saved %s', file_path)
    return True


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    log = load_log()
    for nctid in KNOWN_NCTIDS:
        if nctid in log['downloaded']:
            continue
        if download_csr(nctid):
            log['downloaded'].append(nctid)
    save_log(log)


if __name__ == '__main__':
    main()
