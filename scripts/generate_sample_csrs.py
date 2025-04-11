import os
import json
import random
from datetime import datetime, timedelta

def generate_sample_csrs(num_samples=50, output_dir="data/processed_csrs"):
    """
    Generate sample CSR JSON files for ML model development and testing.
    These samples are based on realistic patterns from clinical trials.
    """
    print(f"Generating {num_samples} sample CSR files in {output_dir}")
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Define realistic value ranges
    indications = [
        "Type 2 Diabetes", "Obesity", "Hypertension", "Rheumatoid Arthritis",
        "Asthma", "COPD", "Major Depressive Disorder", "Alzheimer's Disease",
        "Parkinson's Disease", "Multiple Sclerosis", "Breast Cancer", "Prostate Cancer",
        "Colorectal Cancer", "Non-Small Cell Lung Cancer", "Melanoma"
    ]
    
    phases = ["Phase 1", "Phase 1/2", "Phase 2", "Phase 2/3", "Phase 3", "Phase 4"]
    phase_weights = [0.1, 0.1, 0.3, 0.1, 0.35, 0.05]  # Phase 2 and 3 are most common
    
    blinding_options = ["double-blind", "single-blind", "open-label"]
    blinding_weights = [0.6, 0.15, 0.25]
    
    control_types = ["placebo", "active comparator", "standard of care", "no control"]
    control_weights = [0.5, 0.3, 0.15, 0.05]
    
    # Templates for primary endpoints by indication
    endpoint_templates = {
        "Type 2 Diabetes": ["HbA1c reduction", "Fasting glucose reduction", "Postprandial glucose reduction"],
        "Obesity": ["Weight reduction", "BMI reduction", "Waist circumference reduction"],
        "Hypertension": ["SBP reduction", "DBP reduction", "24-hour ambulatory BP reduction"],
        "Rheumatoid Arthritis": ["ACR20 response", "DAS28 score reduction", "HAQ-DI improvement"],
        "Asthma": ["FEV1 improvement", "Asthma exacerbation reduction", "ACQ score improvement"],
        "COPD": ["FEV1 improvement", "SGRQ score improvement", "Exacerbation reduction"],
        "Major Depressive Disorder": ["HAM-D score reduction", "MADRS score reduction", "Response rate"],
        "Alzheimer's Disease": ["ADAS-Cog improvement", "MMSE improvement", "CDR-SB score change"],
        "Parkinson's Disease": ["UPDRS score improvement", "OFF time reduction", "ON time without dyskinesia"],
        "Multiple Sclerosis": ["Relapse rate reduction", "EDSS score change", "New T2 lesions"],
        "Breast Cancer": ["Progression-free survival", "Overall survival", "Objective response rate"],
        "Prostate Cancer": ["PSA response", "Time to PSA progression", "Overall survival"],
        "Colorectal Cancer": ["Progression-free survival", "Overall survival", "Disease control rate"],
        "Non-Small Cell Lung Cancer": ["Progression-free survival", "Overall survival", "Objective response rate"],
        "Melanoma": ["Progression-free survival", "Overall survival", "Objective response rate"]
    }
    
    # Success and failure patterns
    success_outcomes = [
        "Primary endpoint met with statistical significance (p<0.05)",
        "Statistically significant improvement on primary and key secondary endpoints",
        "Met all pre-specified efficacy endpoints with favorable safety profile",
        "Demonstrated superior efficacy compared to placebo",
        "Statistically significant clinical benefit observed"
    ]
    
    failure_outcomes = [
        "Failed to reach statistical significance on primary endpoint",
        "Study terminated early due to futility",
        "No significant difference compared to placebo",
        "Did not meet primary efficacy endpoints",
        "Benefit-risk profile does not support further development"
    ]
    
    failure_reasons = [
        "Inadequate statistical power",
        "High placebo response rate",
        "Unexpected safety signal",
        "Target population too heterogeneous",
        "Endpoint selection not sensitive to change",
        "Dose selection suboptimal",
        "High dropout rate affected statistical analysis",
        "Patient recruitment challenges led to underpowered study",
        "Pharmacokinetic issues with drug exposure",
        "Drug-drug interactions affected efficacy"
    ]
    
    # Generate sample CSRs
    for i in range(num_samples):
        # Pick indication and related fields
        indication = random.choice(indications)
        phase = random.choices(phases, weights=phase_weights)[0]
        
        # Sample size depends on phase
        if "1" in phase:
            sample_size = random.randint(20, 100)
        elif "2" in phase and "/3" not in phase:
            sample_size = random.randint(80, 300)
        else:  # Phase 2/3, 3, or 4
            sample_size = random.randint(250, 1200)
        
        # Duration depends on indication and phase
        if "Cancer" in indication:
            duration_weeks = random.randint(24, 156)  # 6 months to 3 years
        elif phase in ["Phase 1", "Phase 1/2"]:
            duration_weeks = random.randint(4, 24)
        else:
            duration_weeks = random.randint(12, 78)
        
        # Other parameters
        blinding = random.choices(blinding_options, weights=blinding_weights)[0]
        control_type = random.choices(control_types, weights=control_weights)[0]
        
        # Determine endpoints based on indication
        available_endpoints = endpoint_templates.get(indication, ["Clinical response"])
        primary_endpoint = random.choice(available_endpoints)
        
        # Set secondary endpoints (1-3)
        remaining_endpoints = [ep for ep in available_endpoints if ep != primary_endpoint]
        num_secondary = min(len(remaining_endpoints), random.randint(1, 3))
        secondary_endpoints = random.sample(remaining_endpoints, k=num_secondary) if remaining_endpoints else []
        
        # Dropout rate - higher for longer studies and certain indications
        base_dropout = 0.05 + (duration_weeks / 1000 * 3)  # Base dropout increases with duration
        if indication in ["Alzheimer's Disease", "Major Depressive Disorder", "COPD"]:
            base_dropout += 0.1  # Higher dropout for these indications
        dropout_rate = round(min(0.4, max(0.02, random.gauss(base_dropout, 0.04))), 2)
        
        # Determine success/failure
        # Success probability varies by phase and other factors
        success_prob = 0.5  # Base rate
        if phase == "Phase 1":
            success_prob += 0.2  # Phase 1 usually has higher "success" rate
        elif phase == "Phase 3":
            success_prob -= 0.1  # Phase 3 has stricter criteria
            
        # Adjust for sample size - small trials have more variance
        if sample_size < 100:
            success_prob -= 0.05
            
        # Adjust for dropout - high dropout reduces success chance
        if dropout_rate > 0.25:
            success_prob -= 0.1
            
        is_successful = random.random() < success_prob
        
        # Get outcome and failure reason if applicable
        if is_successful:
            outcome_summary = random.choice(success_outcomes)
            failure_reason = ""
        else:
            outcome_summary = random.choice(failure_outcomes)
            failure_reason = random.choice(failure_reasons)
        
        # Create a unique NCT ID
        nct_id = f"NCT{random.randint(10000000, 99999999)}"
        
        # Create the CSR data structure
        csr_data = {
            "nct_id": nct_id,
            "indication": indication,
            "phase": phase,
            "sample_size": sample_size,
            "duration_weeks": duration_weeks,
            "dropout_rate": dropout_rate,
            "blinding": blinding,
            "control_arm": control_type,
            "primary_endpoints": [primary_endpoint],
            "secondary_endpoints": secondary_endpoints,
            "outcome_summary": outcome_summary,
            "success": 1 if is_successful else 0
        }
        
        # Add failure reason if applicable
        if failure_reason:
            csr_data["failure_reason"] = failure_reason
        
        # Generate random dates within the last 5 years
        end_date = datetime.now() - timedelta(days=random.randint(0, 1825))
        start_date = end_date - timedelta(weeks=duration_weeks)
        
        csr_data["start_date"] = start_date.strftime("%Y-%m-%d")
        csr_data["completion_date"] = end_date.strftime("%Y-%m-%d")
        
        # Write to JSON file
        filename = f"{output_dir}/{nct_id}.json"
        with open(filename, 'w') as f:
            json.dump(csr_data, f, indent=2)
    
    print(f"Successfully generated {num_samples} sample CSR files!")
    return num_samples

if __name__ == "__main__":
    generate_sample_csrs()