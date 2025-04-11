import os
import json
import pandas as pd

def parse_csrs_to_dataset():
    """
    Loops through processed CSR JSON files and converts them to a structured 
    dataframe for machine learning purposes.
    
    Saves the result to a CSV file.
    """
    print("Starting CSR data normalization process...")
    
    # Check if directory exists
    if not os.path.exists("data/processed_csrs"):
        print("Directory data/processed_csrs does not exist, creating...")
        os.makedirs("data/processed_csrs", exist_ok=True)
    
    # Get list of all JSON files
    json_files = [f for f in os.listdir("data/processed_csrs") if f.endswith('.json')]
    
    if len(json_files) == 0:
        print("No JSON files found in data/processed_csrs directory")
        return
    
    print(f"Found {len(json_files)} CSR JSON files to process")
    
    records = []
    error_count = 0
    
    for fname in json_files:
        try:
            with open(f"data/processed_csrs/{fname}") as f:
                csr = json.load(f)
            
            # Extract primary endpoint from list if it exists
            primary_endpoint = ""
            if "primary_endpoints" in csr and isinstance(csr["primary_endpoints"], list) and len(csr["primary_endpoints"]) > 0:
                primary_endpoint = csr["primary_endpoints"][0]
            
            # Normalize the record
            record = {
                "nct_id": csr.get("nct_id", fname.replace(".json", "")),
                "indication": csr.get("indication", "").strip(),
                "phase": csr.get("phase", "").replace("Phase ", "").strip(),
                "sample_size": int(csr.get("sample_size", 0)),
                "duration_weeks": int(csr.get("duration_weeks", 0)),
                "dropout_rate": float(csr.get("dropout_rate", 0)) if csr.get("dropout_rate") not in [None, ""] else None,
                "endpoint_primary": primary_endpoint,
                "control_type": csr.get("control_arm", "Unknown"),
                "blinding": csr.get("blinding", "None"),
                "outcome": csr.get("outcome_summary", "").lower(),
            }
            
            # Determine success - multiple indicators in the outcome
            success_terms = ["significant", "met endpoint", "positive outcome", "successful", "efficacy demonstrated"]
            record["success"] = int(any(term in record["outcome"] for term in success_terms))
            
            # Capture failure reason if available
            record["failure_reason"] = csr.get("failure_reason", record["outcome"] if record["success"] == 0 else "")
            
            records.append(record)

        except Exception as e:
            error_count += 1
            print(f"Error processing {fname}: {e}")
    
    print(f"Processed {len(records)} records successfully with {error_count} errors")
    
    if len(records) == 0:
        print("No valid records found, dataset not created")
        return
    
    # Create dataframe and save to CSV
    df = pd.DataFrame(records)
    output_path = "data/csr_dataset.csv"
    df.to_csv(output_path, index=False)
    
    print(f"Dataset saved to {output_path}")
    print(f"Dataset shape: {df.shape}")
    
    # Print summary statistics
    print("\nDataset Summary:")
    print(f"Total CSRs: {len(df)}")
    print(f"Successful trials: {df['success'].sum()} ({df['success'].sum()/len(df)*100:.1f}%)")
    print(f"Indications: {df['indication'].nunique()}")
    print(f"Phases: {df['phase'].nunique()}")
    print(f"Average sample size: {df['sample_size'].mean():.1f}")
    
    return df

if __name__ == "__main__":
    parse_csrs_to_dataset()