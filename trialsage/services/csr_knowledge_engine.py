#!/usr/bin/env python3
# trialsage/services/csr_knowledge_engine.py
# CSR Knowledge Engine for managing all CSR-related operations

import os
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import random
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to import optional dependencies
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    logger.warning("NumPy not available. Some functionality will be limited.")

# Sample CSR metadata for simulated data
# In a real implementation, this would be loaded from a database
SAMPLE_CSR_METADATA = [
    {
        "id": "CSR_001",
        "title": "Phase 2 Study of Drug X in NASH",
        "sponsor": "BioPharm Inc.",
        "indication": "NASH",
        "phase": "2",
        "sample_size": 120,
        "control_type": "Placebo",
        "blinding": "Double-blind",
        "randomization": "1:1",
        "primary_endpoint": "ALT reduction at week 12",
        "secondary_endpoints": ["Fibrosis improvement", "NASH resolution", "Safety and tolerability"],
        "duration_weeks": 24,
        "arms": 2,
        "dropout_rate": 0.15,
        "success": True
    },
    {
        "id": "CSR_002",
        "title": "Phase 3 Trial of Drug Y in Obesity",
        "sponsor": "Global Pharma",
        "indication": "Obesity",
        "phase": "3",
        "sample_size": 450,
        "control_type": "Placebo",
        "blinding": "Double-blind",
        "randomization": "2:1",
        "primary_endpoint": "Body weight reduction at week 52",
        "secondary_endpoints": ["Waist circumference", "Blood pressure", "Lipid profile", "Quality of life"],
        "duration_weeks": 52,
        "arms": 2,
        "dropout_rate": 0.22,
        "success": True
    },
    {
        "id": "CSR_003",
        "title": "Phase 2 Study of Drug Z in Type 2 Diabetes",
        "sponsor": "InnoMed",
        "indication": "Type 2 Diabetes",
        "phase": "2",
        "sample_size": 180,
        "control_type": "Active Comparator",
        "blinding": "Double-blind",
        "randomization": "1:1:1",
        "primary_endpoint": "HbA1c reduction at week 24",
        "secondary_endpoints": ["Fasting plasma glucose", "Body weight", "Insulin sensitivity"],
        "duration_weeks": 24,
        "arms": 3,
        "dropout_rate": 0.18,
        "success": True
    }
]

