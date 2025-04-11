#!/usr/bin/env python3
"""
Parse CSR JSON files to regenerate the dataset and proceed to training
"""
import os
import json
import pandas as pd

print("Parsing CSR JSON files to regenerate dataset...")

csr_dir = "data/processed_csrs"
records = []

os.makedirs("data", exist_ok=True)

for fname in os.listdir(csr_dir):
    if not fname.endswith(".json"):
        continue

    with open(os.path.join(csr_dir, fname)) as f:
        csr = json.load(f)

    try:
        outcome = csr.get("outcome_summary", "").lower()
        record = {
            "nct_id": csr.get("nct_id", fname.replace(".json", "")),
            "indication": csr.get("indication", "").strip(),
            "phase": csr.get("phase", "").replace("Phase ", "").strip(),
            "sample_size": csr.get("sample_size", 0),
            "duration_weeks": csr.get("duration_weeks", 0),
            "dropout_rate": csr.get("dropout_rate", 0),
            "endpoint_primary": csr.get("primary_endpoints", [""])[0] if isinstance(csr.get("primary_endpoints", []), list) else csr.get("primary_endpoints", ""),
            "control_type": csr.get("control_arm", "Unknown"),
            "blinding": csr.get("blinding", "None"),
            "outcome": outcome,
            "success": int("significant" in outcome or "met endpoint" in outcome or "met with" in outcome),
            "failure_reason": csr.get("failure_reason", outcome)
        }
        records.append(record)
        print(f"Processed {fname}: {'Success' if record['success'] == 1 else 'Failure'}")
    except Exception as e:
        print(f"Error in {fname}: {e}")

df = pd.DataFrame(records)
csv_path = "data/csr_dataset_new.csv"
df.to_csv(csv_path, index=False)

print(f"\nDataset generation complete. Saved to {csv_path}")
print(f"Total records: {len(df)}")
print(f"Success rate: {df['success'].mean() * 100:.1f}%")
print(f"Records with sample_size: {df['sample_size'].notna().sum()}")
print(f"Records with duration_weeks: {df['duration_weeks'].notna().sum()}")
print(f"Records with dropout_rate: {df['dropout_rate'].notna().sum()}")

# Display some stats
print("\nIndication distribution:")
print(df['indication'].value_counts().head(5))

print("\nPhase distribution:")
print(df['phase'].value_counts().head(5))

print("\nSample Size distribution:")
print(df['sample_size'].describe())

# Count records with all required fields
complete_records = df.dropna(subset=["sample_size", "duration_weeks", "dropout_rate", "success"])
print(f"\nComplete records with all required fields: {len(complete_records)}")