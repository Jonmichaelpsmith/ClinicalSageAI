import os
import json
import pandas as pd
from datetime import datetime

def parse_csrs_to_dataset():
    """
    Loops through processed CSR JSON files and converts them to a structured 
    dataframe for machine learning purposes.
    
    Saves the result to a CSV file.
    """
    print("Starting CSR data normalization process...")
    
    # Setup paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))
    processed_dir = os.path.join(project_root, "data", "processed_csrs")
    output_dir = os.path.join(script_dir, "data")
    output_file = os.path.join(output_dir, "csr_dataset.csv")
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Get all JSON files
    json_files = [f for f in os.listdir(processed_dir) if f.endswith('.json')]
    
    print(f"Found {len(json_files)} CSR JSON files to process")
    
    # Initialize data collection
    records = []
    errors = 0
    
    # Process each file
    for filename in json_files:
        try:
            file_path = os.path.join(processed_dir, filename)
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Extract key fields for ML dataset
            record = {
                'nct_id': data.get('nct_id', ''),
                'indication': data.get('indication', ''),
                'phase': data.get('phase', ''),
                'sample_size': data.get('sample_size', None),
                'duration_weeks': data.get('duration_weeks', None),
                'dropout_rate': data.get('dropout_rate', None),
                'blinding': data.get('blinding', ''),
                'control_arm': data.get('control_arm', ''),
                'primary_endpoints': ', '.join(data.get('primary_endpoints', [])) if isinstance(data.get('primary_endpoints'), list) else data.get('primary_endpoints', ''),
                'secondary_endpoints': ', '.join(data.get('secondary_endpoints', [])) if isinstance(data.get('secondary_endpoints'), list) else data.get('secondary_endpoints', ''),
                'outcome_summary': data.get('outcome_summary', ''),
                'success': data.get('success', None),
                'failure_reason': data.get('failure_reason', '')
            }
            
            records.append(record)
            
        except Exception as e:
            print(f"Error processing {filename}: {str(e)}")
            errors += 1
    
    # Convert to dataframe
    df = pd.DataFrame(records)
    
    # Save to CSV
    df.to_csv(output_file, index=False)
    
    print(f"Processed {len(records)} records successfully with {errors} errors")
    print(f"Dataset saved to {output_file}")
    print(f"Dataset shape: {df.shape}")
    
    # Print some basic analytics
    print("\nDataset Summary:")
    print(f"Total CSRs: {len(df)}")
    if 'success' in df.columns:
        success_count = df['success'].sum()
        print(f"Successful trials: {success_count} ({success_count/len(df)*100:.1f}%)")
    
    if 'indication' in df.columns:
        print(f"Indications: {df['indication'].nunique()}")
    
    if 'phase' in df.columns:
        print(f"Phases: {df['phase'].nunique()}")
    
    if 'sample_size' in df.columns:
        print(f"Average sample size: {df['sample_size'].mean()}")
    
    return df

if __name__ == "__main__":
    parse_csrs_to_dataset()