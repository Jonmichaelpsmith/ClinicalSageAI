"""
Region Rules Utility

Functions to check and validate module requirements per regulatory region.
"""

# Mandatory modules per region
REGION_REQUIREMENTS = {
    'FDA': set(['m1', 'm2', 'm3', 'm4', 'm5']),
    'EMA': set(['m1', 'm2', 'm3', 'm4', 'm5']),
    'PMDA': set(['m1', 'm2', 'm3', 'm4', 'm5', 'jp-annex'])
}

def missing_modules(region: str, provided_modules: set) -> list:
    """
    Determine which required modules are missing for a specific region
    
    Args:
        region: Regulatory region (FDA, EMA, PMDA)
        provided_modules: Set of modules already provided
        
    Returns:
        List of missing mandatory modules
    """
    # Normalize region to uppercase and remove empty strings from provided_modules
    region = region.upper()
    provided_modules = {m for m in provided_modules if m.strip()}
    
    # Get required modules for the region
    required_modules = REGION_REQUIREMENTS.get(region, set())
    
    # Find missing modules
    missing = required_modules - provided_modules
    
    return sorted(list(missing))