class CSRKnowledgeEngine:
    """
    Centralized engine for CSR knowledge management and retrieval
    
    This class provides methods for:
    1. Searching and retrieving CSR data
    2. Generating embeddings and similarity matching
    3. Extracting design parameters and statistics
    4. Comparing trial designs and outcomes
    """
    
    def __init__(self):
        """Initialize the CSR Knowledge Engine"""
        self.csrs = []
        self._load_csr_data()
        
    def _load_csr_data(self):
        """Load CSR data from files or simulated data"""
        # In a real implementation, this would load from a database
        try:
            # Try to load from a local file first
            csr_data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'csr_library.json')
            if os.path.exists(csr_data_path):
                with open(csr_data_path, 'r') as f:
                    self.csrs = json.load(f)
                logger.info(f"Loaded {len(self.csrs)} CSRs from file")
            else:
                # Fall back to sample data
                self.csrs = SAMPLE_CSR_METADATA
                logger.info(f"Using {len(self.csrs)} sample CSRs")
        except Exception as e:
            logger.error(f"Error loading CSR data: {str(e)}")
            self.csrs = SAMPLE_CSR_METADATA
    
    def search_by_indication(self, indication: str, phase: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Search for CSRs by indication and optionally phase
        
        Args:
            indication: The indication to search for
            phase: Optional phase filter
            
        Returns:
            List of matching CSR metadata
        """
        results = []
        for csr in self.csrs:
            if indication.lower() in csr.get('indication', '').lower():
                if phase and phase != csr.get('phase'):
                    continue
                results.append(csr)
        
        return results
    
    def get_csr_by_id(self, csr_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a CSR by its ID
        
        Args:
            csr_id: The CSR ID to retrieve
            
        Returns:
            CSR metadata or None if not found
        """
        for csr in self.csrs:
            if csr.get('id') == csr_id:
                return csr
        return None
    
    def get_design_statistics(self, indication: str, phase: Optional[str] = None) -> Dict[str, Any]:
        """
        Get statistics about study designs for an indication
        
        Args:
            indication: The indication to analyze
            phase: Optional phase filter
            
        Returns:
            Dictionary of design statistics
        """
        matching_csrs = self.search_by_indication(indication, phase)
        
        if not matching_csrs:
            return {
                "count": 0,
                "message": f"No CSRs found for {indication}" + (f" phase {phase}" if phase else "")
            }
        
        # Extract design parameters
        sample_sizes = [csr.get('sample_size', 0) for csr in matching_csrs if csr.get('sample_size')]
        durations = [csr.get('duration_weeks', 0) for csr in matching_csrs if csr.get('duration_weeks')]
        arm_counts = [csr.get('arms', 0) for csr in matching_csrs if csr.get('arms')]
        dropout_rates = [csr.get('dropout_rate', 0) for csr in matching_csrs if csr.get('dropout_rate') is not None]
        
        # Calculate statistics
        if NUMPY_AVAILABLE and sample_sizes:
            avg_sample = float(np.mean(sample_sizes))
            median_sample = float(np.median(sample_sizes))
        else:
            avg_sample = sum(sample_sizes) / len(sample_sizes) if sample_sizes else 0
            median_sample = sorted(sample_sizes)[len(sample_sizes) // 2] if sample_sizes else 0
            
        if NUMPY_AVAILABLE and durations:
            avg_duration = float(np.mean(durations))
            median_duration = float(np.median(durations))
        else:
            avg_duration = sum(durations) / len(durations) if durations else 0
            median_duration = sorted(durations)[len(durations) // 2] if durations else 0
            
        if NUMPY_AVAILABLE and dropout_rates:
            avg_dropout = float(np.mean(dropout_rates))
        else:
            avg_dropout = sum(dropout_rates) / len(dropout_rates) if dropout_rates else 0
        
        # Collect endpoint information
        all_endpoints = []
        for csr in matching_csrs:
            if csr.get('primary_endpoint'):
                all_endpoints.append(csr.get('primary_endpoint'))
            if csr.get('secondary_endpoints'):
                all_endpoints.extend(csr.get('secondary_endpoints', []))
        
        # Count endpoint frequency
        endpoint_counts = {}
        for endpoint in all_endpoints:
            endpoint_counts[endpoint] = endpoint_counts.get(endpoint, 0) + 1
        
        # Sort endpoints by frequency
        common_endpoints = sorted(endpoint_counts.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "count": len(matching_csrs),
            "avg_sample_size": round(avg_sample),
            "median_sample_size": round(median_sample),
            "avg_duration_weeks": round(avg_duration, 1),
            "median_duration_weeks": round(median_duration),
            "common_arms": round(sum(arm_counts) / len(arm_counts)) if arm_counts else 0,
            "avg_dropout_rate": round(avg_dropout * 100) / 100 if dropout_rates else None,
            "common_endpoints": common_endpoints[:5],
            "source_csrs": [csr.get('id') for csr in matching_csrs]
        }
    
    def compare_trial_designs(self, csr_ids: List[str]) -> Dict[str, Any]:
        """
        Compare multiple trial designs
        
        Args:
            csr_ids: List of CSR IDs to compare
            
        Returns:
            Comparison data
        """
        csrs_to_compare = []
        for csr_id in csr_ids:
            csr = self.get_csr_by_id(csr_id)
            if csr:
                csrs_to_compare.append(csr)
        
        if not csrs_to_compare:
            return {"error": "No valid CSRs found to compare"}
        
        comparison = {
            "csrs": csrs_to_compare,
            "comparison_date": datetime.now().strftime("%Y-%m-%d"),
            "design_parameters": {}
        }
        
        # Compare key design parameters
        design_params = ["sample_size", "duration_weeks", "arms", "control_type", "blinding", "randomization"]
        for param in design_params:
            comparison["design_parameters"][param] = {
                csr.get('id'): csr.get(param) for csr in csrs_to_compare
            }
        
        return comparison
    
    def recommend_design(self, indication: str, phase: str) -> Dict[str, Any]:
        """
        Recommend a study design based on successful CSRs
        
        Args:
            indication: The indication for the study
            phase: The study phase
            
        Returns:
            Recommended design parameters
        """
        matching_csrs = self.search_by_indication(indication, phase)
        
        # Filter for successful trials
        successful_csrs = [csr for csr in matching_csrs if csr.get('success') is True]
        
        if not successful_csrs:
            return {
                "status": "insufficient_data",
                "message": f"No successful CSRs found for {indication} phase {phase}",
                "fallback_recommendation": {
                    "based_on": "standard practices",
                    "sample_size": {"phase_1": 30, "phase_2": 120, "phase_3": 300}.get(f"phase_{phase}", 100),
                    "duration_weeks": {"phase_1": 8, "phase_2": 24, "phase_3": 52}.get(f"phase_{phase}", 24),
                    "arms": {"phase_1": 1, "phase_2": 2, "phase_3": 2}.get(f"phase_{phase}", 2),
                    "control_type": "Placebo" if phase in ["2", "3"] else "None",
                    "confidence": "low"
                }
            }
        
        # Calculate average design parameters
        design_params = {}
        numeric_params = ["sample_size", "duration_weeks", "arms", "dropout_rate"]
        
        for param in numeric_params:
            values = [csr.get(param, 0) for csr in successful_csrs if csr.get(param) is not None]
            if values:
                if NUMPY_AVAILABLE:
                    design_params[param] = round(float(np.mean(values)))
                    design_params[f"{param}_median"] = round(float(np.median(values)))
                else:
                    design_params[param] = round(sum(values) / len(values))
                    design_params[f"{param}_median"] = round(sorted(values)[len(values) // 2])
        
        # Find most common categorical parameters
        categorical_params = ["control_type", "blinding", "randomization"]
        for param in categorical_params:
            param_values = {}
            for csr in successful_csrs:
                value = csr.get(param)
                if value:
                    param_values[value] = param_values.get(value, 0) + 1
            
            if param_values:
                design_params[param] = max(param_values.items(), key=lambda x: x[1])[0]
                design_params[f"{param}_options"] = sorted(param_values.items(), key=lambda x: x[1], reverse=True)
        
        # Collect endpoint information
        primary_endpoints = {}
        for csr in successful_csrs:
            endpoint = csr.get('primary_endpoint')
            if endpoint:
                primary_endpoints[endpoint] = primary_endpoints.get(endpoint, 0) + 1
        
        # Sort endpoints by frequency
        design_params["common_primary_endpoints"] = sorted(primary_endpoints.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "status": "success",
            "recommendation": design_params,
            "based_on": len(successful_csrs),
            "confidence": "high" if len(successful_csrs) >= 3 else "medium" if len(successful_csrs) >= 1 else "low",
            "source_csrs": [csr.get('id') for csr in successful_csrs]
        }
        
    def extract_references(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract CSR references from text
        
        Args:
            text: The text to extract references from
            
        Returns:
            List of extracted references with metadata
        """
        references = []
        
        # In a real implementation, this would use NLP/regex to extract actual references
        # For simulation, we'll check if any CSR IDs are mentioned in the text
        for csr in self.csrs:
            csr_id = csr.get('id')
            if csr_id and csr_id in text:
                references.append({
                    "id": csr_id,
                    "title": csr.get('title'),
                    "sponsor": csr.get('sponsor'),
                    "type": "csr",
                    "context": f"...reference to {csr_id}...",  # In real implementation, extract the surrounding text
                })
        
        return references